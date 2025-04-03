"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ExternalLink, GitCommit, RefreshCw } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { MemoizedMarkdown } from "@/components/memorized-markdown";
import { pollCommits } from "@/lib/github";
import { getCommits } from "@/lib/query";

const fetchCommits = async ({ projectId }: { projectId: string }) => {
  await pollCommits(projectId);
  return await getCommits(projectId);
};

const CommitLog = ({ projectId, githubUrl }: { projectId: string; githubUrl: string }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: commits, isLoading, isError, refetch } = useQuery({
    queryKey: ["commits", projectId],
    queryFn: () => fetchCommits({ projectId }),
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) return <CommitLogSkeleton />;
  if (isError) return <CommitLogError />;
  if (!commits || commits.length === 0) return <NoCommits />;

  return (
    <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm border border-orange-200 dark:border-orange-900/50 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500 tracking-wide">
          Commit History
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          className="border-orange-300 text-orange-500 hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 hover:text-white hover:border-transparent transition-all duration-200"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      <ul className="space-y-6" aria-label="Commit history">
        {commits.map((commit: any, commitIdx: number) => (
          <li key={commit.id} className="relative flex gap-x-4">
            <div
              className={cn(
                commitIdx === commits.length - 1 ? "h-6" : "-bottom-6",
                "absolute left-0 top-0 flex w-6 justify-center"
              )}
            >
              <div className="w-px bg-gradient-to-b from-orange-200 to-pink-200 dark:from-orange-900 dark:to-pink-900" />
            </div>
            <div className="relative mt-3 flex-none">
              <Avatar className="h-10 w-10 ring-2 ring-orange-200 dark:ring-orange-900 transition-all duration-200 hover:ring-orange-500 dark:hover:ring-orange-400">
                <AvatarImage src={commit.commitAuthorAvatar} alt={`${commit.commitAuthorName}'s avatar`} />
                <AvatarFallback className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                  {commit.commitAuthorName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-gray-800 border border-orange-300 dark:border-orange-700">
                <GitCommit className="h-3 w-3 text-orange-500 dark:text-orange-400" />
              </div>
            </div>
            <div className="flex-auto rounded-md bg-orange-50 dark:bg-orange-900/20 p-4 shadow-sm ring-1 ring-orange-200 dark:ring-orange-900 transition-all duration-200 hover:ring-orange-500 dark:hover:ring-orange-400">
              <div className="flex items-center justify-between">
                <Link
                  target="_blank"
                  href={`${githubUrl}/commit/${commit.commitHash}`}
                  className="group inline-flex items-center gap-x-2 text-sm font-medium text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 transition-colors duration-200"
                >
                  <span>{commit.commitAuthorName}</span>
                  <ExternalLink className="h-4 w-4 text-orange-400 group-hover:text-orange-500 dark:group-hover:text-orange-300 transition-colors duration-200" />
                </Link>
                <time dateTime={commit.commitDate} className="text-xs text-gray-600 dark:text-gray-300">
                  {formatDistanceToNow(new Date(commit.commitDate), { addSuffix: true })}
                </time>
              </div>
              <h3 className="mt-2 text-base font-semibold text-gray-900 dark:text-gray-100">
                {commit.commitMessage}
              </h3>
              {commit.summary && (
                <div className="mt-2 prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                  <MemoizedMarkdown content={commit.summary} id={commit.id} />
                </div>
              )}
              <div className="mt-4 flex items-center gap-x-2 text-xs">
                <span className="font-medium text-gray-600 dark:text-gray-300">Commit:</span>
                <span className="font-mono text-orange-500 dark:text-orange-400 bg-orange-100 dark:bg-orange-800/20 px-1.5 py-0.5 rounded">
                  {commit.commitHash.slice(0, 7)}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const CommitLogSkeleton = () => (
  <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm border border-orange-200 dark:border-orange-900/50">
    <Skeleton className="h-6 w-1/4 mb-4 bg-orange-200 dark:bg-orange-900/50" />
    <div className="space-y-6">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-x-4">
          <Skeleton className="h-10 w-10 rounded-full bg-orange-200 dark:bg-orange-900/50" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4 bg-orange-200 dark:bg-orange-900/50" />
            <Skeleton className="h-4 w-full bg-orange-200 dark:bg-orange-900/50" />
            <Skeleton className="h-4 w-3/4 bg-orange-200 dark:bg-orange-900/50" />
            <Skeleton className="h-4 w-3/4 bg-orange-200 dark:bg-orange-900/50" />
            <Skeleton className="h-4 w-3/4 bg-orange-200 dark:bg-orange-900/50" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CommitLogError = () => (
  <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 shadow-sm border border-red-200 dark:border-red-800 transition-all duration-200">
    <div className="flex">
      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
      </svg>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading commits</h3>
        <p className="mt-2 text-sm text-red-700 dark:text-red-300">
          There was an error loading the commit history. Please try again later.
        </p>
      </div>
    </div>
  </div>
);

const NoCommits = () => (
  <div className="text-center p-6 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-orange-200 dark:border-orange-900/50">
    <GitCommit className="mx-auto h-12 w-12 text-orange-500 dark:text-orange-400" />
    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No commits</h3>
    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Get started by making your first commit.</p>
  </div>
);

export default CommitLog;