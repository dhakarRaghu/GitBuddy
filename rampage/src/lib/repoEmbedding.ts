import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config';

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

const embeddingCache = new Map<string, number[]>();
const MAX_PAYLOAD_SIZE = 9000;

/**
 * Truncates text to fit within the payload size limit.
 */
function truncateText(text: string, maxBytes: number): string {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(text);
  if (encoded.length <= maxBytes) return text;
  const truncated = encoded.slice(0, maxBytes);
  return new TextDecoder().decode(truncated).substring(0, Math.floor(maxBytes / 4));
}

/**
 * Checks if a vector is all zeros.
 */
function isZeroVector(vector: number[]): boolean {
  return vector.every(v => v === 0);
}

/**
 * Generates an embedding with retries and truncation.
 */
export async function generateEmbedding(text: string, retries: number = 3, timeoutMs: number = 10000): Promise<number[]> {
  const cached = embeddingCache.get(text);
  if (cached) {
    return cached;
  }

  const truncatedText = truncateText(text, MAX_PAYLOAD_SIZE);
  if (truncatedText !== text) {
    console.warn(`Truncated text from ${text.length} to ${truncatedText.length} characters for embedding`);
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Embedding timeout")), timeoutMs)
      );
      const embeddingPromise = model.embedContent(truncatedText).then(result => result.embedding.values);
      const embedding = await Promise.race([embeddingPromise, timeoutPromise]);
      if (isZeroVector(embedding)) {
        throw new Error("API returned an all-zero vector");
      }
      embeddingCache.set(text, embedding);
      return embedding;
    } catch (error) {
      if (attempt === retries) {

        throw error; // Let caller handle the failure
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
    }
  }
  throw new Error("Unexpected exit from retry loop");
}


export async function generateEmbeddings(texts: string[], batchSize: number = 10): Promise<number[][]> {
  const embeddings: number[][] = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchEmbeddings = await Promise.all(
      batch.map(async text => {
        try {
          return await generateEmbedding(text);
        } catch  {
          return null; // Mark as failed
        }
      })
    );
    embeddings.push(...batchEmbeddings.filter((embedding): embedding is number[] => embedding !== null));
  }
  return embeddings;
}

// // embedding.ts
// import { GoogleGenerativeAI } from '@google/generative-ai';
// import dotenv from 'dotenv';
// dotenv.config();

// const googleai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
//   .getGenerativeModel({ model: "text-embedding-004" });

// export const MAX_PAYLOAD_BYTES = 9000;
// export const OVERLAP_BYTES = 1000;
// export const API_CALL_DELAY_MS = 0; // delay between API calls to avoid rate limiting

// function splitLargeTextIntoOverlappingChunks(text: string, maxBytes: number, overlapBytes: number): string[] {
//   const encoder = new TextEncoder();
//   const encodedText = encoder.encode(text);
//   if (encodedText.length <= maxBytes) {
//     return [text];
//   }
//   const chunks: string[] = [];
//   let start = 0;
//   while (start < text.length) {
//     let end = start;
//     let currentChunk = "";
//     while (end < text.length) {
//       const tempChunk = text.substring(start, end + 1);
//       const tempEncoded = encoder.encode(tempChunk);
//       if (tempEncoded.length > maxBytes) {
//         break;
//       }
//       currentChunk = tempChunk;
//       end++;
//     }
//     if (currentChunk) {
//       chunks.push(currentChunk);
//     } else {
//       break;
//     }
//     start = end - overlapBytes;
//     if (start < 0) start = 0;
//     if (end === start) break;
//   }
//   return chunks;
// }

// function safeTextForEmbedding(text: string): string[] {
//   const encoder = new TextEncoder();
//   const encoded = encoder.encode(text);
//   if (encoded.length <= MAX_PAYLOAD_BYTES) {
//     return [text];
//   } else {
//     console.warn(`Text payload size (${encoded.length} bytes) exceeds limit. Splitting using overlapping sliding window.`);
//     return splitLargeTextIntoOverlappingChunks(text, MAX_PAYLOAD_BYTES, OVERLAP_BYTES);
//   }
// }

// /**
//  * Generate embedding for a given text.
//  * If the text is too long, it is split into overlapping chunks and each chunk is processed sequentially
//  * with a delay between API calls. The final embedding is the average of the individual embeddings.
//  */
// export async function generateEmbedding(text: string): Promise<number[]> {
//   const chunks = safeTextForEmbedding(text);
//   if (chunks.length === 1) {
//     try {
//       const result = await googleai.embedContent(chunks[0]);
//       return result.embedding.values;
//     } catch (error) {
//       console.error("Error generating embedding:", error);
//       throw error;
//     }
//   } else {
//     try {
//       // Process each chunk sequentially with a delay to avoid rate limiting.
//       const embeddings: number[][] = [];
//       for (const chunk of chunks) {
//         const result = await googleai.embedContent(chunk);
//         embeddings.push(result.embedding.values);
//         // Wait before processing the next chunk.
//         await new Promise(resolve => setTimeout(resolve, API_CALL_DELAY_MS));
//       }
//       // Average the embeddings.
//       const dims = embeddings[0].length;
//       const avgEmbedding = new Array(dims).fill(0);
//       for (const emb of embeddings) {
//         for (let i = 0; i < dims; i++) {
//           avgEmbedding[i] += emb[i];
//         }
//       }
//       for (let i = 0; i < dims; i++) {
//         avgEmbedding[i] /= embeddings.length;
//       }
//       return avgEmbedding;
//     } catch (error) {
//       console.error("Error generating embeddings for overlapping chunks:", error);
//       throw error;
//     }
//   }
// }

// /**
//  * Generate embeddings for an array of texts in batches.
//  * A delay is added between batches to manage rate limits.
//  */
// export async function generateEmbeddings(texts: string[], batchSize: number = 3): Promise<number[][]> {
//   const embeddings: number[][] = [];
//   for (let i = 0; i < texts.length; i += batchSize) {
//     const batch = texts.slice(i, i + batchSize);
//     const batchResults = [];
//     // Process each text in the batch sequentially (to be safe), or adjust if parallel processing is acceptable.
//     for (const text of batch) {
//       const emb = await generateEmbedding(text);
//       batchResults.push(emb);
//     }
//     embeddings.push(...batchResults);
//     // Delay between batches.
//     await new Promise(resolve => setTimeout(resolve, API_CALL_DELAY_MS));
//   }
//   return embeddings;
// }
