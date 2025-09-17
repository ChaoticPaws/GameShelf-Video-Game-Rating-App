"use client";

import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { SearchBar } from "../components/SearchBar";
import { useTheme } from "../contexts/ThemeContext";

export function MainLayout() {
    const [showSearchBar, setShowSearchBar] = useState(false);
    const { theme } = useTheme();

    const toggleSearchBar = () => {
        setShowSearchBar((prev) => !prev);
    };

   return (
  <div className="relative flex flex-col min-h-screen">
    {/* Modo día */}
<div className="fixed inset-0 -z-50 overflow-hidden">
  <div 
    className={`absolute inset-0 transition-opacity duration-500 ${
      theme === 'dark' ? 'opacity-0' : 'opacity-100' 
    }`}
    style={{ 
      background: "linear-gradient(135deg, #fff4e6 0%, #f5e8d8 50%, #ebe0d2 100%)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
      transform: "none !important",
      filter: "brightness(1.05) contrast(1.1)" 
    }}
  />
      
     {/* Modo Noche */}
<div 
  className={`absolute inset-0 transition-opacity duration-500 ${
    theme === 'dark' ? 'opacity-100' : 'opacity-0'
  }`}
  style={{ 
    background: "linear-gradient(135deg, #001F3F 0%, #003366 50%, #001A33 100%)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    transform: "none !important",
    filter: "brightness(0.9) contrast(1.2)" 
  }}
/>
                {/* Overlay sutil */}
                <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />
            </div>

            {/* Contenido principal */}
            <div className="relative z-10">
                <Header toggleSearchBar={toggleSearchBar} />

                {showSearchBar && (
                    <div className="fixed top-16 z-[110] w-full flex justify-center px-4 bg-lightBg dark:bg-header shadow-md">
                        <div className="w-full max-w-4xl py-2">
                            <SearchBar onClose={toggleSearchBar} />
                        </div>
                    </div>
                )}

                <main className="flex-grow container mx-auto px-4 py-6 mt-4">
                    <Outlet />
                </main>

                <Footer />
            </div>
        </div>
    );
}