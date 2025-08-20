import { Skeleton } from "./Skeleton";

export const SettingsSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header Skeleton */}
        <div className="mb-6 sm:mb-8">
          <Skeleton width="140px" height="2.25rem" className="mb-2" />
          <Skeleton width="320px" height="1rem" />
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Sidebar Skeleton */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-200 dark:border-gray-700 p-3 sm:p-4">
              <div className="space-y-2 sm:space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 sm:p-3">
                    <Skeleton variant="rectangular" width="20px" height="20px" />
                    <div className="flex-1">
                      <Skeleton width="80px" height="1rem" className="mb-1" />
                      <Skeleton width="120px" height="0.75rem" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="w-full lg:w-3/4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-200 dark:border-gray-700 p-4 sm:p-6">
              {/* Section Title */}
              <Skeleton width="200px" height="1.75rem" className="mb-4 sm:mb-6" />
              
              {/* Form Sections */}
              <div className="space-y-4 sm:space-y-6">
                {/* Profile Avatar Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <Skeleton variant="circular" width="80px" height="80px" />
                  <div className="flex-1">
                    <Skeleton width="120px" height="2.5rem" className="mb-1" />
                    <Skeleton width="180px" height="0.875rem" />
                  </div>
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index}>
                      <Skeleton width="100px" height="1rem" className="mb-2" />
                      <Skeleton width="100%" height="2.5rem" />
                    </div>
                  ))}
                </div>

                {/* Large Text Area */}
                <div>
                  <Skeleton width="60px" height="1rem" className="mb-2" />
                  <Skeleton width="100%" height="4rem" />
                </div>

                {/* Notification Settings */}
                <div className="space-y-3">
                  <Skeleton width="180px" height="1.5rem" className="mb-4" />
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex-1">
                        <Skeleton width="140px" height="1.25rem" className="mb-1" />
                        <Skeleton width="200px" height="0.875rem" />
                      </div>
                      <Skeleton variant="rectangular" width="44px" height="24px" className="rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Save Button */}
              <div className="flex justify-end pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700 mt-4 sm:mt-6">
                <Skeleton width="140px" height="2.5rem" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};