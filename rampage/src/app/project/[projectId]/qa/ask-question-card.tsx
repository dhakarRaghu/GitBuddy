"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { askQuestion } from "./actions";
import { readStreamableValue } from "ai/rsc";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MemoizedMarkdown } from "@/components/memoized-markdown";
import CodeReferences from "@/components/code-references";

interface FileReference {
  fileName: string;
  sourceCode: string;
  summary: string;
}

interface AskQuestionCardProps {
  projectId: string;
}

export default function AskQuestionCard({ projectId }: AskQuestionCardProps) {
  const [open, setOpen] = React.useState(false);
  const [question, setQuestion] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [filesReferences, setFilesReferences] = React.useState<FileReference[]>([]);
  const [answer, setAnswer] = React.useState("");
  // const saveAnswer = api.project.saveAnswer.useMutation();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!projectId || !question.trim()) return;

    setAnswer("");
    setFilesReferences([]);
    setIsLoading(true);
    setOpen(true);

    try {
      const { output, filesReferences } = await askQuestion(question, projectId);
      setFilesReferences(filesReferences);

      for await (const delta of readStreamableValue(output)) {
        if (delta) {
          setAnswer((ans) => ans + delta);
        }
      }
    } catch (error) {
      console.error("Error asking question:", error);
      toast.error("Failed to get an answer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAnswer = () => {
    // saveAnswer.mutate(
    //   {
    //     projectId,
    //     question,
    //     answer,
    //     filesReferences,
    //   },
    //   {
    //     onSuccess: () => {
    //       toast.success("Answer saved successfully");
    //       setOpen(false);
    //     },
    //     onError: () => toast.error("Failed to save answer"),
    //   }
    // );
    console.log("Saving answer...");
    console.log("ans", answer);
    console.log("files reference", filesReferences);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[80vw] max-h-[90vh] flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4 px-6">
            <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-gray-800 dark:text-gray-100">
              <Image src="/logo4.png" alt="GitBuddy" width={40} height={40} className="rounded-full" />
              GitBuddy Answer
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-grow max-h-[70vh] overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-sm transition-all duration-200">
                {isLoading && !answer ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="ml-2 text-gray-600 dark:text-gray-300">Processing your question...</span>
                  </div>
                ) : (
                  <MemoizedMarkdown content={answer || "No answer yet."} id="answer" />
                )}
              </div>
              {filesReferences.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 mb-3">Code References</h3>
                  <div className="max-h-[40vh] overflow-y-auto space-y-4">
                    <CodeReferences filesReferences={filesReferences} />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-4 px-6">
            <Button
              variant="outline"
              onClick={handleSaveAnswer}
              // disabled={saveAnswer.isPending || isLoading || !answer}
              className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            >
              {/* {saveAnswer.isPending ? "Saving..." : "Save Answer"} */}
            </Button>
            <Button
              onClick={() => setOpen(false)}
              className="bg-primary hover:bg-primary/90 text-white font-semibold"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="bg-white dark:bg-gray-900 shadow-md rounded-lg transition-all duration-200 hover:shadow-lg">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">Ask GitBuddy</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <Textarea
              placeholder="Which file should I edit to change the home page?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[120px] bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-primary focus:border-primary rounded-md shadow-sm"
            />
            <Button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 rounded-md shadow-sm transition-all duration-200 disabled:bg-gray-400 dark:disabled:bg-gray-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Ask GitBuddy!"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}