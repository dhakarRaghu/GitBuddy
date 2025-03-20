"use server";
import {GoogleGenerativeAI} from '@google/generative-ai';

import { Document } from '@langchain/core/documents';



const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Constants for chunk size and retry configuration
const CHUNK_SIZE = 15000; // Adjust based on API token limits
const MAX_RETRIES = 3; // Maximum number of retries
const BASE_DELAY_MS = 2000; // Base delay for exponential backoff (2 seconds)

// Utility function for exponential backoff delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const aiSummariseCommit = async (diff: string): Promise<string> => {
  try {
    // Split diff into chunks if too large
    const chunks = [];
    for (let i = 0; i < 30000; i += CHUNK_SIZE) {
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

      // Retry logic for the API call
      let lastError: any;
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          const response = await model.generateContent([prompt]);
          const summary = response.response.text().trim();
          if (summary) summaries.push(summary);
          break; // Success, exit retry loop
        } catch (error) {
          lastError = error;
          const status = (error as any)?.response?.status;

          // Check for rate limit error (429)
          if (status === 429) {
            if (attempt === MAX_RETRIES) {
              console.error(`Max retries (${MAX_RETRIES}) reached for rate limit error.`);
              break; // Max retries reached, exit loop
            }

            // Calculate delay with exponential backoff: baseDelay * 2^(attempt-1)
            const delayMs = BASE_DELAY_MS * Math.pow(2, attempt - 1);
            console.log(
              `Rate limit hit (429) on attempt ${attempt}/${MAX_RETRIES}. Retrying after ${delayMs}ms...`
            );
            await delay(delayMs);
            continue; // Retry the API call
          } else if (status === 403) {
            // 403 might indicate a permissions issue or quota exhaustion
            console.error("API returned 403 (Forbidden):", error);
            break; // No point in retrying for 403
          } else {
            // Other errors (e.g., 500, network issues) might be transient, so retry
            if (attempt === MAX_RETRIES) {
              console.error(`Max retries (${MAX_RETRIES}) reached for error:`, error);
              break;
            }
            const delayMs = BASE_DELAY_MS * Math.pow(2, attempt - 1);
            console.log(
              `Error on attempt ${attempt}/${MAX_RETRIES}. Retrying after ${delayMs}ms...`
            );
            await delay(delayMs);
            continue;
          }
        }
      }

      // If the last attempt failed, throw the last error to handle it in the outer catch block
      if (lastError && summaries.length < chunks.length) {
        throw lastError;
      }
    }

    // Combine summaries from chunks
    const combinedSummary =
      summaries.length > 1
        ? summaries.map((s, i) => `Part ${i + 1}: ${s}`).join("\n")
        : summaries[0] || "No summary available";

    return combinedSummary || "No summary available";
  } catch (error) {
    console.error("Error during AI commit summarization:", error);
    const status = (error as any)?.response?.status;
    if (status === 403 || status === 429) {
      console.log("API rate limit or quota issue.");
      return "Rate limit or quota exceeded, unable to summarize";
    }
    return "Error summarizing commit";
  }
};

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

  // Retry configuration
  const MAX_RETRIES = 3;
  const BASE_RETRY_DELAY_MS = 1000;
  // const TIMEOUT_MS = 30000; // 30 seconds timeout for the API call

  // Utility to delay execution
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
      - Add **context** where necessary to clarify the content and make it more actionable without losing the core message.  
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


  try {
    let summary: string;

    // Retry loop for API rate limit errors
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await model.generateContent([prompt]);
        summary = response.response.text().trim();
        break; // Success, exit the retry loop
      } catch (error: any) {
        if (error.response?.status === 429 || error.message.includes("rate limit")) {
          if (attempt === MAX_RETRIES) {
            console.error(`Failed to summarize ${fileName} after ${MAX_RETRIES} attempts due to rate limit:`, error);
            throw new Error("API rate limit exceeded after retries");
          }
          const retryDelay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          console.warn(
            `Rate limit hit while summarizing ${fileName}. Retrying (${attempt}/${MAX_RETRIES}) after ${retryDelay}ms...`,
          );
          await delay(retryDelay);
        } else {
          console.error(`Error summarizing ${fileName}:`, error);
          throw error; // Non-rate-limit error, throw immediately
        }
      }
    }

    // Ensure the summary has the required sections (fallback if missing)
    const requiredSections = [
      `Overview of ${fileName}`,
      `Key Components in ${fileName}`,
      `Interactions of ${fileName}`,
      `Dependencies in ${fileName}`,
      `Key Takeaways for ${fileName}`,
    ];
    let formattedSummary = summary!;
    for (const section of requiredSections) {
      if (!summary!.includes(`## ${section}`)) {
        formattedSummary += `\n\n## ${section}\nDetails not available for ${fileName}. Please review the file manually for more information.`;
      }
    }

    // Log the word count for debugging
    const words = formattedSummary.split(/\s+/).length;
    // console.log(`Summary for ${fileName} (${words} words):`, formattedSummary);

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