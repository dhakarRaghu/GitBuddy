"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Info, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { checkCreditsAndStructure } from "@/lib/githubLoader";
import { CreateProject } from "@/lib/query";
import { fetchUserRepos } from "@/lib/githubLoader";

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
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInputs>({
    defaultValues: {
      repoUrl: "",
      projectName: "",
    },
  });

  const router = useRouter();

  // Helper to reset form and state
  const resetForm = () => {
    reset();
    setUsername("");
    setRepos([]);
    setSelectedRepo("");
  };

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
      const result = await CreateProject(githubUrl, name);
      return result;
    },
    onSuccess: (data) => {
      toast.success("Project created successfully");
      resetForm();
      setIsCreating(false);
      router.push(`/project/${data.project.id}/dashboard`);
    },
    onError: (error) => {
      toast.error(`Failed to create project: ${(error as Error).message}`);
      setIsCreating(false);
      resetForm();
    },
  });

  const handleFetchRepos = async () => {
    if (!username.trim()) {
      toast.error("Please enter a GitHub username");
      return;
    }

    try {
      const userRepos = await fetchUserRepos(username);
      setRepos(userRepos);
      if (userRepos.length === 0) {
        toast.error("No repositories found for this user");
      }
    } catch (err) {
      toast.error(`Failed to fetch repositories: ${(err as Error).message}`);
    }
  };

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
        {/* Form Section */}
        <div className="flex-1 p-4">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
              Create a New Project
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              Link your GitHub repository to get started
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex justify-center mb-6">
            <motion.button
              onClick={() => setMode("url")}
              className={`px-4 py-2 rounded-l-lg ${mode === "url" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Enter URL
            </motion.button>
            <motion.button
              onClick={() => setMode("username")}
              className={`px-4 py-2 rounded-r-lg ${mode === "username" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Select by Username
            </motion.button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Project Name */}
            <div>
              <label htmlFor="projectName" className="block text-gray-700 dark:text-gray-300 font-medium">
                Project Name
              </label>
              <input
                id="projectName"
                type="text"
                placeholder="Enter project name"
                {...register("projectName", { required: "Project Name is required" })}
                className="mt-2 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {errors.projectName && (
                <p className="text-red-500 text-sm mt-1">{errors.projectName.message}</p>
              )}
            </div>

            {/* Mode: Enter URL */}
            {mode === "url" && (
              <div>
                <label htmlFor="repoUrl" className="block text-gray-700 dark:text-gray-300 font-medium">
                  Repository URL
                </label>
                <input
                  id="repoUrl"
                  type="text"
                  placeholder="Enter repository URL (e.g., https://github.com/username/repo)"
                  {...register("repoUrl", { required: "Repo URL is required" })}
                  className="mt-2 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {errors.repoUrl && (
                  <p className="text-red-500 text-sm mt-1">{errors.repoUrl.message}</p>
                )}
              </div>
            )}

            {/* Mode: Select by Username */}
            {mode === "username" && (
              <>
                <div>
                  <label htmlFor="username" className="block text-gray-700 dark:text-gray-300 font-medium">
                    GitHub Username
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your GitHub username"
                      className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <motion.button
                      type="button"
                      onClick={handleFetchRepos}
                      disabled={checkCreditMutation.isPending}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-blue-400"
                    >
                      {checkCreditMutation.isPending ? "Fetching..." : "Fetch Repos"}
                    </motion.button>
                  </div>
                </div>

                {repos.length > 0 && (
                  <div>
                    <label htmlFor="repository" className="block text-gray-700 dark:text-gray-300 font-medium">
                      Select Repository
                    </label>
                    <select
                      id="repository"
                      value={selectedRepo}
                      onChange={(e) => setSelectedRepo(e.target.value)}
                      className="mt-2 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">-- Select a repository --</option>
                      {repos.map((repo) => (
                        <option key={repo.name} value={repo.name}>
                          {repo.name} {repo.private ? "(Private)" : ""} -{" "}
                          {repo.description || "No description"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            {/* Credit Check Information */}
            <AnimatePresence>
              {checkCreditMutation.data && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-4 bg-orange-50 dark:bg-orange-900/30 px-6 py-4 rounded-md border border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-300"
                >
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    <p className="text-sm">
                      You will be charged{" "}
                      <strong>{checkCreditMutation.data.fileCount}</strong> credits for this repository.
                    </p>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 ml-6">
                    You have{" "}
                    <strong>{checkCreditMutation.data.userCredits}</strong> credits remaining.
                  </p>
                  {!hasEnoughCredits && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      Insufficient credits to proceed.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading Spinner */}
            <AnimatePresence>
              {isCreating && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 flex items-center gap-2"
                >
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
                  <p className="text-gray-700 dark:text-gray-300">Creating project...</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={
                createProjectMutation.isPending ||
                checkCreditMutation.isPending ||
                !hasEnoughCredits ||
                (mode === "username" && !selectedRepo)
              }
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {checkCreditMutation.data ? "Create Project" : "Check Credits"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateProjectPage;