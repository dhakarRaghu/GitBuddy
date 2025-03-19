"use server";

import { Pinecone } from "@pinecone-database/pinecone";
import {streamText } from 'ai'
import {createStreamableValue} from 'ai/rsc'
import{ createGoogleGenerativeAI} from '@ai-sdk/google'

import { getPineconeClient } from "@/lib/pineconedb";
import { prisma } from "@/lib/db";
import { config } from "@/lib/config";
import { RepoGenerateEmbeddings } from "./githubLoader";
import { generateEmbedding } from "./repoEmbedding";

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
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

/**
 * Enhanced askQuestion function with Pinecone retrieval
 */
export async function askQuestion(question: string, projectId: string) {
    console.log("Asking question:", question);
    console.log("For project:", projectId);
    
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

    // await RepoGenerateEmbeddings(projectId);

  // if (project.indexingStatus !== "COMPLETED") {
  //   stream.update("Error: Project indexing is not yet complete. Please wait.");
  //   stream.done();
  //   return { output: stream.value, filesReferences: [] };
  // }

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
    stream.update("No relevant information found in the repository.");
    stream.done();
    return { output: stream.value, filesReferences: [] };
  }

  // Build context
  let context = "";
  for (const doc of filesReferences) {
    context += `
      File: ${doc.fileName}
      Summary: ${doc.summary}
      Code Content:
      \`\`\`
      ${doc.sourceCode.slice(0, 2000)}
      \`\`\`
      \n\n`;
  }

  // Stream answer


  (async () => {
    try {
      const { textStream } = await streamText({
        model: google('gemini-1.5-flash'),
        prompt: `
        You are **GitBuddy**, an intelligent AI assistant designed to help technical interns understand and navigate GitHub repositories. Your task is to transform raw repository data—such as file names, source code, and summaries—into a **well-organized, professional-quality summary** in **Markdown format**. The goal is to present the content in a clear, structured, and engaging manner, making it easy for interns to grasp key details and use the information effectively.

            ---

            ## ✅ **Guidelines for Summarization**
            Follow these detailed instructions to ensure the summary is polished and intern-friendly:

            ### 1. **Markdown Formatting**
            - Use appropriate **headings** (\`#\`, \`##\`, \`###\`) to organize content logically and enhance readability.
            - Present information using **bullet points** and **numbered lists** for clarity and structure.
            - For code snippets or file references, use **code blocks** (\`\`\`language) with the appropriate language (e.g., \`typescript\`, \`javascript\`).
            - Apply **bold** or *italic* text for emphasis where needed to highlight key points.

            ---

            ### 2. **Summarization Style**
            - Be **concise** yet **comprehensive**—capture essential details while simplifying complex code or concepts.
            - Use a **friendly, approachable tone** with a professional edge, suitable for technical interns.
            - Eliminate redundant or irrelevant code/comments without losing critical functionality or intent.
            - Ensure the summary is easy to follow, with a logical flow tailored to beginners.

            ---

            ### 3. **Enhancement Guidelines**
            - Refine the language to improve **flow** and **readability** without altering the original meaning of the code or summary.
            - Explain technical terms, functions, or complex logic using **simple language** to aid understanding.
            - Add **context** (e.g., file purpose, usage in the project) to make the summary actionable for interns.
            - Highlight **key takeaways** or practical insights (e.g., "This file handles routing") to boost comprehension.

            ---

            ### 4. **Handling Edge Cases**
            - If the content is incomplete (e.g., missing summary or partial code), **indicate the gap** and provide a logical interpretation.
            - If details are missing, make an informed guess where possible or note the limitation (e.g., "Purpose unclear without more context").
            - If the content is irrelevant to the repository or question, respond with a polite explanation and suggest checking the repo directly.

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