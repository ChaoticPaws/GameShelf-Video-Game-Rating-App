// components/HomeSkeleton.jsx
import { useTheme } from "../contexts/ThemeContext"

export function HomeSkeleton() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  
  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Hero Section Skeleton */}
      <section className="mb-16 text-center">
        <div className={`h-12 rounded-lg mb-4 animate-pulse border ${
          isDark ? 'bg-cyber-purple/20 border-cyber-purple/10' : 'bg-brown-light/20 border-brown-light/10'
        }`}></div>
        <div className={`h-6 rounded-lg max-w-3xl mx-auto animate-pulse border ${
          isDark ? 'bg-cyber-pink/20 border-cyber-pink/10' : 'bg-brown/20 border-brown/10'
        }`}></div>
      </section>

      {/* Top Games Section Skeleton */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className={`w-2 h-8 rounded-full mr-3 ${
              isDark ? 'bg-cyber-pink/30' : 'bg-brown/30'
            }`}></div>
            <div className={`h-8 w-48 rounded-lg animate-pulse border ${
              isDark ? 'bg-cyber-purple/20 border-cyber-purple/10' : 'bg-brown-light/20 border-brown-light/10'
            }`}></div>
          </div>
          <div className={`h-6 w-20 rounded-lg animate-pulse border ${
            isDark ? 'bg-cyber-pink/20 border-cyber-pink/10' : 'bg-brown/20 border-brown/10'
          }`}></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className={`aspect-[3/4] rounded-lg mb-3 border ${
                isDark ? 'bg-cyber-purple/20 border-cyber-purple/10' : 'bg-brown-light/20 border-brown-light/10'
              }`}></div>
              <div className={`h-4 rounded mb-2 border ${
                isDark ? 'bg-cyber-pink/20 border-cyber-pink/10' : 'bg-brown/20 border-brown/10'
              }`}></div>
              <div className={`h-3 rounded w-3/4 border ${
                isDark ? 'bg-cyber-purple/20 border-cyber-purple/10' : 'bg-brown-light/20 border-brown-light/10'
              }`}></div>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews Section Skeleton */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className={`w-2 h-8 rounded-full mr-3 ${
              isDark ? 'bg-cyber-cyan/30' : 'bg-brown-light/30'
            }`}></div>
            <div className={`h-8 w-56 rounded-lg animate-pulse border ${
              isDark ? 'bg-cyber-pink/20 border-cyber-pink/10' : 'bg-brown/20 border-brown/10'
            }`}></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`p-6 rounded-xl border animate-pulse ${
                isDark ? 'bg-cyber-dark/20 border-cyber-purple/20' : 'bg-brown-light/10 border-brown-light/20'
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full border ${
                  isDark ? 'bg-cyber-purple/30 border-cyber-purple/20' : 'bg-brown-light/30 border-brown-light/20'
                }`}></div>
                <div className="flex-1">
                  <div className={`h-4 rounded mb-2 border ${
                    isDark ? 'bg-cyber-pink/20 border-cyber-pink/10' : 'bg-brown/20 border-brown/10'
                  }`}></div>
                  <div className={`h-3 rounded w-2/3 border ${
                    isDark ? 'bg-cyber-purple/20 border-cyber-purple/10' : 'bg-brown-light/20 border-brown-light/10'
                  }`}></div>
                </div>
              </div>
              <div className={`h-20 rounded-lg border ${
                isDark ? 'bg-cyber-pink/20 border-cyber-pink/10' : 'bg-brown/20 border-brown/10'
              }`}></div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section Skeleton */}
      <section className={`rounded-2xl p-8 text-center border animate-pulse ${
        isDark ? 'bg-cyber-dark/30 border-cyber-purple/20' : 'bg-brown-light/20 border-brown-light/20'
      }`}>
        <div className={`h-8 rounded-lg mb-4 max-w-md mx-auto border ${
          isDark ? 'bg-cyber-pink/30 border-cyber-pink/20' : 'bg-brown/30 border-brown/20'
        }`}></div>
        <div className={`h-6 rounded-lg mb-6 max-w-2xl mx-auto border ${
          isDark ? 'bg-cyber-purple/30 border-cyber-purple/20' : 'bg-brown-light/30 border-brown-light/20'
        }`}></div>
        <div className="flex flex-wrap justify-center gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`h-12 w-32 rounded-lg border ${
                isDark ? 'bg-cyber-pink/30 border-cyber-pink/20' : 'bg-brown/30 border-brown/20'
              }`}
            ></div>
          ))}
        </div>
      </section>
    </div>
  )
}