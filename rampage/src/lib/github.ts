"use server";

import { Octokit } from "octokit";
import { prisma } from "@/lib/db";
import axios from "axios";
import { aiSummariseCommit } from "./gemini";

// Define octokit as a module-scoped variable instead of exporting it
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

type CommitResponse = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

// Fetch recent commit hashes from GitHub
export async function getCommitHashes(githubUrl: string): Promise<CommitResponse[]> {
  const [owner, repo] = githubUrl.split("/").slice(-2);

  if (!owner || !repo) {
    throw new Error("Invalid GitHub URL");
  }

  try {
    const { data } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      per_page: 10, // Fetch only the last 10 commits
    });

    return data.map((commit) => ({
      commitHash: commit.sha,
      commitMessage: commit.commit.message ?? "",
      commitAuthorName: commit.commit.author?.name ?? "Unknown",
      commitAuthorAvatar: commit.author?.avatar_url ?? "",
      commitDate: commit.commit.author?.date ?? "",
    }));
  } catch (error) {
    console.error("Error fetching commits:", error);
    throw new Error("Failed to fetch commits");
  }
}

// Poll commits for a project and save summaries
export async function pollCommits(projectId: string) {
  console.log(`Polling commits for project ${projectId}`);

  const { githubUrl } = await fetchProjectGithubUrl(projectId);
  const commitHashes = await getCommitHashes(githubUrl);
  const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes);

  if (unprocessedCommits.length === 0) {
    console.log("No new commits to process.");
    return { count: 0 };
  }

  const summaryResponses = await Promise.allSettled(
    unprocessedCommits.map((commit) => summariseCommit(githubUrl, commit.commitHash))
  );

  const summaries = summaryResponses.map((response, index) => {
    if (response.status === "fulfilled") {
      return response.value;
    }
    console.warn(`Failed to summarize commit ${unprocessedCommits[index]?.commitHash}`);
    return "Summary unavailable";
  });

  console.log("Summaries to be saved:", summaries);

  const commits = await prisma.commit.createMany({
    data: unprocessedCommits.map((commit, index) => ({
      projectId,
      commitHash: commit.commitHash,
      commitMessage: commit.commitMessage,
      commitAuthorName: commit.commitAuthorName,
      commitAuthorAvatar: commit.commitAuthorAvatar,
      commitDate: new Date(commit.commitDate),
      summary: summaries[index] ?? "Summary unavailable",
    })),
  });

  console.log("Commits saved:", commits);
  return commits;
}

// Summarize a commit diff using AI
export async function summariseCommit(githubUrl: string, commitHash: string): Promise<string> {
  try {
    const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3.diff",
      },
    });

    return (await aiSummariseCommit(data)) || "Summary unavailable";
  } catch (error) {
    console.error("Error summarising commit:", error);
    const axiosError = error as any;
    if (axiosError?.response?.status === 403 || axiosError?.response?.status === 429) {
      console.log("API rate limit reached. Returning partial summaries.");
      return "Rate limit reached, partial summary available";
    }
    return "Error summarising commit";
  }
}

// Fetch project's GitHub URL
async function fetchProjectGithubUrl(projectId: string): Promise<{ githubUrl: string }> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { githubUrl: true },
  });

  if (!project?.githubUrl) {
    throw new Error("Project has no GitHub URL");
  }

  return { githubUrl: project.githubUrl };
}

// Filter out already processed commits
async function filterUnprocessedCommits(
  projectId: string,
  commitHashes: CommitResponse[]
): Promise<CommitResponse[]> {
  const processedCommits = await prisma.commit.findMany({
    where: { projectId },
    select: { commitHash: true },
  });

  const processedHashSet = new Set(processedCommits.map((c) => c.commitHash));
  return commitHashes.filter((commit) => !processedHashSet.has(commit.commitHash));
}