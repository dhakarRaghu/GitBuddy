"use server";

import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { Pinecone } from "@pinecone-database/pinecone";
import { generateEmbedding } from "@/lib/gemini";
import { prisma } from "@/lib/db";
import axios from "axios";
import { loadGithubRepo } from "@/lib/githubLoader";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || "",
});
const index = pinecone.index("gitbuddy");



// export async function initializeProjectEmbeddings(projectId: string, githubUrl: string) {
//   // const existingVectors = await index.namespace(projectId).fetch(["metadata"]);
//   // if (existingVectors.records && Object.keys(existingVectors.records).length > 0) {
//   //   console.log(`Embeddings already exist for project ${projectId}`);
//   //   return;
//   // }

//   console.log(`Initializing embeddings for project ${projectId}`);
//   // const files = await fetchRepoFiles(githubUrl);
//   const files = await loadGithubRepo(githubUrl);
//   // console.log(`Fetched ${files.length} files from repository` , files);

//   // const vectors = await Promise.all(
//   //   files.map(async (file, idx) => {
//   //     const embedding = await generateEmbedding(file.summary);
//   //     return {
//   //       id: `${projectId}_${idx}`,
//   //       values: embedding,
//   //       metadata: {
//   //         fileName: file.fileName,
//   //         sourceCode: file.sourceCode,
//   //         summary: file.summary,
//   //         projectId,
//   //       },
//   //     };
//   //   })
//   // );

//   // await index.namespace(projectId).upsert(vectors);
//   // console.log(`Upserted ${vectors.length} embeddings for project ${projectId}`);
// }

// export async function askQuestion(question: string, projectId: string) {
//   const stream = createStreamableValue();

//   const project = await prisma.project.findUnique({
//     where: { id: projectId },
//     select: { githubUrl: true },
//   });

//   if (!project?.githubUrl) {
//     throw new Error("Project has no GitHub URL");
//   }

//   await initializeProjectEmbeddings(projectId, project.githubUrl);

//   const queryVector = await generateEmbedding(question);
//   const queryResponse = await index.namespace(projectId).query({
//     vector: queryVector,
//     topK: 10,
//     includeMetadata: true,
//   });

  // const filesReferences = queryResponse.matches
  //   .filter((match) => match.score && match.score > 0.5)
  //   .map((match) => ({
  //     fileName: match.metadata?.fileName as string,
  //     sourceCode: match.metadata?.sourceCode as string,
  //     summary: match.metadata?.summary as string,
  //   }));

  // let context = "";
  // for (const doc of filesReferences) {
  //   context += `source: ${doc.fileName}\ncode content: ${doc.sourceCode}\nsummary of file: ${doc.summary}\n\n`;
  // }

  // (async () => {
  //   const { textStream } = await streamText({
  //     model: google("gemini-1.5-flash"),
  //     prompt: `
  //       You are GitBuddy, a GitHub Copilot-like AI assistant that helps developers navigate and understand their repository.
  //       Your audience is a technical intern, so provide clear, step-by-step explanations.
  //       Traits: Expert knowledge, helpful, clever, articulate, friendly, and inspiring.
  //       Use markdown syntax for answers, including code snippets where relevant.

  //       START CONTEXT BLOCK
  //       ${context}
  //       END OF CONTEXT BLOCK

  //       START QUESTION
  //       ${question}
  //       END OF QUESTION

  //       Use the CONTEXT BLOCK to provide detailed, actionable answers about the codebase.
  //       If the context lacks sufficient information, say: "I don't have enough data from the repository to answer this fully. Try asking something more specific or check the repo directly."
  //       Do not invent information beyond the context.
  //     `,
  //   });

  //   for await (const delta of textStream) {
  //     stream.update(delta);
  //   }
  //   stream.done();
  // })();

  // return {
  //   output: stream.value,
  //   filesReferences,
  // };
// }

// export async function getQuestions(projectId: string) {
//   try {
//     const questions = await prisma.question.findMany({
//       where: { projectId },
//       include: {
//         user: {
//           select: {
//             profilePicture: true, // Replace 'profilePicture' with a valid property from 'UserSelect<DefaultArgs>'
//             name: true,
//           },
//         },
//         filesReferences: true,
//       },
//       orderBy: { createdAt: "desc" },
//     });

//     return {
//       data: questions,
//       isLoading: false,
//     };
//   } catch (error) {
//     console.error("Error fetching questions:", error);
//     return {
//       data: null,
//       isLoading: false,
//       error: "Failed to fetch questions",
//     };
//   }
// }
export async function getQuestions(projectId: string) {
  // Fetch questions logic
  const questions = await prisma.question.findMany({
    where: { projectId },
    include: {
      user: {
        select: {
          image: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return {
    data: questions.map((q) => ({
      question: q.question,
      id: q.id,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
      answer: q.answer,
      filesReferences: q.filesReferences,
      projectId: q.projectId,
      userId: q.userId,
      user: {
        imageUrls: q.user.image || null,
        name: q.user.name || "Unknown",
      },
    })),
    isLoading: false,
  };
}