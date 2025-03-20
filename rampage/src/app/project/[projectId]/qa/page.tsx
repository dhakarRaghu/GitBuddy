"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { askQuestion } from "@/lib/retrival";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Save } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import Image from "next/image";
import { readStreamableValue } from "ai/rsc";
import CodeReferences from "@/components/code-references";
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

export default function QA() {
  const path = usePathname();
  const parts = path.split("/");
  const projectId = parts[2];

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [currentReferences, setCurrentReferences] = useState<FileReference[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [question]);

  // Scroll to bottom when messages or currentAnswer change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentAnswer]);

  // Mutation for saving answers
  const saveAnswer = useMutation({
    mutationFn: async (data: {
      projectId: string;
      question: string;
      answer: string;
      filesReferences: FileReference[];
    }) => {
      const response = await fetch("/api/save-answer", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to save answer");
      return response.json();
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!question.trim()) return;

    const questionId = Date.now().toString();

    // Add question to messages
    setMessages((prev) => [
      ...prev,
      {
        id: questionId,
        content: question,
        type: "question",
        timestamp: new Date(),
      },
    ]);

    setCurrentAnswer("");
    setCurrentReferences([]);
    setIsLoading(true);

    const currentQuestion = question;
    setQuestion("");

    try {
      const { output, filesReferences } = await askQuestion(currentQuestion, projectId);
      setCurrentReferences(filesReferences);

      let fullAnswer = "";
      for await (const delta of readStreamableValue(output)) {
        if (delta) {
          fullAnswer += delta;
          setCurrentAnswer(fullAnswer);
        }
      }

      // Add answer to messages
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
    } catch (error) {
      console.error("Error asking question:", error);
      toast.error("Failed to get an answer. Please try again.");

      // Add error message
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
      setCurrentAnswer("");
    }
  };

  const handleSaveAnswer = (questionContent: string, answerContent: string, references: FileReference[] = []) => {
    saveAnswer.mutate(
      {
        projectId,
        question: questionContent,
        answer: answerContent,
        filesReferences: references,
      },
      {
        onSuccess: () => {
          toast.success("Answer saved successfully");
          queryClient.invalidateQueries({ queryKey: ["answers", projectId] });
        },
        onError: () => toast.error("Failed to save answer"),
      },
    );
  };

  // Find the last question and answer pair for display in the right panel
  const lastAnswer = messages.filter((m) => m.type === "answer").pop();
  const lastQuestion = lastAnswer
    ? messages.find((m) => m.type === "question" && messages.indexOf(m) < messages.indexOf(lastAnswer))
    : null;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Left Panel - Chat History */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full lg:w-1/2 border-r border-border flex flex-col h-screen lg:h-auto"
      >
        <div className="p-4 border-b flex items-center gap-2 bg-white dark:bg-gray-800">
          <Image src="/logo.png" alt="GitBuddy" width={32} height={32} />
          <h1 className="text-xl font-bold text-foreground">GitBuddy</h1>
        </div>

        <ScrollArea className="flex-grow p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.type === "question" ? "justify-end" : "justify-start",
                )}
              >
                {message.type === "answer" && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Image src="/logo.png" alt="GitBuddy" width={20} height={20} />
                  </div>
                )}
                <div
                  className={cn(
                    "p-3 rounded-lg max-w-[80%]",
                    message.type === "question"
                      ? "bg-primary text-white"
                      : "bg-muted text-foreground",
                  )}
                >
                  {/* <p className="text-sm">{message.content}</p> */}
                  <MemoizedMarkdown content={message.content} id={message.id} />
                  <div className="mt-1 text-xs text-muted-foreground">
                    {format(message.timestamp, "MMM d, h:mm a")}
                  </div>
                  {message.type === "answer" && message.filesReferences && message.filesReferences.length > 0 && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {message.filesReferences.length} file reference{message.filesReferences.length > 1 ? "s" : ""}
                    </div>
                  )}
                </div>
                {message.type === "question" && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-sm font-semibold">U</span>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Image src="/logo.png" alt="GitBuddy" width={20} height={20} />
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-white dark:bg-gray-800">
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <Textarea
              ref={textareaRef}
              placeholder="Ask about your codebase..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[60px] max-h-[150px] resize-none border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary text-base"
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
              className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>

      {/* Right Panel - Code References and Summaries Only */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full lg:w-1/2 flex flex-col h-screen lg:h-auto relative"
      >
        {isLoading || lastAnswer ? (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b bg-white dark:bg-gray-800 sticky top-0 z-10">
              <h3 className="text-lg font-semibold text-foreground">
                Code References ({currentReferences.length || lastAnswer?.filesReferences?.length || 0})
              </h3>
            </div>

            <ScrollArea className="flex-grow p-6">
              <div className="space-y-4">
                {isLoading ? (
                  currentReferences.length > 0 ? (
                    <CodeReferences filesReferences={currentReferences} />
                  ) : (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  )
                ) : (
                  lastAnswer?.filesReferences && <CodeReferences filesReferences={lastAnswer.filesReferences} />
                )}
              </div>
            </ScrollArea>

            {!isLoading && lastAnswer && (
              <div className="p-4 bg-white dark:bg-gray-800 sticky bottom-0 z-10">
                <Button
                  variant="outline"
                  onClick={() =>
                    lastQuestion &&
                    handleSaveAnswer(lastQuestion.content, lastAnswer.content, lastAnswer.filesReferences)
                  }
                  disabled={saveAnswer.isPending}
                  className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10 transition-all duration-200 w-full"
                >
                  <Save className="w-4 h-4" />
                  {saveAnswer.isPending ? "Saving..." : "Save Answer"}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Image src="/logo.png" alt="GitBuddy" width={80} height={80} className="mb-6 opacity-50" />
            <h2 className="text-2xl font-bold text-muted-foreground mb-2">Ask GitBuddy</h2>
            <p className="text-muted-foreground max-w-md">
              Ask questions about your codebase and get detailed answers with relevant code references.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}