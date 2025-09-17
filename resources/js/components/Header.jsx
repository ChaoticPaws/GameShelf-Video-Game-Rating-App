"use client";

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { SearchBar } from "./SearchBar";
import ThemeSwitch from "./ThemeSwitch";

export const Header = ({ toggleSearchBar }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    setShowUserMenu(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-all duration-500 ease-in-out ${
          theme === "dark"
            ? "bg-cyber-dark/30 border-cyber-purple/30 shadow-[0_2px_30px_-10px_rgba(0,0,0,0.3)]"
            : "bg-lightBg/30 border-gray-200/30 shadow-[0_2px_30px_-10px_rgba(0,0,0,0.1)]"
        }`}
        style={{ height: "4rem" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          {/* Logo a la izquierda*/}
          <Link to="/" className="flex-shrink-0">
            <img src="/images/logo2.png" alt="Logo" className="w-40" />
          </Link>

          {/* Contenedor flexible para el resto */}
          <div className="flex items-center flex-1 justify-between ml-6">
           
            <nav className="hidden md:flex space-x-6 min-w-[150px]">
              <Link
                to="/"
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-cyber-cyan" : "text-textLight"
                } hover:text-interactive transition-colors dark:hover:text-cyber-green`}
              >
                Home
              </Link>
              <Link
                to="/games"
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-cyber-cyan" : "text-textLight"
                } hover:text-interactive transition-colors dark:hover:text-cyber-green`}
              >
                Games
              </Link>
            </nav>

            {/* Barra de búsqueda*/}
            <div className="hidden md:block flex-1 max-w-md ml-8">
              <SearchBar />
            </div>

            {/* Contenedor para Auth y ThemeSwitch SOLO en escritorio */}
            <div className="hidden md:flex items-center space-x-4 ml-8">
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center max-w-xs rounded-full focus:outline-none"
                    aria-label="User menu"
                  >
                    <div className={`h-8 w-8 rounded-full overflow-hidden border-2 ${
                      theme === "dark" 
                        ? "border-cyber-cyan hover:border-cyber-green" 
                        : "border-interactive hover:border-interactiveHover"
                    } transition-colors`}>
                      {user?.avatar ? (
                        <img
                          src={user.avatar || "/images/default-avatar.png"}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className={`h-full w-full flex items-center justify-center ${
                          theme === "dark" ? "bg-cyber-cyan" : "bg-interactive"
                        }`}>
                          <span className="text-white text-xs font-bold">
                            {user?.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-lightBg dark:bg-cyber-dark ring-1 ring-black ring-opacity-5 divide-y divide-gray-200 dark:divide-cyber-purple/30">
                      <div className="py-1">
                        <Link
                          to={`/users/${user?.name}`}
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-sm text-textLight dark:text-cyber-cyan hover:bg-gray-100 dark:hover:bg-cyber-purple/20"
                        >
                          Your Profile
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-sm text-textLight dark:text-cyber-cyan hover:bg-gray-100 dark:hover:bg-cyber-purple/20"
                        >
                          Settings
                        </Link>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-textLight dark:text-cyber-cyan hover:bg-gray-100 dark:hover:bg-cyber-purple/20"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      theme === "dark"
                        ? "text-cyber-cyan hover:text-cyber-green"
                        : "text-textLight hover:text-interactive"
                    }`}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-sm ${
                      theme === "dark"
                        ? "bg-cyber-cyan hover:bg-cyber-green text-cyber-dark"
                        : "bg-interactive hover:bg-interactiveHover text-white"
                    }`}
                  >
                    Sign up
                  </Link>
                </>
              )}

              {/* Switch de tema a la derecha*/}
              <div>
                <ThemeSwitch checked={theme === "dark"} onChange={toggleTheme} />
              </div>
            </div>
          </div>

          {/* Menú hamburguesa y elementos móviles */}
          <div className="md:hidden flex items-center justify-end flex-1 space-x-3 ml-auto z-50">
            {/* Barra de búsqueda en móvil - en el header */}
            <div className="md:hidden flex-1 max-w-xs mx-2">
              <SearchBar />
            </div>

            {/* Switch tema móvil */}
            <ThemeSwitch checked={theme === "dark"} onChange={toggleTheme} />

            {/* Botón menú hamburguesa móvil */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`p-2 rounded-md transition-colors duration-200 ${
                theme === "dark"
                  ? "text-cyber-cyan hover:text-cyber-green bg-cyber-dark/30 backdrop-blur-xl border border-cyber-purple/30"
                  : "text-textLight/80 hover:text-interactive bg-lightBg/30 backdrop-blur-xl border border-gray-200/30"
              }`}
              aria-label="Toggle menu"
            >
              {showMobileMenu ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Menú hamburguesa desplegable solo en móvil, fuera del header */}
      {showMobileMenu && (
        <div
          className={`md:hidden fixed top-16 left-0 w-full z-40 px-4 pt-4 pb-3 space-y-1 backdrop-blur-md ${
            theme === "dark"
              ? "bg-cyber-dark/90 text-cyber-cyan"
              : "bg-lightBg/90 text-textLight"
          }`}
        >
          <Link
            to="/"
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-cyber-purple/20 dark:hover:bg-cyber-purple/20"
            onClick={() => setShowMobileMenu(false)}
          >
            Home
          </Link>
          <Link
            to="/games"
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-cyber-purple/20 dark:hover:bg-cyber-purple/20"
            onClick={() => setShowMobileMenu(false)}
          >
            Games
          </Link>

          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-cyber-purple/20 dark:hover:bg-cyber-purple/20"
                onClick={() => setShowMobileMenu(false)}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-cyber-purple/20 dark:hover:bg-cyber-purple/20"
                onClick={() => setShowMobileMenu(false)}
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              <Link
                to={`/users/${user?.name}`}
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-cyber-purple/20 dark:hover:bg-cyber-purple/20"
                onClick={() => setShowMobileMenu(false)}
              >
                Your Profile
              </Link>
              <Link
                to="/settings"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-cyber-purple/20 dark:hover:bg-cyber-purple/20"
                onClick={() => setShowMobileMenu(false)}
              >
                Settings
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-cyber-purple/20 dark:hover:bg-cyber-purple/20"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
};