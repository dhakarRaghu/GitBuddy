"use client";
import { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function parseMarkdownIntoBlocks(markdown: string): string[] {
  return markdown.split(/\n\n+/).filter((block) => block.trim()); // Split by double newlines, filter empty blocks
}

const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-300">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-base mb-4 text-gray-600 dark:text-gray-300 transition-opacity duration-200 hover:opacity-80">
              {children}
            </p>
          ),
          code({ className, children, ...props }) {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="px-2 py-1 bg-gray-800 dark:bg-gray-900 rounded text-sm text-gray-200 transition-all duration-200 hover:bg-gray-700 dark:hover:bg-gray-600"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre className="p-4 my-4 bg-gray-800 dark:bg-gray-900 rounded-lg overflow-x-auto transition-all duration-200 hover:shadow-md">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2 mb-4 text-gray-600 dark:text-gray-300 transition-opacity duration-200 hover:opacity-80">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-600 dark:text-gray-300 transition-opacity duration-200 hover:opacity-80">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-base transition-opacity duration-200 hover:opacity-80">
              {children}
            </li>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 transition-colors duration-200"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <table className="border-collapse border border-gray-200 dark:border-gray-700 my-4 w-full transition-all duration-200 hover:shadow-md">
              {children}
            </table>
          ),
          th: ({ children }) => (
            <th className="border border-gray-200 dark:border-gray-700 p-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-200 dark:border-gray-700 p-2 text-gray-600 dark:text-gray-300 transition-opacity duration-200 hover:opacity-80">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  },
  (prevProps, nextProps) => prevProps.content === nextProps.content
);

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock";

export const MemoizedMarkdown = memo(
  ({ content, id }: { content: string; id: string }) => {
    const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);

    return (
      <div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-lg">
        {blocks.map((block, index) => (
          <MemoizedMarkdownBlock content={block} key={`${id}-block_${index}`} />
        ))}
      </div>
    );
  }
);

MemoizedMarkdown.displayName = "MemoizedMarkdown";