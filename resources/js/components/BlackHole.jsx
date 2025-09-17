const BlackHole = ({ 
  color = "blue", 
  className = "",
  rotationSpeed = 1,
  opacity = 1,
  intensity = 0.8,
  mode = "night",
  coreSize = 0.7 
}) => {
  // Generar ID único basado en el color
  const gradientId = `accretion-disk-${color}-${mode}`;
  const coreId = `blackhole-core-${color}-${mode}`;

  // Colores consistentes para ambos modos (día y noche)
  const getColors = () => {
    switch(color) {
      case "blue":
        return {
          start: "#0077FF",     
          mid: "#0099FF",       
          end: "#00FFFF",      
          glow: "#00BFFF"
        };
      case "orange":
        return {
          start: "#FF8C00",   
          mid: "#FFA500",      
          end: "#FFD700",            
          glow: "#FF8C00"      
        };
      default:
        return {
          start: "#0077FF",
          mid: "#0099FF",
          end: "#00FFFF",
          glow: "#00BFFF"
        };
    }
  };

  const colors = getColors();
  
  return (
    <svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 640 640" 
      className={`black-hole ${className} ${mode}-mode`}
      preserveAspectRatio="xMidYMid meet"
      style={{
        borderRadius: 'inherit',
        filter: mode === "day" 
          ? `brightness(0.7) contrast(1.8) drop-shadow(0 0 8px rgba(0, 0, 0, 0.9))`
          : `brightness(${0.9 + intensity * 0.2}) contrast(${1 + intensity * 0.3})`,
        overflow: 'hidden'
      }}
    >
      <defs>
        {/* Gradiente radial para el agujero negro */}
        <radialGradient id={coreId} cx="50%" cy="50%" r="50%">
          {mode === "day" ? (
            // Gradiente para modo día - NEGRO TOTAL
            <>
              <stop offset="0%" stopColor="#000000" stopOpacity="1"/>
              <stop offset="50%" stopColor="#000000" stopOpacity="1"/>
              <stop offset="70%" stopColor="#000000" stopOpacity="1"/>
              <stop offset="85%" stopColor="#000000" stopOpacity="0.98"/>
              <stop offset="95%" stopColor="#000000" stopOpacity="0.95"/>
              <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
            </>
          ) : (
            // Gradiente para modo noche
            <>
              <stop offset="0%" stopColor="#000000" stopOpacity="1"/>
              <stop offset="70%" stopColor="#000000" stopOpacity="0.98"/>
              <stop offset="85%" stopColor="#000000" stopOpacity="0.9"/>
              <stop offset="95%" stopColor="#111122" stopOpacity="0.7"/>
              <stop offset="100%" stopColor="#1a1a33" stopOpacity="0"/>
            </>
          )}
        </radialGradient>

        {/* Gradiente para el disco de acreción*/}
        <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
          <stop offset="85%" stopColor="#000000" stopOpacity="0"/>
          <stop offset="87%" stopColor={colors.start} stopOpacity={color === "orange" ? 0.8 * intensity : (mode === "day" ? 0.7 * intensity : 0.5 * intensity)}/>
          <stop offset="90%" stopColor={colors.mid} stopOpacity={color === "orange" ? 0.9 * intensity : (mode === "day" ? 0.9 * intensity : 0.7 * intensity)}/>
          <stop offset="93%" stopColor={colors.mid} stopOpacity={color === "orange" ? 1 * intensity : (mode === "day" ? 1 * intensity : 0.9 * intensity)}/>
          <stop offset="96%" stopColor={colors.end} stopOpacity={color === "orange" ? 0.9 * intensity : (mode === "day" ? 1 * intensity : 0.95 * intensity)}/>
          <stop offset="100%" stopColor={colors.end} stopOpacity={color === "orange" ? 0.8 * intensity : (mode === "day" ? 1 * intensity : 1 * intensity)}/>
        </radialGradient>

        {/* Filtro de brillo*/}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={color === "orange" ? "8" : (mode === "day" ? "6" : "5")} result="blur"/>
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="glow"/>
          <feComposite in="SourceGraphic" in2="glow" operator="over"/>
        </filter>
      </defs>

      {/* Fondo oscuro para modo día */}
      {mode === "day" && (
        <ellipse 
          cx="320" 
          cy="320" 
          rx="300" 
          ry="280" 
          fill="#000000"
          opacity="0.9"
        />
      )}

      {/* Disco de acreción exterior*/}
      <ellipse 
        cx="330" 
        cy="330" 
        rx="320" 
        ry="310" 
        fill={`url(#${gradientId})`} 
        opacity={color === "orange" ? opacity * 0.9 : (mode === "day" ? opacity * 1.1 : opacity)}
        style={{ filter: "url(#glow)" }}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 330 330"
          to={color === "orange" ? "360 330 330" : "390 330 330"}
          dur={`${color === "orange" ? 25 / rotationSpeed : 35 / rotationSpeed}s`}
          repeatCount="indefinite"
        />
      </ellipse>

      {/* Anillo de energía intensa*/}
      <ellipse 
        cx="330" 
        cy="330" 
        rx="300" 
        ry="280" 
        fill="none" 
        stroke={`url(#${gradientId})`} 
        strokeWidth={color === "orange" ? "10" : (mode === "day" ? "8" : "6")} 
        opacity={color === "orange" ? opacity * 0.7 : (mode === "day" ? opacity * 0.9 : opacity * 0.8)}
        style={{ filter: "url(#glow)" }}
      >
        <animate
          attributeName="stroke-width"
          values={color === "orange" ? "10;14;10" : (mode === "day" ? "8;12;8" : "6;10;6")}
          dur="3s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 320 320"
          to="360 320 320"
          dur={`${color === "orange" ? 20 / rotationSpeed : 25 / rotationSpeed}s`}
          repeatCount="indefinite"
        />
      </ellipse>

      {/* Núcleo del agujero negro - forma ovalada*/}
      <ellipse 
        cx="330" 
        cy="330" 
        rx={300 * coreSize} 
        ry={280 * coreSize} 
        fill={`url(#${coreId})`} 
        opacity={mode === "day" ? 1 : opacity}
      >
        <animate
          attributeName="rx"
          values={`${290 * coreSize};${292 * coreSize};${290 * coreSize}`}
          dur="4s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="ry"
          values={`${250 * coreSize};${252 * coreSize};${250 * coreSize}`}
          dur="4s"
          repeatCount="indefinite"
        />
      </ellipse>

      {/* Efecto de partículas energéticas*/}
      <circle cx="320" cy="320" r="280" fill="none" stroke={colors.glow} strokeWidth="2" opacity={color === "orange" ? 0.5 * opacity : (mode === "day" ? 0.6 * opacity : 0.4 * opacity)}>
        <animate
          attributeName="r"
          values="280;285;280"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values={color === "orange" ? "0.5;0.7;0.5" : (mode === "day" ? "0.6;0.8;0.6" : "0.4;0.6;0.4")}
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
};

export default BlackHole;