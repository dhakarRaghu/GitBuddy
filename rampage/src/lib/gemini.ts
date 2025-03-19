"use server";
import {GoogleGenerativeAI} from '@google/generative-ai';

import { Document } from '@langchain/core/documents';
// import { generate } from 'node_modules/@langchain/core/dist/utils/fast-json-patch';



const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const CHUNK_SIZE = 10000; // Adjust based on API limits (characters)

export const aiSummariseCommit = async (diff: string): Promise<string> => {
  try {
    // Split diff into chunks if too large
    const chunks = [];
    for (let i = 0; i < diff.length; i += CHUNK_SIZE) {
      chunks.push(diff.slice(i, i + CHUNK_SIZE));
    }

    const summaries: string[] = [];
    for (const chunk of chunks) {
      const prompt = `
        You are an expert programmer tasked with summarizing a Git commit diff in a concise, actionable way.
        Guidelines for summarizing:
        - Focus on the purpose and impact of the changes (e.g., bug fixes, features, refactoring).
        - Mention specific files only if there are 1-2 key files; omit file names if changes span many files.
        - Use clear, concise language (e.g., "Added user authentication", "Optimized database queries").
        - Ignore unchanged context lines (no '+' or '-' prefix).
        - Exclude metadata lines (e.g., "diff --git", "index") from the summary.
        - Avoid repeating example summaries verbatim.

        Git diff format reminder:
        - Lines starting with '+' are additions.
        - Lines starting with '-' are deletions.
        - Lines without '+' or '-' are context (not part of the changes).

        Example summaries:
        - "Added caching to improve API performance"
        - "Fixed validation bug in user signup form (src/auth.ts)"
        - "Refactored utility functions for better readability (src/utils.ts, src/helpers.ts)"
        - "Updated dependencies to latest versions"

        Summarize this diff chunk:\n${chunk}
      `;

      const response = await model.generateContent([prompt]);
      const summary = response.response.text().trim();
      if (summary) summaries.push(summary);
    }

    // Combine summaries from chunks
    const combinedSummary = summaries.length > 1
      ? summaries.map((s, i) => `Part ${i + 1}: ${s}`).join("\n")
      : summaries[0] || "No summary available";

    return combinedSummary || "No summary available";
  } catch (error) {
    console.error("Error during AI commit summarization:", error);
    const status = (error as any)?.response?.status;
    if (status === 403 || status === 429) {
      console.log("API rate limit reached.");
      return "Rate limit reached, unable to summarize";
    }
    return "Error summarizing commit";
  }
};
// export const aiSummariseCommit = async (diff: string) => {
//     const summaries: string[] = [];
//     try {
//       const response = await model.generateContent([
//         `You are an expert programmer, and you are trying to summarize a git diff.
//         Reminders about the git diff format:
//         For every file, there are a few metadata lines, like (for example):
//         diff --git a/lib/index.js b/lib/index.js
//         index aadf691..bfef603 100644
//         --- a/lib/index.js
//         +++ b/lib/index.js
//         This means that 'lib/index.js' was modified in this commit. Note that this is only an example.
//         Then there is a specifier of the lines that were modified.
//         A line starting with '+' means it was added.
//         A line starting with '-' means that line was deleted.
//         A line that starts with neither '+' nor '-' is code given for context and better understanding.
//         It is not part of the diff.
//         EXAMPLE SUMMARY COMMENTS:
//         Raised the amount of returned recordings from 10 to 100 (packages/server/recordings_api.ts), (packages/server/constants.ts)
//         Fixed a typo in the github action name (.github/workflows/gpt-commit-summarizer.yml)
//         Moved the 'octokit' initialization to a separate file (src/octokit.ts), (src/index.ts)
//         Added an OpenAI API for completions (packages/utils/apis/openai.ts)
//         Lowered numeric tolerance for test files
//         The last comment does not include the file names because there were more than two relevant files in the hypothetical commit.
//         Do not include parts of the example in your summary. It is given only as an example of appropriate comments.
//         Please summarise the following diff file: ${diff}`,
//       ]);
  
//       const summary = response.response.text();
  
//       if (summary.length) summaries.push(summary);
//       // console.log("Summary response:", summary);
//       return summary.trim() === "" ? "No summary available" : summary;
//     } catch (error) {
//       console.error("Error during AI commit summarization:", error);
  
//       // Check if the error is due to API rate limit
//       if ((error as any)?.response?.status === 403 || (error as any)?.response?.status === 429) {
//         console.log("API rate limit reached. Returning partial summaries.");
//         return summaries.join("\n");
//       } else {
//         return summaries.join("\n"); // Return whatever summaries were collected
//       }
//     }
//   };

  export async function generateEmbedding(summary: string) {
    // console.log("Generating embedding for \n", summary);
    try {
      const model = genAI.getGenerativeModel({
        model: "text-embedding-004",
      });
  
      const result = await model.embedContent(summary);
      const embedding = result.embedding;
      return embedding.values;
    } catch (error) {
      console.error("Error in generateEmbedding:", error);
  
      // Handle rate limit or other errors
      if ((error as any)?.response?.status === 403 || (error as any)?.response?.status === 429) {
        console.log("API rate limit reached. Returning partial embeddings.");
        return []; // Return empty array to signify partial embeddings
      }
      throw error; // Rethrow the error if not rate limit related
    }
  }


export async function summariseCode(doc: Document) {
    // console.log("Getting summary for\n", doc.metadata.source);
    const canSummarise = []
    try {
        const code = doc.pageContent.slice(0, 5000); // Limit to 10000 characters
        const response = await model.generateContent([
            `You are an intelligent senior software engineer specializing in onboarding junior software engineers onto projects.
            You are onboarding a junior software engineer and explaining the purpose of the ${doc.metadata.source} file.
            Here is the code:
            ${code}
            Give a summary no more than 100 words of the code above.`,
        ]);
        // console.log("Summary response:", response.response.text());
        canSummarise.push(response.response.text());
        return response.response.text();
    } catch (error) {
        console.error("n\Error in summariseCode:", error);
        return '';
        // throw error;
    }
}

