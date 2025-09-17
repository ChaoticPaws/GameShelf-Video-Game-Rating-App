"use client"

import { useState, useMemo, useEffect } from "react"
import { useTheme } from "../contexts/ThemeContext"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

export function GenreChart({ data, compact = false }) {
  const { theme } = useTheme()
  const [activeIndex, setActiveIndex] = useState(null)
  const [windowWidth, setWindowWidth] = useState(0)

  // Hook para detectar cambios de tamaño de ventana (solo ancho)
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    // Establecer tamaño inicial
    handleResize()

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Función para generar colores automáticamente
  const generateColor = (index) => {
    const baseColors = [
      "#6366f1",
      "#8b5cf6",
      "#ec4899",
      "#ef4444",
      "#f59e0b",
      "#10b981",
      "#3b82f6",
      "#06b6d4",
      "#14b8a6",
      "#84cc16",
    ]

    if (index < baseColors.length) {
      return baseColors[index]
    }

    const hue = (index * 137.5) % 360
    const saturation = 65 + (index % 3) * 10
    const lightness = 50 + (index % 4) * 5

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }

  const COLORS = useMemo(() => {
    return Array.from({ length: data?.length || 0 }, (_, index) => generateColor(index))
  }, [data?.length])

  const total = useMemo(() => data.reduce((sum, item) => sum + item.count, 0), [data])

  const chartData = useMemo(() => {
    return data.map((item) => ({
      name: item.name,
      value: item.count,
      percentage: ((item.count / total) * 100).toFixed(1) + "%",
    }))
  }, [data, total])

  if (!data || data.length === 0) {
  return (
    <div
      className={`${compact ? "p-3" : "p-4 sm:p-6"} rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"} text-center flex items-center justify-center h-full`}
    >
      <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">No genre data available</p>
    </div>
  )
}

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={`p-2 sm:p-3 rounded-lg shadow-xl ${theme === "dark" ? "bg-gray-700 text-white" : "bg-white text-gray-800"} border ${theme === "dark" ? "border-gray-600" : "border-gray-200"} max-w-xs z-50`}
        >
          <p className="font-semibold text-xs sm:text-sm">
            {payload[0].name}{" "}
            <span className="text-indigo-500 dark:text-indigo-300">• {payload[0].payload.percentage}</span>
          </p>
          <p className="text-xs sm:text-sm">
            <span className="font-medium">{payload[0].value}</span> juegos
          </p>
        </div>
      )
    }
    return null
  }

  const handleMouseEnter = (_, index) => {
    setActiveIndex(index)
  }

  const handleMouseLeave = () => {
    setActiveIndex(null)
  }

 // Tamaños responsive optimizados
const getChartSizes = useMemo(() => {
  const width = windowWidth || 1024 // fallback

  if (compact) {
    return {
      innerRadius: windowWidth < 768 ? 20 : 25,
      outerRadius: activeIndex !== null ? (windowWidth < 768 ? 50 : 55) : (windowWidth < 768 ? 40 : 45),
      cx: "45%",
    }
  }

  if (width < 480) {
    return {
      innerRadius: 35,
      outerRadius: activeIndex !== null ? 85 : 75,
      cx: "45%",
    }
  } else if (width < 640) {
    return {
      innerRadius: 40,
      outerRadius: activeIndex !== null ? 95 : 85,
      cx: "45%",
    }
  } else if (width < 768) {
    return {
      innerRadius: 45,
      outerRadius: activeIndex !== null ? 110 : 100,
      cx: "45%",
    }
  } else if (width < 1024) {
    // Tablet
    return {
      innerRadius: 55,
      outerRadius: activeIndex !== null ? 130 : 120,
      cx: "45%",
    }
  } else if (width < 1280) {
    return {
      innerRadius: 65,
      outerRadius: activeIndex !== null ? 150 : 140,
      cx: "45%",
    }
  } else {
    return {
      innerRadius: 75,
      outerRadius: activeIndex !== null ? 170 : 160,
      cx: "45%",
    }
  }
}, [windowWidth, compact, activeIndex])

  const { innerRadius, outerRadius, cx } = getChartSizes

  return (
    <div className="w-full h-full p-1">
      <div className="w-full h-full min-h-[250px] xs:min-h-[280px] sm:min-h-[320px] md:min-h-[380px] lg:min-h-[420px] xl:min-h-[480px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: -90, right: 10, bottom: 10, left: 10 }}>
            <Pie
              data={chartData}
              cx={cx}
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={1}
              dataKey="value"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              animationDuration={200}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index]}
                  stroke={theme === "dark" ? "#1f2937" : "#ffffff"}
                  strokeWidth={1}
                  style={{
                    transition: "all 0.2s ease-in-out",
                    transform: activeIndex === index ? "scale(1.05)" : "scale(1)",
                    filter: activeIndex === index ? "brightness(1.1)" : "none",
                    transformOrigin: "center center",
                    cursor: "pointer",
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 1000 }} />
            <Legend
              layout="vertical"
              verticalAlign="top"
              align="right"
              wrapperStyle={{
                paddingLeft: windowWidth < 640 ? "8px" : "12px",
                paddingTop: windowWidth < 640 ? "70px" : "80px",
                fontSize: compact ? "9px" : windowWidth < 640 ? "10px" : windowWidth < 768 ? "11px" : "12px",
                color: theme === "dark" ? "#e5e7eb" : "#374151",
                fontWeight: 500,
                lineHeight: 1.3,
              }}
              iconSize={compact ? 7 : windowWidth < 640 ? 8 : 9}
              iconType="circle"
              formatter={(value) => (
                <span
                  className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                  style={{
                    fontSize: compact ? "9px" : windowWidth < 640 ? "10px" : windowWidth < 768 ? "11px" : "12px",
                    maxWidth: compact ? "45px" : windowWidth < 640 ? "50px" : "70px",
                    display: "inline-block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={value}
                >
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}