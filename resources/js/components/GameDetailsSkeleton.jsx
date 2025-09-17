// components/GameDetailsSkeleton.jsx
import { useTheme } from "../contexts/ThemeContext"

export function GameDetailsSkeleton() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  
  return (
    <div className="min-h-screen">
      <div className="absolute inset-0">
        <div className={`absolute top-1/4 left-1/4 w-32 h-32 sm:w-64 sm:h-64 rounded-full blur-3xl animate-pulse ${
          isDark ? 'bg-purple-500/20' : 'bg-purple-300/20'
        }`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-96 sm:h-96 rounded-full blur-3xl ${
          isDark ? 'bg-blue-500/20' : 'bg-blue-300/20'
        }`}></div>
      </div>

      <div className="relative container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 max-w-7xl">
        <div className={`rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 relative overflow-hidden border-2 shadow-lg ${
          isDark ? 'bg-cyber-dark/30 border-cyber-purple/30' : 'bg-lightBg/30 border-gray-200/30'
        }`}>
          <div className="animate-pulse">
            <div className="py-8 md:py-16">
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Game Cover Skeleton */}
                <div className="w-full lg:w-1/3 xl:w-1/4 flex-shrink-0">
                  <div className="flex flex-col items-center lg:items-start">
                    <div className={`w-80 h-96 rounded-xl border ${
                      isDark ? 'bg-cyber-dark/50 border-cyber-purple/30' : 'bg-gray-200/50 border-gray-300/30'
                    }`}></div>
                    <div className="mt-6 w-full max-w-sm space-y-3">
                      <div className={`h-12 rounded border ${
                        isDark ? 'bg-cyber-dark/40 border-cyber-purple/30' : 'bg-gray-200/40 border-gray-300/30'
                      }`}></div>
                      <div className={`h-12 rounded border ${
                        isDark ? 'bg-cyber-dark/40 border-cyber-purple/30' : 'bg-gray-200/40 border-gray-300/30'
                      }`}></div>
                    </div>
                  </div>
                </div>

                {/* Game Info Skeleton */}
                <div className="flex-1">
                  <div className={`p-6 md:p-8 rounded-xl shadow-xl border-2 backdrop-blur-sm ${
                    isDark ? 'bg-cyber-dark/40 border-cyber-purple/30' : 'bg-lightBg/40 border-gray-200/30'
                  }`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className={`h-12 rounded border mb-4 ${
                          isDark ? 'bg-cyber-cyan/20 border-cyber-cyan/30' : 'bg-gray-300/40 border-gray-400/30'
                        }`}></div>
                      </div>
                      <div className="flex gap-8 ml-8">
                        <div className={`w-16 h-16 rounded border ${
                          isDark ? 'bg-cyber-green/20 border-cyber-green/30' : 'bg-gray-300/40 border-gray-400/30'
                        }`}></div>
                        <div className={`w-16 h-16 rounded border ${
                          isDark ? 'bg-cyber-green/20 border-cyber-green/30' : 'bg-gray-300/40 border-gray-400/30'
                        }`}></div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 mb-6">
                      <div className={`h-4 w-24 rounded border ${
                        isDark ? 'bg-cyber-cyan/15 border-cyber-cyan/20' : 'bg-gray-300/30 border-gray-400/20'
                      }`}></div>
                      <div className={`h-4 w-32 rounded border ${
                        isDark ? 'bg-cyber-cyan/15 border-cyber-cyan/20' : 'bg-gray-300/30 border-gray-400/20'
                      }`}></div>
                      <div className={`h-4 w-20 rounded border ${
                        isDark ? 'bg-cyber-cyan/15 border-cyber-cyan/20' : 'bg-gray-300/30 border-gray-400/20'
                      }`}></div>
                    </div>

                    <div className="flex items-center space-x-4 mb-6">
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-6 h-6 rounded border ${
                              isDark ? 'bg-cyber-purple/20 border-cyber-purple/30' : 'bg-gray-300/40 border-gray-400/30'
                            }`}
                          ></div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-8 w-20 rounded-full border ${
                              isDark ? 'bg-cyber-cyan/15 border-cyber-cyan/20' : 'bg-gray-300/30 border-gray-400/20'
                            }`}
                          ></div>
                        ))}
                      </div>
                    </div>

                    {/* Screenshots Skeleton */}
                    <div className="mb-6">
                      <div className={`h-6 w-24 rounded border mb-3 ${
                        isDark ? 'bg-cyber-cyan/15 border-cyber-cyan/20' : 'bg-gray-300/30 border-gray-400/20'
                      }`}></div>
                      <div className="flex gap-4 overflow-hidden">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-64 h-36 rounded-lg border flex-shrink-0 ${
                              isDark ? 'bg-cyber-dark/50 border-cyber-purple/30' : 'bg-gray-200/40 border-gray-300/30'
                            }`}
                          ></div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className={`h-4 rounded border ${
                        isDark ? 'bg-cyber-cyan/10 border-cyber-cyan/15' : 'bg-gray-300/20 border-gray-400/15'
                      }`}></div>
                      <div className={`h-4 rounded border w-3/4 ${
                        isDark ? 'bg-cyber-cyan/10 border-cyber-cyan/15' : 'bg-gray-300/20 border-gray-400/15'
                      }`}></div>
                      <div className={`h-4 rounded border w-1/2 ${
                        isDark ? 'bg-cyber-cyan/10 border-cyber-cyan/15' : 'bg-gray-300/20 border-gray-400/15'
                      }`}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section Skeleton */}
            <div className="py-8 space-y-8">
              {/* Detailed Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`p-6 rounded-xl border-2 backdrop-blur-sm ${
                      isDark ? 'bg-cyber-dark/40 border-cyber-purple/30' : 'bg-lightBg/40 border-gray-200/30'
                    }`}
                  >
                    <div className={`h-6 w-32 rounded-lg mb-4 ${
                      isDark ? 'bg-cyber-cyan/15 border-cyber-cyan/20' : 'bg-gray-300/30 border-gray-400/20'
                    }`}></div>
                    <div className="space-y-3">
                      {[...Array(3)].map((_, j) => (
                        <div
                          key={j}
                          className={`h-4 rounded-full ${
                            isDark ? 'bg-cyber-cyan/10 border-cyber-cyan/15' : 'bg-gray-300/20 border-gray-400/15'
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reviews Section Skeleton */}
              <div className="space-y-8">
                <div className={`h-8 w-48 rounded-lg ${
                  isDark ? 'bg-cyber-pink/20 border-cyber-pink/30' : 'bg-gray-300/40 border-gray-400/30'
                }`}></div>
                
                {/* Review Form Skeleton */}
                <div className={`p-6 rounded-xl border-2 backdrop-blur-sm ${
                  isDark ? 'bg-cyber-dark/40 border-cyber-purple/30' : 'bg-lightBg/40 border-gray-200/30'
                }`}>
                  <div className="space-y-4">
                    <div className={`h-6 w-24 rounded ${
                      isDark ? 'bg-cyber-cyan/15 border-cyber-cyan/20' : 'bg-gray-300/30 border-gray-400/20'
                    }`}></div>
                    <div className={`h-20 rounded ${
                      isDark ? 'bg-cyber-dark/50 border-cyber-purple/30' : 'bg-gray-200/40 border-gray-300/30'
                    }`}></div>
                    <div className={`h-10 w-32 rounded ${
                      isDark ? 'bg-cyber-green/20 border-cyber-green/30' : 'bg-gray-300/40 border-gray-400/30'
                    }`}></div>
                  </div>
                </div>

                {/* Review Cards Skeleton */}
                <div className="space-y-6">
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className={`p-6 rounded-xl border-2 backdrop-blur-sm ${
                        isDark ? 'bg-cyber-dark/40 border-cyber-purple/30' : 'bg-lightBg/40 border-gray-200/30'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full ${
                          isDark ? 'bg-cyber-cyan/20 border-cyber-cyan/30' : 'bg-gray-300/40 border-gray-400/30'
                        }`}></div>
                        <div className="flex-1 space-y-3">
                          <div className={`h-5 w-40 rounded ${
                            isDark ? 'bg-cyber-cyan/15 border-cyber-cyan/20' : 'bg-gray-300/30 border-gray-400/20'
                          }`}></div>
                          <div className="flex space-x-1">
                            {[...Array(5)].map((_, j) => (
                              <div
                                key={j}
                                className={`w-5 h-5 rounded ${
                                  isDark ? 'bg-cyber-purple/20 border-cyber-purple/30' : 'bg-gray-300/40 border-gray-400/30'
                                }`}
                              ></div>
                            ))}
                          </div>
                          <div className="space-y-2">
                            <div className={`h-4 rounded-full ${
                              isDark ? 'bg-cyber-cyan/10 border-cyber-cyan/15' : 'bg-gray-300/20 border-gray-400/15'
                            }`}></div>
                            <div className={`h-4 rounded-full w-3/4 ${
                              isDark ? 'bg-cyber-cyan/10 border-cyber-cyan/15' : 'bg-gray-300/20 border-gray-400/15'
                            }`}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}