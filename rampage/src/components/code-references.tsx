"use client"

import type React from "react"
import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { MemoizedMarkdown } from "./memorized-markdown"
import { Button } from "@/components/ui/button"
import { X, Copy, Check } from "lucide-react"

interface FileReference {
  fileName: string
  sourceCode: string
  summary: string
  score?: number
}

interface CodeReferencePanelProps {
  file: FileReference
  onClose: () => void
}

const CodeReferencePanel: React.FC<CodeReferencePanelProps> = ({ file, onClose }) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(file.sourceCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div
        className="w-full max-w-2xl bg-white dark:bg-gray-800 h-full shadow-xl border-l border-gray-200 dark:border-gray-700 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                {file.fileName.split(".").pop()?.toUpperCase() || "FILE"}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[300px]">
              {file.fileName}
              {file.score && (
                <span className="ml-2 text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                  {file.score.toFixed(2)}
                </span>
              )}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={copyToClipboard}
              className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Source Code Section */}
          <div className="p-4 pb-2">
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">Source Code</h4>
          </div>
          <div className="px-4 flex-1 overflow-hidden">
            <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden h-[calc(50vh-100px)]">
              <ScrollArea className="h-full" type="always">
                <div className="overflow-auto">
                  <SyntaxHighlighter
                    language="typescript"
                    style={oneDark}
                    customStyle={{
                      margin: 0,
                      padding: "1rem",
                      borderRadius: "0.5rem",
                      fontSize: "0.9rem",
                      overflow: "visible", // Important to prevent hiding content
                    }}
                    wrapLines={false} // Important to allow horizontal scrolling
                    showLineNumbers={true}
                  >
                    {file.sourceCode}
                  </SyntaxHighlighter>
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Summary Section */}
          <div className="p-4 pb-2">
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">Summary</h4>
          </div>
          <div className="px-4 pb-4 flex-1 overflow-hidden">
            <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 h-[calc(50vh-100px)]">
              <ScrollArea className="h-full">
                <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
                  <MemoizedMarkdown content={file.summary} id={file.fileName} />
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CodeReferencePanel

