// config.ts
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
  PINECONE_API_KEY: process.env.PINECONE_API_KEY!,
  PINECONE_INDEX: "insigts", // Adjust as needed
};

if (!config.GEMINI_API_KEY || !config.PINECONE_API_KEY) {
  throw new Error("Missing required environment variables: GEMINI_API_KEY or PINECONE_API_KEY");
}