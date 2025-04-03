
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";



export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header Skeleton */}
      <div className="p-4 bg-white dark:bg-gray-800 shadow-sm flex items-center gap-2">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-6 w-1/4" />
      </div>

      {/* Chat Area Skeleton */}
      <div className="flex-grow p-6 max-w-5xl mx-auto w-full">
        <div className="space-y-6">
          {/* Welcome Message Skeleton */}
          <div className="text-center py-12">
            <Skeleton className="w-20 h-20 rounded-full mx-auto mb-4" />
            <Skeleton className="h-8 w-1/3 mx-auto mb-2" />
            <Skeleton className="h-5 w-2/3 mx-auto" />
          </div>

          {/* Placeholder for Messages (Optional) */}
          <div className="flex justify-end gap-3">
            <div className="p-4 rounded-2xl shadow-sm bg-gradient-to-r from-orange-500 to-pink-500 max-w-[80%]">
              <Skeleton className="h-5 w-3/4" />
            </div>
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>

          <div className="flex justify-start gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="p-4 rounded-2xl shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-w-full">
              <Skeleton className="h-5 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        </div>
      </div>

      {/* Input Area Skeleton */}
      <div className="p-4 bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-5xl mx-auto flex gap-3 items-end">
          <Skeleton className="flex-grow h-16 rounded-xl" />
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </div>
    </div>
  );
}