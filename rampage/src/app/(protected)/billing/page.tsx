"use client";
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { getRepoStatus } from '@/lib/github-insights';

// Interfaces remain unchanged
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
}

const RepoInsights = ({ projectId }: { projectId: string }) => {
  const [insights, setInsights] = useState<RepoStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const response =  await getRepoStatus("https://github.com/LEVIII007/xDOTContractor")
        setInsights(response);

      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [projectId]);

  if (loading) return <div className="text-gray-500 text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-8">Error: {error}</div>;
  if (!insights) return null;

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">{insights.name}</h2>
      <p className="text-gray-600 mb-6">{insights.description}</p>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Commits</h3>
          <p className="text-2xl text-blue-600">{insights.totalCommits}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Contributors</h3>
          <p className="text-2xl text-blue-600">{insights.totalContributors}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Open Issues</h3>
          <p className="text-2xl text-blue-600">{insights.openIssues}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Stars / Forks</h3>
          <p className="text-2xl text-blue-600">{insights.stargazers} / {insights.forks}</p>
        </div>
      </div>

      {/* Contributors */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Contributors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.contributors.map(c => (
            <div key={c.author} className="flex items-center bg-white p-4 rounded-lg shadow">
              {c.avatar && <img src={c.avatar} alt={c.author} className="w-10 h-10 rounded-full mr-4" />}
              <div>
                <p className="font-medium">{c.author}</p>
                <p className="text-sm text-gray-600">
                  {c.commits} commits, {c.linesAdded} added, {c.linesDeleted} deleted
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Code Frequency */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Code Frequency</h3>
        <LineChart width={600} height={300} data={insights.codeFrequency} className="mx-auto">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="weekStart" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="additions" stroke="#8884d8" name="Additions" />
          <Line type="monotone" dataKey="deletions" stroke="#82ca9d" name="Deletions" />
        </LineChart>
      </div>

      {/* Commit Frequency by Day */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Commit Frequency by Day</h3>
        <BarChart width={600} height={300} data={insights.commitFrequency} className="mx-auto">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </div>

      {/* File Types */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">File Types</h3>
        <ul className="list-disc pl-5 text-gray-600">
          {insights.fileTypes.map(f => (
            <li key={f.extension}>
              .{f.extension}: {f.count} files ({f.percentage}%)
            </li>
          ))}
        </ul>
      </div>

      {/* Languages */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Languages</h3>
        <ul className="list-disc pl-5 text-gray-600">
          {Object.entries(insights.languages).map(([lang, bytes]) => (
            <li key={lang}>{lang}: {bytes} bytes</li>
          ))}
        </ul>
      </div>

      {/* Key Commits */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Key Commits</h3>
        <ul className="list-disc pl-5 text-gray-600">
          {insights.keyCommits.map(c => (
            <li key={c.sha}>
              <span className="font-medium">{c.message}</span> by {c.author} ({new Date(c.date).toLocaleDateString()}) - Impact: {c.impactScore}
            </li>
          ))}
        </ul>
      </div>

      {/* Pull Requests */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Pull Requests</h3>
        <div className="space-y-2">
          {insights.pullRequests.slice(0, 5).map(pr => (
            <div key={pr.number} className="bg-white p-4 rounded-lg shadow">
              <p className="font-medium">#{pr.number}: {pr.title} ({pr.state})</p>
              <p className="text-sm text-gray-600">
                By {pr.author} on {new Date(pr.createdAt).toLocaleDateString()} - Reviewers: {pr.reviewers.join(', ') || 'None'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Issues */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Issues</h3>
        <div className="space-y-2">
          {insights.issues.slice(0, 5).map(i => (
            <div key={i.number} className="bg-white p-4 rounded-lg shadow">
              <p className="font-medium">#{i.number}: {i.title} ({i.state})</p>
              <p className="text-sm text-gray-600">
                By {i.author} on {new Date(i.createdAt).toLocaleDateString()} - Labels: {i.labels.join(', ') || 'None'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Averages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Avg. Issue Resolution Time</h3>
          <p className="text-2xl text-blue-600">{insights.averageIssueResolutionTime} days</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Avg. PR Review Time</h3>
          <p className="text-2xl text-blue-600">{insights.averagePRReviewTime} days</p>
        </div>
      </div>
    </div>
  );
};

export default RepoInsights;