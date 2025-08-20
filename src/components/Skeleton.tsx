import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'text',
  width,
  height,
  lines = 1
}) => {
  const baseClasses = "animate-pulse bg-gray-200 dark:bg-gray-700";
  
  const variantClasses = {
    text: "rounded",
    rectangular: "rounded-md",
    circular: "rounded-full"
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (variant === 'text' && lines > 1) {
    return (
      <div className={className}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]} mb-2 last:mb-0`}
            style={{
              ...style,
              width: index === lines - 1 ? '60%' : '100%',
              height: height || '1rem'
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

// Dashboard specific skeleton components
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-0">
            <Skeleton width="200px" height="2rem" className="mb-2" />
            <Skeleton width="300px" height="1rem" />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Skeleton width="100px" height="2.5rem" />
            <Skeleton width="120px" height="2.5rem" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <Skeleton width="60px" height="2rem" className="mb-2" />
                  <Skeleton width="80px" height="1rem" />
                </div>
                <Skeleton variant="rectangular" width="48px" height="48px" />
              </div>
              <div className="space-y-2">
                <Skeleton width="100%" height="0.5rem" />
                <Skeleton width="70%" height="0.75rem" />
              </div>
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <Skeleton width="200px" height="1.5rem" />
            <Skeleton width="80px" height="1rem" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="text-center">
                <Skeleton variant="rectangular" width="64px" height="64px" className="mx-auto mb-3" />
                <Skeleton width="40px" height="1.5rem" className="mx-auto mb-1" />
                <Skeleton width="60px" height="1rem" className="mx-auto mb-1" />
                <Skeleton width="30px" height="0.75rem" className="mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          {/* Recent Issues Skeleton */}
          <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <Skeleton width="150px" height="1.5rem" />
                <Skeleton width="80px" height="1rem" />
              </div>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-gray-700">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <Skeleton variant="circular" width="16px" height="16px" className="mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <Skeleton width="70%" height="1.25rem" />
                        <Skeleton width="60px" height="1rem" />
                      </div>
                      <div className="flex flex-wrap items-center gap-1 sm:gap-3">
                        <Skeleton width="40px" height="0.75rem" />
                        <Skeleton width="80px" height="0.75rem" />
                        <Skeleton width="60px" height="0.75rem" />
                        <Skeleton width="70px" height="0.75rem" className="hidden sm:block" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
            <Skeleton width="120px" height="1.5rem" className="mb-6" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 dark:border-gray-700">
                  <Skeleton variant="rectangular" width="40px" height="40px" />
                  <div className="flex-1">
                    <Skeleton width="100px" height="1.25rem" className="mb-1" />
                    <Skeleton width="120px" height="1rem" />
                  </div>
                  <Skeleton variant="rectangular" width="16px" height="16px" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Generic page skeleton
export const PageSkeleton: React.FC<{ 
  showHeader?: boolean;
  showFilters?: boolean;
  itemCount?: number;
}> = ({ 
  showHeader = true, 
  showFilters = false, 
  itemCount = 8 
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {showHeader && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
            <div className="mb-4 sm:mb-0">
              <Skeleton width="200px" height="2rem" className="mb-2" />
              <Skeleton width="300px" height="1rem" />
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Skeleton width="100px" height="2.5rem" />
              <Skeleton width="120px" height="2.5rem" />
            </div>
          </div>
        )}

        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index}>
                  <Skeleton width="80px" height="1rem" className="mb-2" />
                  <Skeleton width="100%" height="2.5rem" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Skeleton width="150px" height="1.5rem" />
              <div className="flex items-center gap-3">
                <Skeleton width="100px" height="2rem" />
                <Skeleton width="80px" height="2rem" />
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-gray-700">
            {Array.from({ length: itemCount }).map((_, index) => (
              <div key={index} className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <Skeleton width="70%" height="1.25rem" className="mb-2" />
                    <div className="flex flex-wrap items-center gap-2">
                      <Skeleton width="60px" height="1rem" />
                      <Skeleton width="80px" height="1rem" />
                      <Skeleton width="100px" height="1rem" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton width="60px" height="1.5rem" />
                    <Skeleton width="80px" height="1.5rem" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


export const IssuesSkeleton: React.FC<{ viewMode?: 'list' | 'card' }> = ({ viewMode = 'list' }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Skeleton variant="rectangular" width="32px" height="32px" />
            <Skeleton width="120px" height="2rem" />
          </div>
          <Skeleton width="280px" height="1rem" />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton width="100px" height="2.5rem" />
          <Skeleton width="120px" height="2.5rem" />
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
          <div className="flex-1">
            <Skeleton width="100%" height="2.5rem" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton width="120px" height="2.5rem" />
            <Skeleton width="120px" height="2.5rem" />
            <Skeleton width="100px" height="2.5rem" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Skeleton width="150px" height="1rem" />
          <Skeleton width="100px" height="1rem" />
        </div>
      </div>

      {/* Content Skeleton */}
      {viewMode === 'list' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="border-b border-slate-200 dark:border-gray-700 px-4 sm:px-6 py-3 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-4">
              <Skeleton variant="rectangular" width="16px" height="16px" />
              <div className="grid grid-cols-4 sm:grid-cols-12 gap-2 sm:gap-4 w-full">
                <Skeleton width="60px" height="1rem" className="col-span-2 sm:col-span-4" />
                <Skeleton width="50px" height="1rem" className="hidden sm:block col-span-2" />
                <Skeleton width="50px" height="1rem" className="hidden sm:block col-span-2" />
                <Skeleton width="60px" height="1rem" className="hidden sm:block col-span-2" />
                <Skeleton width="50px" height="1rem" className="col-span-1 sm:col-span-1" />
                <Skeleton width="50px" height="1rem" className="col-span-1 sm:col-span-1" />
              </div>
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-200 dark:divide-gray-700">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="px-4 sm:px-6 py-4">
                <div className="flex items-center gap-4">
                  <Skeleton variant="rectangular" width="16px" height="16px" />
                  <div className="grid grid-cols-4 sm:grid-cols-12 gap-2 sm:gap-4 w-full">
                    <div className="col-span-2 sm:col-span-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Skeleton variant="circular" width="16px" height="16px" />
                        <Skeleton width="70%" height="1.25rem" />
                      </div>
                      <Skeleton width="40%" height="1rem" className="mb-2" />
                      <div className="flex gap-1">
                        <Skeleton width="40px" height="1rem" />
                        <Skeleton width="50px" height="1rem" />
                      </div>
                    </div>
                    <div className="hidden sm:block col-span-2">
                      <Skeleton width="60px" height="1.5rem" />
                    </div>
                    <div className="hidden sm:block col-span-2">
                      <Skeleton width="60px" height="1.5rem" />
                    </div>
                    <div className="hidden sm:block col-span-2">
                      <div className="flex items-center gap-2">
                        <Skeleton variant="circular" width="24px" height="24px" />
                        <Skeleton width="60px" height="1rem" />
                      </div>
                    </div>
                    <div className="col-span-1 sm:col-span-1">
                      <Skeleton width="40px" height="1rem" />
                    </div>
                    <div className="col-span-1 sm:col-span-1">
                      <div className="flex gap-1">
                        <Skeleton variant="rectangular" width="16px" height="16px" />
                        <Skeleton variant="rectangular" width="16px" height="16px" />
                        <Skeleton variant="rectangular" width="16px" height="16px" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Skeleton variant="circular" width="16px" height="16px" />
                  <Skeleton width="40px" height="1rem" />
                </div>
                <Skeleton variant="rectangular" width="16px" height="16px" />
              </div>
              
              <Skeleton width="90%" height="1.5rem" className="mb-2" />
              <Skeleton width="100%" height="1rem" className="mb-4" lines={2} />
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Skeleton width="50px" height="1.5rem" />
                <Skeleton width="60px" height="1.5rem" />
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  <Skeleton width="50px" height="1.5rem" />
                  <Skeleton width="60px" height="1.5rem" />
                </div>
                <div className="flex gap-1">
                  <Skeleton variant="rectangular" width="16px" height="16px" />
                  <Skeleton variant="rectangular" width="16px" height="16px" />
                  <Skeleton variant="rectangular" width="16px" height="16px" />
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton variant="circular" width="12px" height="12px" />
                  <Skeleton width="60px" height="0.75rem" />
                </div>
                <Skeleton width="60px" height="0.75rem" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ActivitySkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Skeleton variant="rectangular" width="32px" height="32px" />
              <Skeleton width="150px" height="2rem" />
            </div>
            <Skeleton width="300px" height="1rem" />
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
              <Skeleton width="60%" height="0.75rem" />
            </div>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Skeleton width="100%" height="2.5rem" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Skeleton width="120px" height="2.5rem" />
              <Skeleton width="120px" height="2.5rem" />
              <Skeleton width="100px" height="2.5rem" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Skeleton width="150px" height="1rem" />
            <Skeleton width="80px" height="1rem" />
          </div>
        </div>

        {/* Activity Feed Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-gray-700">
            <Skeleton width="150px" height="1.5rem" />
          </div>

          {/* Activity Items */}
          <div className="divide-y divide-slate-200 dark:divide-gray-700">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="p-4 sm:p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Skeleton variant="circular" width="40px" height="40px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <Skeleton width="70%" height="1.25rem" />
                      <Skeleton width="60px" height="1rem" />
                    </div>
                    <Skeleton width="90%" height="1rem" className="mb-3" />
                    <div className="flex flex-wrap items-center gap-2">
                      <Skeleton width="60px" height="1.5rem" />
                      <Skeleton width="80px" height="1.5rem" />
                      <Skeleton width="50px" height="1.5rem" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Skeleton */}
          <div className="px-4 sm:px-6 py-4 border-t border-slate-200 dark:border-gray-700 text-center">
            <Skeleton width="120px" height="2.5rem" className="mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};


export const LabelsSkeleton: React.FC<{ viewMode?: 'list' | 'grid' }> = ({ viewMode = 'list' }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Skeleton variant="rectangular" width="32px" height="32px" />
              <Skeleton width="120px" height="2rem" />
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
              <Skeleton width="60%" height="0.75rem" />
            </div>
          ))}
        </div>

        {/* Search and Filters Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Skeleton width="100%" height="2.5rem" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Skeleton width="120px" height="2.5rem" />
              <Skeleton width="100px" height="2.5rem" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Skeleton width="150px" height="1rem" />
            <Skeleton width="80px" height="1rem" />
          </div>
        </div>

        {/* Content Skeleton */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Skeleton variant="rectangular" width="16px" height="16px" />
                    <Skeleton width="80px" height="1.25rem" />
                  </div>
                  <Skeleton variant="rectangular" width="16px" height="16px" />
                </div>
                
                <Skeleton width="100%" height="1rem" className="mb-3" lines={2} />
                
                <div className="flex items-center justify-between mb-4">
                  <Skeleton width="60px" height="1.5rem" />
                  <Skeleton width="40px" height="1rem" />
                </div>
                
                <div className="pt-4 border-t border-slate-200 dark:border-gray-700 flex items-center justify-between">
                  <Skeleton width="80px" height="0.75rem" />
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
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-gray-700 px-4 sm:px-6 py-3 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center gap-4">
                <Skeleton variant="rectangular" width="16px" height="16px" />
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 w-full">
                  <Skeleton width="60px" height="1rem" className="col-span-2" />
                  <Skeleton width="80px" height="1rem" className="hidden sm:block" />
                  <Skeleton width="60px" height="1rem" className="hidden sm:block" />
                  <Skeleton width="50px" height="1rem" />
                  <Skeleton width="60px" height="1rem" />
                </div>
              </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-200 dark:divide-gray-700">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="px-4 sm:px-6 py-4">
                  <div className="flex items-center gap-4">
                    <Skeleton variant="rectangular" width="16px" height="16px" />
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 w-full">
                      <div className="col-span-2 flex items-center gap-3">
                        <Skeleton variant="rectangular" width="16px" height="16px" />
                        <div>
                          <Skeleton width="80px" height="1.25rem" className="mb-1" />
                          <Skeleton width="120px" height="1rem" />
                        </div>
                      </div>
                      <div className="hidden sm:block">
                        <Skeleton width="60px" height="1.5rem" />
                      </div>
                      <div className="hidden sm:block">
                        <Skeleton width="40px" height="1rem" />
                      </div>
                      <div>
                        <Skeleton width="40px" height="1rem" />
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

export const ProjectsSkeleton: React.FC<{ viewMode?: 'list' | 'grid' }> = ({ viewMode = 'grid' }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Skeleton variant="rectangular" width="32px" height="32px" />
              <Skeleton width="140px" height="2rem" />
            </div>
            <Skeleton width="320px" height="1rem" />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Skeleton width="100px" height="2.5rem" />
            <Skeleton width="140px" height="2.5rem" />
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
              <Skeleton width="60%" height="0.75rem" />
            </div>
          ))}
        </div>

        {/* Search and Filters Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Skeleton width="100%" height="2.5rem" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Skeleton width="120px" height="2.5rem" />
              <Skeleton width="100px" height="2.5rem" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Skeleton width="150px" height="1rem" />
            <Skeleton width="80px" height="1rem" />
          </div>
        </div>

        {/* Content Skeleton */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton variant="rectangular" width="40px" height="40px" />
                    <div className="flex-1">
                      <Skeleton width="80%" height="1.25rem" className="mb-1" />
                      <Skeleton width="60%" height="0.875rem" />
                    </div>
                  </div>
                  <Skeleton variant="rectangular" width="16px" height="16px" />
                </div>
                
                <Skeleton width="100%" height="1rem" className="mb-3" lines={2} />
                
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton width="60px" height="1.5rem" />
                  <Skeleton width="50px" height="1.5rem" />
                  <Skeleton width="40px" height="1.5rem" />
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex -space-x-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} variant="circular" width="28px" height="28px" />
                    ))}
                  </div>
                  <Skeleton width="40px" height="1rem" />
                </div>
                
                <div className="pt-4 border-t border-slate-200 dark:border-gray-700 flex items-center justify-between">
                  <Skeleton width="60px" height="0.75rem" />
                  <div className="flex gap-1">
                    <Skeleton variant="rectangular" width="16px" height="16px" />
                    <Skeleton variant="rectangular" width="16px" height="16px" />
                    <Skeleton variant="rectangular" width="16px" height="16px" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-gray-700 px-4 sm:px-6 py-3 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center gap-4">
                <Skeleton variant="rectangular" width="16px" height="16px" />
                <div className="grid grid-cols-6 gap-4 w-full">
                  <Skeleton width="60px" height="1rem" className="col-span-2" />
                  <Skeleton width="50px" height="1rem" />
                  <Skeleton width="40px" height="1rem" />
                  <Skeleton width="50px" height="1rem" />
                  <Skeleton width="60px" height="1rem" />
                </div>
              </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-200 dark:divide-gray-700">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="px-4 sm:px-6 py-4">
                  <div className="flex items-center gap-4">
                    <Skeleton variant="rectangular" width="16px" height="16px" />
                    <div className="grid grid-cols-6 gap-4 w-full">
                      <div className="col-span-2 flex items-center gap-3">
                        <Skeleton variant="rectangular" width="32px" height="32px" />
                        <div>
                          <Skeleton width="100px" height="1.25rem" className="mb-1" />
                          <Skeleton width="80px" height="1rem" />
                        </div>
                      </div>
                      <div>
                        <Skeleton width="60px" height="1.5rem" />
                      </div>
                      <div>
                        <Skeleton width="30px" height="1rem" />
                      </div>
                      <div>
                        <Skeleton width="40px" height="1rem" />
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