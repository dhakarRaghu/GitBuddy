'use client';

import { useForm } from 'react-hook-form';
import React from 'react';
import { api } from '~/trpc/react';
import { toast } from 'sonner';
import useRefetch from '~/hooks/use-refetch';
import { Info } from 'lucide-react';
import { redirect } from 'next/navigation';


type FormInputs = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInputs>();
  const createProject = api.project.createProject.useMutation();
  const checkCredit = api.project.checkCredit.useMutation();
  const refetch = useRefetch();

  function onSubmit(data: FormInputs) {
    if (!!checkCredit.data) {
      createProject.mutate(
        {
          githubUrl: data.repoUrl,
          name: data.projectName,
          githubToken: data.githubToken,
        },
        {
          onSuccess: () => {
            toast.success('Project created successfully');
            reset();
            refetch();
            redirect('/dashboard');
          },
          onError: () => {
            // toast.error('Failed to create project');
          },
        }
      );
    } else {
      checkCredit.mutate({
        githubUrl: data.repoUrl,
        githubToken: data.githubToken,
      });
    }
  }

  const hasEnoughCredits = checkCredit?.data?.userCredits
    ? checkCredit.data.fileCount <= checkCredit.data.userCredits
    : true;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-6xl flex flex-col md:flex-row space-y-8 md:space-y-0">
        {/* Image Section */}
        <div className="flex-1 overflow-hidden">
          <img
            src="/images.jpeg"
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
              <label htmlFor="projectName" className="block text-gray-700 font-medium">
                Project Name
              </label>
              <input
                id="projectName"
                type="text"
                placeholder="Enter project name"
                {...register('projectName', { required: 'Project Name is required' })}
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
                {...register('repoUrl', { required: 'Repo URL is required' })}
                className="mt-2 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="githubToken" className="block text-gray-700 font-medium">
                Github Token (optional)
              </label>
              <input
                id="githubToken"
                type="text"
                placeholder="Enter Github token"
                {...register('githubToken')}
                className="mt-2 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            {!!checkCredit.data && (
              <div className="mt-4 bg-orange-50 px-6 py-4 rounded-md border border-orange-200 text-orange-700">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  <p className="text-sm">
                    You will be charged <strong>{checkCredit.data?.fileCount}</strong> credits for
                    this repository.
                  </p>
                </div>
                <p className="text-sm text-blue-600 ml-6">
                  You have <strong>{checkCredit.data?.userCredits}</strong> credits remaining.
                </p>
              </div>
            )}
            <div className="mt-6">
              <button
                disabled={createProject.isPending || checkCredit.isPending || !hasEnoughCredits}
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {!!checkCredit.data ? 'Create Project' : 'Check Credits'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
