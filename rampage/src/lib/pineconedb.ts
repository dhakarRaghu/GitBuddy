
import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import dotenv from 'dotenv';
import { prisma } from "./db";
dotenv.config();

export const getPineconeClient = () => {
  return new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
};

function sanitizeMetadata(metadata: Record<string, any>): Record<string, string | number | boolean | string[]> {
  const sanitized: Record<string, string | number | boolean | string[]> = {};
  for (const key in metadata) {
    if (typeof metadata[key] === "string" ||
        typeof metadata[key] === "number" ||
        typeof metadata[key] === "boolean") {
      sanitized[key] = metadata[key];
    } else if (Array.isArray(metadata[key]) && metadata[key].every(v => typeof v === "string")) {
      sanitized[key] = metadata[key];
    } else {
      sanitized[key] = JSON.stringify(metadata[key]);
    }
  }
  return sanitized;
}

export async function uploadToPinecone(vectors: PineconeRecord[], namespace: string) {
  const client = getPineconeClient();
  const pineconeIndex = await client.index("gitbuddy");
  const ns = pineconeIndex.namespace(namespace);
  console.log("Inserting vectors into Pinecone...");
  
  try{
    const sanitizedVectors = vectors.map(vector => ({
      id: vector.id,
      values: vector.values,
      metadata: vector.metadata ? sanitizeMetadata(vector.metadata) : {},
    }));
    await ns.upsert(sanitizedVectors);
    console.log("Vectors upserted successfully.");
    await prisma.project.update({
      where: { id: namespace },
      data: { indexingStatus: "COMPLETED" },
    });
  }
  catch (error) {
    console.error("Error upserting vectors:", error);
    throw error;
  }
}
