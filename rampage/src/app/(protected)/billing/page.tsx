"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Info, Loader2 } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { checkCreditsAndStructure } from "@/lib/githubLoader";
import { CreateProject } from "@/lib/query";

interface UserRepo {
  name: string;
  fullName: string;
  description: string | null;
  private: boolean;
}

type FormInputs = {
  repoUrl: string;
  projectName: string;
};

type CreditCheckResponse = {
  fileCount: number;
  userCredits: number;
};

const CreateProjectPage = () => {
  const [mode, setMode] = useState<"url" | "username">("url");
  const [username, setUsername] = useState<string>("");
  const [repos, setRepos] = useState<UserRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [projectId, setProjectId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInputs>({
    defaultValues: {
      repoUrl: "",
      projectName: "",
    },
  });

  const router = useRouter();

  // SSE connection for progress updates
  useEffect(() => {
    if (!isCreating || !projectId) return;

    const eventSource = new EventSource(`/api/sse/${projectId}`);

    eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data);
      const { currentBatch, totalBatches } = update;
      const percentage = Math.round((currentBatch / totalBatches) * 100);
      setProgress(percentage);
      setProgressMessage(`Processing batch ${currentBatch} of ${totalBatches}`);

      // If the process is complete, close the connection
      if (currentBatch === totalBatches) {
        eventSource.close();
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close();
      setIsCreating(false);
      toast.error("Failed to receive progress updates");
    };

    return () => {
      eventSource.close();
    };
  }, [isCreating, projectId]);

  const checkCreditMutation = useMutation({
    mutationFn: async ({ githubUrl }: { githubUrl: string }) => {
      const response = await checkCreditsAndStructure(githubUrl);
      return response as CreditCheckResponse;
    },
    onError: (error) => {
      toast.error(`Failed to check credits: ${(error as Error).message}`);
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async ({ githubUrl, name }: { githubUrl: string; name: string }) => {
      setIsCreating(true);
      setProgress(0);
      setProgressMessage("Starting project creation...");

      const result = await CreateProject(githubUrl, name);
      setProjectId(result.project.id); // Set projectId to start SSE
      return result;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      reset();
      setUsername("");
      setRepos([]);
      setSelectedRepo("");
      setIsCreating(false);
      router.push(`/project/${data.project.id}/dashboard`);
    },
    onError: (error) => {
      toast.error(`Failed to create project: ${(error as Error).message}`);
      setIsCreating(false);
    },
  });

  const onSubmit = (data: FormInputs) => {
    let githubUrl = data.repoUrl;

    if (mode === "username") {
      if (!username || !selectedRepo) {
        toast.error("Please enter a username and select a repository");
        return;
      }
      githubUrl = `https://github.com/${username}/${selectedRepo}`;
    }

    if (checkCreditMutation.data) {
      createProjectMutation.mutate({
        githubUrl,
        name: data.projectName,
      });
    } else {
      checkCreditMutation.mutate({ githubUrl });
    }
  };

  const hasEnoughCredits = checkCreditMutation.data
    ? checkCreditMutation.data.fileCount <= checkCreditMutation.data.userCredits
    : true;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8"
      >
        {/* ... (rest of the UI remains the same) */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
                <p className="text-gray-700 dark:text-gray-300">{progressMessage}</p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <motion.div
                  className="bg-blue-600 h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* ... (rest of the UI) */}
      </motion.div>
    </div>
  );
};

export default CreateProjectPage;