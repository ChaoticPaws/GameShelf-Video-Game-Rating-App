// components/GameCard.jsx
"use client";
import { useState, useEffect } from "react";
import { Star, Calendar, Monitor, Gamepad2, Smartphone } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const formatDate = (dateString) => {
  if (!dateString) return "Unknown date";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
  }).format(date);
};

const getPlatformIcon = (platformName) => {
  const name = platformName.toLowerCase();
  if (name.includes("pc") || name.includes("mac") || name.includes("linux")) {
    return <Monitor className="w-3.5 h-3.5" />;
  } else if (
    name.includes("playstation") ||
    name.includes("xbox") ||
    name.includes("nintendo") ||
    name.includes("switch")
  ) {
    return <Gamepad2 className="w-3.5 h-3.5" />;
  } else if (name.includes("ios") || name.includes("android")) {
    return <Smartphone className="w-3.5 h-3.5" />;
  }
  return <Gamepad2 className="w-3.5 h-3.5" />;
};

// 🎨 Paletas dinámicas mejoradas según id
const generateColorsFromId = (id, isDark = false) => {
  // Paletas mejoradas con colores más vibrantes y contrastados
  const colorPalettes = [
    { 
      dominant: isDark ? "#818cf8" : "#6366f1", 
      secondary: isDark ? "#6366f1" : "#4f46e5",
      text: isDark ? "#e0e7ff" : "#3730a3",
      bg: isDark ? "#3730a330" : "#6366f120"
    },
    { 
      dominant: isDark ? "#fbbf24" : "#f59e0b", 
      secondary: isDark ? "#f59e0b" : "#d97706",
      text: isDark ? "#fef3c7" : "#78350f",
      bg: isDark ? "#78350f30" : "#f59e0b20"
    },
    { 
      dominant: isDark ? "#34d399" : "#10b981", 
      secondary: isDark ? "#10b981" : "#059669",
      text: isDark ? "#d1fae5" : "#064e3b",
      bg: isDark ? "#064e3b30" : "#10b98120"
    },
    { 
      dominant: isDark ? "#f87171" : "#ef4444", 
      secondary: isDark ? "#ef4444" : "#dc2626",
      text: isDark ? "#fee2e2" : "#7f1d1d",
      bg: isDark ? "#7f1d1d30" : "#ef444420"
    },
    { 
      dominant: isDark ? "#a78bfa" : "#8b5cf6", 
      secondary: isDark ? "#8b5cf6" : "#7c3aed",
      text: isDark ? "#ede9fe" : "#4c1d95",
      bg: isDark ? "#4c1d9530" : "#8b5cf620"
    },
    { 
      dominant: isDark ? "#60a5fa" : "#3b82f6", 
      secondary: isDark ? "#3b82f6" : "#2563eb",
      text: isDark ? "#dbeafe" : "#1e3a8a",
      bg: isDark ? "#1e3a8a30" : "#3b82f620"
    },
    { 
      dominant: isDark ? "#f472b6" : "#ec4899", 
      secondary: isDark ? "#ec4899" : "#db2777",
      text: isDark ? "#fce7f3" : "#831843",
      bg: isDark ? "#83184330" : "#ec489920"
    },
  ];
  const index = (typeof id === "number" ? id : parseInt(id, 10)) % colorPalettes.length;
  return colorPalettes[Math.abs(index)];
};

