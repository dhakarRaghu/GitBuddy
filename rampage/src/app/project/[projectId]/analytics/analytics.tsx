"use client";

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { getRepoStatus } from '@/lib/github-insights';
import { motion } from 'framer-motion';
import {
  SiJavascript,
  SiTypescript,
  SiPython,
  SiHtml5,
  SiCss3,
  SiJson,
  SiMarkdown,
  SiYaml,
} from 'react-icons/si';
import { FileCode, FileText, FileJson, File } from 'lucide-react';
import Loading from './loading';

// Interfaces
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

const RepoInsights = ({ projectId }: { projectId: string }) => {
  const [insights, setInsights] = useState<RepoStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const response = await getRepoStatus(projectId);
        setInsights(response);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [projectId]);

  if (loading) return Loading();
  if (error) return <div className="text-red-500 text-center py-8">Error: {error}</div>;
  if (!insights) return null;

  // Language Icons Mapping
  const languageIcons: Record<string, React.ReactNode> = {
    JavaScript: <SiJavascript className="text-yellow-500" />,
    TypeScript: <SiTypescript className="text-blue-600" />,
    Python: <SiPython className="text-blue-400" />,
    HTML: <SiHtml5 className="text-orange-500" />,
    CSS: <SiCss3 className="text-blue-500" />,
    JSON: <SiJson className="text-gray-500" />,
    Markdown: <SiMarkdown className="text-gray-700" />,
    YAML: <SiYaml className="text-red-500" />,
  };


  // File Type Icons Mapping
  const fileTypeIcons = (extension: string) => {
    switch (extension.toLowerCase()) {
      case 'js':
      case 'jsx':
        return <SiJavascript className="text-yellow-500" />;
      case 'ts':
      case 'tsx':
        return <SiTypescript className="text-blue-600" />;
      case 'py':
        return <SiPython className="text-blue-400" />;
      case 'html':
        return <SiHtml5 className="text-orange-500" />;
      case 'css':
        return <SiCss3 className="text-blue-500" />;
      case 'json':
        return <SiJson className="text-gray-500" />;
      case 'md':
        return <SiMarkdown className="text-gray-700" />;
      case 'yaml':
      case 'yml':
        return <SiYaml className="text-red-500" />;
      default:
        return <File className="text-gray-500" />;
    }
  };

  // Prepare data for Languages Bar Chart
  const languageData = Object.entries(insights.languages).map(([lang, bytes]) => ({
    name: lang,
    bytes,
  }));

  // Prepare data for File Types Bar Chart
  const fileTypeData = insights.fileTypes.map(ft => ({
    name: ft.extension,
    count: ft.count,
    percentage: ft.percentage,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {insights.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{insights.description}</p>

          {/* Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Commits', value: insights.totalCommits, color: 'text-blue-600' },
              { label: 'Contributors', value: insights.totalContributors, color: 'text-green-600' },
              { label: 'Open Issues', value: insights.openIssues, color: 'text-red-600' },
              { label: 'Stars / Forks', value: `${insights.stargazers} / ${insights.forks}`, color: 'text-purple-600' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{stat.label}</h3>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Contributors */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Contributors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.contributors.map(c => (
                <motion.div
                  key={c.author}
                  className="flex items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  {c.avatar && (
                    <img src={c.avatar} alt={c.author} className="w-10 h-10 rounded-full mr-4" />
                  )}
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{c.author}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {c.commits} commits, {c.linesAdded} added, {c.linesDeleted} deleted
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Commits Per Day */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Commits Per Day</h3>
            <LineChart width={600} height={300} data={insights.commitsPerDay} className="mx-auto">
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" name="Commits" />
            </LineChart>
          </div>

          {/* Code Frequency */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Code Frequency</h3>
            <LineChart width={600} height={300} data={insights.codeFrequency} className="mx-auto">
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="weekStart" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <Legend />
              <Line type="monotone" dataKey="additions" stroke="#8884d8" name="Additions" />
              <Line type="monotone" dataKey="deletions" stroke="#82ca9d" name="Deletions" />
            </LineChart>
          </div>

          {/* Commit Frequency by Day */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Commit Frequency by Day</h3>
            <BarChart width={600} height={300} data={insights.commitFrequency} className="mx-auto">
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="day" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </div>

          {/* Languages */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Languages</h3>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <BarChart width={600} height={300} data={languageData} className="mx-auto">
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                <Bar dataKey="bytes" fill="#82ca9d" />
              </BarChart>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {languageData.map(lang => (
                  <motion.div
                    key={lang.name}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    {languageIcons[lang.name] || <FileCode className="text-gray-500" />}
                    <span>{lang.name}: {lang.bytes} bytes</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* File Types */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">File Types</h3>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <BarChart width={600} height={300} data={fileTypeData} className="mx-auto">
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {fileTypeData.map(ft => (
                  <motion.div
                    key={ft.name}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    {fileTypeIcons(ft.name)}
                    <span>.{ft.name}: {ft.count} files ({ft.percentage}%)</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Key Commits */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Key Commits</h3>
            <div className="space-y-4">
              {insights.keyCommits.map(c => (
                <motion.div
                  key={c.sha}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="font-medium text-gray-800 dark:text-gray-100">
                    {c.message}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    By {c.author} on {new Date(c.date).toLocaleDateString()} - Impact: {c.impactScore}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Averages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                Avg. Issue Resolution Time
              </h3>
              <p className="text-2xl font-bold text-blue-600">{insights.averageIssueResolutionTime} days</p>
            </motion.div>
            <motion.div
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                Avg. PR Review Time
              </h3>
              <p className="text-2xl font-bold text-blue-600">{insights.averagePRReviewTime} days</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RepoInsights;