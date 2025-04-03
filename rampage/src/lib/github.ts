"use server";

import { Octokit } from "octokit";
import { prisma } from "@/lib/db";
import axios from "axios";
import { aiSummariseCommit } from "./gemini";
import { aiSummariseCommit_2 } from "./gemini2";

// Octokit instance
const githubToken = process.env.GITHUB_TOKEN;
if (!githubToken) {
  throw new Error("GITHUB_TOKEN is not defined in the environment variables.");
}
const octokit = new Octokit({ auth: githubToken });

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000; // 1 second base delay
const BATCH_SIZE = 2; // Process fewer commits per batch to avoid rate limits
const BATCH_DELAY_MS = 2000; // 3 seconds delay between batches

type CommitResponse = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

// Utility function for delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Fetch commits with retry logic
export async function getCommitHashes(githubUrl: string, since?: string): Promise<CommitResponse[]> {
  const [owner, repo] = githubUrl.split("/").slice(-2);
  if (!owner || !repo) throw new Error("Invalid GitHub URL");

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { data } = await octokit.rest.repos.listCommits({
        owner,
        repo,
        per_page: 10,
        since,
      });

      return data.map((commit) => ({
        commitHash: commit.sha,
        commitMessage: commit.commit.message ?? "",
        commitAuthorName: commit.commit.author?.name ?? "Unknown",
        commitAuthorAvatar: commit.author?.avatar_url ?? "",
        commitDate: commit.commit.author?.date ?? "",
      }));
    } catch (error: any) {
      if (error.status === 403 || error.status === 429 || error.message.includes("rate limit")) {
        if (attempt === MAX_RETRIES) {
          console.error("Max retries reached for fetching commits:", error);
          throw new Error("Failed to fetch commits after max retries");
        }
        const retryDelay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(`Rate limit hit. Retrying (${attempt}/${MAX_RETRIES}) after ${retryDelay}ms...`);
        await delay(retryDelay);
      } else {
        console.error("Error fetching commits:", error);
        throw error;
      }
    }
  }
  throw new Error("Failed to fetch commits after max retries");
}

// Poll commits with rate limit handling
export async function pollCommits(projectId: string): Promise<{ count: number }> {
  console.log(`Polling commits for project ${projectId}`);

  const { githubUrl } = await fetchProjectGithubUrl(projectId);

  const lastCommit = await prisma.commit.findFirst({
    where: { projectId },
    orderBy: { commitDate: "desc" },
    select: { commitDate: true },
  });

  const since = lastCommit && lastCommit.commitDate ? lastCommit.commitDate.toISOString() : undefined;
  console.log("Fetching commits since:", since);

  const commitHashes = await getCommitHashes(githubUrl, since);
  const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes);

  if (unprocessedCommits.length === 0) {
    console.log("No new commits to process.");
    return { count: 0 };
  }

  const summaries = await batchSummariseCommits(githubUrl, unprocessedCommits);

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
  return { count: commits.count };
}

// Batch summarize commits with rate limit handling
async function batchSummariseCommits(githubUrl: string, commits: CommitResponse[]): Promise<string[]> {
  const summaries: string[] = [];

  let turn = false;
  for (let i = 0; i < commits.length; i += BATCH_SIZE) {
    const batch = commits.slice(i, i + BATCH_SIZE);
    let batchSummaries;
    if (turn) {
      batchSummaries = await Promise.allSettled(
        batch.map((commit) => summariseCommit(githubUrl, commit.commitHash))
      );
      turn = false;
    } else {
      batchSummaries = await Promise.allSettled(
        batch.map((commit) => summariseCommit_2(githubUrl, commit.commitHash))
      );
      turn = true;
    }
    batchSummaries.forEach((result, idx) => {
      summaries[i + idx] = result.status === "fulfilled" ? result.value : "Summary unavailable";
    });

    if (i + BATCH_SIZE < commits.length) {
      console.log(`Waiting ${BATCH_DELAY_MS}ms before next batch...`);
      await delay(BATCH_DELAY_MS);
    }
  }

  return summaries;
}

// Single commit summarization with retry logic
export async function summariseCommit(githubUrl: string, commitHash: string): Promise<string> {
  const [owner, repo] = githubUrl.split("/").slice(-2);
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits/${commitHash}`;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { data } = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3.diff",
        },
      });

      return (await aiSummariseCommit(data)) || "Summary unavailable";
    } catch (error: any) {
      if (error.response?.status === 429 || error.response?.status === 403) {
        if (attempt === MAX_RETRIES) {
          console.error(`Failed to summarise commit ${commitHash} after ${MAX_RETRIES} attempts:`, error);
          return "Rate limit reached, retry later";
        }
        const retryDelay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(
          `Rate limit hit for commit ${commitHash}. Retrying (${attempt}/${MAX_RETRIES}) after ${retryDelay}ms...`
        );
        await delay(retryDelay);
      } else {
        console.error(`Error summarising commit ${commitHash}:`, error);
        return "Error summarising commit";
      }
    }
  }
  return "Error summarising commit after max retries";
}

export async function summariseCommit_2(githubUrl: string, commitHash: string): Promise<string> {
  const [owner, repo] = githubUrl.split("/").slice(-2);
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits/${commitHash}`;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { data } = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3.diff",
        },
      });

      return (await aiSummariseCommit_2(data)) || "Summary unavailable";
    } catch (error: any) {
      if (error.response?.status === 429 || error.response?.status === 403) {
        if (attempt === MAX_RETRIES) {
          console.error(`Failed to summarise commit ${commitHash} after ${MAX_RETRIES} attempts:`, error);
          return "Rate limit reached, retry later";
        }
        const retryDelay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(
          `Rate limit hit for commit ${commitHash}. Retrying (${attempt}/${MAX_RETRIES}) after ${retryDelay}ms...`
        );
        await delay(retryDelay);
      } else {
        console.error(`Error summarising commit ${commitHash}:`, error);
        return "Error summarising commit";
      }
    }
  }
  return "Error summarising commit after max retries";
}

// Fetch project GitHub URL
async function fetchProjectGithubUrl(projectId: string): Promise<{ githubUrl: string }> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { githubUrl: true },
  });
  if (!project?.githubUrl) throw new Error("Project has no GitHub URL");
  return { githubUrl: project.githubUrl };
}

// Filter unprocessed commits
async function filterUnprocessedCommits(projectId: string, commitHashes: CommitResponse[]): Promise<CommitResponse[]> {
  const processedCommits = await prisma.commit.findMany({
    where: { projectId },
    select: { commitHash: true },
  });
  const processedHashSet = new Set(processedCommits.map((c: { commitHash: string }) => c.commitHash));
  return commitHashes.filter((commit) => !processedHashSet.has(commit.commitHash));
}