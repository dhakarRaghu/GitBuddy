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

  // export async function generateEmbedding(summary: string) {
  //   // console.log("Generating embedding for \n", summary);
  //   try {
  //     const model = genAI.getGenerativeModel({
  //       model: "text-embedding-004",
  //     });
  
  //     const result = await model.embedContent(summary);
  //     const embedding = result.embedding;
  //     return embedding.values;
  //   } catch (error) {
  //     console.error("Error in generateEmbedding:", error);
  
  //     // Handle rate limit or other errors
  //     if ((error as any)?.response?.status === 403 || (error as any)?.response?.status === 429) {
  //       console.log("API rate limit reached. Returning partial embeddings.");
  //       return []; // Return empty array to signify partial embeddings
  //     }
  //     throw error; // Rethrow the error if not rate limit related
  //   }
  // }

  // export async function summariseCode(doc: Document): Promise<string> {
  //   const fileName = doc.metadata.source || "unknown file";
  //   console.log(`Generating summary for ${fileName}`);
  
  //   const MAX_CODE_SIZE = 10000; // Increased to 15k characters (approx. 3k-4k tokens, well within Gemini 1.5 Flash limits)
  //   const code = doc.pageContent.slice(0, MAX_CODE_SIZE);
  //   if (!code.trim()) {
  //     console.warn(`Empty code content for ${fileName}`);
  //     return `The file ${fileName} is empty or contains no meaningful content.`;
  //   }
  //   if (doc.pageContent.length > MAX_CODE_SIZE) {
  //     console.warn(`Code for ${fileName} truncated from ${doc.pageContent.length} to ${MAX_CODE_SIZE} characters`);
  //   }
  
  //   try {
  //     const prompt = `
  //       You are an expert senior software engineer onboarding a junior engineer to a project while also preparing detailed summaries for an AI system to generate embeddings. Your task is to summarize the purpose, key functionality, and role of the file "${fileName}" in a way that:
  //       Your task is to analyze the file "${fileName}" and provide a structured and informative summary that serves two key purposes:
  //       1. **Onboarding** - Make it clear and easy for a junior engineer to understand the purpose and functionality of the file.
  //       2. **AI Embedding** - Include enough detail and structure to enable accurate retrieval when answering technical questions.

  //       ### Provide a detailed summary that includes:
  //       - Purpose: Explain the file's role within the project and why it's important.
  //       - Key Components: Identify major functions, classes, variables, or logic blocks and describe their responsibilities.
  //       - Interaction: Explain how these components interact with each other and with other files or systems (e.g., APIs, modules, UI).
  //       - Patterns & Dependencies**: Highlight any notable patterns, dependencies, or external libraries used.
  //       - Actionability: Provide enough insight to answer common developer questions like:
  //           - "Which file handles X?"
  //           - "Where is Y defined?"
  //           - "How does Z work?"
  
  //       Here is the code:
  //       \`\`\`
  //       ${code}
  //       \`\`\`
  
  //       Provide a summary in plain English that:
  //       - Describes what the file does and why it matters in the project.
  //       - Lists key functions, classes, or logic blocks and their purposes.
  //       - Notes any connections to other files or systems (if inferable).
  //       - Ensures enough context for embeddings to match user queries effectively.
  //       - Provide enough detail for a junior engineer to understand the file's role.

  //       # DO NOT INCLUDE UNNECESSARY METADATA IN THE SUMMARY.
  //     `;
  
  //     const response = await model.generateContent([prompt]);
  //     let summary = response.response.text().trim();
  
  //     // // Word count check (target 150-200 words)
  //     const words = summary.split(/\s+/).length;
  //     // if (words > 200) {
  //     //   console.warn(`Summary for ${fileName} exceeds 200 words (${words}), truncating...`);
  //     //   summary = summary.split(/\s+/).slice(0, 195).join(" ") + "...";
  //     // } else if (words < 150) {
  //     //   console.warn(`Summary for ${fileName} is under 150 words (${words}), may lack detail`);
  //     // }
  
  //     console.log(`Summary for ${fileName} (${words} words):`, summary);
  //     return summary;
  //   } catch (error) {
  //     console.error(`Error summarizing ${fileName}:`, error);
  //     return `The file ${fileName} could not be summarized due to an error. It contains code that may define functions, classes, or logic, but specific details are unavailable. Check the file manually for its role in the project.`;
  //   }
  // }



