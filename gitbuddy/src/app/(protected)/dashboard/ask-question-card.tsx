'use client';

import React from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Textarea } from '~/components/ui/textarea';
import useProject from '~/hooks/use-project';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '~/components/ui/dialog';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { askQuestion } from './actions';
import { readStreamableValue } from 'ai/rsc';
import CodeReferences from './code-references';
import { api } from '~/trpc/react';
import { toast } from 'sonner';
import { ScrollArea } from '~/components/ui/scroll-area';
import MDEditor from '@uiw/react-md-editor';
import useRefetch from '~/hooks/use-refetch';

interface FileReference {
  fileName: string;
  sourceCode: string;
  summary: string;
}

export default function AskQuestionCard() {
  const { project } = useProject();
  const [open, setOpen] = React.useState(false);
  const [question, setQuestion] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [filesReferences, setFilesReferences] = React.useState<FileReference[]>([]);
  const [answer, setAnswer] = React.useState('');
  const saveAnswer = api.project.saveAnswer.useMutation();
  const refetch = useRefetch();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!project?.id) return;

    setAnswer('');
    setFilesReferences([]);
    setIsLoading(true);
    setOpen(true);

    try {
      const { output, filesReferences } = await askQuestion(question, project.id);
      setFilesReferences(filesReferences);

      for await (const delta of readStreamableValue(output)) {
        if (delta) {
          setAnswer((ans) => ans + delta);
        }
      }
    } catch (error) {
      console.error('Error asking question:', error);
      toast.error('Failed to get an answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAnswer = () => {
    saveAnswer.mutate(
      {
        projectId: project!.id,
        question,
        answer,
        filesReferences,
      },
      {
        onSuccess: () => {
          toast.success('Answer saved successfully');
          refetch();
          setOpen(false);
        },
        onError: () => toast.error('Failed to save answer'),
      }
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[80vw] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image src="/logo4.png" alt="logo" width={40} height={40} />
              <span>GitBuddy Answer</span>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-grow">
            <div className="space-y-4 p-4">
              <MDEditor.Markdown source={answer} className="prose dark:prose-invert max-w-none" />
              <CodeReferences filesReferences={filesReferences} />
            </div>
          </ScrollArea>
          <DialogFooter className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={handleSaveAnswer}
              disabled={saveAnswer.isPending || isLoading}
            >
              {saveAnswer.isPending ? 'Saving...' : 'Save answer'}
            </Button>
            <Button type="button" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="h-full">
        <CardHeader>
          <CardTitle>Ask GitBuddy</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <Textarea
              placeholder="Which file should I edit to change the home page?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[100px]"
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Ask GitBuddy!'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
