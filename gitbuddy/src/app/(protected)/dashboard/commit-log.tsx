"use client"

import React from 'react'
import useProject from '~/hooks/use-project'
import { api } from '~/trpc/react'
import { cn } from "~/lib/utils"
import Link from 'next/link'
import { ExternalLink, GitCommit } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Skeleton } from "~/components/ui/skeleton"
import { formatDistanceToNow } from 'date-fns'

const CommitLog = () => {
    const { projectId, project } = useProject()
    const { data: commits, isLoading, isError } = api.project.getCommits.useQuery({ projectId })

    if (isLoading) return <CommitLogSkeleton />
    if (isError) return <CommitLogError />
    if (!commits || commits.length === 0) return <NoCommits />

    return (
        <ul className='space-y-6' aria-label="Commit history">
            {commits.map((commit, commitIdx) => (
                <li key={commit.id} className='relative flex gap-x-4'>
                    <div className={cn(
                        commitIdx === commits.length - 1 ? 'h-6' : '-bottom-6',
                        'absolute left-0 top-0 flex w-6 justify-center'
                    )}>
                        <div className='w-px translate-x-1 bg-gray-200'></div>
                    </div>

                    <div className="relative mt-3 flex-none">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={commit.commitAuthorAvatar} alt={`${commit.commitAuthorName}'s avatar`} />
                            <AvatarFallback>{commit.commitAuthorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white">
                            <GitCommit className="h-3 w-3 text-primary" />
                        </div>
                    </div>

                    <div className='flex-auto rounded-md bg-white p-3 shadow-sm ring-1 ring-gray-200'>
                        <div className="flex items-center justify-between">
                            <Link
                                target='_blank'
                                href={`${project?.githubUrl}/commit/${commit.commitHash}`}
                                className='group inline-flex items-center gap-x-2 text-sm font-medium text-gray-900 hover:text-primary'
                            >
                                <span>{commit.commitAuthorName}</span>
                                <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-primary" />
                            </Link>
                            <time 
                                dateTime={commit.commitDate.toISOString()} 
                                className="text-xs text-gray-500"
                            >
                                {formatDistanceToNow(commit.commitDate, { addSuffix: true })}
                            </time>
                        </div>

                        <h3 className="mt-2 text-base font-semibold text-gray-900">
                            {commit.commitMessage}
                        </h3>

                        {commit.summary && (
                            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                                {commit.summary}
                            </p>
                        )}

                        <div className="mt-4 flex items-center gap-x-2 text-xs">
                            <span className="font-medium text-gray-500">Commit:</span>
                            <span className="font-mono text-gray-900">{commit.commitHash.slice(0, 7)}</span>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    )
}

const CommitLogSkeleton = () => (
    <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-x-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        ))}
    </div>
)

const CommitLogError = () => (
    <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
            <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
            </div>
            <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading commits</h3>
                <div className="mt-2 text-sm text-red-700">
                    <p>There was an error loading the commit history. Please try again later.</p>
                </div>
            </div>
        </div>
    </div>
)

const NoCommits = () => (
    <div className="text-center">
        <GitCommit className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No commits</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by making your first commit.</p>
    </div>
)

export default CommitLog
