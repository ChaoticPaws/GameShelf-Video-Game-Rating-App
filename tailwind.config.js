/** @type {import('tailwindcss').Config} */
module.exports = {   
    content: [
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.{js,jsx,ts,tsx}",
    ],
darkMode: ["class"],
    theme: {
        extend: {
            keyframes: {
                scan: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                pulseGlow: {
                    '0%, 100%': { 
                        boxShadow: '0 0 10px #ff00ff, 0 0 20px #00ffff, 0 0 30px #ff00ff' 
                    },
                    '50%': { 
                        boxShadow: '0 0 20px #00ffff, 0 0 40px #ff00ff, 0 0 60px #00ffff' 
                    },
                },
                glitch: {
                    '0%': { clip: 'rect(0, 9999px, 0, 0)' },
                    '5%': { clip: 'rect(0, 9999px, 100%, 0)', transform: 'skew(0.5deg)' },
                    '10%': { clip: 'rect(0, 9999px, 0, 0)' },
                    '15%': { clip: 'rect(0, 9999px, 100%, 0)', transform: 'skew(-0.5deg)' },
                    '20%, 100%': { clip: 'rect(0, 9999px, 0, 0)' },
                },
            },
            animation: {
                scan: 'scan 2s linear infinite',
                pulseGlow: 'pulseGlow 2s infinite',
                glitch: 'glitch 3s infinite',
            },
            colors: {
                // Colores base
                header: "#be9b7b", 
                darkBg: "#1f2833", 
                lightBg: "#fff4e6",

                // Colores interactivos
                interactive: "#854442", 
                interactiveHover: "#6b3635", 

                // Colores tipográficos
                heading: {
                    DEFAULT: "#4b3832", 
                    dark: "#FF0059"  // Rosa neón cyberpunk
                },
                textLight: "#4b3832", 
                textDark: "#e2e8f0",  

                // Colores de acento y utilidades
                accent: {
                    DEFAULT: "#854442",  
                    light: "#a85d5b",   
                    dark: "#6b3635",     
                },
                
                // Colores marrones
                brown: {
                    light: "#be9b7b",   
                    DEFAULT: "#854442",  
                    dark: "#4b3832",    
                    darker: "#3c2f2f",   
                },
                
                // Paleta cyberpunk para modo noche
                cyber: {
                    pink: "#FF0059",
                    cyan: "#00F5FF",     
                    purple: "#7700FF",   
                    green: "#00FF47",    
                    black: "#000000",    
                    dark: "#0A0A1F",     
                },
                
                // Colores para estados
                success: "#10b981",     
                warning: "#f59e0b",     
                error: "#ef4444",       

                // Compatibilidad con shadcn/ui
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                
                // Alias para modo claro/oscuro
                light: {
                    bg: "#fff4e6",       
                    text: "#4b3832"    
                },
                dark: {
                    bg: "#0A0A1F",  
                    text: "#E0E0E0" 
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            container: {
                center: true,
                padding: {
                    DEFAULT: "1rem",
                    sm: "2rem",
                    lg: "4rem",
                    xl: "5rem",
                },
            },
            // Extender tipografía
            typography: (theme) => ({
                DEFAULT: {
                    css: {
                        color: theme("colors.textLight"),
                        h1: { 
                            color: theme("colors.heading.DEFAULT"),
                            fontSize: '2.5rem',
                            fontWeight: '800',
                        },
                        h2: { 
                            color: theme("colors.heading.DEFAULT"),
                            fontSize: '2rem',
                            fontWeight: '700',
                        },
                        h3: { 
                            color: theme("colors.heading.DEFAULT"),
                            fontSize: '1.75rem',
                            fontWeight: '600',
                        },
                        a: {
                            color: theme("colors.interactive"),
                            fontWeight: '500',
                            "&:hover": {
                                color: theme("colors.interactiveHover"),
                                textDecoration: 'underline',
                            },
                        },
                    },
                },
                dark: {
                    css: {
                        color: theme("colors.textDark"),
                        h1: { 
                            color: theme("colors.heading.dark"),
                            textShadow: "0 0 10px rgba(255, 0, 160, 0.5)"
                        },
                        h2: { 
                            color: theme("colors.cyber.cyan"),
                            textShadow: "0 0 8px rgba(0, 245, 255, 0.5)"
                        },
                        h3: { 
                            color: theme("colors.cyber.green"),
                            textShadow: "0 0 8px rgba(0, 255, 71, 0.5)"
                        },
                        a: {
                            color: theme("colors.cyber.cyan"),
                            fontWeight: '500',
                            textShadow: "0 0 5px rgba(0, 245, 255, 0.3)",
                            "&:hover": {
                                color: theme("colors.cyber.pink"),
                                textShadow: "0 0 10px rgba(255, 0, 160, 0.5)",
                            },
                        },
                        strong: {
                            color: theme("colors.cyber.pink"),
                        },
                        code: {
                            color: theme("colors.cyber.green"),
                            backgroundColor: "#1a1a2e",
                            padding: "2px 6px",
                            borderRadius: "4px",
                        },
                    },
                },
            }),
        },
    },
    
    plugins: [
        require("@tailwindcss/typography"),
        require("@tailwindcss/forms"),
        require("@tailwindcss/line-clamp"),
        require("tailwindcss-animate"),
    ],
};