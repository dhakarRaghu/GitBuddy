"use client"
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Calendar, User, Tag } from 'lucide-react';

interface RepoStatus {
  name: string;
  pullRequests: {
    number: number;
    title: string;
    state: string;
    author: string;
    createdAt: string;
    reviewers: string[];
  }[];
  issues: {
    number: number;
    title: string;
    state: string;
    author: string;
    createdAt: string;
    labels: string[];
  }[];
}

const PRAndIssuesClient = ({ insights }: { insights: RepoStatus }) => {
    const [prFilter, setPRFilter] = useState<string>('all');
    const [issueFilter, setIssueFilter] = useState<string>('all');
    const [prSort, setPRSort] = useState<string>('created-desc');
    const [issueSort, setIssueSort] = useState<string>('created-desc');
  
    // Filter and sort PRs
    interface PullRequest {
      number: number;
      title: string;
      state: string;
      author: string;
      createdAt: string;
      reviewers: string[];
    }

    const filteredPRs = insights.pullRequests.filter((pr: PullRequest) => {
      if (prFilter === 'all') return true;
      return pr.state.toLowerCase() === prFilter;
    }).sort((a: PullRequest, b: PullRequest) => {
      if (prSort === 'created-desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (prSort === 'created-asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return 0;
    });
  
    // Filter and sort Issues
    interface Issue {
      number: number;
      title: string;
      state: string;
      author: string;
      createdAt: string;
      labels: string[];
    }

    const filteredIssues = insights.issues.filter((issue: Issue) => {
      if (issueFilter === 'all') return true;
      return issue.state.toLowerCase() === issueFilter;
    }).sort((a: Issue, b: Issue) => {
      if (issueSort === 'created-desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (issueSort === 'created-asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return 0;
    });
  
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
              Pull Requests & Issues for {insights.name}
            </h2>
  
            {/* Pull Requests Section */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Pull Requests</h3>
                <div className="flex gap-4">
                  <Select onValueChange={setPRFilter} defaultValue="all">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select onValueChange={setPRSort} defaultValue="created-desc">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created-desc">Newest First</SelectItem>
                      <SelectItem value="created-asc">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-4">
                {filteredPRs.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">No pull requests found.</p>
                ) : (
                  filteredPRs.map((pr: PullRequest) => (
                    <motion.div
                      key={pr.number}
                      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-100">
                            #{pr.number}: {pr.title}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <User className="w-4 h-4" />
                            <span>By {pr.author}</span>
                            <Calendar className="w-4 h-4 ml-2" />
                            <span>Created on {new Date(pr.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Reviewers: {pr.reviewers.join(', ') || 'None'}
                          </p>
                        </div>
                        <Badge
                          variant={pr.state === 'open' ? 'default' : 'secondary'}
                          className={pr.state === 'open' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}
                        >
                          {pr.state}
                        </Badge>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
  
            {/* Issues Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Issues</h3>
                <div className="flex gap-4">
                  <Select onValueChange={setIssueFilter} defaultValue="all">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select onValueChange={setIssueSort} defaultValue="created-desc">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created-desc">Newest First</SelectItem>
                      <SelectItem value="created-asc">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-4">
                {filteredIssues.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">No issues found.</p>
                ) : (
                  filteredIssues.map((issue: Issue) => (
                    <motion.div
                      key={issue.number}
                      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-100">
                            #{issue.number}: {issue.title}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <User className="w-4 h-4" />
                            <span>By {issue.author}</span>
                            <Calendar className="w-4 h-4 ml-2" />
                            <span>Created on {new Date(issue.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <Tag className="w-4 h-4" />
                            <span>Labels: {issue.labels.join(', ') || 'None'}</span>
                          </div>
                        </div>
                        <Badge
                          variant={issue.state === 'open' ? 'default' : 'secondary'}
                          className={issue.state === 'open' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}
                        >
                          {issue.state}
                        </Badge>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  };
  
  export default PRAndIssuesClient;