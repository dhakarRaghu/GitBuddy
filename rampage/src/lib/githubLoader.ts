"use server";
import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github';
import { Octokit } from "octokit";
import { prisma } from "./db";
import { getAuthSession } from "./auth";
import { Document } from '@langchain/core/documents';
import {  summariseCode } from './gemini';
import { uploadToPinecone } from './pineconedb';
import { PineconeRecord } from '@pinecone-database/pinecone';
import { generateEmbedding } from './repoEmbedding';
import { summariseCode_2 } from './gemini2';


const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });


// Parse GitHub URL to extract owner and repo
async function RepoDetails(githubUrl: string) {
    const owner = githubUrl.split('/')[3];
    const repo = githubUrl.split('/')[4];
  if (!owner || !repo) {
    throw new Error("Invalid GitHub URL");
  }
  return { owner, repo };
}

// Count files in the repository (simplified without structure)
async function getFileCount(
  path: string,
  octokit: Octokit,
  githubOwner: string,
  githubRepo: string,
  acc: number = 0
): Promise<number> {
  const { data } = await octokit.rest.repos.getContent({
    owner: githubOwner,
    repo: githubRepo,
    path,
  });

//   console.log("data", data);
//   console.log("path", path);

  if (!Array.isArray(data)) {
    if (data.type === "file") return acc + 1;
    return acc;
  }

  let fileCount = acc;
  const directories: string[] = [];

  for (const item of data) {
    if (item.type === "file") {
      fileCount += 1;
    } else if (item.type === "dir") {
      directories.push(item.path);
    }
  }

  if (directories.length > 0) {
    const directoryCounts = await Promise.all(
      directories.map((dirPath) =>
        getFileCount(dirPath, octokit, githubOwner, githubRepo, 0)
      )
    );
    fileCount += directoryCounts.reduce((sum, count) => sum + count, 0);
  }

  return fileCount;
}



interface UserRepo {
  name: string;
  fullName: string;
  description: string | null;
  private: boolean;
}
export const fetchUserRepos = async (username: string): Promise<UserRepo[]> => {
  try {
    console.log(`Fetching repositories for user: ${username}`);

    // Use Octokit to fetch the user's repositories
    const response = await octokit.rest.repos.listForUser({
      username,
      per_page: 100, // Maximum number of repos per page
      sort: 'updated', // Sort by last updated
    });

    // Map the response to a simpler format
    const repos: UserRepo[] = response.data.map(repo => ({
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      private: repo.private,
    }));

    console.log(`Found ${repos.length} repositories for user ${username}`);
    return repos;
  } catch (error) {
    console.error(`Error fetching repositories for user ${username}:`, error);
    throw new Error(`Failed to fetch repositories for ${username}: ${(error as Error).message}`);
  }
};

// Main function to check credits without file structure
export async function checkCreditsAndStructure(githubUrl: string) {
  const session = await getAuthSession();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const { owner, repo } = await RepoDetails(githubUrl);

  console.log("githubUrl", githubUrl);
  console.log("owner", owner);
//   console.log("GITHUB_TOKEN", process.env.GITHUB_TOKEN);

  // Fetch file count only
  const fileCount = await getFileCount("", octokit, owner, repo);
// console.log
  // Fetch user's remaining credits
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  console.log("fileCount", fileCount);
  console.log("userCredits", user?.credits);

  return {
    fileCount,
    userCredits: user?.credits || 0,
  };
}


export const loadGithubRepo = async (githubUrl: string) => {
  const loader = new GithubRepoLoader(githubUrl, {
    branch: "main",
    accessToken: process.env.GITHUB_TOKEN || "", // Ensure GITHUB_TOKEN is set in your environment
    ignoreFiles: [
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "bun.lockb",
      ".next",
      "node_modules",
      "dist",
      "build",
      "out",
      "public",
      "coverage",
      "cypress",
      "tmp",
      "temp",
      "logs",
      "log",
      "images",
      ".DS_Store",
    ],
    recursive: true,
    unknown: "warn",
    maxConcurrency: 3, // Reduced concurrency to minimize rate limit issues
  });

  // Fetch files with retry logic for rate limits
  let docs: Document[] = [];
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      docs = await loader.load();
      break;
    } catch (error: any) {
      if (error.message.includes("rate limit") || error.response?.status === 403) {
        if (attempt === MAX_RETRIES) {
          console.error(`Failed to load GitHub repo after ${MAX_RETRIES} attempts:`, error);
          throw new Error(
            "GitHub API rate limit exceeded. Please try again later or check the repository directly.",
          );
        }
        const retryDelay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(`GitHub API rate limit hit. Retrying after ${retryDelay}ms...`);
        await delay(retryDelay);
      } else {
        console.error("Error loading GitHub repo:", error);
        throw error;
      }
    }
  }
  return docs;
};
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Configuration for rate limiting and processing
const BATCH_SIZE = 4; // Adjust based on API limits
const DELAY_BETWEEN_BATCHES_MS = 1000; // 1 second delay between batches
const MAX_RETRIES = 3; // Number of retry attempts for rate limit errors
const BASE_RETRY_DELAY_MS = 1000; // Base delay for retries

