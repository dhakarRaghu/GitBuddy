import React from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";



export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header Skeleton */}
      <Skeleton className="h-9 w-1/4 mb-6" />

      {/* Meeting Header Skeleton */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 border-b border-orange-200 dark:border-orange-900/50 pb-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-7 w-1/2" />
            <Skeleton className="h-5 w-1/4" />
          </div>
        </div>
        <div className="w-full md:w-80 mt-4 md:mt-0 md:ml-auto space-y-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>

      {/* Issues Grid Skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-orange-200 dark:border-orange-900/50 rounded-lg p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}