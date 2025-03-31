"use client";

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { GetAllProjects } from '@/lib/query';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Projects = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<
    {
      id: string;
      name: string;
      indexingStatus: string;
      githubUrl?: string;
      createdAt: string | Date;
      updatedAt: string | Date;
      commits?: { id: string; createdAt: Date; updatedAt: Date; projectId: string; commitMessage: string; commitHash: string; commitAuthorName: string; commitAuthorAvatar: string | null; commitDate: Date; summary: string }[];
      meetings?: any[];
      questions?: any[];
      users?: any[];
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const fetchedProjects = await GetAllProjects();
        setProjects(
          fetchedProjects.map((project) => ({
            ...project,
            githubUrl: project.githubUrl ?? undefined,
          }))
        );
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600 dark:text-red-400">
        Error: {error}
      </div>
    );
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
              className="transition-all duration-300 hover:shadow-lg hover:bg-gradient-to-br hover:from-orange-50 hover:to-pink-50 dark:hover:from-orange-900/20 dark:hover:to-pink-900/20 cursor-pointer border-orange-200 dark:border-orange-900/50 bg-white dark:bg-gray-800"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-semibold text-orange-500 dark:text-orange-400 line-clamp-1">
                    {project.name}
                  </CardTitle>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    project.indexingStatus === 'PENDING'
                      ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/50'
                      : 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/50'
                  }`}>
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
                    className="text-sm flex items-center gap-2 text-gray-600 hover:text-orange-500 dark:text-gray-300 dark:hover:text-orange-400 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.3 1 .1-.8.4-1.3.7-1.6-2.4-.3-4.9-1.2-4.9-5.3 0-1.2.4-2.2 1.1-2.9-.1-.3-.5-1.4.1-2.9 0 0 .9-.3 2.9 1.1a10 10 0 015.2 0c2-1.4 2.9-1.1 2.9-1.1.6 1.5.2 2.6.1 2.9.7.7 1.1 1.7 1.1 2.9 0 4.1-2.5 5-4.9 5.3.4.3.7 1 .7 1.6v2.2c0 .3.2.7.8.6A12 12 0 0012 0z"/>
                    </svg>
                    GitHub
                  </a>
                )}

                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <p>Created: {format(new Date(project.createdAt), 'MMM d, yyyy')}</p>
                  <p>Updated: {format(new Date(project.updatedAt), 'MMM d, yyyy')}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-200 dark:border-orange-900/50">
                    <span className="font-medium text-orange-600 dark:text-orange-400">Commits:</span>{' '}
                    {project.commits?.length || 0}
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-200 dark:border-orange-900/50">
                    <span className="font-medium text-orange-600 dark:text-orange-400">Meetings:</span>{' '}
                    {project.meetings?.length || 0}
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-200 dark:border-orange-900/50">
                    <span className="font-medium text-orange-600 dark:text-orange-400">Contributors:</span>{' '}
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