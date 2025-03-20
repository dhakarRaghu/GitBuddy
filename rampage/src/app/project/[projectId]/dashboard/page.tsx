"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CommitLog from "../../../../components/commit-log";
// import AskQuestionCard from "./ask-question-card";
import MeetingCard from "@/components/meeting-card";
// import ArchiveButton from "./archive-button";
import dynamic from "next/dynamic";
import TeamMembers from "../../../../components/team-member";
import { GetProjects } from "@/lib/query";

const InviteButton = dynamic(() => import("../../../../components/invite-button"), { ssr: false });

const DashBoardPage = () => {
  const { data: session, status } = useSession();

  // Fetch projects using GetProjects
  // const { data: projects, isLoading, error } = useQuery({
  //   queryKey: ["projects", session?.user?.id],
  //   queryFn: () => GetProjects(),
  //   enabled: !!session?.user?.id, // Only fetch if user is authenticated
  // });

  // Loading state
  // if (status === "loading" || isLoading) {
  //   return <div className="container mx-auto py-8">Loading...</div>;
  // }

  // // Unauthorized state
  // if (!session) {
  //   return <div className="container mx-auto py-8">Please sign in to view your dashboard.</div>;
  // }

  // // Error state
  // if (error) {
  //   return (
  //     <div className="container mx-auto py-8">
  //       Failed to load projects: {(error as Error).message}
  //     </div>
  //   );
  // }

  // // No projects state
  // if (!projects || projects.length === 0) {
  //   return (
  //     <div className="container mx-auto py-8">
  //       No projects found. Create one to get started!
  //     </div>
  //   );
  // }

  // // Use the first project for now (adjust as needed)
  // const project = projects[0];

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
                {/* <Link
                  href={project.githubUrl ?? "#"}
                  className="inline-flex items-center text-white/80 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {project.githubUrl || "No GitHub URL available"} */}
                  <ExternalLink className="ml-1 size-4" />
                {/* </Link> */}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <TeamMembers />
          <InviteButton />
          {/* <ArchiveButton /> */}
        </div>
      </div>

      {/* Spacer */}
      <div className="h-4" />

      {/* Grid Layout */}
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3">
          {/* <AskQuestionCard /> */}
        </div>
        <div className="col-span-2">
          {/* <MeetingCard /> */}
        </div>
      </div>

      {/* Commit Log Section */}
      <div className="mt-8">
      <CommitLog projectId={"cm8h8yd3i000975zdq4tefhsq"} githubUrl={"https://github.com/dhakarRaghu/Learnify"} />
    </div>
    </div>
  );
};

export default DashBoardPage;