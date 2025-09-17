import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { Github } from "lucide-react";

export function Footer() {
    const { theme } = useTheme();
    const currentYear = new Date().getFullYear();

    return (
        <footer
            className={`py-8 ${
                theme === "dark"
                    ? "bg-cyber-dark text-cyber-cyan border-t border-cyber-purple/30"
                    : "bg-lightBg/50 text-textLight"
            }`}
        >
            <div className="container mx-auto px-4">
                <div className="flex flex-wrap md:flex-nowrap justify-between gap-8">
                    {/* Logo y descripción */}
                    <div className="flex-shrink-0 max-w-xs">
                        <Link to="/" className="flex items-center">
                            <img
                                src="/images/logo2.png"
                                alt="Logo"
                                className="w-36"
                            />
                        </Link>
                        <p className="mt-3 text-sm leading-relaxed max-w-xs">
                            Track, rate, and discover your next favorite video
                            game.
                        </p>
                        <p
                            className={`mt-2 text-xs ${
                                theme === "dark"
                                    ? "text-cyber-cyan/70"
                                    : "text-textLight/60"
                            }`}
                        >
                            Developed by Rachni & ChaoticPaws
                        </p>
                    </div>

                    {/* Enlaces y redes sociales */}
                    <div className="flex flex-col md:flex-row md:space-x-16 space-y-6 md:space-y-0">
                        {/* Enlaces rápidos */}
                        <div>
                            <h3 className={`font-semibold mb-4 text-sm ${
                                theme === "dark" 
                                    ? "text-cyber-pink" 
                                    : "text-heading"
                            }`}>
                                Links
                            </h3>
                            <ul className="space-y-2">
                                {[
                                    { text: "Home", to: "/" },
                                    { text: "Browse Games", to: "/search" },
                                    { text: "About", to: "#" },
                                    { text: "Privacy Policy", to: "#" },
                                ].map(({ text, to }) => (
                                    <li key={text}>
                                        <Link
                                            to={to}
                                            className={`text-sm transition-colors duration-300 ${
                                                theme === "dark"
                                                    ? "text-cyber-cyan hover:text-cyber-green"
                                                    : "text-textLight hover:text-interactive"
                                            }`}
                                        >
                                            {text}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Redes sociales */}
                        <div>
                            <h3
                                className={`font-semibold mb-4 text-sm ${
                                    theme === "dark"
                                        ? "text-cyber-pink"
                                        : "text-heading"
                                }`}
                            >
                                Connect
                            </h3>
                            <div className="flex space-x-4">
                                <a
                                    href="https://github.com/Rachni"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`transition-colors duration-300 ${
                                        theme === "dark"
                                            ? "text-cyber-cyan hover:text-cyber-green"
                                            : "text-textLight hover:text-interactive"
                                    }`}
                                    aria-label="GitHub"
                                >
                                    <Github size={20} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Derechos de autor */}
                <div
                    className={`mt-10 pt-6 border-t text-center text-sm ${
                        theme === "dark"
                            ? "text-cyber-cyan/70 border-cyber-purple/30"
                            : "text-textLight/60 border-gray-300"
                    }`}
                >
                    <p>&copy; {currentYear} GameShelf.</p>
                    <p className="mt-2">
                        Powered by{" "}
                        <a
                            href="https://rawg.io/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`transition-colors duration-300 ${
                                theme === "dark"
                                    ? "text-cyber-cyan hover:text-cyber-green"
                                    : "text-interactive hover:underline"
                            }`}
                        >
                            RAWG API
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}