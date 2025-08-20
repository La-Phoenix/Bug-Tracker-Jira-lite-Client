// Add this to your existing Skeleton.tsx file

import { Skeleton } from "./Skeleton";

export const LabelsSkeleton: React.FC<{ viewMode?: 'list' | 'grid' }> = ({ viewMode = 'grid' }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Skeleton variant="rectangular" width="32px" height="32px" />
              <Skeleton width="100px" height="2rem" />
            </div>
            <Skeleton width="280px" height="1rem" />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Skeleton width="100px" height="2.5rem" />
            <Skeleton width="120px" height="2.5rem" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <Skeleton width="40px" height="1.5rem" className="mb-1" />
                  <Skeleton width="80px" height="0.875rem" />
                </div>
                <Skeleton variant="rectangular" width="40px" height="40px" />
              </div>
              <Skeleton width="60px" height="0.75rem" />
            </div>
          ))}
        </div>

        {/* Search and Filters Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 mb-6">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Skeleton width="100%" height="2.5rem" />
              </div>
              <div className="flex gap-3">
                <Skeleton width="120px" height="2.5rem" />
                <Skeleton width="100px" height="2.5rem" />
                <Skeleton width="80px" height="2.5rem" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Skeleton variant="circular" width="16px" height="16px" />
                    <Skeleton variant="rectangular" width="16px" height="16px" />
                    <Skeleton width="80px" height="1.25rem" />
                  </div>
                  <Skeleton variant="rectangular" width="16px" height="16px" />
                </div>
                
                <Skeleton width="100%" height="1rem" className="mb-4" />
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Skeleton variant="rectangular" width="16px" height="16px" />
                    <Skeleton width="20px" height="1rem" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Skeleton variant="circular" width="8px" height="8px" />
                    <Skeleton width="15px" height="1rem" />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-200 dark:border-gray-700 flex items-center justify-between">
                  <Skeleton width="100px" height="0.75rem" />
                  <div className="flex gap-1">
                    <Skeleton variant="rectangular" width="16px" height="16px" />
                    <Skeleton variant="rectangular" width="16px" height="16px" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 overflow-hidden">
            <div className="border-b border-slate-200 dark:border-gray-700 px-6 py-3 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center">
                <Skeleton variant="rectangular" width="16px" height="16px" />
                <div className="ml-4 grid grid-cols-6 gap-4 w-full">
                  <Skeleton width="60px" height="1rem" className="col-span-2" />
                  <Skeleton width="40px" height="1rem" />
                  <Skeleton width="50px" height="1rem" />
                  <Skeleton width="60px" height="1rem" />
                  <Skeleton width="50px" height="1rem" />
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-slate-200 dark:divide-gray-700">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="p-4 sm:p-6">
                  <div className="flex items-center">
                    <Skeleton variant="rectangular" width="16px" height="16px" />
                    <div className="ml-4 grid grid-cols-6 gap-4 w-full">
                      <div className="col-span-2 flex items-center gap-3">
                        <Skeleton variant="circular" width="16px" height="16px" />
                        <div>
                          <Skeleton width="120px" height="1.25rem" className="mb-1" />
                          <Skeleton width="80px" height="1rem" />
                        </div>
                      </div>
                      <div>
                        <Skeleton width="30px" height="1rem" />
                      </div>
                      <div>
                        <Skeleton width="60px" height="1rem" />
                      </div>
                      <div>
                        <Skeleton width="80px" height="1rem" />
                      </div>
                      <div className="flex gap-1">
                        <Skeleton variant="rectangular" width="16px" height="16px" />
                        <Skeleton variant="rectangular" width="16px" height="16px" />
                        <Skeleton variant="rectangular" width="16px" height="16px" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};