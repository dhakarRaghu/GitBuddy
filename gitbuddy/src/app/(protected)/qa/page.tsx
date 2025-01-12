"use client";

import React from 'react';
import { api } from '~/trpc/react';
import AskQuestionCard from '../dashboard/ask-question-card';
import useProject from '~/hooks/use-project';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui/sheet';
import MDEditor from '@uiw/react-md-editor';
import { Code, Calendar } from 'lucide-react';
import CodeReferences from '../dashboard/code-references';
import { ScrollArea } from '~/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Skeleton } from '~/components/ui/skeleton';

interface Question {
  id: string;
  question: string;
  answer: string;
  createdAt: Date;
  user: {
    imageUrls: string | null;
    name: string;
  };
  filesReferences: Array<{
    fileName: string;
    sourceCode: string;
    summary: string;
  }>;
}

const QAPage: React.FC = () => {
  const { projectId } = useProject();
  const { data: questions, isLoading } = api.project.getQuestions.useQuery({ projectId });
  const [selectedQuestion, setSelectedQuestion] = React.useState<Question | null>(null);

  return (
    <div className="space-y-6">
      <AskQuestionCard />
      
      <div>
        <h1 className="text-2xl font-semibold mb-4">Saved Questions</h1>
        <Sheet>
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-24 w-full" />
              ))
            ) : questions?.length === 0 ? (
              <p className="text-muted-foreground">No saved questions yet.</p>
            ) : (
              questions?.map((question) => (
                <SheetTrigger asChild key={question.id} onClick={() => setSelectedQuestion(question)}>
                  <button className="w-full text-left">
                    <div className="flex items-start gap-4 bg-card rounded-lg p-4 shadow-sm border hover:border-primary transition-colors">
                      <Avatar>
                        <AvatarImage src={question.user.imageUrls ?? ""} alt={`${question.user.firstName ?? ''} ${question.user.lastName ?? ''}`} />
                        <AvatarFallback>{`${question.user.firstName?.[0] ?? ''}${question.user.lastName?.[0] ?? ''}`.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium line-clamp-1">{question.question}</p>
                          <div className="flex items-center text-muted-foreground text-sm">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <p className="text-muted-foreground line-clamp-2 text-sm">{question.answer}</p>
                      </div>
                    </div>
                  </button>
                </SheetTrigger>
              ))
            )}
          </div>

          {selectedQuestion && (
            <SheetContent className="sm:max-w-[80vw]">
              <SheetHeader>
                <SheetTitle>{selectedQuestion.question}</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-10rem)] mt-6">
                <div className="pr-4">
                  <MDEditor.Markdown source={selectedQuestion.answer} className="prose dark:prose-invert" />
                  <div className="mt-8">
                    <CodeReferences filesReferences={selectedQuestion.filesReferences} />
                  </div>
                </div>
              </ScrollArea>
            </SheetContent>
          )}
        </Sheet>
      </div>
    </div>
  );
};

export default QAPage;


// "use client";
// import { api } from '~/trpc/react';
// import React from 'react';
// import AskQuestionCard from '../dashboard/ask-question-card';
// import useProject from '~/hooks/use-project';
// import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui/sheet';
// import MDEditor from '@uiw/react-md-editor';
// import { Code } from 'lucide-react';
// import CodeReferences from '../dashboard/code-references';

// const QAPage = () => {
//   const { projectId } = useProject();
//   const { data: questions } = api.project.getQuestions.useQuery({ projectId });
//   const [questionIndex, setQuestionIndex] = React.useState(0);
//   const question = questions?.[questionIndex];

//   return (
//     <Sheet>
//       <AskQuestionCard />
//       <div className="h-4"></div>
//       <h1 className="text-xl font-semibold">Saved Questions</h1>
//       <div className="h-2"></div>
//       <div className="flex flex-col gap-2">
//         {questions?.map((question, index) => {
//           return (
//             <React.Fragment key={question.id}>
//               <SheetTrigger onClick={() => setQuestionIndex(index)}>
//                 <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow border">
//                   <img
//                     className="rounded-full"
//                     height={30}
//                     width={30}
//                     src={question.user.imageUrls ?? ""}
//                   />
//                   <div className="text-left flex flex-col">
//                     <div className="flex items-center gap-2">
//                       <p className="text-gray-700 line-clamp-1 text-lg font-medium">
//                         {question.question}
//                       </p>
//                       <span className="text-xs text-gray-400 whitespace-nowrap">
//                         {question.createdAt.toLocaleDateString()}
//                       </span>
//                     </div>
//                     <p className="text-gray-500 line-clamp-1 text-sm">
//                       {question.answer}
//                     </p>
//                   </div>
//                 </div>
//               </SheetTrigger>
//             </React.Fragment>
//           );
//         })}
//       </div>
//       {question && (
//         <SheetContent className="sm:max-w-[80vw]">
//           <SheetHeader>
//             <SheetTitle>{question.question}</SheetTitle>
//             <MDEditor.Markdown source={question.answer} />
//             <CodeReferences filesReferences={(question.filesReferences ?? []) as any} />
//           </SheetHeader>
//         </SheetContent>
//       )}
//     </Sheet>
//   );
// };

// export default QAPage;
