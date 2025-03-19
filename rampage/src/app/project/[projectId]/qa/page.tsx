"use client";

import { useState } from "react";
import { askQuestion } from "@/lib/retrival";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import Image from "next/image";
import { readStreamableValue } from "ai/rsc";
import CodeReferences from "@/components/code-references"; // New import
import { MemoizedMarkdown } from "@/components/memorized-markdown"; // New import
import { usePathname } from "next/navigation";

interface FileReference {
  fileName: string;
  sourceCode: string;
  summary: string;
  score?: number;
}

interface QAProps {
  params: { id: string };
}

export default function QA() {
  const path = usePathname();
  console.log("QA page for project:", path);
  const parts = path.split("/");
  const projectId = parts[2];
  console.log("projectId", projectId);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [filesReferences, setFilesReferences] = useState<FileReference[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Mutation for saving answers
  // const saveAnswer = useMutation({
  //   mutationFn: async (data: { projectId: string; question: string; answer: string; filesReferences: FileReference[] }) => {
  //     const response = await fetch("/api/save-answer", {
  //       method: "POST",
  //       body: JSON.stringify(data),
  //       headers: { "Content-Type": "application/json" },
  //     });
  //     if (!response.ok) throw new Error("Failed to save answer");
  //     return response.json();
  //   },
  // });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log("onSubmit" , question, projectId);
    e.preventDefault();
    setAnswer("");
    setFilesReferences([]);
    setIsLoading(true);
    setOpen(true);

    try {
      const { output, filesReferences } = await askQuestion(question, projectId);
      setFilesReferences(filesReferences);


      let fullAnswer = "";
      for await (const delta of readStreamableValue(output)) {
        if (delta) {
          fullAnswer += delta;
          setAnswer(fullAnswer);
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
    //     projectId: params.id,
    //     question,
    //     answer,
    //     filesReferences,
    //   },
    //   {
    //     onSuccess: () => {
    //       toast.success("Answer saved successfully");
    //       queryClient.invalidateQueries(["answers", params.id]);
    //       setOpen(false);
    //     },
    //     onError: () => toast.error("Failed to save answer"),
    //   }
    // );
    console.log("Saving answer...");
    console.log("ans" , answer)
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Ask Question Card */}
        <Card className="shadow-lg border-none bg-white dark:bg-gray-800">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-foreground">
              <Image src="/logo4.png" alt="GitBuddy" width={40} height={40} />
              Ask GitBuddy
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-4">
              <Textarea
                placeholder="Which file should I edit to change the home page?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="min-h-[120px] text-base border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary resize-none"
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 rounded-lg transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Ask GitBuddy!"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Answer Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[80vw] max-h-[90vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
                <Image src="/logo4.png" alt="GitBuddy" width={32} height={32} />
                GitBuddy Answer
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-grow overflow-y-auto p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Answer Section */}
                <div className="bg-muted p-4 rounded-lg shadow-inner">
                  <MemoizedMarkdown content={answer} id="answer" />
                </div>
                {/* References Section */}
                {filesReferences.length > 0 && (
                  <div className="border-t pt-6">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Code References</h3>
                    <CodeReferences filesReferences={filesReferences} />
                  </div>
                )}
              </motion.div>
            </ScrollArea>
            <div className="flex justify-between items-center p-4 border-t">
              <Button
                variant="outline"
                onClick={handleSaveAnswer}
                // disabled={saveAnswer.isPending || isLoading}
                className="border-primary text-primary hover:bg-primary/10 transition-all duration-200"
              >
                {/* {saveAnswer.isPending ? "Saving..." : "Save Answer"} */}
              </Button>
              <Button
                onClick={() => setOpen(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white transition-all duration-200"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}