export function GameCard({ game, className }) {
  const {
    id,
    name: title,
    image_url: coverImage,
    average_rating,
    release_date,
    genres = [],
    platforms = [],
    slug,
  } = game;

  const rating = parseFloat(average_rating);
  const formattedReleaseDate = formatDate(release_date);
  const genreNames = genres.map((g) => g.name);
  const platformNames = platforms.map((p) => p.name).slice(0, 3);
  const url = `/games/${slug}`;
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const colors = generateColorsFromId(id, isDark);

  const renderStars = (rating) => {
    const maxStars = 5;
    return (
      <div className="flex gap-[2px]">
        {[...Array(maxStars)].map((_, i) => {
          const starValue = i + 1;
          return (
            <Star
              key={i}
              className={cn(
                "w-3 h-3",
                starValue <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-400 dark:text-gray-600"
              )}
            />
          );
        })}
      </div>
    );
  };

  // Calcular tamaño de fuente responsivo para el título
  const getTitleSize = () => {
    if (isMobile) return 'text-base';
    if (isTablet) return 'text-lg';
    return 'text-lg';
  };

  // Calcular altura del contenedor de contenido
  const getContentHeight = () => {
    if (isMobile) return 'h-[44%]';
    if (isTablet) return 'h-[42%]';
    return 'h-[40%]';
  };

  return (
    <a href={url} className="block group">
      <div
        className={cn(
          "relative w-full h-[420px] max-w-[260px] overflow-hidden rounded-2xl transition-all duration-500",
          "shadow-lg border",
          "bg-beige-100 dark:bg-cyber-dark",
          className
        )}
        style={{
          borderColor: isHovering ? colors.dominant : `${colors.dominant}40`,
          boxShadow: isHovering
            ? `0 12px 30px -5px ${colors.dominant}60`
            : "0 6px 20px -5px rgba(0,0,0,0.15)",
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Imagen - Reducida ligeramente la altura para dar más espacio al contenido */}
        <div className="relative h-[56%] w-full overflow-hidden">
          <img
            src={coverImage || "/placeholder.svg"}
            alt={title}
            className={cn(
              "w-full h-full object-cover transition-transform duration-500",
              isHovering ? "scale-110" : "scale-100"
            )}
            onError={(e) => {
              e.target.src = "/placeholder.svg";
            }}
          />

          {/* Overlay degradado mejorado */}
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              background: isHovering
                ? `linear-gradient(to top, ${colors.dominant}80, transparent 70%)`
                : `linear-gradient(to top, ${isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)'}, transparent 70%)`,
            }}
          />

          {/* Badge rating - Mejorado con mejor contraste */}
          <div
            className={cn(
              "absolute top-3 right-3 flex items-center justify-center rounded-full font-bold text-white shadow-md",
              isMobile ? "w-9 h-9 text-xs" : "w-11 h-11 text-sm"
            )}
            style={{
              background: `linear-gradient(135deg, ${colors.dominant}, ${colors.secondary})`,
              boxShadow: `0 0 10px ${colors.dominant}, 0 0 20px ${colors.dominant}80`,
            }}
          >
            {rating.toFixed(1)}
          </div>
        </div>

        {/* Contenido inferior - Altura responsiva */}
        <div
          className={cn(
            "flex flex-col p-4",
            getContentHeight(),
            "bg-gradient-to-t from-beige-100/95 to-beige-50/70 dark:from-cyber-dark/90 dark:to-cyber-dark/40"
          )}
        >
          {/* Título - Mejorado para todos los dispositivos */}
          <h3
            className={cn(
              "font-bold mb-2 line-clamp-2 transition-colors",
              getTitleSize(),
              "text-brown-darker dark:text-white leading-tight"
            )}
            style={{
              minHeight: isMobile ? '2.5rem' : '2.8rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {title}
          </h3>

          {/* Fecha + estrellas - Ajustado para móviles */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1 text-xs text-brown dark:text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedReleaseDate}</span>
            </div>
            <div className="flex items-center gap-1">
              {renderStars(rating)}
              <span className="text-xs text-brown dark:text-gray-400">
                ({rating.toFixed(1)})
              </span>
            </div>
          </div>

          {/* Géneros - Mejorado con mejor contraste */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {genreNames.slice(0, 2).map((g, i) => (
              <span
                key={i}
                className="px-2 py-1 text-xs rounded-full font-medium transition-colors"
                style={{
                  backgroundColor: isHovering ? colors.bg : `${colors.dominant}15`,
                  color: isHovering ? colors.text : colors.dominant,
                  border: `1px solid ${isHovering ? colors.dominant : `${colors.dominant}40`}`,
                }}
              >
                {g}
              </span>
            ))}
            {genreNames.length > 2 && (
              <span
                className="px-2 py-1 text-xs rounded-full transition-colors"
                style={{
                  backgroundColor: isHovering ? colors.bg : `${colors.dominant}15`,
                  color: isHovering ? colors.text : colors.dominant,
                  border: `1px solid ${isHovering ? colors.dominant : `${colors.dominant}40`}`,
                }}
              >
                +{genreNames.length - 2}
              </span>
            )}
          </div>

          {/* Plataformas - Mejorado para todos los dispositivos */}
          <div className="flex flex-wrap gap-2 mt-auto text-xs font-medium text-brown dark:text-gray-300">
            {platformNames.map((platform, i) => (
              <div key={i} className="flex items-center gap-1">
                {getPlatformIcon(platform)}
                <span className="truncate max-w-[60px]">{platform}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </a>
  );
}