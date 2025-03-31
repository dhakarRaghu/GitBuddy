"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Calendar, User, Tag, GitPullRequest, AlertCircle } from "lucide-react";

interface PullRequest {
  number: number;
  title: string;
  state: string;
  author: string;
  createdAt: string;
  reviewers: string[];
}

interface Issue {
  number: number;
  title: string;
  state: string;
  author: string;
  createdAt: string;
  labels: string[];
}

interface RepoStatus {
  name: string;
  pullRequests: PullRequest[];
  issues: Issue[];
  openIssues: number;
  averageIssueResolutionTime: number;
  averagePRReviewTime: number;
}

const PRAndIssuesClient = ({ insights }: { insights: RepoStatus }) => {
  const [activeTab, setActiveTab] = useState<"prs" | "issues">("prs");
  const [prFilter, setPRFilter] = useState<string>("all");
  const [issueFilter, setIssueFilter] = useState<string>("all");
  const [prSort, setPRSort] = useState<string>("created-desc");
  const [issueSort, setIssueSort] = useState<string>("created-desc");

  // Filter and sort PRs
  const filteredPRs = insights.pullRequests
    .filter((pr) => (prFilter === "all" ? true : pr.state.toLowerCase() === prFilter))
    .sort((a, b) => {
      if (prSort === "created-desc") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (prSort === "created-asc") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return 0;
    });

  // Filter and sort Issues
  const filteredIssues = insights.issues
    .filter((issue) => (issueFilter === "all" ? true : issue.state.toLowerCase() === issueFilter))
    .sort((a, b) => {
      if (issueSort === "created-desc") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (issueSort === "created-asc") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto py-6 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
            {insights.name}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {insights.openIssues} open issues • Avg. issue resolution: {insights.averageIssueResolutionTime} days • Avg. PR review: {insights.averagePRReviewTime} days
          </p>
        </motion.div>

        {/* Toggle Buttons */}
        <div className="flex border-b border-orange-200 dark:border-orange-900/50 mb-6">
          <button
            onClick={() => setActiveTab("prs")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "prs"
                ? "border-b-2 border-orange-500 text-orange-500 dark:text-orange-400"
                : "text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
            }`}
          >
            <GitPullRequest className="inline w-4 h-4 mr-2" />
            Pull Requests ({filteredPRs.length})
          </button>
          <button
            onClick={() => setActiveTab("issues")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "issues"
                ? "border-b-2 border-orange-500 text-orange-500 dark:text-orange-400"
                : "text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
            }`}
          >
            <AlertCircle className="inline w-4 h-4 mr-2" />
            Issues ({filteredIssues.length})
          </button>
        </div>

        {/* Filters and Sorting */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4">
            <Select
              onValueChange={activeTab === "prs" ? setPRFilter : setIssueFilter}
              defaultValue="all"
            >
              <SelectTrigger className="w-[150px] bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-900/50 text-orange-500 dark:text-orange-400">
                <SelectValue placeholder="Filter by state" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-orange-200 dark:border-orange-900/50">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              onValueChange={activeTab === "prs" ? setPRSort : setIssueSort}
              defaultValue="created-desc"
            >
              <SelectTrigger className="w-[150px] bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-900/50 text-orange-500 dark:text-orange-400">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-orange-200 dark:border-orange-900/50">
                <SelectItem value="created-desc">Newest First</SelectItem>
                <SelectItem value="created-asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {activeTab === "prs" ? (
            filteredPRs.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No pull requests found.
              </div>
            ) : (
              filteredPRs.map((pr) => (
                <div
                  key={pr.number}
                  className="bg-white dark:bg-gray-800 p-4 rounded-md border border-orange-200 dark:border-orange-900/50 hover:bg-gradient-to-br hover:from-orange-50 hover:to-pink-50 dark:hover:from-orange-900/20 dark:hover:to-pink-900/20 transition-colors duration-200"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-orange-500 dark:text-orange-400 font-medium">
                        #{pr.number} {pr.title}
                      </p>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        <User className="inline w-4 h-4 mr-1" />
                        {pr.author} opened on {new Date(pr.createdAt).toLocaleDateString()} • Reviewers: {pr.reviewers.join(", ") || "None"}
                      </div>
                    </div>
                    <Badge
                      variant={pr.state === "open" ? "default" : "secondary"}
                      className={pr.state === "open" 
                        ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/50" 
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border border-orange-200 dark:border-orange-900/50"}
                    >
                      {pr.state}
                    </Badge>
                  </div>
                </div>
              ))
            )
          ) : (
            filteredIssues.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No issues found.
              </div>
            ) : (
              filteredIssues.map((issue) => (
                <div
                  key={issue.number}
                  className="bg-white dark:bg-gray-800 p-4 rounded-md border border-orange-200 dark:border-orange-900/50 hover:bg-gradient-to-br hover:from-orange-50 hover:to-pink-50 dark:hover:from-orange-900/20 dark:hover:to-pink-900/20 transition-colors duration-200"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-orange-500 dark:text-orange-400 font-medium">
                        #{issue.number} {issue.title}
                      </p>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        <User className="inline w-4 h-4 mr-1" />
                        {issue.author} opened on {new Date(issue.createdAt).toLocaleDateString()} •{" "}
                        <Tag className="inline w-4 h-4 mr-1" />
                        {issue.labels.join(", ") || "No labels"}
                      </div>
                    </div>
                    <Badge
                      variant={issue.state === "open" ? "default" : "secondary"}
                      className={issue.state === "open" 
                        ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/50" 
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border border-orange-200 dark:border-orange-900/50"}
                    >
                      {issue.state}
                    </Badge>
                  </div>
                </div>
              ))
            )
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PRAndIssuesClient;