"use server";

import { Octokit } from 'octokit';
import { prisma } from './db';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// Interfaces (unchanged except for adding commitsPerDay)
interface RepoInfo {
  owner: string;
  repo: string;
}

interface ContributorStats {
  author: string;
  commits: number;
  linesAdded: number;
  linesDeleted: number;
  avatar?: string;
}

interface CodeFrequency {
  weekStart: string;
  additions: number;
  deletions: number;
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

interface FileType {
  extension: string;
  count: number;
  percentage: number;
}

interface CommitSummary {
  message: string;
  author: string;
  date: string;
  sha: string;
  impactScore: number;
}

interface CommitPerDay {
  date: string;
  count: number;
}

interface RepoStatus {
  name: string;
  description: string;
  totalCommits: number;
  totalContributors: number;
  codeFrequency: CodeFrequency[];
  contributors: ContributorStats[];
  openIssues: number;
  branches: string[];
  pullRequests: PullRequest[];
  issues: Issue[];
  fileTypes: FileType[];
  stargazers: number;
  forks: number;
  languages: Record<string, number>;
  keyCommits: CommitSummary[];
  averageIssueResolutionTime: number;
  averagePRReviewTime: number;
  commitFrequency: { day: string; count: number }[];
  commitsPerDay: CommitPerDay[];
}

const parseRepoUrl = (githubUrl: string): RepoInfo => {
  const cleanUrl = githubUrl.replace(/\.git\/?$/, '').replace(/\/$/, '');
  const parts = cleanUrl.split('/').filter(Boolean).slice(-2);
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error('Invalid GitHub URL');
  }
  return { owner: parts[0], repo: parts[1] };
};

