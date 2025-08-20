import { Skeleton } from "./Skeleton";

export const ReportsSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 sm:mb-8">
          <div className="mb-4 lg:mb-0">
            <div className="flex items-center gap-3 mb-2">
              <Skeleton variant="rectangular" width="32px" height="32px" />
              <Skeleton width="220px" height="2rem" />
            </div>
            <Skeleton width="320px" height="1rem" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton width="100px" height="2.5rem" />
            <Skeleton width="140px" height="2.5rem" />
          </div>
        </div>

        {/* Filters Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-2">
              <Skeleton variant="rectangular" width="20px" height="20px" />
              <Skeleton width="60px" height="1.25rem" />
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <Skeleton width="120px" height="2.5rem" />
              <Skeleton width="140px" height="2.5rem" />
              <Skeleton width="120px" height="2.5rem" />
            </div>
          </div>
        </div>

        {/* Key Metrics Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton variant="rectangular" width="48px" height="48px" className="rounded-lg" />
                <Skeleton variant="rectangular" width="16px" height="16px" />
              </div>
              <div>
                <Skeleton width="60px" height="2rem" className="mb-1" />
                <Skeleton width="80px" height="0.875rem" />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-6">
                <Skeleton variant="rectangular" width="20px" height="20px" />
                <Skeleton width="120px" height="1.25rem" />
              </div>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, chartIndex) => (
                  <div key={chartIndex} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton variant="circular" width="12px" height="12px" />
                      <Skeleton width="80px" height="1rem" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton width="80px" height="8px" className="rounded-full" />
                      <Skeleton width="32px" height="1rem" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Monthly Trends Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Skeleton variant="rectangular" width="20px" height="20px" />
            <Skeleton width="140px" height="1.25rem" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="text-center">
                <div className="mb-2">
                  <div className="flex items-end justify-center gap-1 h-16 sm:h-20">
                    <Skeleton width="16px" height="60%" />
                    <Skeleton width="16px" height="40%" />
                  </div>
                </div>
                <Skeleton width="32px" height="0.75rem" className="mx-auto mb-1" />
                <Skeleton width="40px" height="0.75rem" className="mx-auto" />
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <Skeleton variant="rectangular" width="12px" height="12px" />
              <Skeleton width="50px" height="0.75rem" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton variant="rectangular" width="12px" height="12px" />
              <Skeleton width="50px" height="0.75rem" />
            </div>
          </div>
        </div>

        {/* Bottom Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-6">
                <Skeleton variant="rectangular" width="20px" height="20px" />
                <Skeleton width="120px" height="1.25rem" />
              </div>
              <div className="space-y-3 sm:space-y-4">
                {Array.from({ length: 5 }).map((_, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Skeleton variant="circular" width="32px" height="32px" />
                      <div>
                        <Skeleton width="100px" height="1rem" className="mb-1" />
                        <Skeleton width="80px" height="0.75rem" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton width="40px" height="1rem" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};