import React from "react";
import { PRandIssues } from "@/lib/github-insights";
import PRAndIssuesClient from "./PRandIssue";

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function PRAndIssuesPage({ params }: Props) {
  const { projectId } = await params;
  const insights = await PRandIssues(projectId);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <PRAndIssuesClient insights={insights} />
    </div>
  );
}