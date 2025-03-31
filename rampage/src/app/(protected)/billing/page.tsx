"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TreeNode {
  path: string;
  type: "file" | "dir";
  url: string;
}

export default function MindMapPage() {
  const [inputValue, setInputValue] = useState("");
  const [repoStructure, setRepoStructure] = useState<TreeNode[]>([]);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRepoStructure = async (repoUrl: string) => {
    setLoading(true);
    setError(null);
    setRepoStructure([]);
    setFileContent(null);

    try {
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) throw new Error("Invalid GitHub URL");

      const owner = match[1];
      const repo = match[2];

      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`);
      if (!res.ok) throw new Error("Failed to fetch repository structure");

      const data = await res.json();
      if (!data.tree) throw new Error("Invalid repository structure");

      const treeData: TreeNode[] = data.tree.map((node: any) => ({
        path: node.path,
        type: node.type === "blob" ? "file" : "dir",
        url: node.url,
      }));

      setRepoStructure(treeData);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchFileContent = async (url: string) => {
    setLoading(true);
    setError(null);
    setFileContent(null);

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch file content");

      const data = await res.json();
      if (!data.content) throw new Error("Empty file");

      setFileContent(atob(data.content)); // Decode base64 content
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRepoStructure(inputValue);
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl min-h-screen flex flex-col">
      {/* Input Section */}
      <Card className="mb-8 bg-white dark:bg-gray-800 border-orange-200 dark:border-orange-900/50 shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500 tracking-tight">
            GitHub Repository Structure
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Enter a GitHub repository URL to view its structure.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-4">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="https://github.com/username/repo"
              className="flex-1 border-orange-200 dark:border-orange-900/50 focus:ring-orange-500 dark:focus:ring-orange-400 bg-orange-50 dark:bg-orange-900/20 text-gray-700 dark:text-gray-300"
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 transition-all duration-300"
            >
              {loading ? "Fetching..." : "Generate"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="flex-1 flex flex-col">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4 shadow-sm">
            {error}
          </div>
        )}

        <Card className="flex-1 bg-white dark:bg-gray-800 border-orange-200 dark:border-orange-900/50 shadow-md overflow-auto">
          <CardContent className="p-4 h-full">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                <span className="ml-4 text-gray-600 dark:text-gray-300">Fetching repository structure...</span>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-96">
                <ul className="text-sm font-mono text-gray-800 dark:text-gray-200">
                  {repoStructure.length === 0 ? (
                    <p>Enter a repository URL above to view its structure.</p>
                  ) : (
                    repoStructure.map((node, index) => (
                      <li key={index} className="mb-1">
                        {node.type === "dir" ? (
                          <span className="text-blue-500">📂 {node.path}</span>
                        ) : (
                          <button
                            onClick={() => fetchFileContent(node.url)}
                            className="text-green-500 hover:text-green-700 underline"
                          >
                            📄 {node.path}
                          </button>
                        )}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* File Content Viewer */}
        {fileContent && (
          <Card className="mt-4 bg-white dark:bg-gray-800 border-orange-200 dark:border-orange-900/50 shadow-md">
            <CardContent className="p-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">File Content:</h2>
              <pre className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg text-sm whitespace-pre-wrap">
                {fileContent}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
