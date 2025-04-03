import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto py-6 px-4">
        {/* Header Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-8 w-1/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        {/* Toggle Buttons Skeleton */}
        <div className="flex border-b border-orange-200 dark:border-orange-900/50 mb-6">
          <Skeleton className="h-8 w-32 mr-4" />
          <Skeleton className="h-8 w-32" />
        </div>

        {/* Filters and Sorting Skeleton */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4">
            <Skeleton className="h-10 w-[150px] rounded-md" />
            <Skeleton className="h-10 w-[150px] rounded-md" />
          </div>
        </div>

        {/* Content Skeleton (PRs/Issues List) */}
        <div className="space-y-4">
          {[1, 2, 3,4,5].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 p-4 rounded-md border border-orange-200 dark:border-orange-900/50"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}