"use server";

import {streamText } from 'ai'
import {createStreamableValue} from 'ai/rsc'
import{ createGoogleGenerativeAI} from '@ai-sdk/google'

import { getPineconeClient } from "@/lib/pineconedb";
import { prisma } from "@/lib/db";

import { generateEmbedding } from "./repoEmbedding";
import { Octokit } from "octokit";


interface FileReference {
  fileName: string;
  sourceCode: string;
  summary: string;
  score?: number;
}


const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Initialize Pinecone and Gemini
const pinecone = getPineconeClient();

// Configuration
const TOP_K = 5;
const SCORE_THRESHOLD = 0.7;
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 1000;

// In-memory cache for query embeddings
const queryEmbeddingCache = new Map<string, number[]>();

// Utility to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Interface for search results
interface SearchResult {
  fileName: string;
  sourceCode: string;
  summary: string;
  score: number;
}

/**
 * Searches Pinecone for embeddings with retry logic and caching
 */
async function searchEmbeddings(query: string, namespace: string): Promise<SearchResult[]> {
  const pineconeIndex = pinecone.index("gitbuddy");
  const ns = pineconeIndex.namespace(namespace);

  // Check cache for query embedding
  let queryEmbedding = queryEmbeddingCache.get(query);
  if (!queryEmbedding) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        queryEmbedding = await generateEmbedding(query);
        queryEmbeddingCache.set(query, queryEmbedding);
        break;
      } catch (error: any) {
        if (error.response?.status === 429 || error.message.includes("rate limit")) {
          if (attempt === MAX_RETRIES) {
            console.error(`Failed to generate query embedding after ${MAX_RETRIES} attempts:`, error);
            throw error;
          }
          const retryDelay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          console.warn(`Rate limit hit for query embedding. Retrying after ${retryDelay}ms...`);
          await delay(retryDelay);
        } else {
          console.error("Error generating query embedding:", error);
          throw error;
        }
      }
    }
  }

  try {
    const queryResult = await ns.query({
      vector: queryEmbedding!,
      topK: TOP_K,
      includeMetadata: true,
    });

    return (queryResult.matches || [])
      .filter((match) => match.score && match.score > SCORE_THRESHOLD)
      .map((match) => ({
        fileName: match.metadata?.fileName as string,
        sourceCode: match.metadata?.sourceCode as string,
        summary: match.metadata?.summary as string,
        score: match.score ?? 0,
      }));
  } catch (error) {
    console.error(`Error querying Pinecone namespace ${namespace}:`, error);
    throw error;
  }
}

/**
 * Normalizes scores to a 0-1 range
 */
function normalizeResults(results: SearchResult[]): SearchResult[] {
  const maxScore = Math.max(...results.map((r) => r.score), 1); // Avoid division by zero
  return results.map((r) => ({ ...r, score: r.score / maxScore }));
}

/**
 * Retrieves unique, sorted vector results
 */
async function retrieveVectorResults(query: string, namespace: string): Promise<SearchResult[]> {
  const vectorResults = await searchEmbeddings(query, namespace);
  const normalizedResults = normalizeResults(vectorResults);
console.log("normalizedResults", normalizedResults);
  const sortedResults = normalizedResults.sort((a, b) => b.score - a.score);
  const uniqueResults: { [key: string]: SearchResult } = {};

  for (const result of sortedResults) {
    if (!uniqueResults[result.fileName] && result.fileName.trim()) {
      uniqueResults[result.fileName] = result;
      if (Object.keys(uniqueResults).length === TOP_K) break;
    }
  }

  return Object.values(uniqueResults);
}