export interface EmbeddingResult {
  summary: string;
  embedding: number[];
  sourceCode: string;
  fileName: string;
}

/**
 * Generates embeddings for a repository and uploads them to Pinecone.
 * @param projectId - Unique identifier for the project (used as Pinecone namespace)
 * @param docs - Array of documents to process
 */
export const RepoGenerateEmbeddings = async (
  projectId: string,
): Promise<EmbeddingResult[]> => {
  const embeddings: EmbeddingResult[] = [];
  // In-memory cache scoped to this function call
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { githubUrl: true },
  });
  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }
  const docs = await loadGithubRepo(project.githubUrl!);
  const embeddingCache = new Map<string, EmbeddingResult>();

  if (!docs) {
    throw new Error("Failed to load documents from the repository.");
  }

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(docs.length / BATCH_SIZE)}`);


    const batchPromises = batch.map(async (doc) => {
      const cacheKey = doc.metadata.source || "unknown_file";

      // Check if already embedded
      const cachedResult = embeddingCache.get(cacheKey);
      if (cachedResult) {
        console.log(`Using cached embedding for ${cacheKey}`);
        return cachedResult;
      }

      if((i/BATCH_SIZE + 1)%2==0){
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          try {
            const summary = await summariseCode(doc);
            const embedding = await generateEmbedding(summary);
            const result: EmbeddingResult = {
              summary,
              embedding,
              sourceCode: doc.pageContent,
              fileName: doc.metadata.source,
            };
  
            // Cache the result after successful embedding
            embeddingCache.set(cacheKey, result);
            return result;
          } catch (error: any) {
            // Handle rate limit errors
            if (error.response?.status === 429 || error.message.includes("rate limit")) {
              if (attempt === MAX_RETRIES) {
                console.error(
                  `Failed to generate embedding for ${doc.metadata.source} after ${MAX_RETRIES} attempts:`,
                  error
                );
                return null;
              }
              const retryDelay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1); // Exponential backoff
              console.warn(
                `Rate limit hit for ${doc.metadata.source}. Retrying (${attempt}/${MAX_RETRIES}) after ${retryDelay}ms...`
              );
              await delay(retryDelay);
            } else {
              // Non-rate-limit error, fail immediately
              console.error(`Error generating embedding for ${doc.metadata.source}:`, error);
              return null;
            }
          }
        }
      }
      else{
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          try {
            const summary = await summariseCode_2(doc);
            const embedding = await generateEmbedding(summary);
            const result: EmbeddingResult = {
              summary,
              embedding,
              sourceCode: doc.pageContent,
              fileName: doc.metadata.source,
            };
  
            // Cache the result after successful embedding
            embeddingCache.set(cacheKey, result);
            return result;
          } catch (error: any) {
            // Handle rate limit errors
            if (error.response?.status === 429 || error.message.includes("rate limit")) {
              if (attempt === MAX_RETRIES) {
                console.error(
                  `Failed to generate embedding for ${doc.metadata.source} after ${MAX_RETRIES} attempts:`,
                  error
                );
                return null;
              }
              const retryDelay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1); // Exponential backoff
              console.warn(
                `Rate limit hit for ${doc.metadata.source}. Retrying (${attempt}/${MAX_RETRIES}) after ${retryDelay}ms...`
              );
              await delay(retryDelay);
            } else {
              // Non-rate-limit error, fail immediately
              console.error(`Error generating embedding for ${doc.metadata.source}:`, error);
              return null;
            }
          }
        }
      }

      return null; // Fallback (shouldn’t reach here)
    });

    // Wait for the current batch to complete
    const batchResults = await Promise.all(batchPromises);
    const successfulResults = batchResults.filter(
      (item): item is EmbeddingResult => item !== null
    );
    embeddings.push(...successfulResults);

    // Upload successful embeddings to Pinecone
    if (successfulResults.length > 0) {
      const vectors: PineconeRecord[] = successfulResults.map((result) => ({
        id: `${projectId}_${result.fileName.replace(/[^a-zA-Z0-9-_]/g, "_")}`,
        values: result.embedding,
        metadata: {
          fileName: result.fileName,
          sourceCode: result.sourceCode,
          summary: result.summary,
          projectId,
        },
      }));

      try {
        await uploadToPinecone(vectors, projectId);
        console.log(`Uploaded ${vectors.length} embeddings to Pinecone for project ${projectId}`);
      } catch (error) {
        console.error(`Failed to upload batch to Pinecone for project ${projectId}:`, error);
        // Continue processing next batch despite upload failure (or throw to stop)
      }
    }

    // Delay before the next batch (skip delay on the last batch)
    if (i + BATCH_SIZE < docs.length) {
      console.log(`Waiting ${DELAY_BETWEEN_BATCHES_MS}ms before next batch...`);
      await delay(DELAY_BETWEEN_BATCHES_MS);
    }
  }

  console.log("Embeddings generated and uploaded:", embeddings.length);
  return embeddings;
};