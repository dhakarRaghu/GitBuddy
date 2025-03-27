"use server";

import { Octokit } from "octokit";
import { prisma } from "./db";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// Interfaces (simplified for PRs and Issues)
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

interface RepoInfo {
  owner: string;
  repo: string;
}

interface RepoStatus {
  name: string;
  description: string;
  totalCommits: number;
  totalContributors: number;
  codeFrequency: { weekStart: string; additions: number; deletions: number }[];
  contributors: { author: string; commits: number; linesAdded: number; linesDeleted: number; avatar?: string }[];
  openIssues: number;
  branches: string[];
  pullRequests: PullRequest[];
  issues: Issue[];
  fileTypes: { extension: string; count: number; percentage: number }[];
  stargazers: number;
  forks: number;
  languages: Record<string, number>;
  keyCommits: { message: string; author: string; date: string; sha: string; impactScore: number }[];
  averageIssueResolutionTime: number;
  averagePRReviewTime: number;
  commitFrequency: { day: string; count: number }[];
  commitsPerDay: { date: string; count: number }[];
}

const parseRepoUrl = (githubUrl: string): RepoInfo => {
  const cleanUrl = githubUrl.replace(/\.git\/?$/, "").replace(/\/$/, "");
  const parts = cleanUrl.split("/").filter(Boolean).slice(-2);
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error("Invalid GitHub URL");
  }
  return { owner: parts[0], repo: parts[1] };
};

// Full repo status (unchanged except for PRs and Issues extraction)
export const getRepoStatus = async (projectId: string): Promise<RepoStatus> => {
  console.log(`Fetching repo status for project ${projectId}`);
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { githubUrl: true },
  });

  if (!project?.githubUrl) {
    throw new Error("Project not found or GitHub URL missing");
  }

  const { owner, repo } = parseRepoUrl(project.githubUrl);

  try {
    const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
    const allCommits = await octokit.paginate(octokit.rest.repos.listCommits, { owner, repo, per_page: 100 });

    // Commits per day (unchanged)
    const commitsPerDayMap = new Map<string, number>();
    allCommits.forEach((c) => {
      const date = new Date(c.commit.author?.date || c.commit.committer?.date || Date.now())
        .toISOString()
        .split("T")[0]!;
      commitsPerDayMap.set(date, (commitsPerDayMap.get(date) || 0) + 1);
    });
    const commitsPerDay = Array.from(commitsPerDayMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const uniqueContributors = [...new Set(allCommits.map((c) => c.commit.author?.name || "Unknown"))];
    const contributorStats = await Promise.all(
      uniqueContributors.map(async (author) => {
        const authorCommits = allCommits.filter((c) => c.commit.author?.name === author);
        let linesAdded = 0,
          linesDeleted = 0;
        for (const commit of authorCommits.slice(0, 50)) {
          const { data } = await octokit.rest.repos.getCommit({ owner, repo, ref: commit.sha });
          data.files?.forEach((f) => {
            linesAdded += f.additions || 0;
            linesDeleted += f.deletions || 0;
          });
        }
        return {
          author,
          commits: authorCommits.length,
          linesAdded,
          linesDeleted,
          avatar: authorCommits[0]?.author?.avatar_url,
        };
      })
    );

    const { data: codeFreqData } = await octokit.rest.repos.getCodeFrequencyStats({ owner, repo });
    const codeFrequency = (Array.isArray(codeFreqData) ? codeFreqData : []).map((w) => ({
      weekStart: w[0] ? new Date(w[0] * 1000).toISOString().split("T")[0]! : "",
      additions: w[1] || 0,
      deletions: w[2] || 0,
    }));

    const issues = await octokit.paginate(octokit.rest.issues.listForRepo, { owner, repo, state: "all", per_page: 100 });
    const pulls = await octokit.paginate(octokit.rest.pulls.list, { owner, repo, state: "all", per_page: 100 });
    const branches = await octokit.paginate(octokit.rest.repos.listBranches, { owner, repo, per_page: 100 });
    const { data: languages } = await octokit.rest.repos.listLanguages({ owner, repo });
    const { data: treeData } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: allCommits[0]?.commit.tree.sha || "HEAD",
      recursive: "true",
    });

    const fileExtensions = new Map<string, number>();
    treeData.tree.forEach((item: any) => {
      if (item.type === "blob") {
        const extension = item.path.split(".").pop() || "none";
        fileExtensions.set(extension, (fileExtensions.get(extension) || 0) + 1);
      }
    });
    const totalFiles = Array.from(fileExtensions.values()).reduce((sum, count) => sum + count, 0);
    const fileTypes = Array.from(fileExtensions.entries()).map(([extension, count]) => ({
      extension,
      count,
      percentage: totalFiles ? Math.round((count / totalFiles) * 100 * 10) / 10 : 0,
    }));

    const closedIssues = issues.filter((i) => i.state === "closed" && !i.pull_request);
    const issueResolutionTime = closedIssues.reduce((sum, issue) => {
      const created = new Date(issue.created_at).getTime();
      const closed = new Date(issue.closed_at || issue.updated_at).getTime();
      return sum + (closed - created) / (1000 * 60 * 60 * 24);
    }, 0);
    const averageIssueResolutionTime = closedIssues.length ? Math.round((issueResolutionTime / closedIssues.length) * 10) / 10 : 0;

    const closedPRs = pulls.filter((pr) => pr.state === "closed" && pr.closed_at);
    const prReviewTime = closedPRs.reduce((sum, pr) => {
      const created = new Date(pr.created_at).getTime();
      const closed = new Date(pr.closed_at!).getTime();
      return sum + (closed - created) / (1000 * 60 * 60 * 24);
    }, 0);
    const averagePRReviewTime = closedPRs.length ? Math.round((prReviewTime / closedPRs.length) * 10) / 10 : 0;

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const commitFrequencyMap = new Map<string, number>(days.map((d) => [d, 0]));
    allCommits.forEach((c) => {
      const day = days[new Date(c.commit.author?.date || c.commit.committer?.date || Date.now()).getDay()];
      commitFrequencyMap.set(day, (commitFrequencyMap.get(day) || 0) + 1);
    });
    const commitFrequency = Array.from(commitFrequencyMap.entries()).map(([day, count]) => ({ day, count }));

    const keyCommits = await Promise.all(
      allCommits.slice(0, 10).map(async (commit) => {
        const { data: commitData } = await octokit.rest.repos.getCommit({ owner, repo, ref: commit.sha });
        const messageLength = commit.commit.message.length;
        const filesChanged = commitData.files?.length || 0;
        const additions = commitData.stats?.additions || 0;
        const deletions = commitData.stats?.deletions || 0;
        const impactScore = Math.round((messageLength * 0.01 + filesChanged * 0.5 + additions * 0.01 + deletions * 0.01) * 10) / 10;

        return {
          message: commit.commit.message.split("\n")[0] || "No message",
          author: commit.commit.author?.name || "Unknown",
          date: commit.commit.author?.date || commit.commit.committer?.date || new Date().toISOString(),
          sha: commit.sha,
          impactScore,
        };
      })
    );

    const formattedIssues = issues.filter((i) => !i.pull_request).map((i) => ({
      number: i.number,
      title: i.title,
      state: i.state,
      createdAt: i.created_at,
      updatedAt: i.updated_at,
      author: i.user?.login || "Unknown",
      labels: i.labels.map((l: any) => l.name),
    }));

    const formattedPRs = pulls.map((pr) => ({
      number: pr.number,
      title: pr.title,
      state: pr.state,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      author: pr.user?.login || "Unknown",
      reviewers: pr.requested_reviewers?.map((r: any) => r.login) || [],
    }));

    return {
      name: repoData.name,
      description: repoData.description || "No description",
      totalCommits: allCommits.length,
      totalContributors: contributorStats.length,
      codeFrequency,
      contributors: contributorStats,
      openIssues: formattedIssues.filter((i) => i.state === "open").length,
      branches: branches.map((b) => b.name),
      pullRequests: formattedPRs,
      issues: formattedIssues,
      fileTypes,
      stargazers: repoData.stargazers_count,
      forks: repoData.forks_count,
      languages,
      keyCommits: keyCommits.sort((a, b) => b.impactScore - a.impactScore).slice(0, 5),
      averageIssueResolutionTime,
      averagePRReviewTime,
      commitFrequency,
      commitsPerDay,
    };
  } catch (error) {
    console.error("Error fetching repo status:", error);
    throw new Error(`Failed to fetch repo status: ${(error as Error).message}`);
  }
};

