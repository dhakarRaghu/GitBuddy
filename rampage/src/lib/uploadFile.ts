"use server";
import {GoogleGenerativeAI} from '@google/generative-ai';

import { Document } from '@langchain/core/documents';
// import { generate } from 'node_modules/@langchain/core/dist/utils/fast-json-patch';



const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY1 || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });



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
    console.log(`Summary for ${fileName} (${words} words):`, formattedSummary);

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