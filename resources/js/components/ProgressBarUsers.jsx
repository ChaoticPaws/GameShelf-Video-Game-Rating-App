import { useTheme } from "../contexts/ThemeContext"

export function ProgressBarUsers({ current, total, label }) {
  const { theme } = useTheme()
  const percentage = Math.min((current / total) * 100, 100)
  const isDark = theme === "dark"

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col items-center mb-4">
        <p
          className={`text-sm sm:text-base font-bold tracking-widest uppercase mb-1 ${
            isDark ? "text-cyber-cyan" : "text-brown-dark"
          }`}
        >
          {label}
        </p>      
      </div>

      {/* Cyberpunk style progress bar */}
      <div
        className={`relative w-full h-6 sm:h-8 overflow-hidden rounded-full border-2 ${
          isDark ? "border-cyber-purple bg-cyber-dark" : "border-brown-light bg-brown-light/20"
        }`}
      >
        {/* Background grid lines */}
        <div className="absolute inset-0 opacity-60">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className={`absolute top-0 h-full w-px ${
                isDark ? "bg-cyber-cyan/30" : "bg-brown-light/40"
              }`}
              style={{ left: `${(i / 16) * 100}%` }}
            />
          ))}
        </div>

        {/* Filled portion */}
        <div
          className={`h-full transition-all duration-700 ease-out ${
            isDark
              ? "bg-gradient-to-r from-cyber-cyan via-cyber-pink to-cyber-purple"
              : "bg-gradient-to-r from-brown to-brown-dark"
          } rounded-full`}
          style={{ width: `${percentage}%` }}
        />

        {/* Overlay scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05)_2px,transparent_2px)] bg-[length:100%_5px] pointer-events-none rounded-full" />

        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`font-mono text-sm sm:text-base font-bold tracking-widest ${
              isDark ? "text-cyber-green" : "text-brown-dark"
            }`}
          >
            {Math.round(percentage)}%
          </span>
        </div>
      </div>

      {/* Helper text */}
      <div className="mt-4 flex items-center justify-center">
        <span
          className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${
            isDark
              ? "border-cyber-purple/50 text-cyber-pink bg-cyber-purple/10"
              : "border-brown-light text-brown-dark bg-brown-light/10"
          }`}
        >
          Add {total - current} more to complete
        </span>
      </div>
    </div>
  )
}
