"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Info } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { CreateProject } from "@/lib/query";
import useRefetch from "@/hooks/use-refetch";
import { checkCreditsAndStructure } from "@/lib/githubLoader";

// Form input type definition
type FormInputs = {
  repoUrl: string;
  projectName: string;
};

// Response type from checkCreditsAndStructure
type CreditCheckResponse = {
  fileCount: number;
  userCredits: number;
};

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInputs>({
    defaultValues: {
      repoUrl: "",
      projectName: "",
    },
  });

  const refetch = useRefetch(); // Assuming this returns a function
  const router = useRouter();
  // Mutation to check credits
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
      const result = await CreateProject(githubUrl, name);
      return result;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      reset();
      refetch();
      router.push(`project/${data.project.id}/dashboard`);
    },
    onError: (error) => {
      toast.error(`Failed to create project: ${(error as Error).message}`);
    },
  });

  // Handle form submission
  const onSubmit = (data: FormInputs) => {
    if (checkCreditMutation.data) {
      createProjectMutation.mutate({
        githubUrl: data.repoUrl,
        name: data.projectName,
      });
    } else {
      checkCreditMutation.mutate({ githubUrl: data.repoUrl });
    }
  };

  // Check if user has enough credits
  const hasEnoughCredits = checkCreditMutation.data
    ? checkCreditMutation.data.fileCount <= checkCreditMutation.data.userCredits
    : true;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-6xl flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8">
        {/* Image Section */}
        <div className="flex-1 overflow-hidden">
          <img
            src="/logo.png"
            alt="GitBudd Logo"
            className="h-full w-full object-cover rounded-lg"
          />
        </div>

        {/* Form Section */}
        <div className="flex-1 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-gray-800 mt-4">
              Link Your Repository
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              Enter the URL of the repository you want to link
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="projectName"
                className="block text-gray-700 font-medium"
              >
                Project Name
              </label>
              <input
                id="projectName"
                type="text"
                placeholder="Enter project name"
                {...register("projectName", { required: "Project Name is required" })}
                className="mt-2 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="repoUrl" className="block text-gray-700 font-medium">
                Repo URL
              </label>
              <input
                id="repoUrl"
                type="text"
                placeholder="Enter repository URL"
                {...register("repoUrl", { required: "Repo URL is required" })}
                className="mt-2 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {checkCreditMutation.data && (
              <div className="mt-4 bg-orange-50 px-6 py-4 rounded-md border border-orange-200 text-orange-700">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  <p className="text-sm">
                    You will be charged{" "}
                    <strong>{checkCreditMutation.data.fileCount}</strong> credits for
                    this repository.
                  </p>
                </div>
                <p className="text-sm text-blue-600 ml-6">
                  You have{" "}
                  <strong>{checkCreditMutation.data.userCredits}</strong> credits
                  remaining.
                </p>
                {!hasEnoughCredits && (
                  <p className="text-sm text-red-600 mt-1">
                    Insufficient credits to proceed.
                  </p>
                )}
              </div>
            )}

            <div className="mt-6">
              <button
                type="submit"
                disabled={
                  createProjectMutation.isPending ||
                  checkCreditMutation.isPending ||
                  !hasEnoughCredits
                }
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {checkCreditMutation.data ? "Create Project" : "Check Credits"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;