const embeddingCache = new Map<string, number[]>();
const MAX_PAYLOAD_SIZE = 9500;

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

function isZeroVector(vector: number[]): boolean {
  return vector.every(v => v === 0);
}


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


// import { Document } from "@langchain/core/documents";
// import { model } from "@/lib/gemini"; // Assuming this is your Gemini model setup

// interface FileSummary {
//   summary: string;
//   metadata?: {
//     fileName: string;
//     language?: string;
//     fileType?: string;
//     wordCount: number;
//   };
// }

export async function summariseCode(doc: Document): Promise<string> {
  const fileName = doc.metadata.source || "unknown file";
  console.log(`Generating summary for ${fileName}`);

  const MAX_CODE_SIZE = 15000; // Increased to 15k characters to allow more context (within Gemini 1.5 Flash limits)
  const code = doc.pageContent.slice(0, MAX_CODE_SIZE);
  if (!code.trim()) {
    console.warn(`Empty code content for ${fileName}`);
    return `The file ${fileName} is empty or contains no meaningful content.`;
  }
  if (doc.pageContent.length > MAX_CODE_SIZE) {
    console.warn(`Code for ${fileName} truncated from ${doc.pageContent.length} to ${MAX_CODE_SIZE} characters`);
  }

  // Infer file language and type from the file extension (optional metadata for embeddings)
  const fileExtension = fileName.split(".").pop()?.toLowerCase();
  const languageMap: { [key: string]: string } = {
    ts: "TypeScript",
    tsx: "TypeScript (TSX)",
    js: "JavaScript",
    jsx: "JavaScript (JSX)",
    py: "Python",
    css: "CSS",
    html: "HTML",
  };
  const language = languageMap[fileExtension || ""] || "Unknown";
  const fileType = fileExtension === "tsx" || fileExtension === "jsx" ? "Component" : "Module";

  try {
    const prompt = `
      You are an expert senior software engineer tasked with creating a detailed summary of the file "${fileName}" for two purposes:
      1. **Onboarding a Junior Engineer**: Help a junior engineer understand the file's purpose, functionality, and role in the project.
      2. **AI Embedding for Retrieval**: Provide a detailed, structured summary that enables accurate retrieval for technical queries (e.g., "What does ${fileName} do?", "Tell me about ${fileName}") by explicitly mentioning the file name in key sections.

      ---

      ## ✅ **Guidelines for Summarization**

      ### 1. **Markdown Formatting**  
          - Use appropriate **headings** (\`#\`, \`##\`, \`###\`) to organize the content logically and enhance readability.  
          - Present information using **bullet points** and **numbered lists** for clarity and structure.  
          - For technical terms or code snippets, use **code blocks** (\`\`\`language).  
          - Apply **bold** or *italic* text for emphasis where needed.  

      - Include the following sections:
        - **Overview of ${fileName}**: A brief description of the file's purpose and role in the project.
        - **Key Components in ${fileName}**: List major functions, classes, variables, or logic blocks, and describe their responsibilities.
        - **Interactions of ${fileName}**: Explain how the file interacts with other files, modules, APIs, or systems.
        - **Dependencies in ${fileName}**: Highlight notable dependencies, libraries, or patterns used.
        - **Key Takeaways for ${fileName}**: Provide actionable insights for common developer questions.

      ### 2. **Detail and Clarity**
      - Be **detailed** but **concise**—but not more than 500 words to capture enough context for embeddings.
      - Add **context** where necessary to clarify the content and make it more actionable without losing the core message..  
      - Use a **friendly, approachable tone** suitable for junior engineers, while maintaining technical accuracy.
      - Explain technical concepts in simple terms (e.g., "In ${fileName}, this function fetches user data from an API").
      - Include **specific names** of functions, classes, or variables to improve retrieval accuracy (e.g., "The \`fetchUserData\` function in ${fileName} handles API calls").

      ### 3. **File Name Inclusion for Embeddings**
      - Explicitly mention the file name "${fileName}" in each section to improve embedding match accuracy.
      - Use the file name naturally in sentences (e.g., "In ${fileName}, the \`Page\` component renders the homepage").
      - Pair the file name with relevant keywords (e.g., "${fileName} handles the homepage", "${fileName} uses React").

      ### 4. **Keyword Optimization for Embeddings**
      - Include **relevant keywords** that match potential user queries, such as:
        - File purpose (e.g., "homepage", "routing", "authentication").
        - Function/class names (e.g., "fetchUserData", "UserProfile").
        - Libraries or frameworks (e.g., "React", "Next.js", "Tailwind CSS").
        - Key concepts (e.g., "state management", "API integration").
      - Avoid generic phrases—be specific to the file's content.

      ### 5. **Edge Cases**
      - If the code is incomplete or unclear, note the limitation (e.g., "Purpose of ${fileName} unclear due to partial code").
      - If the file appears irrelevant to the project, explain why (e.g., "${fileName} seems to be a configuration file with no direct functionality").
      - If no meaningful summary can be generated, provide a fallback description (e.g., "${fileName} contains code, but its purpose is unclear").

      ### 6. **Avoid Unnecessary Metadata**
      - Do not include metadata like file paths, line numbers, or timestamps in the summary.
      - Focus on the content and its role in the project.

      ---

      ## 🚀 **Task**
      Analyze the file "${fileName}" and provide a detailed summary following the guidelines above. The summary should help a junior engineer understand the file and enable accurate retrieval for technical queries about "${fileName}".

      Here is the code:
      \`\`\`
      ${code}
      \`\`\`

      Provide the summary in Markdown format with the specified sections, ensuring the file name "${fileName}" is mentioned in each section.
    `;

    const response = await model.generateContent([prompt]);
    let summary = response.response.text().trim();

    // Ensure the summary has the required sections (fallback if missing)
    const requiredSections = [
      `Overview of ${fileName}`,
      `Key Components in ${fileName}`,
      `Interactions of ${fileName}`,
      `Dependencies in ${fileName}`,
      `Key Takeaways for ${fileName}`,
    ];
    let formattedSummary = summary;
    for (const section of requiredSections) {
      if (!summary.includes(`## ${section}`)) {
        formattedSummary += `\n\n## ${section}\nDetails not available for ${fileName}. Please review the file manually for more information.`;
      }
    }

    // Word count check (target 200-300 words)
    const words = formattedSummary.split(/\s+/).length;
    // if (words > 300) {
    //   console.warn(`Summary for ${fileName} exceeds 300 words (${words}), truncating...`);
    //   formattedSummary = formattedSummary.split(/\s+/).slice(0, 295).join(" ") + "...";
    // } else if (words < 200) {
    //   console.warn(`Summary for ${fileName} is under 200 words (${words}), adding more context...`);
    //   formattedSummary += `\n\n## Additional Context for ${fileName}\nThe file ${fileName} is a ${language} ${fileType.toLowerCase()} that likely plays a role in the project. Review the code for specific functionality.`;
    // }

    console.log(`Summary for ${fileName} (${words} words):`, formattedSummary);

    // Optionally, return metadata for embeddings (not included in the summary text)
    // const summaryWithMetadata: FileSummary = {
    //   summary: formattedSummary,
    //   metadata: {
    //     fileName,
    //     language,
    //     fileType,
    //     wordCount: words,
    //   },
    // };

    return formattedSummary;
  } catch (error) {
    console.error(`Error summarizing ${fileName}:`, error);
    const fallbackSummary = `
## Overview of ${fileName}
The file ${fileName} contains ${language} code, but its purpose could not be determined due to an error.

## Key Components in ${fileName}
Specific functions, classes, or logic blocks in ${fileName} are unavailable.

## Interactions of ${fileName}
Interactions of ${fileName} with other files or systems are unclear.

## Dependencies in ${fileName}
Dependencies used by ${fileName} could not be identified.

## Key Takeaways for ${fileName}
Check ${fileName} manually to understand its role in the project.
    `;
    return fallbackSummary;
  }
}