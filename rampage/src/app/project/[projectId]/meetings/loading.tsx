import React from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";



export default function Loading() {
  return (
    <main className="container mx-auto py-12 px-6 max-w-7xl">
      {/* Header Section Skeleton */}
      <div className="mb-12">
        <Skeleton className="h-10 w-1/3 mb-2" />
        <Skeleton className="h-6 w-2/3" />
      </div>

      {/* Upload Audio Section Skeleton */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-orange-200 dark:border-orange-900/50 p-6 mb-8">
        <Skeleton className="h-8 w-1/4 mb-6" />
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-900/50">
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-10 w-1/4" />
        </div>
      </section>

      {/* Meetings List Section Skeleton */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-orange-200 dark:border-orange-900/50 p-6">
        <Skeleton className="h-8 w-1/4 mb-6" />
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-900/50">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 rounded-lg border border-border/50">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}