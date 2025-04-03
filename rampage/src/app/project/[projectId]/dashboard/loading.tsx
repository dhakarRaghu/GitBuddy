import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export default function Loading() {
  return (
    <div className="container mx-auto py-8">
      {/* Header Section Skeleton */}
      <div className="flex items-center justify-between flex-wrap gap-y-4 mb-4">
        <div className="w-fit rounded-md bg-gradient-to-r from-gray-300 to-gray-400 px-5 py-4 shadow-sm">
          <div className="flex items-center">
            <Skeleton className="w-7 h-7 rounded-full" />
            <div className="ml-3 space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-32 rounded-md" /> {/* TeamMembers placeholder */}
          <Skeleton className="h-10 w-24 rounded-md" /> {/* InviteButton placeholder */}
        </div>
      </div>

      {/* Spacer Skeleton */}
      <div className="h-4" />

      {/* Grid Layout Skeleton */}
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3">
          {/* Placeholder for additional components */}
          <Skeleton className="h-32 w-full rounded-md" />
        </div>
        <div className="col-span-2">
          {/* Placeholder for additional components */}
          <Skeleton className="h-32 w-full rounded-md" />
        </div>
      </div>

      {/* Commit Log Section Skeleton */}
      <div className="mt-8">
        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm border border-orange-200 dark:border-orange-900/50">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-6 w-1/4" /> {/* Title placeholder */}
            <Skeleton className="h-8 w-20 rounded-md" /> {/* Refresh button placeholder */}
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-x-4">
                <Skeleton className="h-10 w-10 rounded-full" /> {/* Avatar placeholder */}
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" /> {/* Author placeholder */}
                  <Skeleton className="h-4 w-full" /> {/* Message placeholder */}
                  <Skeleton className="h-4 w-3/4" /> {/* Summary placeholder */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}