export const getRepoStatus = async (projectId: string): Promise<RepoStatus> => {
  console.log(`Fetching repo status for project ${projectId}`);
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      githubUrl: true,
    },
  });

  if (!project?.githubUrl) {
    throw new Error('Project not found or GitHub URL missing');
  }

  const { owner, repo } = parseRepoUrl(project.githubUrl);
  console.log("owner", owner);
  console.log("repo", repo);

  try {
    // Fetch basic repo info
    const { data: repoData } = await octokit.rest.repos.get({ owner, repo });

    // Fetch all commits with pagination
    const allCommits = await octokit.paginate(octokit.rest.repos.listCommits, {
      owner,
      repo,
      per_page: 100,
    });

    // Calculate commits per day
    const commitsPerDayMap = new Map<string, number>();
    allCommits.forEach(c => {
      const date = new Date(c.commit.author?.date || c.commit.committer?.date || Date.now())
        .toISOString()
        .split('T')[0]!; // Format as YYYY-MM-DD
      commitsPerDayMap.set(date, (commitsPerDayMap.get(date) || 0) + 1);
    });
    const commitsPerDay: CommitPerDay[] = Array.from(commitsPerDayMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get unique contributors
    const uniqueContributors = [...new Set(allCommits.map(c => c.commit.author?.name || 'Unknown'))];

    // Fetch contributor stats
    const contributorStats: ContributorStats[] = await Promise.all(
      uniqueContributors.map(async (author) => {
        const authorCommits = allCommits.filter(c => c.commit.author?.name === author);
        let linesAdded = 0, linesDeleted = 0;

        for (const commit of authorCommits.slice(0, 50)) {
          const { data } = await octokit.rest.repos.getCommit({ owner, repo, ref: commit.sha });
          data.files?.forEach(f => {
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

    // Fetch code frequency with fallback
    let codeFreqData: number[][] = [];
    try {
      const { data } = await octokit.rest.repos.getCodeFrequencyStats({ owner, repo });
      console.log(`Code frequency data for ${owner}/${repo}:`, data); // Debug log
      codeFreqData = Array.isArray(data) ? data : [];
      if (codeFreqData.length === 0) {
        console.warn(`No code frequency data available for ${owner}/${repo}`);
      }
    } catch (error) {
      console.warn('Code frequency unavailable:', error);
      codeFreqData = [];
    }

    const codeFrequency: CodeFrequency[] = codeFreqData.map(w => {
      if (!w || w.length < 3) {
        console.warn('Invalid code frequency entry:', w);
        return { weekStart: '', additions: 0, deletions: 0 };
      }
      return {
        weekStart: w[0] ? new Date(w[0] * 1000).toISOString().split('T')[0]! : '',
        additions: w[1] || 0,
        deletions: w[2] || 0,
      };
    }).filter(entry => entry.weekStart !== ''); // Filter out invalid entries

    // Fetch issues
    const issues = await octokit.paginate(octokit.rest.issues.listForRepo, {
      owner,
      repo,
      state: 'all',
      per_page: 100,
    });

    // Fetch pull requests
    const pulls = await octokit.paginate(octokit.rest.pulls.list, {
      owner,
      repo,
      state: 'all',
      per_page: 100,
    });

    // Fetch branches
    const branches = await octokit.paginate(octokit.rest.repos.listBranches, {
      owner,
      repo,
      per_page: 100,
    });

    // Fetch languages
    const { data: languages } = await octokit.rest.repos.listLanguages({ owner, repo });

    // Calculate file types from latest commit tree
    const { data: treeData } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: allCommits[0]?.commit.tree.sha || 'HEAD',
      recursive: 'true',
    });
    const fileExtensions = new Map<string, number>();
    treeData.tree.forEach((item: any) => {
      if (item.type === 'blob') {
        const extension = item.path.split('.').pop() || 'none';
        fileExtensions.set(extension, (fileExtensions.get(extension) || 0) + 1);
      }
    });
    const totalFiles = Array.from(fileExtensions.values()).reduce((sum, count) => sum + count, 0);
    const fileTypes: FileType[] = Array.from(fileExtensions.entries()).map(([extension, count]) => ({
      extension,
      count,
      percentage: totalFiles ? Math.round((count / totalFiles) * 100 * 10) / 10 : 0,
    }));

    // Calculate average issue resolution time
    const closedIssues = issues.filter(i => i.state === 'closed' && !i.pull_request);
    const issueResolutionTime = closedIssues.reduce((sum, issue) => {
      const created = new Date(issue.created_at).getTime();
      const closed = new Date(issue.closed_at || issue.updated_at).getTime();
      return sum + (closed - created) / (1000 * 60 * 60 * 24);
    }, 0);
    const averageIssueResolutionTime = closedIssues.length
      ? Math.round((issueResolutionTime / closedIssues.length) * 10) / 10
      : 0;

    // Calculate average PR review time
    const closedPRs = pulls.filter(pr => pr.state === 'closed' && pr.closed_at);
    const prReviewTime = closedPRs.reduce((sum, pr) => {
      const created = new Date(pr.created_at).getTime();
      const closed = new Date(pr.closed_at!).getTime();
      return sum + (closed - created) / (1000 * 60 * 60 * 24);
    }, 0);
    const averagePRReviewTime = closedPRs.length
      ? Math.round((prReviewTime / closedPRs.length) * 10) / 10
      : 0;

    // Calculate commit frequency by day of the week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const commitFrequencyMap = new Map<string, number>(days.map(d => [d, 0]));
    allCommits.forEach(c => {
      const day = days[new Date(c.commit.author?.date || c.commit.committer?.date || Date.now()).getDay()];
      commitFrequencyMap.set(day, (commitFrequencyMap.get(day) || 0) + 1);
    });
    const commitFrequency = Array.from(commitFrequencyMap.entries()).map(([day, count]) => ({ day, count }));

    // Identify key commits (top 5 by impact)
    const keyCommits = await Promise.all(
      allCommits.slice(0, 10).map(async (commit) => {
        const { data: commitData } = await octokit.rest.repos.getCommit({ owner, repo, ref: commit.sha });
        const messageLength = commit.commit.message.length;
        const filesChanged = commitData.files?.length || 0;
        const additions = commitData.stats?.additions || 0;
        const deletions = commitData.stats?.deletions || 0;
        const impactScore = Math.round((messageLength * 0.01 + filesChanged * 0.5 + additions * 0.01 + deletions * 0.01) * 10) / 10;

        return {
          message: commit.commit.message.split('\n')[0] || 'No message',
          author: commit.commit.author?.name || 'Unknown',
          date: commit.commit.author?.date || commit.commit.committer?.date || new Date().toISOString(),
          sha: commit.sha,
          impactScore,
        };
      })
    );

    // Format issues and PRs
    const formattedIssues = issues.filter(i => !i.pull_request).map(i => ({
      number: i.number,
      title: i.title,
      state: i.state,
      createdAt: i.created_at,
      updatedAt: i.updated_at,
      author: i.user?.login || 'Unknown',
      labels: i.labels.map((l: any) => l.name),
    }));

    const formattedPRs = pulls.map(pr => ({
      number: pr.number,
      title: pr.title,
      state: pr.state,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      author: pr.user?.login || 'Unknown',
      reviewers: pr.requested_reviewers?.map((r: any) => r.login) || [],
    }));

    const status: RepoStatus = {
      name: repoData.name,
      description: repoData.description || 'No description',
      totalCommits: allCommits.length,
      totalContributors: contributorStats.length,
      codeFrequency,
      contributors: contributorStats,
      openIssues: formattedIssues.filter(i => i.state === 'open').length,
      branches: branches.map(b => b.name),
      pullRequests: formattedPRs,
      issues: formattedIssues,
      fileTypes,
      stargazers: repoData.stargazers_count,
      forks: repoData.forks_count,
      languages,
      keyCommits: keyCommits.map(commit => ({
        ...commit,
        date: commit.date || new Date().toISOString(),
      })).sort((a, b) => b.impactScore - a.impactScore).slice(0, 5),
      averageIssueResolutionTime,
      averagePRReviewTime,
      commitFrequency,
      commitsPerDay,
    };

    return status;
  } catch (error) {
    console.error('Error fetching repo status:', error);
    throw new Error(`Failed to fetch repo status: ${(error as Error).message}`);
  }
};