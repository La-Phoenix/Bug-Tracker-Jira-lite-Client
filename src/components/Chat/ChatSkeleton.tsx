import React from 'react';
import { Skeleton } from "../Skeleton";

export const ChatSkeleton: React.FC = () => {
  return (
    <div className="h-full flex overflow-hidden relative">
      {/* Chat Sidebar Skeleton */}
      <div className="w-80 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
        {/* Sidebar Header Skeleton */}
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <Skeleton variant="rectangular" width="24px" height="24px" />
              <Skeleton width="60px" height="1.5rem" />
            </div>
            <div className="flex items-center gap-1">
              <Skeleton variant="rectangular" width="32px" height="32px" />
            </div>
          </div>

          {/* Search Skeleton */}
          <div className="mb-3 sm:mb-4">
            <Skeleton width="100%" height="2.5rem" />
          </div>

          {/* Filters Skeleton */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} width="60px" height="1.75rem" />
            ))}
          </div>
        </div>

        {/* Room List Skeleton */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="space-y-1">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Skeleton variant="circular" width="48px" height="48px" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <Skeleton width="70%" height="1.25rem" />
                      <Skeleton width="40px" height="0.75rem" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Skeleton width="90%" height="1rem" />
                      <Skeleton variant="circular" width="16px" height="16px" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area Skeleton */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        {/* Chat Header Skeleton */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Skeleton variant="circular" width="40px" height="40px" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <Skeleton width="150px" height="1.25rem" />
                <div className="flex items-center gap-1">
                  <Skeleton variant="rectangular" width="16px" height="16px" />
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Skeleton width="100px" height="0.875rem" />
                <Skeleton width="80px" height="0.875rem" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} variant="rectangular" width="32px" height="32px" />
            ))}
          </div>
        </div>

        {/* Messages Area Skeleton */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-2 sm:px-4 pt-4 space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index}>
                {/* Alternate between sent and received messages */}
                {index % 2 === 0 ? (
                  // Received Message Skeleton
                  <div className="flex gap-2 sm:gap-3">
                    <Skeleton variant="circular" width="32px" height="32px" className="flex-shrink-0" />
                    <div className="flex-1 max-w-xs sm:max-w-md">
                      <div className="flex items-center gap-2 mb-1">
                        <Skeleton width="80px" height="1rem" />
                        <Skeleton width="40px" height="0.75rem" />
                      </div>
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                        <Skeleton width="100%" height="1rem" lines={Math.floor(Math.random() * 3) + 1} />
                      </div>
                    </div>
                  </div>
                ) : (
                  // Sent Message Skeleton
                  <div className="flex justify-end">
                    <div className="max-w-xs sm:max-w-md">
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                        <Skeleton width="100%" height="1rem" lines={Math.floor(Math.random() * 2) + 1} />
                      </div>
                      <div className="text-right mt-1">
                        <Skeleton width="40px" height="0.75rem" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Message Input Skeleton */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 sm:p-4">
          <div className="flex items-center gap-2">
            <Skeleton variant="rectangular" width="32px" height="32px" />
            <div className="flex-1">
              <Skeleton width="100%" height="2.5rem" />
            </div>
            <Skeleton variant="rectangular" width="32px" height="32px" />
            <Skeleton variant="rectangular" width="40px" height="32px" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Chat-specific skeleton for when no room is selected
export const ChatEmptySkeleton: React.FC = () => {
  return (
    <div className="h-full flex overflow-hidden relative">
      {/* Chat Sidebar Skeleton - same as above */}
      <div className="w-80 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <Skeleton variant="rectangular" width="24px" height="24px" />
              <Skeleton width="60px" height="1.5rem" />
            </div>
            <Skeleton variant="rectangular" width="32px" height="32px" />
          </div>
          <div className="mb-3 sm:mb-4">
            <Skeleton width="100%" height="2.5rem" />
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} width="60px" height="1.75rem" />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="p-3">
                <div className="flex items-center gap-3">
                  <Skeleton variant="circular" width="48px" height="48px" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <Skeleton width="70%" height="1.25rem" />
                      <Skeleton width="40px" height="0.75rem" />
                    </div>
                    <Skeleton width="90%" height="1rem" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Empty Chat Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="text-center">
          <Skeleton variant="circular" width="80px" height="80px" className="mx-auto mb-4 sm:mb-6" />
          <Skeleton width="200px" height="1.5rem" className="mx-auto mb-2 sm:mb-3" />
          <Skeleton width="300px" height="1rem" className="mx-auto" lines={2} />
        </div>
      </div>
    </div>
  );
};

export const MessagesLoadingSkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="space-y-4 w-full max-w-md px-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex gap-3">
            <Skeleton variant="circular" width="32px" height="32px" className="flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Skeleton width="80px" height="1rem" />
                <Skeleton width="40px" height="0.75rem" />
              </div>
              <div className="dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                <Skeleton width="100%" height="1rem" lines={Math.floor(Math.random() * 2) + 1} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

