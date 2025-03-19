// import { Document } from '@langchain/core/documents';
//  // Your summarization function
// import { uploadToPinecone } from "./pineconedb"; // Pinecone upload function
// import { prisma } from "@/lib/db";
// import { generateEmbedding, summariseCode } from './gemini';
// import { loadGithubRepo } from './githubLoader';

// // Configuration
// const BATCH_SIZE = 10;
// const MAX_RETRIES = 3;
// const BASE_RETRY_DELAY_MS = 1000;
// const DELAY_BETWEEN_BATCHES_MS = 1000;

// export interface EmbeddingResult {
//   summary: string;
//   embedding: number[];
//   sourceCode: string;
//   fileName: string;
// }

// // In-memory cache for embeddings (persists across retries within a run)
// const embeddingCache = new Map<string, EmbeddingResult>();

// // Utility to delay execution
// const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// /**
//  * Generates embeddings for a repository, caching results and running in the background.
//  */
// export const RepoGenerateEmbeddings = (projectId: string, docs: Document[]): void => {
//   // Fire-and-forget background execution
//   (async () => {
//     try {
//       await prisma.project.update({
//         where: { id: projectId },
//         data: { indexingStatus: "IN_PROGRESS" },
//       });

//       const embeddings: EmbeddingResult[] = [];

//       for (let i = 0; i < docs.length; i += BATCH_SIZE) {
//         const batch = docs.slice(i, i + BATCH_SIZE);
//         console.log(`Processing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(docs.length / BATCH_SIZE)}`);

//         const batchPromises = batch.map(async (doc) => {
//           const cacheKey = `${projectId}_${doc.metadata.source}`;
//           const cached = embeddingCache.get(cacheKey);
//           if (cached) {
//             console.log(`Using cached embedding for ${doc.metadata.source}`);
//             return cached;
//           }

//           for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
//             try {
//               const summary = await summariseCode(doc);
//               const embedding = await generateEmbedding(summary);
//               const result: EmbeddingResult = {
//                 summary,
//                 embedding,
//                 sourceCode: doc.pageContent,
//                 fileName: doc.metadata.source,
//               };

//               embeddingCache.set(cacheKey, result);
//               return result;
//             } catch (error: any) {
//               if (error.response?.status === 429 || error.message.includes("rate limit")) {
//                 if (attempt === MAX_RETRIES) {
//                   console.error(
//                     `Failed embedding ${doc.metadata.source} after ${MAX_RETRIES} attempts:`,
//                     error
//                   );
//                   return null;
//                 }
//                 const retryDelay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
//                 console.warn(
//                   `Rate limit hit for ${doc.metadata.source}. Retrying (${attempt}/${MAX_RETRIES}) after ${retryDelay}ms`
//                 );
//                 await delay(retryDelay);
//               } else {
//                 console.error(`Error embedding ${doc.metadata.source}:`, error);
//                 return null;
//               }
//             }
//           }
//           return null; // Shouldn’t reach here due to retry loop
//         });

//         const batchResults = await Promise.all(batchPromises);
//         embeddings.push(...batchResults.filter((item): item is EmbeddingResult => item !== null));

//         if (i + BATCH_SIZE < docs.length) {
//           console.log(`Waiting ${DELAY_BETWEEN_BATCHES_MS}ms before next batch...`);
//           await delay(DELAY_BETWEEN_BATCHES_MS);
//         }
//       }

//       // Store embeddings in Pinecone
//       const vectors = embeddings.map((e) => ({
//         id: `${projectId}_${e.fileName.replace(/[^a-zA-Z0-9-_]/g, "_")}`,
//         values: e.embedding,
//         metadata: { fileName: e.fileName, sourceCode: e.sourceCode, summary: e.summary, projectId },
//       }));
//       await uploadToPinecone(vectors, projectId);

//       console.log(`Embeddings generated for project ${projectId}: ${embeddings.length}`);
//       await prisma.project.update({
//         where: { id: projectId },
//         data: { indexingStatus: "COMPLETED" },
//       });
//     } catch (error) {
//       console.error(`Embedding process failed for project ${projectId}:`, error);
//       await prisma.project.update({
//         where: { id: projectId },
//         data: { indexingStatus: "FAILED" },
//       });
//     }
//   })(); // Runs in background
// };

// /**
//  * Wrapper to initiate embedding process for a project
//  */
// export const startEmbeddingProcess = async (projectId: string, githubUrl: string) => {
//   const docs = await loadGithubRepo(githubUrl, process.env.GITHUB_TOKEN);
//   RepoGenerateEmbeddings(projectId, docs);
// };