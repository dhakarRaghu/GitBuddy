"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { GetAllProjects } from "@/lib/query";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming you have a Skeleton component

type Project = {
  id: string;
  name: string;
  indexingStatus: string;
  githubUrl?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  commits?: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    projectId: string;
    commitMessage: string;
    commitHash: string;
    commitAuthorName: string;
    commitAuthorAvatar: string | null;
    commitDate: Date;
    summary: string;
  }[];
  meetings?: any[];
  questions?: any[];
  users?: any[];
};

const Projects = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const fetchedProjects = await GetAllProjects();
        setProjects(
          fetchedProjects.map((project: any) => ({
            ...project,
            githubUrl: project.githubUrl ?? undefined,
          })) as Project[]
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  const handleProjectClick = (projectId: string) => {
    router.push(`/project/${projectId}/dashboard`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <Skeleton className="h-10 w-48 mb-8 bg-gray-200 dark:bg-gray-700" /> {/* Skeleton for the title */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Render 3 skeleton cards to match the layout */}
          {[1, 2, 3].map((_, index) => (
            <Card key={index} className="border-orange-200 dark:border-orange-900/50 bg-white dark:bg-gray-800">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700" /> {/* Skeleton for project name */}
                  <Skeleton className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-700" /> {/* Skeleton for status badge */}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-20 bg-gray-200 dark:bg-gray-700" /> {/* Skeleton for GitHub link */}
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <Skeleton className="h-4 w-32 bg-gray-200 dark:bg-gray-700" /> {/* Skeleton for Created date */}
                  <Skeleton className="h-4 w-32 bg-gray-200 dark:bg-gray-700" /> {/* Skeleton for Updated date */}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Skeleton className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded" /> {/* Skeleton for Commits */}
                  <Skeleton className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded" /> {/* Skeleton for Meetings */}
                  <Skeleton className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded" /> {/* Skeleton for Contributors */}
                </div>
                <div className="flex justify-end">
                  <Skeleton className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full" /> {/* Skeleton for ChevronRight */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-red-600 dark:text-red-400">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl">
      <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500 mb-8 tracking-tight">
        Your Projects
      </h1>
      {projects.length === 0 ? (
        <div className="text-center py-10 text-gray-600 dark:text-gray-400">
          No projects found. Create your first project to get started!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              className="cursor-pointer border-orange-200 dark:border-orange-900/50 bg-white dark:bg-gray-800 hover:shadow-lg transition-all"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-semibold text-orange-500 dark:text-orange-400 line-clamp-1">
                    {project.name}
                  </CardTitle>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      project.indexingStatus === "PENDING"
                        ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/50"
                        : "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/50"
                    }`}
                  >
                    {project.indexingStatus}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm flex items-center gap-2 text-gray-600 hover:text-orange-500 dark:text-gray-300 dark:hover:text-orange-400"
                  >
                    GitHub
                  </a>
                )}
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <p>Created: {format(new Date(project.createdAt), "MMM d, yyyy")}</p>
                  <p>Updated: {format(new Date(project.updatedAt), "MMM d, yyyy")}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-200 dark:border-orange-900/50">
                    <span className="font-medium text-orange-600 dark:text-orange-400">Commits:</span>{" "}
                    {project.commits?.length || 0}
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-200 dark:border-orange-900/50">
                    <span className="font-medium text-orange-600 dark:text-orange-400">Meetings:</span>{" "}
                    {project.meetings?.length || 0}
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-200 dark:border-orange-900/50">
                    <span className="font-medium text-orange-600 dark:text-orange-400">Contributors:</span>{" "}
                    {project.users?.length || 0}
                  </div>
                </div>
                <div className="flex justify-end">
                  <ChevronRight className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;