// Standalone PR and Issues function
export const PRandIssues = async (projectId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { githubUrl: true },
  });

  if (!project?.githubUrl) {
    throw new Error("Project not found or GitHub URL missing");
  }

  const { owner, repo } = parseRepoUrl(project.githubUrl);

  try {
    const issues = await octokit.paginate(octokit.rest.issues.listForRepo, {
      owner,
      repo,
      state: "all",
      per_page: 100,
    });

    const pulls = await octokit.paginate(octokit.rest.pulls.list, {
      owner,
      repo,
      state: "all",
      per_page: 100,
    });

    const formattedIssues = issues.filter((i) => !i.pull_request).map((i) => ({
      number: i.number,
      title: i.title,
      state: i.state,
      createdAt: i.created_at,
      updatedAt: i.updated_at,
      author: i.user?.login || "Unknown",
      labels: i.labels.map((l: any) => l.name),
    }));

    const formattedPRs = pulls.map((pr) => ({
      number: pr.number,
      title: pr.title,
      state: pr.state,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      author: pr.user?.login || "Unknown",
      reviewers: pr.requested_reviewers?.map((r: any) => r.login) || [],
    }));

    const closedIssues = issues.filter((i) => i.state === "closed" && !i.pull_request);
    const issueResolutionTime = closedIssues.reduce((sum, issue) => {
      const created = new Date(issue.created_at).getTime();
      const closed = new Date(issue.closed_at || issue.updated_at).getTime();
      return sum + (closed - created) / (1000 * 60 * 60 * 24);
    }, 0);
    const averageIssueResolutionTime = closedIssues.length ? Math.round((issueResolutionTime / closedIssues.length) * 10) / 10 : 0;

    const closedPRs = pulls.filter((pr) => pr.state === "closed" && pr.closed_at);
    const prReviewTime = closedPRs.reduce((sum, pr) => {
      const created = new Date(pr.created_at).getTime();
      const closed = new Date(pr.closed_at!).getTime();
      return sum + (closed - created) / (1000 * 60 * 60 * 24);
    }, 0);
    const averagePRReviewTime = closedPRs.length ? Math.round((prReviewTime / closedPRs.length) * 10) / 10 : 0;

    return {
      name: `${owner}/${repo}`, // Simple name for now; could fetch from repoData if needed
      pullRequests: formattedPRs,
      issues: formattedIssues,
      openIssues: formattedIssues.filter((i) => i.state === "open").length,
      averageIssueResolutionTime,
      averagePRReviewTime,
    };
  } catch (error) {
    console.error("Error fetching PRs and Issues:", error);
    throw new Error(`Failed to fetch PRs and Issues: ${(error as Error).message}`);
  }
};