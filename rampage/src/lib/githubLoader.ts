"use server";

import { Octokit } from "octokit";
import { prisma } from "./db";
import { getAuthSession } from "./auth";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// Parse GitHub URL to extract owner and repo
async function RepoDetails(githubUrl: string) {
    const owner = githubUrl.split('/')[3];
    const repo = githubUrl.split('/')[4];
  if (!owner || !repo) {
    throw new Error("Invalid GitHub URL");
  }
  return { owner, repo };
}

// Count files in the repository (simplified without structure)
async function getFileCount(
  path: string,
  octokit: Octokit,
  githubOwner: string,
  githubRepo: string,
  acc: number = 0
): Promise<number> {
  const { data } = await octokit.rest.repos.getContent({
    owner: githubOwner,
    repo: githubRepo,
    path,
  });

//   console.log("data", data);
//   console.log("path", path);

  if (!Array.isArray(data)) {
    if (data.type === "file") return acc + 1;
    return acc;
  }

  let fileCount = acc;
  const directories: string[] = [];

  for (const item of data) {
    if (item.type === "file") {
      fileCount += 1;
    } else if (item.type === "dir") {
      directories.push(item.path);
    }
  }

  if (directories.length > 0) {
    const directoryCounts = await Promise.all(
      directories.map((dirPath) =>
        getFileCount(dirPath, octokit, githubOwner, githubRepo, 0)
      )
    );
    fileCount += directoryCounts.reduce((sum, count) => sum + count, 0);
  }

  return fileCount;
}

// Main function to check credits without file structure
export async function checkCreditsAndStructure(githubUrl: string) {
  const session = await getAuthSession();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const { owner, repo } = await RepoDetails(githubUrl);

  console.log("githubUrl", githubUrl);
  console.log("owner", owner);
//   console.log("GITHUB_TOKEN", process.env.GITHUB_TOKEN);

  // Fetch file count only
  const fileCount = await getFileCount("", octokit, owner, repo);

  // Fetch user's remaining credits
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  console.log("fileCount", fileCount);
  console.log("userCredits", user?.credits);

  return {
    fileCount,
    userCredits: user?.credits || 0,
  };
}