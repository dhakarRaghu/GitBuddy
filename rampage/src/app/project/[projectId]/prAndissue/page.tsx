
import React from 'react';
import { getRepoStatus } from '@/lib/github-insights';

import PRAndIssuesClient from './PRandIssue';

interface Props {
  params: Promise<{ projectId: string }>;
}

interface PullRequest {
  number: number;
  title: string;
  state: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  reviewers: string[];
}

interface Issue {
  number: number;
  title: string;
  state: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  labels: string[];
}

export default async function PRAndIssuesPage({ params }: Props){
  const { projectId } = await params;
    const insights = await getRepoStatus(projectId);

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mt-2">
           <PRAndIssuesClient insights={insights} />
          </p>
        </div>
      </div>
    );

};
