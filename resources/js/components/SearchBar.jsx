// SearchBar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import Loader from "../components/Spinner";

export const SearchBar = ({ onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimeout = useRef(null);
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
        setIsExpanded(false);
        if (onClose) onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [onClose]);

  const formatSearchQuery = (query) => encodeURIComponent(query.trim().replace(/\s+/g, " "));

  const searchGames = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowDropdown(false);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/search-games?query=${formatSearchQuery(searchQuery)}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      const sortedGames = data.games?.sort((a, b) => {
        const exactMatchA = a.name.toLowerCase() === searchQuery.toLowerCase();
        const exactMatchB = b.name.toLowerCase() === searchQuery.toLowerCase();
        if (exactMatchA !== exactMatchB) return exactMatchA ? -1 : 1;
        return (b.metacritic_score || 0) - (a.metacritic_score || 0);
      });

      setResults(sortedGames || []);
      setShowDropdown(true);
    } catch (error) {
      console.error("Error searching games:", error);
      setResults([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim().length >= 2) {
      setLoading(true);
      setShowDropdown(true);
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(() => searchGames(value), 300);
    } else {
      setResults([]);
      setShowDropdown(false);
      setLoading(false);
    }
  };

  const handleSelectGame = (game) => {
    navigate(`/games/${game.slug || game.id}`);
    resetSearch();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      resetSearch();
    }
  };

  const resetSearch = () => {
    setQuery("");
    setResults([]);
    setShowDropdown(false);
    setIsExpanded(false);
    setLoading(false);
    if (onClose) onClose();
  };

  return (
    <div ref={searchRef} className="relative flex items-center max-w-[600px] w-full">
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          aria-label="Open search"
          className={`p-2 rounded-full transition-colors duration-300 ${
            theme === "dark"
              ? "text-pink-400 hover:bg-gray-700"
              : "text-pink-600 hover:bg-pink-100"
          }`}
        >
          <svg
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M6 10.5a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z" />
          </svg>
        </button>
      )}

      {isExpanded && (
        <form
          onSubmit={handleSubmit}
          className={`flex items-center w-full rounded-full shadow-md transition-all duration-300 ${
            theme === "dark"
              ? "bg-gray-900 border border-pink-500"
              : "bg-white border border-pink-500"
          }`}
        >
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search games..."
            className={`flex-grow rounded-full py-2 px-4 text-sm border-none outline-none focus:outline-none focus:ring-0 focus:border-0 appearance-none ${
              theme === "dark"
                ? "bg-gray-900 text-white placeholder-gray-500"
                : "bg-white text-gray-900 placeholder-gray-400"
            }`}
            aria-label="Search games"
          />
          <button
            type="button"
            onClick={resetSearch}
            aria-label="Close search"
            className={`p-2 pr-3 rounded-full transition-colors duration-200 ${
              theme === "dark"
                ? "text-gray-400 hover:text-pink-400"
                : "text-gray-600 hover:text-pink-600"
            }`}
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </form>
      )}

      {showDropdown && (
        <div
          className={`absolute top-full z-50 mt-2 w-full rounded-2xl shadow-xl backdrop-blur-sm bg-opacity-95 max-h-80 overflow-y-auto ${
            theme === "dark"
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
        >
          {loading ? (
 <div className="flex justify-center items-center min-h-[60px] py-2">
  <Loader />
</div>


) : results.length > 0 ? (

            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {results.map((game) => (
                <li key={game.id || game.slug} className="hover:bg-gray-100 dark:hover:bg-gray-700/50">
                  <button
                    onClick={() => handleSelectGame(game)}
                    className="w-full text-left px-6 py-4 flex items-center gap-4 group"
                  >
                    <div className="flex-shrink-0">
                      {game.image_url ? (
                        <img
                          src={game.image_url}
                          alt={game.name}
                          className="w-14 h-18 object-cover rounded-lg group-hover:scale-105 transition-transform"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = "/placeholder-game.png";
                          }}
                        />
                      ) : (
                        <div className="w-14 h-18 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold truncate group-hover:text-pink-500 dark:group-hover:text-pink-400">
                        {game.name}
                      </h3>
                      {game.metacritic_score && (
                        <span className="text-xs block mt-1 text-gray-500 dark:text-gray-400">
                          Metacritic: {game.metacritic_score}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
              No results for "<span className="font-medium text-pink-500">{query}</span>"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
