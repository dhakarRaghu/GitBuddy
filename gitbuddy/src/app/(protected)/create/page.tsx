"use client"
import { useForm } from 'react-hook-form'
import React from 'react'
import { api } from '~/trpc/react'
import { toast } from 'sonner'
import useRefetch from '~/hooks/use-refetch'

type FormInputs = {
    repoUrl: string
    projectName: string
    githubToken?: string
}

const CreatePage = () => {
    const { register, handleSubmit, reset } = useForm<FormInputs>()
    const createProject = api.project.createProject.useMutation()
    const refetch = useRefetch()

    function onSubmit(data: FormInputs) {

       createProject.mutate({
           name: data.projectName,
           githubUrl: data.repoUrl,
          githubToken: (data.githubToken==="") ? process.env.GITHUB_TOKEN : data.githubToken,
       },{
            onSuccess: () => {
                toast.success('Project created successfully')
                refetch()
                reset()
            },
            onError: (error) => {
                // console.error("Error creating project:", error);
                toast.error('Failed to create project')
            }
       })
        return true
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-6xl flex">
                <div className="flex-1">
                    <img
                        src="/images.jpeg"
                        alt="GitBuddy Logo"
                        className="h-full w-full object-cover rounded-lg"
                    />
                </div>
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
                            <label htmlFor="projectName" className="block text-gray-700 font-medium">Project Name</label>
                            <input
                                id="projectName"
                                type="text"
                                placeholder="Enter project name"
                                {...register('projectName', { required: "Project Name is required" })}
                                className="mt-2 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label htmlFor="repoUrl" className="block text-gray-700 font-medium">Repo URL</label>
                            <input
                                id="repoUrl"
                                type="text"
                                placeholder="Enter repository URL"
                                {...register('repoUrl', { required: "Repo URL is required" })}
                                className="mt-2 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                       

                        <div>
                            <label htmlFor="githubToken" className="block text-gray-700 font-medium">Github Token (optional)</label>
                            <input
                                id="githubToken"
                                type="text"
                                placeholder="Enter Github token"
                                {...register('githubToken')}
                                className="mt-2 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div className="mt-6">
                            <button
                                type="submit" disabled={createProject.isPending}
                                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:outline-none"
                            >
                                Create Project
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreatePage
