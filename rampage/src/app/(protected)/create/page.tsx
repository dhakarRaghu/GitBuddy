"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Github, Loader2, ArrowRight, Check, AlertTriangle, Server } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { checkCreditsAndStructure } from "@/lib/githubLoader";
import { CreateProject } from "@/lib/query";
import { fetchUserRepos } from "@/lib/githubLoader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserRepo {
  name: string;
  fullName: string;
  description: string | null;
  private: boolean;
}

type CreditCheckResponse = {
  fileCount: number;
  userCredits: number;
};

const CreateProjectPage = () => {
  const [step, setStep] = useState<"username" | "select" | "configure">("username");
  const [username, setUsername] = useState<string>("");
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [projectName, setProjectName] = useState<string>("");
  const [repos, setRepos] = useState<UserRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<CreditCheckResponse | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const router = useRouter();

  // Reset form and state
  const resetForm = () => {
    setUsername("");
    setRepoUrl("");
    setProjectName("");
    setRepos([]);
    setSelectedRepo("");
    setCredits(null);
    setProgress(null);
    setStep("username");
  };

  const checkCreditMutation = useMutation({
    mutationFn: async ({ githubUrl }: { githubUrl: string }) => {
      const response = await checkCreditsAndStructure(githubUrl);
      return response as CreditCheckResponse;
    },
    onError: (error) => {
      toast.error(`Failed to check credits: ${(error as Error).message}`);
      setError(`Failed to check credits: ${(error as Error).message}`);
    },
    onSuccess: (data) => {
      setCredits(data);
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
      router.push(`/project/${data.project.id}/qa`);
    },
    onError: (error) => {
      toast.error(`Failed to create project: ${(error as Error).message}`);
      setError(`Failed to create project: ${(error as Error).message}`);
      setIsCreating(false);
      resetForm();
    },
  });

  const handleFetchRepos = async () => {
    if (!username.trim()) {
      setError("Please enter a GitHub username");
      toast.error("Please enter a GitHub username");
      return;
    }

    setError(null);
    setRepos([]);
    setSelectedRepo("");

    try {
      const userRepos = await fetchUserRepos(username);
      setRepos(userRepos);
      if (userRepos.length === 0) {
        setError("No repositories found for this user");
        toast.error("No repositories found for this user");
      } else {
        setStep("select");
        toast.success(`Found ${userRepos.length} repositories for ${username}`);
      }
    } catch (err) {
      setError(`Failed to fetch repositories: ${(err as Error).message}`);
      toast.error(`Failed to fetch repositories: ${(err as Error).message}`);
    }
  };

  const handleSelectRepo = (repoName: string) => {
    setSelectedRepo(repoName);
    const repo = repos.find((r) => r.name === repoName);
    if (repo) {
      setProjectName(repo.name);
    }
  };

  const handleDirectUrlNext = async () => {
    if (!repoUrl.trim() || !repoUrl.includes("github.com")) {
      setError("Please enter a valid GitHub repository URL");
      toast.error("Please enter a valid GitHub repository URL");
      return;
    }

    setError(null);
    const urlParts = repoUrl.split("/");
    const repoName = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
    setProjectName(repoName);

    await checkCreditMutation.mutateAsync({ githubUrl: repoUrl });
    if (checkCreditMutation.data) {
      setStep("configure");
      toast.success("Repository URL validated");
    }
  };

  const handleProceedToConfig = async () => {
    if (!selectedRepo) {
      setError("Please select a repository");
      toast.error("Please select a repository");
      return;
    }

    const githubUrl = `https://github.com/${username}/${selectedRepo}`;
    await checkCreditMutation.mutateAsync({ githubUrl });
    if (checkCreditMutation.data) {
      setStep("configure");
    }
  };

  const handleCreateProject = async () => {
    if (!projectName) {
      setError("Project name is required");
      toast.error("Project name is required");
      return;
    }

    setError(null);
    setProgress({ current: 0, total: 10 });

    let githubUrl = repoUrl;
    if (!githubUrl) {
      githubUrl = `https://github.com/${username}/${selectedRepo}`;
    }

    try {
      for (let i = 1; i <= 10; i++) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        setProgress({ current: i, total: 10 });
      }

      await createProjectMutation.mutateAsync({
        githubUrl,
        name: projectName,
      });
    } catch (err) {
      setProgress(null);
    }
  };

  const hasEnoughCredits = credits ? credits.fileCount <= credits.userCredits : true;

  return (
    <div className="h-172 w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8"
      >
        {/* Left Column - Visual Feedback */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl p-6 text-white">
          {progress ? (
            <div className="w-full">
              <h3 className="text-xl font-semibold mb-4 text-center">Creating Your Project</h3>
              <div className="h-3 bg-white/20 rounded-full mb-2 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
              </div>
              <p className="text-center text-white/80 text-sm">
                Processing batch {progress.current} of {progress.total}
              </p>
              <div className="mt-6 text-center">
                <Server className="inline-block animate-pulse mr-2" size={18} />
                <span>Generating embeddings for your code...</span>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-6 bg-white/10 p-6 rounded-full inline-block">
                <Github size={60} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Connect Your Repository</h3>
              <p className="text-white/80 mb-4">
                Link your GitHub repository to get started with AI-powered code analysis
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Form */}
        <div className="flex-1 p-4">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
              {step === "username" && "Connect Repository"}
              {step === "select" && "Select Repository"}
              {step === "configure" && "Configure Project"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              {step === "username" && "Enter a GitHub username or repository URL"}
              {step === "select" && "Choose the repository you want to connect"}
              {step === "configure" && "Set up your project details"}
            </p>
          </div>

          {/* Step Indicators */}
          <div className="flex mb-8">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === "username"
                    ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                1
              </div>
              <div
                className={`h-1 w-12 ${
                  step !== "username"
                    ? "bg-gradient-to-r from-orange-500 to-pink-500"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              ></div>
            </div>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === "select" || step === "configure"
                    ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                2
              </div>
              <div
                className={`h-1 w-12 ${
                  step === "configure"
                    ? "bg-gradient-to-r from-orange-500 to-pink-500"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              ></div>
            </div>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === "configure"
                    ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                3
              </div>
            </div>
          </div>

          {/* Step 1: Username/URL */}
          {step === "username" && (
            <>
              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Username Method
                </label>
                <div className="flex gap-4 mb-4">
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="GitHub username"
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                  <motion.button
                    onClick={handleFetchRepos}
                    disabled={checkCreditMutation.isPending || !username.trim()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg disabled:from-orange-400 disabled:to-pink-400"
                  >
                    {checkCreditMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Github className="mr-2 h-4 w-4" />
                    )}
                    Fetch Repos
                  </motion.button>
                </div>

                <div className="text-center my-4 text-gray-500 dark:text-gray-400">
                  - OR -
                </div>

                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Direct URL Method
                </label>
                <div className="flex gap-4">
                  <Input
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/repo"
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                  <motion.button
                    onClick={handleDirectUrlNext}
                    disabled={checkCreditMutation.isPending || !repoUrl.trim()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg disabled:from-orange-400 disabled:to-pink-400"
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Next
                  </motion.button>
                </div>
              </div>

              {error && (
                <div className="text-red-500 flex items-center gap-2 mt-4 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                  <AlertTriangle size={16} />
                  <span>{error}</span>
                </div>
              )}
            </>
          )}

          {/* Step 2: Repository Selection */}
          {step === "select" && (
            <>
              <ScrollArea className="h-[300px] mb-6 rounded-md border border-gray-300 dark:border-gray-600">
                <div className="p-4 space-y-2">
                  {repos.map((repo) => (
                    <div
                      key={repo.name}
                      onClick={() => handleSelectRepo(repo.name)}
                      className={`p-4 rounded-md cursor-pointer transition-all duration-200 ${
                        selectedRepo === repo.name
                          ? "bg-orange-50 dark:bg-orange-900/30 border-orange-500 border-2"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      <div className="flex justify-between">
                        <div className="font-medium text-gray-800 dark:text-gray-200">
                          {repo.name}
                        </div>
                        {repo.private ? (
                          <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-700 dark:text-gray-300">
                            Private
                          </span>
                        ) : (
                          <span className="text-xs bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full text-green-800 dark:text-green-100">
                            Public
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        {repo.description || "No description available"}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex justify-between">
                <motion.button
                  onClick={() => setStep("username")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
                >
                  Back
                </motion.button>
                <motion.button
                  onClick={handleProceedToConfig}
                  disabled={checkCreditMutation.isPending || !selectedRepo}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg disabled:from-orange-400 disabled:to-pink-400"
                >
                  Next
                </motion.button>
              </div>

              {error && (
                <div className="text-red-500 flex items-center gap-2 mt-4 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                  <AlertTriangle size={16} />
                  <span>{error}</span>
                </div>
              )}
            </>
          )}

          {/* Step 3: Configuration */}
          {step === "configure" && (
            <>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                    Project Name
                  </label>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name"
                    className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                {credits && (
                  <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                    <h4 className="font-medium text-orange-800 dark:text-orange-400 flex items-center gap-2 mb-2">
                      <AlertTriangle size={16} />
                      Credit Information
                    </h4>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mb-1">
                      This repository will use <strong>{credits.fileCount}</strong> credits.
                    </p>
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      You have <strong>{credits.userCredits}</strong> credits remaining.
                    </p>
                    {!hasEnoughCredits && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        Insufficient credits to proceed.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <motion.button
                  onClick={() => (selectedRepo ? setStep("select") : setStep("username"))}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
                >
                  Back
                </motion.button>
                <motion.button
                  onClick={handleCreateProject}
                  disabled={
                    createProjectMutation.isPending ||
                    !hasEnoughCredits ||
                    !projectName
                  }
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg disabled:from-orange-400 disabled:to-pink-400 disabled:cursor-not-allowed"
                >
                  {createProjectMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Create Project
                </motion.button>
              </div>

              {error && (
                <div className="text-red-500 flex items-center gap-2 mt-4 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                  <AlertTriangle size={16} />
                  <span>{error}</span>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CreateProjectPage;