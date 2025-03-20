"use server"
import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in the environment variables");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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