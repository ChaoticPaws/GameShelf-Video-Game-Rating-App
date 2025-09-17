// ThemeSwitch.jsx
import React from "react";
import { useTheme } from "../contexts/ThemeContext";

const Switch = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <label className="inline-flex items-center relative cursor-pointer select-none">
      <input
        id="toggle"
        type="checkbox"
        className="peer hidden"
        checked={theme === "dark"}
        onChange={toggleTheme}
      />
      <div
        className={`
          relative w-[100px] h-[40px] rounded-full
          bg-white peer-checked:bg-[#04040c]
          after:absolute after:content-[''] after:w-[34px] after:h-[34px]
          after:bg-gradient-to-r from-orange-500 to-yellow-400
          peer-checked:after:from-zinc-900 peer-checked:after:to-zinc-900
          after:rounded-full after:top-[3px] after:left-[3px]
          peer-checked:after:left-[63px]
          peer-checked:after:shadow-[#7700FF]
          shadow-sm duration-300 after:duration-300 after:shadow-md
        `}
      />
      {/* Icono de taza de café - transparente en modo noche */}
      <svg 
        className={`absolute left-[10px] top-1/2 transform -translate-y-1/2 z-10 transition-opacity duration-300 ${
          theme === "dark" ? "opacity-40" : "opacity-100"
        }`} 
        width="22" 
        height="22" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="#854442"
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M10 2v2"/>
        <path d="M14 2v2"/>
        <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/>
        <path d="M6 2v2"/>
      </svg>

      {/* Icono de fantasma - transparente en modo día */}
      <svg 
        className={`absolute right-[8px] top-1/2 transform -translate-y-1/2 z-10 transition-opacity duration-300 ${
          theme === "dark" ? "opacity-100" : "opacity-40"
        }`} 
        width="22" 
        height="22" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="#FF00A0" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M9 10h.01"/>
        <path d="M15 10h.01"/>
        <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/>
      </svg>
    </label>
  );
};

export default Switch;