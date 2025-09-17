"use client";

import { useState } from "react";
import { Star, Send, AlertTriangle } from "lucide-react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

export function ReviewForm({ gameId, onReviewSubmit }) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const { user, token, checkAuth } = useAuth();
    const { theme } = useTheme();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            alert("Please log in to submit reviews");
            return;
        }

        if (rating === 0) {
            alert("Please select a rating");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const isAuthenticated = await checkAuth();
            if (!isAuthenticated) {
                throw new Error("Session expired");
            }

            await axios.get("/sanctum/csrf-cookie", { withCredentials: true });

            const response = await axios.post(
                "/api/games/rate",
                {
                    game_id: gameId,
                    rating: rating,
                    text: reviewText,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                    withCredentials: true,
                }
            );

            const formattedReview = {
                ...response.data,
                user: {
                    username: user.username,
                    name: user.name,
                    avatar: user.profile_pic,
                },
                content: response.data.text,
                rating: response.data.star_rating,
                likes_count: 0,
                is_liked: false,
            };

            if (onReviewSubmit) {
                onReviewSubmit(formattedReview);
            }

            setRating(0);
            setReviewText("");
            setHoveredRating(0);
        } catch (error) {
            console.error("Review submission error:", error);
            setError(error.response?.data?.message || error.message);

            if (error.response?.status === 401) {
                alert("Your session has expired. Please log in again.");
            } else if (error.response?.status === 422) {
                alert(
                    "Validation error: " +
                        Object.values(error.response.data.errors).join("\n")
                );
            } else {
                alert("Failed to submit review. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-6 p-8 rounded-xl bg-lightBg dark:bg-cyber-dark/30 shadow-xl border border-gray-200 dark:border-cyber-purple/50 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-start mb-6">
                <div className={`p-3 rounded-lg mr-4 ${
                    theme === "dark" 
                        ? "bg-yellow-400/20" 
                        : "bg-interactive/10"
                }`}>
                    <Star className={`h-6 w-6 ${
                        theme === "dark" 
                            ? "text-yellow-400" 
                            : "text-interactive"
                    }`} />
                </div>
                <div>
                    <h3 className={`text-2xl font-bold ${
                        theme === "dark" 
                            ? "text-white" 
                            : "text-textLight"
                    }`}>
                        Share Your Experience
                    </h3>
                    <p className={`mt-1 ${
                        theme === "dark" 
                            ? "text-gray-300" 
                            : "text-textLight/70"
                    }`}>
                        Help others by sharing your thoughts about this game
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className={`block text-sm font-semibold ${
                        theme === "dark" 
                            ? "text-gray-300" 
                            : "text-textLight/80"
                    }`}>
                        Your Rating
                    </label>
                    <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="focus:outline-none transition-all duration-150"
                            >
                                <Star
  size={32}
  strokeWidth={1.5}
  className={`${
    (hoveredRating || rating) >= star
      ? "text-[#FFAB00] fill-[#FBC02D]"
      : "text-[#FFAB00] dark:text-[#FFFF00]/80"
  } transition-transform duration-200 hover:scale-125`}
/>
                            </button>
                        ))}
                        <span className={`ml-4 text-lg font-medium ${
                            theme === "dark" 
                                ? "text-gray-300" 
                                : "text-textLight"
                        }`}>
                            {rating > 0
                                ? `${rating} ${rating === 1 ? "star" : "stars"}`
                                : "Not rated"}
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="review-text"
                        className={`block text-sm font-semibold ${
                            theme === "dark" 
                                ? "text-gray-300" 
                                : "text-textLight/80"
                        }`}
                    >
                        Your Detailed Review
                    </label>
                    <div className="relative">
                        <textarea
                            id="review-text"
                            rows={5}
                            className={`w-full px-4 py-3 
  /* Fondo cristal */
  bg-lightBg/20 dark:bg-cyber-dark/20
  /* Borde */
  border border-gray-300 dark:border-cyber-cyan/50 
  /* Efecto glass */
  backdrop-blur-sm dark:backdrop-blur-[6px]
  /* Estilo base */
  rounded-lg text-textLight dark:text-gray-300
  placeholder-textLight/50 dark:placeholder-gray-400/50
  transition-all duration-200
  /* Sombra */
  shadow-sm dark:shadow-cyan-900/10`}
                            placeholder="What did you like or dislike about this game? Would you recommend it?"
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            required
                        />
                        <div className={`absolute bottom-3 right-3 text-xs ${
                            theme === "dark" 
                                ? "text-gray-400 bg-cyber-dark/80 border border-cyber-purple/30" 
                                : "text-textLight/50 bg-lightBg/80"
                        } px-2 py-1 rounded`}>
                            {reviewText.length}/1000
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                    {user ? (
                        <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                theme === "dark" 
                                    ? "bg-cyber-purple/30 border border-cyber-purple/50" 
                                    : "bg-interactive/10"
                            }`}>
                                <span className={`text-sm font-medium ${
                                    theme === "dark" 
                                        ? "text-gray-300" 
                                        : "text-interactive"
                                }`}>
                                    {user.name?.charAt(0) ||
                                        user.email?.charAt(0)}
                                </span>
                            </div>
                            <span className={`text-sm ${
                                theme === "dark" 
                                    ? "text-gray-400" 
                                    : "text-textLight/70"
                            }`}>
                                Posting as{" "}
                                <span className={`font-semibold ${
                                    theme === "dark" 
                                        ? "text-gray-300" 
                                        : "text-interactive"
                                }`}>
                                    {user.name || user.email}
                                </span>
                            </span>
                        </div>
                    ) : (
                        <div className={`text-sm ${
                            theme === "dark" 
                                ? "text-gray-400" 
                                : "text-textLight/60"
                        }`}>
                            Please sign in to submit a review
                        </div>
                    )}

                    <button
  type="submit"
  disabled={isSubmitting || !user}
  className={`inline-flex items-center px-6 py-3 font-medium rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
    ${
        theme === "dark" 
            ? "bg-gradient-to-r from-cyber-pink to-cyber-purple hover:from-cyber-pink/90 hover:to-cyber-purple/90 text-white drop-shadow-[0_0_6px_rgba(255,0,160,0.5)]" 
            : "bg-gradient-to-r from-accent to-accent-light hover:from-accent/90 hover:to-accent-light/90 text-white"
    }`}
>
  {isSubmitting ? (
    <>
      <svg
        className={`animate-spin -ml-1 mr-2 h-4 w-4 ${
            theme === "dark" ? "text-white" : "text-white"
        }`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      Submitting...
    </>
  ) : (
    <>
      <Send className="w-4 h-4 mr-2" />
      Submit Review
    </>
  )}
</button>
                </div>

                {error && (
                    <div className={`mt-4 p-4 rounded-lg border ${
                        theme === "dark" 
                            ? "bg-red-900/20 border-red-800" 
                            : "bg-red-50 border-red-200"
                    }`}>
                        <div className={`flex items-center ${
                            theme === "dark" 
                                ? "text-red-400" 
                                : "text-red-600"
                        }`}>
                            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}