"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming you have a Skeleton component

const Loading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Title and Description Skeleton */}
        <Skeleton className="h-8 w-1/3 bg-gray-300 dark:bg-gray-700 mb-2 rounded" />
        <Skeleton className="h-4 w-2/3 bg-gray-300 dark:bg-gray-700 mb-6 rounded" />

        {/* Overview Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {Array(4)
            .fill(null)
            .map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md animate-pulse"
              >
                <Skeleton className="h-5 w-1/2 bg-gray-300 dark:bg-gray-700 mb-2 rounded" />
                <Skeleton className="h-7 w-1/3 bg-gray-300 dark:bg-gray-700 rounded" />
              </div>
            ))}
        </div>

        {/* Contributors Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-6 w-1/4 bg-gray-300 dark:bg-gray-700 mb-4 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array(4)
              .fill(null)
              .map((_, index) => (
                <div
                  key={index}
                  className="flex items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md animate-pulse"
                >
                  <Skeleton className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700 mr-4" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 mb-2 rounded" />
                    <Skeleton className="h-3 w-3/4 bg-gray-300 dark:bg-gray-700 rounded" />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Commits Per Day Chart Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-6 w-1/4 bg-gray-300 dark:bg-gray-700 mb-4 rounded" />
          <Skeleton className="h-72 w-full bg-gray-300 dark:bg-gray-700 rounded-lg mx-auto" />
        </div>

        {/* Code Frequency Chart Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-6 w-1/4 bg-gray-300 dark:bg-gray-700 mb-4 rounded" />
          <Skeleton className="h-72 w-full bg-gray-300 dark:bg-gray-700 rounded-lg mx-auto" />
        </div>

        {/* Commit Frequency by Day Chart Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-6 w-1/4 bg-gray-300 dark:bg-gray-700 mb-4 rounded" />
          <Skeleton className="h-72 w-full bg-gray-300 dark:bg-gray-700 rounded-lg mx-auto" />
        </div>

        {/* Languages Section Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-6 w-1/4 bg-gray-300 dark:bg-gray-700 mb-4 rounded" />
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <Skeleton className="h-72 w-full bg-gray-300 dark:bg-gray-700 rounded-lg mx-auto mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array(4)
                .fill(null)
                .map((_, index) => (
                  <div key={index} className="flex items-center gap-2 animate-pulse">
                    <Skeleton className="h-5 w-5 bg-gray-300 dark:bg-gray-700 rounded" />
                    <Skeleton className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 rounded" />
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* File Types Section Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-6 w-1/4 bg-gray-300 dark:bg-gray-700 mb-4 rounded" />
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <Skeleton className="h-72 w-full bg-gray-300 dark:bg-gray-700 rounded-lg mx-auto mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array(4)
                .fill(null)
                .map((_, index) => (
                  <div key={index} className="flex items-center gap-2 animate-pulse">
                    <Skeleton className="h-5 w-5 bg-gray-300 dark:bg-gray-700 rounded" />
                    <Skeleton className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 rounded" />
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Key Commits Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-6 w-1/4 bg-gray-300 dark:bg-gray-700 mb-4 rounded" />
          <div className="space-y-4">
            {Array(3)
              .fill(null)
              .map((_, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md animate-pulse"
                >
                  <Skeleton className="h-4 w-3/4 bg-gray-300 dark:bg-gray-700 mb-2 rounded" />
                  <Skeleton className="h-3 w-1/2 bg-gray-300 dark:bg-gray-700 rounded" />
                </div>
              ))}
          </div>
        </div>

        {/* Averages Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(2)
            .fill(null)
            .map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md animate-pulse"
              >
                <Skeleton className="h-5 w-1/2 bg-gray-300 dark:bg-gray-700 mb-2 rounded" />
                <Skeleton className="h-7 w-1/3 bg-gray-300 dark:bg-gray-700 rounded" />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Loading;