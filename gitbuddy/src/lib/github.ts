import { Octokit } from "octokit";
import { db } from "~/server/db";
import axios from "axios";
import { aiSummariseCommit } from "./gemini";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// const githubUrl = 'https://github.com/docker/genai-stack';

type Response = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};



export const getCommitHashes = async (githubUrl: string): Promise<Response[]> => {

    const [owner, repo] = githubUrl.split('/').slice(-2);

    if(!owner || !repo) {
        throw new Error("Invalid github url");
        }
    
        try{
          const { data } = await octokit.rest.repos.listCommits({
            owner,
            repo
        });
          const sortedCommits = data.sort((a: any, b: any) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime()) as any[];
    return sortedCommits.slice(0, 10).map((commit: any) => ({
      commitHash: commit.sha as string,
      commitMessage: commit.commit.message ?? "",
      commitAuthorName: commit.commit?.author?.name ?? "",
      commitAuthorAvatar: commit?.author?.avatar_url ?? "",
      commitDate: commit.commit?.author?.date ?? ""
    }));

        }
        catch (error) {
          console.error('Error fetching commits:', error);
          throw new Error('Failed to fetch commits');
        }
};

// console.log(await getCommitHashes(githubUrl));

export const pollCommits = async (projectId: string) => {
  console.log(`Polling commits for project ${projectId}`);

  const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
  const commitHashes = await getCommitHashes(githubUrl);
  const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes);

  const summaryResponses = await Promise.allSettled(
    unprocessedCommits.map((commit) =>{
       return summariseCommit(githubUrl, commit.commitHash)
    }) );

  const summaries = summaryResponses.map((response) => {
      if (response.status === 'fulfilled') {
        return response.value as string;
      }
      return ""; 
    })
   
    console.log("Summaries to be saved:", summaries); 

  const commits = await db.commit.createMany({
    data: summaries.map((summary, index) => {
        return{
      projectId: projectId,
      commitHash: unprocessedCommits[index]?.commitHash ?? "",
      commitMessage: unprocessedCommits[index]?.commitMessage ?? "",
      commitAuthorName: unprocessedCommits[index]?.commitAuthorName ?? "",
      commitAuthorAvatar: unprocessedCommits[index]?.commitAuthorAvatar ?? "",
      commitDate: unprocessedCommits[index]?.commitDate ?? "",
      summary,
    }
    }),
  });
  console.log("Commits saved:", commits);  
  return commits;
};



// github.ts
export const summariseCommit = async (githubUrl: string, commitHash: string) => {
  try {
    const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3.diff",
      },
    });

    return await aiSummariseCommit(data) || "Summary unavailable";
  } catch (error) {
    console.error("Error summarising commit:", error);

    // Check if the error is related to rate limiting (HTTP 403 or 429)
    if ((error as any)?.response?.status === 403 || (error as any)?.response?.status === 429) {
      console.log("API rate limit reached. Returning partial summaries.");
      return "Rate limit reached, partial summary available.";
    } else {
      return "Error summarising commit";  // Generic error message
    }
  }
};


async function fetchProjectGithubUrl(projectId: string): Promise<{ project: any, githubUrl: string }> {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: {
         githubUrl: true }
   });

  if (!project?.githubUrl) {
    throw new Error("Project has no github url");
  }
  return { project, githubUrl: project.githubUrl };
}

async function filterUnprocessedCommits(projectId: string, commitHashes: Response[]): Promise<Response[]> {
  const processedCommits = await db.commit.findMany({
    where: { projectId }
  });

  const unprocessedCommits = commitHashes.filter((commit) => 
    !processedCommits.some((processedCommit: any) => processedCommit.commitHash === commit.commitHash)
  );

  return unprocessedCommits;
}

