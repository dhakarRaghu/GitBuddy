"use client"

import type React from "react"
import { useState, useRef } from "react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { MemoizedMarkdown } from "./memorized-markdown"
import { Button } from "@/components/ui/button"
import { X, Copy, Check, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface FileReference {
  fileName: string
  sourceCode: string
  summary: string
  score?: number
}

interface CodeReferencePanelProps {
  file: FileReference
  allReferences: FileReference[]
  onClose: () => void
  onChangeReference: (file: FileReference) => void
}

const CodeReferencePanel: React.FC<CodeReferencePanelProps> = ({ 
  file, 
  allReferences, 
  onClose, 
  onChangeReference 
}) => {
  const [copied, setCopied] = useState(false)
  const sourceCodeScrollRef = useRef<HTMLDivElement>(null)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(file.sourceCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div
        className="w-full max-w-5xl bg-white dark:bg-gray-800 h-full shadow-xl border-l border-gray-200 dark:border-gray-700 flex flex-col"
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
            
            {/* File selector dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="px-2 py-1 h-auto">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[240px]">
                    {file.fileName}
                    {file.score && (
                      <span className="ml-2 text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                        {file.score.toFixed(2)}
                      </span>
                    )}
                  </h3>
                  <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[300px] max-h-[400px] overflow-y-auto">
                {allReferences.map((ref) => (
                  <DropdownMenuItem 
                    key={ref.fileName}
                    onClick={() => onChangeReference(ref)}
                    className={`flex items-center gap-2 ${file.fileName === ref.fileName ? 'bg-orange-100 dark:bg-orange-900' : ''}`}
                  >
                    <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                        {ref.fileName.split(".").pop()?.toUpperCase() || "F"}
                      </span>
                    </div>
                    <span className="truncate">{ref.fileName}</span>
                    {ref.score && (
                      <span className="ml-auto text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                        {ref.score.toFixed(2)}
                      </span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
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

        {/* Content - Horizontal Layout */}
        <div className="flex flex-col md:flex-row h-full">
          {/* Left Column - Source Code */}
          <div className="w-2/3 p-4 overflow-hidden">
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">Source Code</h4>
            <div className="flex-1 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
              <ScrollArea className="h-full w-full">
                <div className="w-full overflow-auto"> {/* Allows both horizontal & vertical scrolling */}
                  <div className="min-w-full">
                    <SyntaxHighlighter
                      language="typescript"
                      style={oneDark}
                      customStyle={{
                        margin: 0,
                        padding: "1rem",
                        borderRadius: "0.5rem",
                        fontSize: "0.95rem",
                        width: "100%",  // Ensures it fits container width
                        maxHeight: "84vh", // Enables vertical scrolling when content exceeds height
                        overflow: "auto", // Ensures scrolling
                        whiteSpace: "pre", 
                      }}
                      wrapLines={false}
                      showLineNumbers={true}
                      lineNumberStyle={{ minWidth: "2em", paddingRight: "1em" }}
                    >
                      {file.sourceCode}
                    </SyntaxHighlighter>
                  </div>
                </div>
                <ScrollBar orientation="horizontal" />
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </div>

          </div>

          {/* Right Column - Summary */}
          <div className="w-1/2 p-4 border-l border-gray-200 dark:border-gray-700">
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">Summary</h4>
            <div className="h-[calc(100vh-130px)] border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 p-4 overflow-hidden">
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