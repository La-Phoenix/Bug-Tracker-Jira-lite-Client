import React from 'react';

export const IssueCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        <div className="flex gap-2">
          <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
      </div>
      
      <div className="flex gap-2 mb-3">
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-16"></div>
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-20"></div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
        </div>
        <div className="space-y-1 text-right">
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
};

export const StatsCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-2"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
        </div>
        <div className="h-12 w-12 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
      </div>
    </div>
  );
};

export const IssuesGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <IssueCardSkeleton key={index} />
      ))}
    </div>
  );
};

export const StatsGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <StatsCardSkeleton key={index} />
      ))}
    </div>
  );
};