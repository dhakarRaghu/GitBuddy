// app/project/[projectId]/dashboard/page.tsx
"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import CommitLog from "../../../../components/commit-log";
import MeetingCard from "@/components/meeting-card"; // Ensure MeetingCard is a valid React component
import dynamic from "next/dynamic";
import TeamMembers from "../../../../components/team-member";
import { GetProjectById } from "@/lib/query";

const InviteButton = dynamic(() => import("../../../../components/invite-button"), { ssr: false });

const DashBoardPage = ({ params }: { params: { projectId: string } }) => {
  const { data: session, status } = useSession();

  const { data: project, isLoading: projectLoading, isError: projectError } = useQuery({
    queryKey: ["project", params.projectId],
    queryFn: () => GetProjectById(params.projectId),
    enabled: !!params.projectId,
  });

  if (projectLoading) {
    return <div className="container mx-auto py-8">Loading project...</div>;
  }

  if (projectError || !project) {
    return <div className="container mx-auto py-8">Error loading project</div>;
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header Section */}
      <div className="flex items-center justify-between flex-wrap gap-y-4">
        <div className="w-fit rounded-md bg-primary px-4 py-3">
          <div className="flex items-center">
            <Github className="size-5 text-white" />
            <div className="ml-2">
              <span className="text-sm font-medium text-white">
                This project is linked to{" "}
                <Link
                  href={project.githubUrl ?? "#"}
                  className="inline-flex items-center text-white/80 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {project.githubUrl || "No GitHub URL available"}
                  <ExternalLink className="ml-1 size-4" />
                </Link>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <TeamMembers  />
          <InviteButton  />
        </div>
      </div>

      {/* Spacer */}
      <div className="h-4" />

      {/* Grid Layout */}
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3">
          {/* Add other components here if needed */}
        </div>
        <div className="col-span-2">
          {/* <MeetingCard /> */}
        </div>
      </div>

      {/* Commit Log Section */}
      <div className="mt-8">
        <CommitLog projectId={params.projectId} githubUrl={project.githubUrl || ""} />
      </div>
    </div>
  );
};

export default DashBoardPage;