"use client";

import { useRouter, useParams } from 'next/navigation'; // Use next/navigation for App Router
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { JoinProject } from '@/lib/query';

const JoinProjectPage = () => {
  const router = useRouter();
  const { projectId } = useParams(); // Extract projectId from the URL params
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      // Redirect to login if the user is not authenticated
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleJoinProject = async () => {
    if (!projectId || typeof projectId !== 'string') {
      toast.error('Invalid project ID');
      return;
    }

    if (!session?.user?.id) {
      toast.error('You must be logged in to join a project');
      return;
    }

    setLoading(true);

    try {
      console.log('Joining project:', projectId, 'for user:', session.user.id);
      const response = await JoinProject(projectId)

      const data = response;

      console.log('Response:', data);
      if(response.message === 'User is already a member of this project') {
        toast.error('You are already a member of this project');
        router.push(`/project/${projectId}/qa`);
      }
      
      if (response.message !== 'User successfully added to the project') {
        throw new Error(data.message || 'Failed to join project');
      }

      toast.success('Successfully joined the project!');
      router.push(`/project/${projectId}/qa`);
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while joining the project');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return null; // The useEffect will handle the redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Join Project
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          You have been invited to join a project.
        </p>
        <Button
          onClick={handleJoinProject}
          disabled={loading}
          className="bg-gradient-to-r from-orange-500 to-pink-500 text-white"
        >
          {loading ? 'Joining...' : 'Join Project'}
        </Button>
      </div>
    </div>
  );
};

export default JoinProjectPage;