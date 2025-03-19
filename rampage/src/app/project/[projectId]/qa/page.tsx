import React from "react";
import { notFound } from "next/navigation";
import AskQuestionCard from "./ask-question-card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MemoizedMarkdown } from "@/components/memoized-markdown";
import { Code, Calendar } from "lucide-react";
import CodeReferences from "@/components/code-references";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getQuestions } from "./actions";

interface FileReference {
  fileName: string;
  sourceCode: string;
  summary: string;
}

interface Question {
  id: string;
  question: string;
  answer: string;
  createdAt: Date;
  user: {
    imageUrls: string | null;
    name: string;
  };
  filesReferences: FileReference[];
}

interface QAPageProps {
  params: { projectId: string };
}

export default async function QAPage({ params }: QAPageProps) {
  const { projectId } = params;
  const { data: questions, isLoading } = await getQuestions(projectId);

  if (!projectId) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Ask Question Card */}
      <div className="max-w-2xl mx-auto">
        <AskQuestionCard projectId={projectId} />
      </div>

      {/* Saved Questions */}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Saved Questions</h1>
        <Sheet>
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-24 w-full rounded-lg" />
              ))
            ) : !questions || questions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No saved questions yet. Ask GitBuddy something to get started!
              </p>
            ) : (
              questions.map((question) => (
                <SheetTrigger asChild key={question.id}>
                  <button
                    className="w-full text-left"
                    onClick={() =>
                      // Use client-side state via data attribute or hydration
                      document.documentElement.dataset.selectedQuestion = JSON.stringify(question)
                    }
                  >
                    <div className="flex items-start gap-4 bg-white dark:bg-gray-900 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-lg transition-all duration-200">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={question.user.imageUrls ?? ""} alt={question.user.name} />
                        <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                          {question.user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-800 dark:text-gray-100 line-clamp-1">
                            {question.question}
                          </p>
                          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 line-clamp-2 text-sm">
                          {question.answer}
                        </p>
                      </div>
                    </div>
                  </button>
                </SheetTrigger>
              ))
            )}
          </div>

          {/* Client-side script to handle Sheet content */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                document.addEventListener('click', (e) => {
                  const trigger = e.target.closest('[data-sheet-trigger]');
                  if (trigger) {
                    const sheet = document.querySelector('[data-sheet-content]');
                    if (sheet) {
                      sheet.style.display = 'block';
                    }
                  }
                });
              `,
            }}
          />
          <SheetContent
            data-sheet-content
            className="sm:max-w-[80vw] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 hidden"
          >
            <SheetHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <SheetTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                <span id="sheet-title"></span>
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-10rem)] mt-6 pr-4">
              <div className="space-y-6">
                <MemoizedMarkdown content="" id="sheet-answer" />
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4" id="sheet-references">
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 mb-3 flex items-center">
                    <Code className="w-5 h-5 mr-2" />
                    Code References
                  </h3>
                  <div id="sheet-references-content"></div>
                </div>
              </div>
            </ScrollArea>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  document.addEventListener('click', (e) => {
                    const trigger = e.target.closest('[data-sheet-trigger]');
                    if (trigger) {
                      const selectedQuestion = JSON.parse(document.documentElement.dataset.selectedQuestion || '{}');
                      if (selectedQuestion) {
                        document.getElementById('sheet-title').textContent = selectedQuestion.question;
                        document.getElementById('sheet-answer').innerHTML = selectedQuestion.answer;
                        const references = selectedQuestion.filesReferences || [];
                        const refContent = document.getElementById('sheet-references-content');
                        refContent.innerHTML = references.length > 0 
                          ? references.map(ref => 
                              '<div class="space-y-2">' +
                              '<p class="font-medium text-gray-800 dark:text-gray-100">' + ref.fileName + '</p>' +
                              '<pre class="bg-gray-100 dark:bg-gray-800 p-2 rounded-md text-sm overflow-x-auto">' + ref.sourceCode + '</pre>' +
                              '<p class="text-gray-600 dark:text-gray-300">' + ref.summary + '</p>' +
                              '</div>'
                            ).join('')
                          : '<p class="text-gray-500 dark:text-gray-400">No references available.</p>';
                        document.querySelector('[data-sheet-content]').style.display = 'block';
                      }
                    }
                  });
                `,
              }}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}