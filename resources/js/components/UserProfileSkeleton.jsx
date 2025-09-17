// components/UserProfileSkeleton.jsx
import { useTheme } from "../contexts/ThemeContext"

export function UserProfileSkeleton() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  
  return (
    <div className="min-h-screen relative">
      <div className="relative container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 max-w-7xl">
        <div className={`rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 relative overflow-hidden border-2 shadow-lg 
          ${isDark ? 'bg-cyber-dark/30 border-cyber-purple/30' : 'bg-lightBg/30 border-gray-200/30'}`}>
          
          {/* Profile Header Skeleton */}
          <div className="relative mb-6 sm:mb-8 md:mb-14">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
              {/* Profile Image Skeleton */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-36 lg:h-36 xl:w-44 xl:h-44 flex-shrink-0">
                <div className={`w-full h-full rounded-2xl ${
                  isDark ? 'bg-cyber-dark/50 border-cyber-purple/30' : 'bg-gray-200/50 border-gray-300/30'
                } border-2 animate-pulse`}></div>
              </div>

              {/* Bio and Name Skeleton */}
              <div className={`w-full lg:flex-1 rounded-xl border-2 ${
                isDark ? 'border-cyber-cyan/30 bg-cyber-dark/40' : 'border-brown-light/30 bg-lightBg/40'
              } p-4 sm:p-5 lg:p-6`}>
                <div className={`h-8 w-3/4 rounded-lg ${
                  isDark ? 'bg-cyber-cyan/20' : 'bg-gray-300/40'
                } animate-pulse mb-4 mx-auto lg:mx-0`}></div>
                <div className={`h-4 w-full rounded-full ${
                  isDark ? 'bg-cyber-cyan/15' : 'bg-gray-300/30'
                } animate-pulse mb-2`}></div>
                <div className={`h-4 w-2/3 rounded-full ${
                  isDark ? 'bg-cyber-cyan/15' : 'bg-gray-300/30'
                } animate-pulse`}></div>
              </div>

              {/* Configure Button Skeleton */}
              <div className={`w-full lg:w-auto flex justify-center lg:justify-end mt-2 lg:mt-0`}>
                <div className={`h-10 w-32 rounded-xl ${
                  isDark ? 'bg-cyber-dark/40 border-cyber-cyan/30' : 'bg-gray-200/40 border-gray-300/30'
                } border-2 animate-pulse`}></div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-7 mx-2 sm:mx-4 my-4 sm:my-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className={`relative group backdrop-blur-sm rounded-xl p-3 sm:p-4 md:p-5 border-2 ${
                  isDark ? 'bg-cyber-dark/40 border-cyber-purple/30' : 'bg-lightBg/40 border-gray-200/30'
                } animate-pulse min-h-[100px]`}
              ></div>
            ))}
          </div>

          {/* Main Content Grid Skeleton */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6 p-3 sm:p-6 mb-6 sm:mb-8 md:mb-12">
            {/* Genre Chart Skeleton */}
            <div className="xl:col-span-3">
              <div className={`rounded-2xl border-2 ${
                isDark ? 'border-cyber-purple/30 bg-cyber-dark/40' : 'border-brown-light/30 bg-lightBg/40'
              } overflow-hidden shadow-2xl h-96`}></div>
            </div>

            {/* Recent Activity Skeleton */}
            <div className={`rounded-2xl border-2 ${
              isDark ? 'border-cyber-green/30 bg-cyber-dark/40' : 'border-gray-200/30 bg-lightBg/40'
            } h-96`}></div>
          </div>

          {/* Hall of Fame Skeleton */}
          <div className="mb-6 sm:mb-8 md:mb-12 lg:mb-16">
            <div className={`h-8 w-48 rounded-lg ${
              isDark ? 'bg-cyber-pink/20' : 'bg-gray-300/40'
            } animate-pulse mb-6`}></div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className={`aspect-[3/4] rounded-xl sm:rounded-2xl ${
                    isDark ? 'bg-cyber-dark/50 border-cyber-purple/30' : 'bg-gray-200/50 border-gray-300/30'
                  } border-2 animate-pulse`}
                ></div>
              ))}
            </div>
          </div>

          {/* Tabs Section Skeleton */}
          <div className={`rounded-2xl border ${
            isDark ? 'border-cyber-cyan/30 bg-cyber-dark/40' : 'border-gray-200/30 bg-lightBg/40'
          } shadow-2xl`}>
            <div className="border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex space-x-6">
                <div className={`h-8 w-24 rounded ${
                  isDark ? 'bg-cyber-cyan/20' : 'bg-gray-300/40'
                } animate-pulse`}></div>
                <div className={`h-8 w-24 rounded ${
                  isDark ? 'bg-cyber-cyan/20' : 'bg-gray-300/40'
                } animate-pulse`}></div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className={`rounded-xl ${
                      isDark ? 'bg-cyber-dark/50 border-cyber-purple/30' : 'bg-gray-200/50 border-gray-300/30'
                    } border-2 h-64 animate-pulse`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}