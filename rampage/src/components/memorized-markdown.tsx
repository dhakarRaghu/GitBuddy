"use client";

import { memo, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css"; // Modern dark theme for code highlighting
import { Copy, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function parseMarkdownIntoBlocks(markdown: string): string[] {
  return markdown.split(/\n\n+/).filter((block) => block.trim());
}

const MemoizedMarkdownBlock = memo(
  ({ content, isSummary }: { content: string; isSummary?: boolean }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    // Detect if the content is a summary (e.g., starts with "Summary of")
    const isSummaryBlock = isSummary || content.toLowerCase().startsWith("summary of");

    return (
      <div
        className={cn(
          "relative",
          isSummaryBlock &&
            "bg-blue-50 dark:bg-blue-950/50 border-l-4 border-blue-500 dark:border-blue-400 p-4 rounded-lg shadow-sm transition-all duration-300"
        )}
      >
        {isSummaryBlock && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                Summary
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        )}
        <div className={cn(isSummaryBlock && !isExpanded && "hidden")}>
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
                <p className="text-base leading-relaxed mb-4 text-gray-600 dark:text-gray-300 transition-opacity duration-200 hover:opacity-90">
                  {children}
                </p>
              ),
              code({ className, children, ...props }) {
                const isInline = !className;
                const language = className?.replace("language-", "") || "text";

                if (isInline) {
                  return (
                    <code
                      className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm text-gray-800 dark:text-gray-200 transition-all duration-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }

                const handleCopy = () => {
                  if (children) {
                    navigator.clipboard.writeText(children.toString().trim());
                  }
                  toast.success("Code copied to clipboard!");
                };

                return (
                  <div className="relative my-4 bg-gray-900 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-800 rounded-t-lg border-b border-gray-700">
                      <span className="text-xs font-medium text-gray-300 capitalize">
                        {language}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="text-gray-400 hover:text-gray-200 transition-colors duration-200"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <pre className="p-4 overflow-x-auto">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                );
              },
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-2 mb-4 text-gray-600 dark:text-gray-300 transition-opacity duration-200 hover:opacity-90">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-600 dark:text-gray-300 transition-opacity duration-200 hover:opacity-90">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-base transition-opacity duration-200 hover:opacity-90">
                  {children}
                </li>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
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
                <td className="border border-gray-200 dark:border-gray-700 p-2 text-gray-600 dark:text-gray-300 transition-opacity duration-200 hover:opacity-90">
                  {children}
                </td>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => prevProps.content === nextProps.content && prevProps.isSummary === nextProps.isSummary
);

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock";

export const MemoizedMarkdown = memo(
  ({ content, id, isSummary }: { content: string; id: string; isSummary?: boolean }) => {
    const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);

    return (
      <div className="relative space-y-6 p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2220%22 height=%2220%22 viewBox=%220 0 20 20%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M1 1h18M1 5h18M1 9h18M1 13h18M1 17h18M1 1v18M5 1v18M9 1v18M13 1v18M17 1v18%22 stroke=%22%23e5e7eb%22 stroke-opacity=%220.1%22 stroke-width=%220.5%22/%3E%3C/svg%3E')] dark:bg-[url('data:image/svg+xml,%3Csvg width=%2220%22 height=%2220%22 viewBox=%220 0 20 20%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M1 1h18M1 5h18M1 9h18M1 13h18M1 17h18M1 1v18M5 1v18M9 1v18M13 1v18M17 1v18%22 stroke=%22%234b5563%22 stroke-opacity=%220.1%22 stroke-width=%220.5%22/%3E%3C/svg%3E')] opacity-50 pointer-events-none" />
        {blocks.map((block, index) => (
          <MemoizedMarkdownBlock
            content={block}
            key={`${id}-block_${index}`}
            isSummary={isSummary}
          />
        ))}
      </div>
    );
  }
);

MemoizedMarkdown.displayName = "MemoizedMarkdown";