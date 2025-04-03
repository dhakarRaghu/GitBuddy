"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import CommitLog from "../../../../components/commit-log";
import TeamMembers from "../../../../components/team-member";
import { GetProjectById } from "@/lib/query";
import InviteButton from "../../../../components/invite-button";
import Loading from "./loading";

const DashBoardPage = ({ params }: { params: Promise<{ projectId: string }> }) => {
  const { data: session, status } = useSession();

  // Unwrap the params Promise using React.use()
  const resolvedParams = React.use(params);
  const projectId = resolvedParams.projectId;

  const { data: project, isLoading: projectLoading, isError: projectError } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => GetProjectById(projectId),
    enabled: !!projectId,
  });

  if (projectLoading) {
    return  Loading();
  }

  if (projectError || !project) {
    return <div className="container mx-auto py-8">Error loading project</div>;
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header Section */}
      <div className="flex items-center justify-between flex-wrap gap-y-4">
        <div className="w-fit rounded-md bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-4 shadow-sm">
          <div className="flex items-center">
            <Github className="size-7 text-white" /> {/* Increased icon size */}
            <div className="ml-3">
              <span className="text-base font-semibold text-white tracking-wide">
                This project is linked to{" "}
                <Link
                  href={project.githubUrl ?? "#"}
                  className="inline-flex items-center text-white font-bold hover:bg-clip-text hover:text-transparent hover:bg-gradient-to-r hover:from-orange-300 hover:to-pink-300 transition-all duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {project.githubUrl || "No GitHub URL available"}
                  <ExternalLink className="ml-1.5 size-5 text-white" /> {/* Adjusted icon size */}
                </Link>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <TeamMembers projectId={projectId} />
          <InviteButton projectId={projectId} />
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
          {/* Add other components here if needed */}
        </div>
      </div>

      {/* Commit Log Section */}
      <div className="mt-8">
        <CommitLog projectId={projectId} githubUrl={project.githubUrl || ""} />
      </div>
    </div>
  );
};

export default DashBoardPage;