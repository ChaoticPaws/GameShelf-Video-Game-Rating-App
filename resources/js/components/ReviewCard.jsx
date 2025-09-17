import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ThumbsUp, Star } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import axios from "axios";

export function ReviewCard({
    review,
    showUser = true,
    showGame = true,
    showGameImage = false,
    maxTextLength = null, 
    className = ""
}) {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [likes, setLikes] = useState(review.likes || 0);
    const [isLiked, setIsLiked] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

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

    const truncateText = (text) => {
        if (!text) return "";
        
        // Para el diseño horizontal, usar truncado por caracteres
        let maxLength = 160; // Caracteres para diseño horizontal
        
        if (maxTextLength) {
            maxLength = maxTextLength;
        }
        
        if (text.length > maxLength) {
            return text.substring(0, maxLength) + '...';
        }
        
        return text;
    };

    const truncatedReview = truncateText(review.text);

    const formatDate = (dateString) => {
        if (!dateString) return null;
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime())
                ? null
                : date.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                  });
        } catch {
            return null;
        }
    };

    const formattedDate = formatDate(review.created_at);

    const handleLike = async () => {
        if (!user) {
            alert("Please log in to like reviews");
            return;
        }

        try {
            const response = await axios.post(
                `/api/reviews/${review.id}/toggle-like`
            );
            setLikes(response.data.likes);
            setIsLiked(response.data.is_liked);
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    return (
        <div
            className={`rounded-2xl p-4 transition-all duration-300 h-full flex ${className}
                ${
                    theme === "dark"
                        ? "bg-cyber-dark/70 border border-cyber-purple/30 backdrop-blur-sm shadow-lg shadow-cyber-purple/20 hover:shadow-cyber-pink/30"
                        : "bg-beige-100/80 border border-brown-light/50 shadow-md shadow-brown-light/20"
                }`}
        >
            {/* Contenedor de imagen y estrellas */}
            {showGame && showGameImage && (
                <div className="flex flex-col items-center mr-4 flex-shrink-0">
                    <div className="flex mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={16}
                                className={`${
                                    star <= review.star_rating
                                        ? "text-yellow-500 fill-yellow-500"
                                        : theme === "dark" 
                                            ? "text-cyber-purple/50" 
                                            : "text-brown/40"
                                } mr-0.5`}
                            />
                        ))}
                    </div>
                    <Link
                        to={`/games/${review.game.slug}`}
                        className={`rounded-xl overflow-hidden transition-all
                            ${theme === "dark" 
                                ? "border-2 border-cyber-cyan/30 hover:border-cyber-cyan" 
                                : "border-2 border-brown/30 hover:border-brown"}
                        `}
                        style={{ width: "80px", height: "80px" }}
                    >
                        <img
                            src={
                                review.game.image_url ||
                                "/placeholder.svg?height=80&width=80"
                            }
                            alt={review.game.name}
                            className="w-full h-full object-cover"
                        />
                    </Link>
                </div>
            )}

            {/* Contenido a la derecha */}
            <div className="flex flex-col flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                    {showGame && (
                        <Link
                            to={`/games/${review.game.slug}`}
                            className={`font-semibold transition-colors text-base
                                ${theme === "dark" 
                                    ? "text-cyber-cyan hover:text-cyber-pink" 
                                    : "text-brown-dark hover:text-brown"}
                            `}
                        >
                            {review.game.name}
                        </Link>
                    )}
                    
                    {showUser && (
                        <Link
                            to={`/users/${review.user.name}`}
                            className="flex items-center gap-2 group ml-2"
                        >
                            <div className="text-right">
                                <div className={`font-medium transition-colors text-sm
                                    ${theme === "dark" 
                                        ? "text-cyber-green group-hover:text-cyber-cyan" 
                                        : "text-brown-dark group-hover:text-brown"}
                                `}>
                                    {review.user.name}
                                </div>
                                {formattedDate && (
                                    <div className={`transition-colors text-xs
                                        ${theme === "dark" 
                                            ? "text-cyber-cyan/70" 
                                            : "text-brown/70"}
                                    `}>
                                        {formattedDate}
                                    </div>
                                )}
                            </div>
                            <div className="relative flex-shrink-0">
  <img
    src={
      review.user.avatar ||
      "/placeholder.svg?height=32&width=32"
    }
    alt={review.user.name}
    className={`w-8 h-8 object-cover border-2 transition-all rounded-full ${
      theme === "dark" 
        ? "border-cyber-purple/50 group-hover:border-cyber-cyan" 
        : "border-brown/40 group-hover:border-brown"
    }`}
  />
                            </div>
                        </Link>
                    )}
                </div>

                {/* Texto de la reseña */}
                <p className={`text-sm leading-relaxed mb-3 flex-grow overflow-hidden
                    ${theme === "dark" ? "text-gray-300" : "text-brown-dark/90"}
                `}>
                    {truncatedReview}
                </p>

                {/* Botón de like */}
                <div className="flex justify-end">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all text-sm
                            ${theme === "dark"
                                ? isLiked
                                    ? "bg-cyber-pink/20 text-cyber-pink ring-1 ring-cyber-pink/30"
                                    : "text-gray-400 hover:bg-cyber-dark/80 hover:text-cyber-cyan"
                                : isLiked
                                    ? "bg-brown/20 text-brown ring-1 ring-brown/30"
                                    : "text-brown/70 hover:bg-beige-200/50 hover:text-brown"
                            }
                            hover:scale-105 active:scale-95
                        `}
                    >
                        <ThumbsUp
                            size={16}
                            className={isLiked ? (theme === "dark" ? "fill-cyber-pink" : "fill-brown") : ""}
                        />
                        <span className="font-medium">{likes}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}