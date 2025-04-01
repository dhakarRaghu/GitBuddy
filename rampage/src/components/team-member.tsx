"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { allMembers } from "@/lib/query";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TeamMember {
  id: string;
  name: string;
  image: string;
}

interface TeamMembersProps {
  projectId: string;
}

const fetchMembers = async (projectId: string) => {
  const res = await allMembers(projectId);
  console.log("Members fetched successfully:", res);
  if (!res) throw new Error("Failed to fetch members");
  return res;
};

const TeamMembers: React.FC<TeamMembersProps> = ({ projectId }) => {
  const { data: members, isLoading, isError } = useQuery<TeamMember[], Error>({
    queryKey: ["teamMembers", projectId],
    queryFn: () => fetchMembers(projectId),
    enabled: !!projectId,
  });

  if (isLoading) {
    return <div className="flex items-center gap-2">Loading team members...</div>;
  }

  if (isError || !members) {
    return <div className="flex items-center gap-2 text-red-500">Error loading team members</div>;
  }

  return (
    <TooltipProvider>
      <div className="flex items-center -space-x-2">
        {members.length === 0 ? (
          <span className="text-sm text-gray-500">No team members</span>
        ) : (
          members.map((member) => (
            <Tooltip key={member.id}>
              <TooltipTrigger asChild>
                <div className="relative group ">
                  <Image
                    src={member.image || "/default-avatar.png"}
                    alt={member.name}
                    height={30}
                    width={30}
                    className="rounded-full border-2 border-white dark:border-gray-800 transition-transform duration-200 group-hover:scale-110"
                    title={member.name} // Fallback for accessibility
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg shadow-sm border-none">
                <p className="text-sm font-medium">{member.name}</p>
              </TooltipContent>
            </Tooltip>
          ))
        )}
      </div>
    </TooltipProvider>
  );
};

export default TeamMembers;