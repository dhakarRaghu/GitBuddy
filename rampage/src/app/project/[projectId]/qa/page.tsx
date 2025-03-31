"use client";

import React, { useState, useRef, useEffect } from "react";
import { askQuestion } from "@/lib/retrival";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { readStreamableValue } from "ai/rsc";
import CodeReferencePanel from "@/components/code-references";
import { MemoizedMarkdown } from "@/components/memorized-markdown";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface FileReference {
  fileName: string;
  sourceCode: string;
  summary: string;
  score?: number;
}

interface Message {
  id: string;
  content: string;
  type: "question" | "answer";
  filesReferences?: FileReference[];
  timestamp: Date;
}

interface StoredMessages {
  messages: Message[];
  storedAt: number; // Timestamp in milliseconds
}

export default function QA() {
  const path = usePathname();
  const parts = path.split("/");
  const projectId = parts[2];

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeAnswer, setActiveAnswer] = useState<string>("");
  const [activeReferences, setActiveReferences] = useState<FileReference[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReference, setSelectedReference] = useState<FileReference | null>(null);
  const [currentReferenceFiles, setCurrentReferenceFiles] = useState<FileReference[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [question]);

  // Scroll to bottom when messages or activeAnswer change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeAnswer]);

  // Load messages from local storage on mount (project-specific)
  useEffect(() => {
    const storageKey = `chatMessages-${projectId}`;
    const storedData = localStorage.getItem(storageKey);
    if (storedData) {
      const { messages: storedMessages, storedAt } = JSON.parse(storedData) as StoredMessages;
      const now = Date.now();
      const twoHoursInMs = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

      if (now - storedAt < twoHoursInMs) {
        // Messages are still valid, load them
        setMessages(
          storedMessages.map((msg: Message) => ({
            ...msg,
            timestamp: new Date(msg.timestamp), // Convert timestamp back to Date
          }))
        );

        // Set a timeout to clear messages after the remaining time
        const remainingTime = twoHoursInMs - (now - storedAt);
        timeoutRef.current = setTimeout(() => {
          localStorage.removeItem(storageKey);
          setMessages([]); // Clear messages in state
        }, remainingTime);
      } else {
        // Messages are expired, clear them
        localStorage.removeItem(storageKey);
      }
    }
  }, [projectId]);

  // Save messages to local storage whenever they change (project-specific)
  useEffect(() => {
    const storageKey = `chatMessages-${projectId}`;
    if (messages.length > 0) {
      const data: StoredMessages = {
        messages,
        storedAt: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(data));

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set a new timeout to clear messages after 2 hours
      const twoHoursInMs = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
      timeoutRef.current = setTimeout(() => {
        localStorage.removeItem(storageKey);
        setMessages([]); // Clear messages in state
      }, twoHoursInMs);
    }

    // Cleanup timeout on component unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [messages, projectId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!question.trim()) return;

    const questionId = Date.now().toString();

    setMessages((prev) => [
      ...prev,
      {
        id: questionId,
        content: question,
        type: "question",
        timestamp: new Date(),
      },
    ]);

    setActiveAnswer("");
    setActiveReferences([]);
    setIsLoading(true);
    setSelectedReference(null); // Close any open reference panel

    const currentQuestion = question;
    setQuestion("");

    try {
      const { output, filesReferences } = await askQuestion(currentQuestion, projectId);
      setActiveReferences(filesReferences);

      let fullAnswer = "";
      for await (const delta of readStreamableValue(output)) {
        if (delta) {
          fullAnswer += delta;
          setActiveAnswer(fullAnswer);
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `answer-${questionId}`,
          content: fullAnswer,
          type: "answer",
          filesReferences: filesReferences,
          timestamp: new Date(),
        },
      ]);
      setActiveAnswer("");
    } catch (error) {
      console.error("Error asking question:", error);
      toast.error("Failed to get an answer. Please try again.");

      setMessages((prev) => [
        ...prev,
        {
          id: `error-${questionId}`,
          content: "Sorry, I couldn't process your question. Please try again.",
          type: "answer",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const openReference = (file: FileReference, allReferences: FileReference[]) => {
    setSelectedReference(file);
    setCurrentReferenceFiles(allReferences);
  };

  const closeReference = () => {
    setSelectedReference(null);
    setCurrentReferenceFiles([]);
  };

  const changeReference = (file: FileReference) => {
    setSelectedReference(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-white dark:bg-gray-800 shadow-sm flex items-center gap-2">
        <Image src="/logo.png" alt="GitBuddy" width={32} height={32} />
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">GitBuddy</h1>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-grow p-6 max-w-5xl mx-auto w-full">
        <div className="space-y-6">
          {messages.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12"
            >
              <Image src="/logo.png" alt="GitBuddy" width={80} height={80} className="mx-auto mb-4 opacity-70" />
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Welcome to GitBuddy</h2>
              <p className="text-gray-500 dark:text-gray-400">Ask questions about your codebase and get detailed answers with code references.</p>
            </motion.div>
          )}

          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex gap-3",
                message.type === "question" ? "justify-end" : "justify-start",
              )}
            >
              {message.type === "answer" && (
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
                  <Image src="/logo.png" alt="GitBuddy" width={24} height={24} />
                </div>
              )}
              <div
                className={cn(
                  "p-4 rounded-2xl shadow-sm",
                  message.type === "question"
                    ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white max-w-[80%]"
                    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 max-w-full",
                )}
              >
                {message.type === "question" ? (
                  <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <MemoizedMarkdown content={message.content} id={message.id} />
                )}
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {format(message.timestamp, "MMM d, h:mm a")}
                </div>
                {message.type === "answer" && message.filesReferences && message.filesReferences.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {message.filesReferences.length} file reference{message.filesReferences.length > 1 ? "s" : ""}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {message.filesReferences.map((file, index) => (
                        <button
                          key={index}
                          onClick={() => openReference(file, message.filesReferences || [])}
                          className="text-xs px-3 py-1 bg-orange-100 dark:bg-orange-900 text-gray-600 dark:text-gray-400 rounded-full hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors"
                        >
                          {file.fileName} {file.score ? `(${file.score.toFixed(2)})` : ""}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {message.type === "question" && (
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">U</span>
                </div>
              )}
            </motion.div>
          ))}

          {isLoading && activeAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-start gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
                <Image src="/logo.png" alt="GitBuddy" width={24} height={24} />
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 max-w-full">
                <MemoizedMarkdown content={activeAnswer} id="streaming-answer" />
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {format(new Date(), "MMM d, h:mm a")}
                </div>
                {activeReferences.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {activeReferences.length} file reference{activeReferences.length > 1 ? "s" : ""}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {activeReferences.map((file, index) => (
                        <button
                          key={index}
                          onClick={() => openReference(file, activeReferences)}
                          className="text-xs px-3 py-1 bg-orange-100 dark:bg-orange-900 text-gray-600 dark:text-gray-400 rounded-full hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors"
                        >
                          {file.fileName} {file.score ? `(${file.score.toFixed(2)})` : ""}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {isLoading && !activeAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-start gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
                <Image src="/logo.png" alt="GitBuddy" width={24} height={24} />
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl">
                <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-gray-800 shadow-sm">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto flex gap-3 items-end">
          <Textarea
            ref={textareaRef}
            placeholder="Ask about your codebase..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-grow min-h-[60px] max-h-[150px] resize-none border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 text-base shadow-sm rounded-xl placeholder:text-gray-500 dark:placeholder:text-gray-400 text-gray-800 dark:text-gray-200"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
          />
          <Button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 shadow-sm disabled:from-orange-400 disabled:to-pink-400"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </form>
      </div>

      {/* Sliding Code Reference Panel */}
      <AnimatePresence>
        {selectedReference && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={closeReference}
          >
            <CodeReferencePanel 
              file={selectedReference} 
              allReferences={currentReferenceFiles}
              onClose={closeReference}
              onChangeReference={changeReference}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}