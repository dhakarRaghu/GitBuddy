"use client"
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { GetAllProjects } from '@/lib/query';
import { useRouter } from 'next/navigation';

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Your Projects</h1>
      
      {projects.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No projects found. Create your first project to get started!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              className="border rounded-lg p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer hover:bg-gray-50"
            >
              {/* Project Header */}
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-semibold text-blue-600">
                  {project.name}
                </h2>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  project.indexingStatus === 'PENDING' 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {project.indexingStatus}
                </span>
              </div>

              {/* GitHub Link */}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()} // Prevents card click from triggering
                  className="text-sm text-gray-600 hover:text-blue-500 flex items-center mb-2"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.3 1 .1-.8.4-1.3.7-1.6-2.4-.3-4.9-1.2-4.9-5.3 0-1.2.4-2.2 1.1-2.9-.1-.3-.5-1.4.1-2.9 0 0 .9-.3 2.9 1.1a10 10 0 015.2 0c2-1.4 2.9-1.1 2.9-1.1.6 1.5.2 2.6.1 2.9.7.7 1.1 1.7 1.1 2.9 0 4.1-2.5 5-4.9 5.3.4.3.7 1 .7 1.6v2.2c0 .3.2.7.8.6A12 12 0 0012 0z"/>
                  </svg>
                  GitHub
                </a>
              )}

              {/* Project Dates */}
              <div className="text-sm text-gray-500 mb-3">
                <p>Created: {format(new Date(project.createdAt), 'MMM d, yyyy')}</p>
                <p>Updated: {format(new Date(project.updatedAt), 'MMM d, yyyy')}</p>
              </div>

              {/* Project Stats */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-100 p-2 rounded">
                  <span className="font-medium">Commits:</span>{' '}
                  {project.commits?.length || 0}
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <span className="font-medium">Meetings:</span>{' '}
                  {project.meetings?.length || 0}
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <span className="font-medium">Contributors:</span>{' '}
                  {project.users?.length || 0}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;