// /**
//  * Enhanced askQuestion function with Pinecone retrieval
//  */
export async function askQuestion(question: string, projectId: string) {
  console.log("Asking question:", question);
  console.log("For project:", projectId);
  // console.log("process.env.GEMINI_API_KEY", process.env.GEMINI_API_KEY);

  const stream = createStreamableValue();

  // Check project status
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { githubUrl: true, indexingStatus: true },
  });

  if (!project?.githubUrl) {
    stream.update("Error: Project has no GitHub URL.");
    stream.done();
    return { output: stream.value, filesReferences: [] };
  }

  // Retrieve vector results
  let filesReferences: SearchResult[];
  try {
    filesReferences = await retrieveVectorResults(question, projectId);
  } catch (error) {
    console.error(`Error retrieving vector results for project ${projectId}:`, error);
    stream.update("Unable to retrieve relevant files due to an error.");
    stream.done();
    return { output: stream.value, filesReferences: [] };
  }
  console.log("filesReferences", filesReferences);

  if (filesReferences.length === 0) {
    // Fallback to GitHub API if a specific file is mentioned
    const filePathMatch = question.match(/\(([^)]+)\)/);
    const specificFilePath = filePathMatch ? filePathMatch[1] : null;

    if (specificFilePath) {
      try {
        const [owner, repo] = project.githubUrl.split("/").slice(-2);
        const fileResponse = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: specificFilePath,
        });

        if ("content" in fileResponse.data) {
          const fileContent = Buffer.from(fileResponse.data.content, "base64").toString("utf-8");
          filesReferences = [
            {
              fileName: specificFilePath,
              sourceCode: fileContent,
              summary: `The file ${specificFilePath} was retrieved directly from GitHub. No summary available from Pinecone.`,
              score: 1.0,
            },
          ];
        } else {
          stream.update(`Error: The file ${specificFilePath} could not be found in the repository.`);
          stream.done();
          return { output: stream.value, filesReferences: [] };
        }
      } catch (error) {
        console.error(`Error fetching file ${specificFilePath} from GitHub:`, error);
        stream.update(`Error: Unable to fetch the file ${specificFilePath} from GitHub. Please check the file path and try again.`);
        stream.done();
        return { output: stream.value, filesReferences: [] };
      }
    } else {
      stream.update("No relevant information found in the repository.");
      stream.done();
      return { output: stream.value, filesReferences: [] };
    }
  }

  // Build context, leveraging the structured summaries
  let context = "";
  for (const doc of filesReferences) {
    context += `
      ### File: ${doc.fileName}
      #### Summary:
      ${doc.summary}

      #### Code Content:
      \`\`\`
      ${doc.sourceCode.slice(0, 2000)}
      \`\`\`
      \n\n`;
  }

  // Stream answer
  (async () => {
    try {
      const { textStream } = await streamText({
        model: google("gemini-1.5-flash"),
        prompt: `
          You are **GitBuddy**, an intelligent AI assistant designed to help technical interns understand and navigate GitHub repositories. Your task is to provide clear, actionable, and professional responses in **Markdown format**, tailored to the user's query. You can analyze code, suggest improvements, identify errors, or provide general guidance based on the context provided.

          ---

          ## ✅ **Guidelines for Responses**

          ### 1. **Markdown Formatting**
          - Use **headings** (\`#\`, \`##\`, \`###\`) to organize content logically.
          - Use **bullet points** and **numbered lists** for clarity.
          - For code snippets, use **code blocks** (\`\`\`language) with the appropriate language (e.g., \`typescript\`, \`javascript\`).
          - Apply **bold** or *italic* text for emphasis where needed.

          ### 2. **Response Style**
          - Be **concise** yet **comprehensive**—focus on the user's query while simplifying complex concepts.
          - Use a **friendly, approachable tone** with a professional edge, suitable for technical interns.
          - Provide **step-by-step explanations** for code improvements or error fixes.
          - Highlight **key takeaways** or practical insights (e.g., "This file handles routing").

          ### 3. **Handling Specific Query Types**
          - **Code Improvement (e.g., "improve the styling and UI")**:
            - Analyze the provided code and suggest specific improvements in styling, UI, or structure.
            - Provide a revised version of the code with explanations for each change.
            - Focus on modern best practices (e.g., Tailwind CSS, responsive design, accessibility).
          - **Error Detection (e.g., "tell me the error in the file")**:
            - Analyze the code for syntax errors, logical issues, or potential bugs.
            - Explain the error in simple terms and provide a corrected version of the code.
            - Suggest best practices to avoid similar issues in the future.
          - **General Queries**:
            - Summarize the file's purpose, functionality, or role in the project using the provided summary.
            - Provide actionable advice based on the query (e.g., "To change the homepage, edit this file").

          ### 4. **Edge Cases**
          - If the file content is incomplete, indicate the gap and provide a logical interpretation.
          - If the query is unrelated to the file, respond with: "This query doesn't seem related to the provided file. Try asking something more specific or check the repo directly."
          - If no actionable insights can be provided, say: "I'm sorry, but I don't have enough data to answer this fully. Try asking something more specific or check the repo directly."

          ### 5. **Leverage Structured Summaries**
          - The context includes detailed summaries for each file, structured with sections like "Overview", "Key Components", "Interactions", "Dependencies", and "Key Takeaways".
          - Use these summaries to answer general queries about the file's purpose or role.
          - For code-specific queries (e.g., improvements, errors), analyze the "Code Content" section in addition to the summary.

          ---

          ## 🚀 **Task**
          You are GitBuddy, an AI code assistant helping technical interns navigate a GitHub repository.
          Provide clear, step-by-step answers in markdown syntax, including code snippets where relevant.
          Traits: expert knowledge, helpfulness, cleverness, articulateness, friendly, kind, and inspiring.
          Use the context below to answer accurately, avoiding invented information.

          START CONTEXT BLOCK
          ${context}
          END OF CONTEXT BLOCK

          START QUESTION
          ${question}
          END OF QUESTION

          If the context lacks sufficient information, say: "I'm sorry, but I don't have enough data from the repository to answer this fully. Try asking something more specific or check the repo directly."
        `,
      });

      for await (const delta of textStream) {
        stream.update(delta);
      }
      stream.done();
    } catch (error) {
      console.error(`Error generating answer for project ${projectId}:`, error);
      stream.error("Unable to generate an answer due to an error.");
    }
  })();

  return { output: stream.value, filesReferences };
}