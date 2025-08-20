import { Skeleton } from "./Skeleton";

export const TeamSkeleton: React.FC<{ viewMode?: 'list' | 'grid' }> = ({ viewMode = 'grid' }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Skeleton variant="rectangular" width="32px" height="32px" />
              <Skeleton width="80px" height="2rem" />
            </div>
            <Skeleton width="280px" height="1rem" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton width="140px" height="2.5rem" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Skeleton width="40px" height="1.5rem" className="mb-1" />
                  <Skeleton width="80px" height="0.875rem" />
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <Skeleton variant="rectangular" width="24px" height="24px" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1 max-w-md">
              <Skeleton width="100%" height="2.5rem" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton width="120px" height="2.5rem" />
              <Skeleton width="140px" height="2.5rem" />
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <Skeleton variant="rectangular" width="32px" height="32px" className="mr-1" />
                <Skeleton variant="rectangular" width="32px" height="32px" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton variant="circular" width="48px" height="48px" />
                    <div className="flex-1">
                      <Skeleton width="120px" height="1.25rem" className="mb-1" />
                      <Skeleton width="160px" height="1rem" />
                    </div>
                  </div>
                  <Skeleton variant="rectangular" width="16px" height="16px" />
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <Skeleton width="40px" height="1rem" />
                    <Skeleton width="80px" height="1.5rem" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton width="80px" height="1rem" />
                    <Skeleton width="70px" height="1.5rem" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 text-center">
                    <Skeleton width="20px" height="1.25rem" className="mb-1 mx-auto" />
                    <Skeleton width="40px" height="0.75rem" className="mx-auto" />
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 text-center">
                    <Skeleton width="20px" height="1.25rem" className="mb-1 mx-auto" />
                    <Skeleton width="50px" height="0.75rem" className="mx-auto" />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-gray-700">
                  <Skeleton width="80%" height="2rem" />
                  <Skeleton width="15%" height="2rem" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-700/50">
              <div className="flex items-center">
                <Skeleton variant="rectangular" width="16px" height="16px" className="mr-4" />
                <div className="hidden lg:grid lg:grid-cols-12 lg:gap-4 flex-1">
                  <Skeleton width="60px" height="1rem" className="col-span-3" />
                  <Skeleton width="40px" height="1rem" className="col-span-2" />
                  <Skeleton width="70px" height="1rem" className="col-span-2" />
                  <Skeleton width="70px" height="1rem" className="col-span-2" />
                  <Skeleton width="60px" height="1rem" className="col-span-2" />
                  <Skeleton width="50px" height="1rem" className="col-span-1" />
                </div>
                <div className="lg:hidden flex-1">
                  <Skeleton width="80px" height="1rem" />
                </div>
              </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-200 dark:divide-gray-700">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="px-4 sm:px-6 py-4">
                  <div className="flex items-center">
                    <Skeleton variant="rectangular" width="16px" height="16px" className="mr-4" />
                    
                    {/* Desktop Layout */}
                    <div className="hidden lg:grid lg:grid-cols-12 lg:gap-4 flex-1 items-center">
                      <div className="col-span-3 flex items-center gap-3">
                        <Skeleton variant="circular" width="32px" height="32px" />
                        <div>
                          <Skeleton width="100px" height="1.25rem" className="mb-1" />
                          <Skeleton width="140px" height="1rem" />
                        </div>
                      </div>
                      <div className="col-span-2">
                        <Skeleton width="70px" height="1.5rem" />
                      </div>
                      <div className="col-span-2">
                        <Skeleton width="60px" height="1.5rem" />
                      </div>
                      <div className="col-span-2">
                        <Skeleton width="40px" height="1rem" />
                      </div>
                      <div className="col-span-2">
                        <Skeleton width="50px" height="1rem" />
                      </div>
                      <div className="col-span-1 flex items-center gap-1">
                        <Skeleton variant="rectangular" width="16px" height="16px" />
                        <Skeleton variant="rectangular" width="16px" height="16px" />
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="lg:hidden flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Skeleton variant="circular" width="32px" height="32px" />
                        <div className="flex-1">
                          <Skeleton width="100px" height="1.25rem" className="mb-1" />
                          <Skeleton width="140px" height="1rem" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Skeleton width="60px" height="1.25rem" />
                        <Skeleton width="50px" height="1.25rem" />
                      </div>
                      <Skeleton width="80px" height="1rem" />
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