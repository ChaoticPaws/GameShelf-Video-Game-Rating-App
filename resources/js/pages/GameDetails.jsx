"use client";
import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { RatingStars } from "../components/RatingStars";
import { ReviewCard } from "../components/ReviewCard";
import { ReviewForm } from "../components/ReviewForm";
import { GameDetailsSkeleton } from "../components/GameDetailsSkeleton";
import {
    Heart,
    Plus,
    ChevronDown,
    ExternalLink,
    X,
    Calendar,
    Users,
    Monitor,
    Star,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    Bookmark,
} from "lucide-react";

const LazyImage = memo(
    ({ src, alt, className, onClick, priority = false, ...props }) => {
        const [loaded, setLoaded] = useState(false);
        const [error, setError] = useState(false);

        const handleLoad = useCallback(() => {
            setLoaded(true);
        }, []);

        const handleError = useCallback(() => {
            setError(true);
            setLoaded(true);
        }, []);

        return (
            <div className={`relative ${className}`} onClick={onClick}>
                {!loaded && (
                    <div className="absolute inset-0 bg-gray-300 dark:bg-gray-700 animate-pulse rounded" />
                )}
                <img
                    src={error ? "/placeholder.svg" : src}
                    alt={alt}
                    className={`${className} transition-opacity duration-300 ${
                        loaded ? "opacity-100" : "opacity-0"
                    }`}
                    loading={priority ? "eager" : "lazy"}
                    onLoad={handleLoad}
                    onError={handleError}
                    {...props}
                />
            </div>
        );
    }
);

LazyImage.displayName = "LazyImage";

const SmartDescription = memo(({ text, maxCollapsedChars = 300 }) => {
    const [expanded, setExpanded] = useState(false);
    const [expandedSections, setExpandedSections] = useState({});

    const processedText = useMemo(() => {
        if (!text) return null;

        const cleanText = text
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");

        const detectSections = (content) => {
            const sectionRegex = /(\n[A-Z][A-Z\s]+[!:-]|\n-{3,})/g;
            const sections = content
                .split(sectionRegex)
                .filter((part) => part.trim().length > 0);

            if (sections.length <= 1) {
                return content
                    .split(/(\n{2,})/g)
                    .filter((part) => part.trim().length > 0);
            }
            return sections;
        };

        return {
            cleanText,
            parts: detectSections(cleanText),
        };
    }, [text]);

    const toggleExpanded = useCallback(() => setExpanded((prev) => !prev), []);

    const toggleSection = useCallback((sectionTitle) => {
        setExpandedSections((prev) => ({
            ...prev,
            [sectionTitle]: !prev[sectionTitle],
        }));
    }, []);

    if (!processedText) return null;

    if (processedText.parts.length <= 1) {
        const shouldTruncate =
            processedText.cleanText.length > maxCollapsedChars && !expanded;
        const displayText = shouldTruncate
            ? `${processedText.cleanText.substring(0, maxCollapsedChars)}...`
            : processedText.cleanText;

        return (
            <div className="prose prose-sm max-w-none dark:prose-invert prose-p:text-textLight dark:prose-p:text-textDark">
                {displayText.split("\n\n").map((paragraph, i) => (
                    <p key={i} className="mb-4 last:mb-0">
                        {paragraph}
                    </p>
                ))}
                {processedText.cleanText.length > maxCollapsedChars && (
                    <button
                        onClick={toggleExpanded}
                        className="text-interactive hover:text-interactiveHover dark:text-cyan-400 dark:hover:text-cyan-300 font-medium mt-2"
                    >
                        {expanded ? "Show less" : "Read more"}
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {processedText.parts.map((part, index) => {
                const isTitle = /[A-Z\s]+[!:-]|^-{3,}$/.test(part.trim());

                if (isTitle) {
                    const sectionTitle = part
                        .trim()
                        .replace(/[:!-]+$/, "")
                        .trim();
                    const sectionContent =
                        index + 1 < processedText.parts.length
                            ? processedText.parts[index + 1]
                            : "";
                    const isExpanded = expandedSections[sectionTitle] !== false;
                    const shouldTruncate =
                        sectionContent.length > maxCollapsedChars;

                    return (
                        <div
                            key={index}
                            className="border-l-4 border-accent pl-4"
                        >
                            <h3 className="font-bold text-lg text-accent mb-3">
                                {sectionTitle}
                            </h3>
                            <div className="prose prose-sm max-w-none dark:prose-invert prose-p:text-textLight dark:prose-p:text-textDark">
                                {sectionContent
                                    .split("\n\n")
                                    .map((paragraph, i) => (
                                        <p key={i} className="mb-3 last:mb-0">
                                            {shouldTruncate &&
                                            !isExpanded &&
                                            i === 0
                                                ? `${paragraph.substring(
                                                      0,
                                                      maxCollapsedChars
                                                  )}...`
                                                : paragraph}
                                        </p>
                                    ))}
                                {shouldTruncate && (
                                    <button
                                        onClick={() =>
                                            toggleSection(sectionTitle)
                                        }
                                        className="text-interactive hover:text-interactiveHover dark:text-cyan-400 dark:hover:text-cyan-300 font-medium mt-2"
                                    >
                                        {isExpanded ? "Show less" : "Read more"}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                }
                return null;
            })}
        </div>
    );
});

SmartDescription.displayName = "SmartDescription";

const HorizontalScreenshotCarousel = memo(
    ({ screenshots, gameName, onImageClick }) => {
        const [currentIndex, setCurrentIndex] = useState(0);
        const [visibleCount, setVisibleCount] = useState(4);

        useEffect(() => {
            const updateVisibleCount = () => {
                const width = window.innerWidth;
                if (width < 640) setVisibleCount(1);
                else if (width < 768) setVisibleCount(2);
                else if (width < 1024) setVisibleCount(3);
                else setVisibleCount(4);
            };

            updateVisibleCount();
            window.addEventListener("resize", updateVisibleCount);
            return () =>
                window.removeEventListener("resize", updateVisibleCount);
        }, []);

        const nextSlide = useCallback(() => {
            setCurrentIndex((prev) =>
                Math.min(prev + 1, screenshots.length - visibleCount)
            );
        }, [screenshots.length, visibleCount]);

        const prevSlide = useCallback(() => {
            setCurrentIndex((prev) => Math.max(prev - 1, 0));
        }, []);

        const canGoNext = currentIndex < screenshots.length - visibleCount;
        const canGoPrev = currentIndex > 0;
        const remainingImages =
            screenshots.length - (currentIndex + visibleCount);

        if (!screenshots?.length) return null;

        return (
            <div className="relative group">
                {/* Screenshots Container */}
                <div className="overflow-hidden rounded-lg">
                    <div
                        className="flex gap-4 transition-transform duration-300 ease-in-out"
                        style={{
                            transform: `translateX(-${
                                currentIndex * (100 / visibleCount)
                            }%)`,
                        }}
                    >
                        {screenshots.map((shot, index) => (
                            <div
                                key={shot.id || index}
                                className="relative flex-shrink-0 cursor-pointer group/item"
                                style={{
                                    width: `calc(${
                                        100 / visibleCount
                                    }% - 12px)`,
                                }}
                                onClick={() => onImageClick(index)}
                            >
                                <div className="aspect-video bg-gray-300 dark:bg-gray-700 rounded-lg overflow-hidden">
                                    <LazyImage
                                        src={shot.image || "/placeholder.svg"}
                                        alt={`${gameName} screenshot ${
                                            index + 1
                                        }`}
                                        className="w-full h-full object-cover transition-transform group-hover/item:scale-105"
                                        priority={index < 4}
                                    />
                                </div>

                                {/* Show +X indicator on last visible image if there are more */}
                                {index === currentIndex + visibleCount - 1 &&
                                    remainingImages > 0 && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                                            <span className="text-white font-bold text-lg">
                                                +{remainingImages}
                                            </span>
                                        </div>
                                    )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Arrows - Inside the carousel */}
                {canGoPrev && (
                    <button
                        onClick={prevSlide}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
                    >
                        <ChevronLeft size={20} />
                    </button>
                )}

                {canGoNext && (
                    <button
                        onClick={nextSlide}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
                    >
                        <ChevronRight size={20} />
                    </button>
                )}
            </div>
        );
    }
);

HorizontalScreenshotCarousel.displayName = "HorizontalScreenshotCarousel";

const ScreenshotGallery = memo(({ screenshots, gameName, onImageClick }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [visibleCount, setVisibleCount] = useState(4);

    useEffect(() => {
        const updateVisibleCount = () => {
            const width = window.innerWidth;
            if (width < 640) setVisibleCount(1);
            else if (width < 768) setVisibleCount(2);
            else if (width < 1024) setVisibleCount(3);
            else setVisibleCount(4);
        };

        updateVisibleCount();
        window.addEventListener("resize", updateVisibleCount);
        return () => window.removeEventListener("resize", updateVisibleCount);
    }, []);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) =>
            Math.min(prev + 1, screenshots.length - visibleCount)
        );
    }, [screenshots.length, visibleCount]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }, []);

    const canGoNext = currentIndex < screenshots.length - visibleCount;
    const canGoPrev = currentIndex > 0;
    const remainingImages = screenshots.length - (currentIndex + visibleCount);

    if (!screenshots?.length) return null;

    return (
        <div className="relative group">
            {/* Screenshots Container */}
            <div className="overflow-hidden rounded-lg">
                <div
                    className="flex gap-4 transition-transform duration-300 ease-in-out"
                    style={{
                        transform: `translateX(-${
                            currentIndex * (100 / visibleCount)
                        }%)`,
                    }}
                >
                    {screenshots.map((shot, index) => (
                        <div
                            key={shot.id || index}
                            className="relative flex-shrink-0 cursor-pointer group/item"
                            style={{
                                width: `calc(${100 / visibleCount}% - 12px)`,
                            }}
                            onClick={() => onImageClick(index)}
                        >
                            <div className="aspect-video bg-gray-300 dark:bg-gray-700 rounded-lg overflow-hidden">
                                <LazyImage
                                    src={shot.image || "/placeholder.svg"}
                                    alt={`${gameName} screenshot ${index + 1}`}
                                    className="w-full h-full object-cover transition-transform group-hover/item:scale-105"
                                    priority={index < 4}
                                />
                            </div>

                            {/* Show +X indicator on last visible image if there are more */}
                            {index === currentIndex + visibleCount - 1 &&
                                remainingImages > 0 && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                                        <span className="text-white font-bold text-lg">
                                            +{remainingImages}
                                        </span>
                                    </div>
                                )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Arrows - Inside the carousel */}
            {canGoPrev && (
                <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
                >
                    <ChevronLeft size={20} />
                </button>
            )}

            {canGoNext && (
                <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
                >
                    <ChevronRight size={20} />
                </button>
            )}
        </div>
    );
});

ScreenshotGallery.displayName = "ScreenshotGallery";

const useGameState = () => {
    const [gameData, setGameData] = useState({
        game: null,
        reviews: [],
        userLists: [],
        userRating: 0,
        isFavorite: false,
        isCompleted: false,
        isInWishlist: false,
        isLoading: true,
        error: null,
        successMessage: null,
    });

    const updateGameData = useCallback((updates) => {
        setGameData((prev) => ({ ...prev, ...updates }));
    }, []);

    return [gameData, updateGameData];
};

export function GameDetails() {
    const { slug } = useParams();
    const { user, token } = useAuth();
    const { theme } = useTheme();
    const [gameData, updateGameData] = useGameState();
    const [isAddToListOpen, setIsAddToListOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [screenshotModal, setScreenshotModal] = useState({
        isOpen: false,
        currentIndex: 0,
    });

    const {
        game,
        reviews,
        userLists,
        userRating,
        isFavorite,
        isCompleted,
        isInWishlist,
        isLoading,
        error,
        successMessage,
    } = gameData;

    const toggleWishlist = useCallback(async () => {
        if (!user?.name || !token || !game?.id) return;

        try {
            await axios.get("/sanctum/csrf-cookie", { withCredentials: true });

            if (isInWishlist) {
                await axios.delete(
                    `/api/users/${user.name}/wishlist/${game.id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        withCredentials: true,
                    }
                );
            } else {
                await axios.post(
                    `/api/users/${user.name}/wishlist`,
                    { game_id: game.id },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        withCredentials: true,
                    }
                );
            }
            updateGameData({ isInWishlist: !isInWishlist });
        } catch (error) {
            console.error("Error toggling wishlist status:", error);
            alert("Failed to update wishlist status. Please try again.");
        }
    }, [user?.name, token, game?.id, isInWishlist, updateGameData]);
    const toggleCompleted = useCallback(async () => {
        if (!user?.name || !token || !game?.id) return;

        try {
            await axios.get("/sanctum/csrf-cookie", { withCredentials: true });

            if (isCompleted) {
                await axios.delete(
                    `/api/users/${user.name}/completed/${game.id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        withCredentials: true,
                    }
                );
            } else {
                await axios.post(
                    `/api/users/${user.name}/completed`,
                    { game_id: game.id },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        withCredentials: true,
                    }
                );
            }
            updateGameData({ isCompleted: !isCompleted });
        } catch (error) {
            console.error("Error toggling completed status:", error);
            alert("Failed to update completion status. Please try again.");
        }
    }, [user?.name, token, game?.id, isCompleted, updateGameData]);

    const toggleFavorite = useCallback(async () => {
        if (!user?.name || !token || !game?.id) return;

        try {
            await axios.get("/sanctum/csrf-cookie", { withCredentials: true });

            if (isFavorite) {
                await axios.delete(
                    `/api/users/${user.name}/favorites/${game.id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        withCredentials: true,
                    }
                );
            } else {
                await axios.post(
                    `/api/users/${user.name}/favorites`,
                    { game_id: game.id },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        withCredentials: true,
                    }
                );
            }
            updateGameData({ isFavorite: !isFavorite });
        } catch (error) {
            console.error("Error toggling favorite:", error);
            alert("Failed to update favorite status. Please try again.");
        }
    }, [user?.name, token, game?.id, isFavorite, updateGameData]);

    const fetchGameDetails = useCallback(async () => {
        if (!slug) return;

        updateGameData({ isLoading: true, error: null });

        try {
            const [gameResponse, reviewsResponse] = await Promise.all([
                axios.get(`/api/games/${slug}`),
                axios.get(`/api/games/${slug}/reviews?limit=20`),
            ]);

            const formattedReviews = reviewsResponse.data.map((review) => ({
                ...review,
                user: {
                    username: review.user.name,
                    name: review.user.name,
                    avatar: review.user.profile_pic,
                },
                content: review.text,
                rating: review.star_rating,
                likes_count: review.likes || 0,
                is_liked: review.is_liked || false,
            }));

            updateGameData({
                game: gameResponse.data,
                reviews: formattedReviews,
                isLoading: false,
            });
        } catch (error) {
            console.error("Error fetching game details:", error);
            updateGameData({
                error: "Failed to load game details. Please try again.",
                isLoading: false,
            });
        }
    }, [slug, updateGameData]);

    const fetchUserLists = useCallback(async () => {
        if (!user?.name || !token) return;

        try {
            const response = await axios.get(`/api/users/${user.name}/lists`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                withCredentials: true,
            });

            updateGameData({ userLists: response.data || [] });
        } catch (error) {
            console.error("Error fetching user lists:", error);
            updateGameData({ userLists: [] });
        }
    }, [user?.name, token, updateGameData]);

    const handleAddToList = useCallback(
        async (listId) => {
            if (!game?.id || !token) return;

            try {
                await axios.get("/sanctum/csrf-cookie", {
                    withCredentials: true,
                });

                const response = await axios.post(
                    `/api/lists/${listId}/games`,
                    { game_id: game.id },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        withCredentials: true,
                    }
                );

                if (response.status === 201) {
                    updateGameData({ successMessage: "Game added to list!" });
                    setIsAddToListOpen(false);
                }
            } catch (error) {
                let errorMessage = "There was an error. Please try again.";

                if (error.response) {
                    switch (error.response.status) {
                        case 401:
                            errorMessage = "Not authorized";
                            break;
                        case 404:
                            errorMessage = "List not found";
                            break;
                        case 409:
                            errorMessage = "Game already in list";
                            break;
                        case 500:
                            errorMessage = "Server error";
                            break;
                    }
                }

                alert(errorMessage);
            }
        },
        [game?.id, token, updateGameData]
    );

    const openScreenshotModal = useCallback((index) => {
        setScreenshotModal({
            isOpen: true,
            currentIndex: index,
        });
        document.body.style.overflow = "hidden";
    }, []);

    const closeScreenshotModal = useCallback(() => {
        setScreenshotModal({
            isOpen: false,
            currentIndex: 0,
        });
        document.body.style.overflow = "unset";
    }, []);

    const navigateScreenshot = useCallback(
        (direction) => {
            setScreenshotModal((prev) => {
                const newIndex =
                    direction === "next"
                        ? (prev.currentIndex + 1) % game.screenshots.length
                        : (prev.currentIndex - 1 + game.screenshots.length) %
                          game.screenshots.length;

                return {
                    ...prev,
                    currentIndex: newIndex,
                };
            });
        },
        [game?.screenshots?.length]
    );

    useEffect(() => {
        fetchGameDetails();
    }, [fetchGameDetails]);

    useEffect(() => {
        if (user?.name && token && game) {
            fetchUserLists();
        }
    }, [user?.name, token, game, fetchUserLists]);

    useEffect(() => {
        if (!screenshotModal.isOpen) return;

        const handleKeyPress = (e) => {
            if (e.key === "ArrowLeft") navigateScreenshot("prev");
            if (e.key === "ArrowRight") navigateScreenshot("next");
            if (e.key === "Escape") closeScreenshotModal();
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [screenshotModal.isOpen, navigateScreenshot, closeScreenshotModal]);

    const userScore = useMemo(() => {
        if (reviews.length === 0) return "--";
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return (sum / reviews.length).toFixed(1);
    }, [reviews]);

    const openModal = useCallback(() => setIsModalOpen(true), []);
    const closeModal = useCallback(() => setIsModalOpen(false), []);

    if (isLoading) {
        return <GameDetailsSkeleton />;
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4 text-accent">Error</h2>
                <p className="mb-6 text-textLight dark:text-textDark">
                    {error}
                </p>
                <Link
                    to="/"
                    className="px-6 py-3 bg-accent hover:bg-accent-dark text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                    Back to Home
                </Link>
            </div>
        );
    }

    if (!game) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4 text-accent">
                    Game not found
                </h2>
                <p className="mb-6 text-textLight dark:text-textDark">
                    The game you're looking for doesn't exist or has been
                    removed.
                </p>
                <Link
                    to="/"
                    className="px-6 py-3 bg-accent hover:bg-accent-dark text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                    Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative">
            {/* Modal de screenshots en pantalla completa */}
            {screenshotModal.isOpen && game?.screenshots && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
                    <button
                        onClick={closeScreenshotModal}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-20"
                    >
                        <X size={24} className="text-white" />
                    </button>

                    <div className="relative w-full h-full flex items-center justify-center">
                        <LazyImage
                            src={
                                game.screenshots[screenshotModal.currentIndex]
                                    ?.image || "/placeholder.svg"
                            }
                            alt={`${game.name} screenshot ${
                                screenshotModal.currentIndex + 1
                            }`}
                            className="max-w-full max-h-full object-contain rounded-lg"
                            priority={true}
                        />

                        {game.screenshots.length > 1 && (
                            <>
                                <button
                                    onClick={() => navigateScreenshot("prev")}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all z-10"
                                >
                                    <ChevronLeft size={24} />
                                </button>

                                <button
                                    onClick={() => navigateScreenshot("next")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all z-10"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}

                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 px-4 py-2 rounded-full">
                            <span className="text-white font-medium">
                                {screenshotModal.currentIndex + 1} /{" "}
                                {game.screenshots.length}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 max-w-7xl">
                <div className="rounded-3xl p-4 sm:p-6 md:p-8 relative overflow-hidden transition-all duration-300 bg-lightBg dark:bg-cyber-dark border border-brown-light dark:border-cyber-purple shadow-lg">
                    {/* Hero Section */}
                    <div className="py-8 md:py-16">
                        <div className="flex flex-col lg:flex-row gap-8 items-start">
                            {/* Game Cover */}
<div className="w-full lg:w-1/3 xl:w-1/4 flex-shrink-0">
    <div className="flex flex-col items-center lg:items-start">
        <div
            className="relative overflow-hidden rounded-xl shadow-2xl cursor-pointer group w-80 md:w-full max-w-md border-double border-2 border-brown-dark dark:border-cyber-purple"
            onClick={openModal}
        >
            <LazyImage
                src={game.image_url || "/placeholder.svg"}
                alt={game.name}
                className="w-full h-auto object-cover aspect-[3/4]"
                priority={true}
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white font-medium">
                    Click to enlarge
                </span>
            </div>
            
            {/* Botón de Favoritos en esquina superior derecha */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite();
                }}
               button class="absolute top-2 right-2 flex items-center justify-center w-12 h-12 rounded-xl font-medium transition-all duration-500 
              shadow-[0_0_3px_#ff3b3b,0_0_5px_#ff0000] 
              active:shadow-[0_0_2px_#ff3b3b] active:translate-x-[1px] active:translate-y-[1px]
              border border-[#ff3b3b] bg-gradient-to-br from-[#2a0a0a] to-[#1a0505] text-[#ff3b3b] 
              hover:shadow-[0_0_4px_#ff3b3b,0_0_7px_#ff0000] 
              hover:text-white hover:bg-gradient-to-br hover:from-[#ff0000] hover:to-[#cc0000]
              dark:shadow-[0_0_3px_#ff3b3b,0_0_5px_#ff0000] 
              dark:border-[#ff3b3b] dark:bg-gradient-to-br dark:from-[#2a0a0a] dark:to-[#1a0505] dark:text-[#ff3b3b]
              dark:hover:shadow-[0_0_4px_#ff3b3b,0_0_7px_#ff0000] 
              dark:hover:text-white dark:hover:bg-gradient-to-br dark:hover:from-[#ff0000] dark:hover:to-[#cc0000]"
            >
                <Heart
                    size={20}
                    className={`${
                        isFavorite
                            ? "fill-current"
                            : ""
                    }`}
                    stroke="currentColor"
                    strokeWidth={2.5}
                />
            </button>
        </div>

                                    {/* Action Buttons */}
                                    {user && (
                                        <div className="mt-6 w-full max-w-sm space-y-3">
                                            {/* Botón de Deseados */}
                                            <button
                                                onClick={toggleWishlist}
                                                className="flex items-center justify-center w-full px-6 py-3 rounded-xl font-medium transition-all duration-200 
               shadow-[3px_3px_0px_0px_#854442] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]
               border-1 border-accent bg-accent/15 text-brown-dark
               dark:shadow-[3px_3px_0px_0px_#FF8C42] dark:active:shadow-none dark:active:translate-x-[3px] dark:active:translate-y-[3px]
               dark:border-[#FF8C42] dark:bg-[#FF8C42]/40 dark:text-[#FF8C42]"
                                            >
                                                <Bookmark
                                                    size={20}
                                                    className={`mr-2 ${
                                                        isInWishlist
                                                            ? "fill-current"
                                                            : ""
                                                    }`}
                                                    stroke="currentColor"
                                                    strokeWidth={2.5}
                                                />
                                                {isInWishlist
                                                    ? "In Wishlist"
                                                    : "Add to Wishlist"}
                                            </button>

                                            {/* Botón de Completado */}
                                            <button
                                                onClick={toggleCompleted}
                                                className="flex items-center justify-center w-full px-6 py-3 rounded-xl font-medium transition-all duration-200 
               shadow-[3px_3px_0px_0px_#854442] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]
               border-1 border-accent bg-accent/15 text-brown-dark
               dark:shadow-[3px_3px_0px_0px_#00ff00] dark:active:shadow-none dark:active:translate-x-[3px] dark:active:translate-y-[3px]
               dark:border-cyber-green dark:bg-[#13ea3d]/40 dark:text-cyber-green"
                                            >
                                                <CheckCircle
                                                    size={20}
                                                    className={`mr-2 ${
                                                        isCompleted
                                                            ? "fill-current"
                                                            : ""
                                                    }`}
                                                    stroke="currentColor"
                                                    strokeWidth={2.5}
                                                />
                                                {isCompleted
                                                    ? "Completed"
                                                    : "Completed"}
                                            </button>

                                            {/* Botón de Add to Collection */}
                                            <div className="relative">
                                                <button
                                                    onClick={() =>
                                                        setIsAddToListOpen(
                                                            !isAddToListOpen
                                                        )
                                                    }
                                                    className="flex items-center justify-center w-full px-6 py-3 rounded-xl font-medium transition-all duration-200 
               shadow-[3px_3px_0px_0px_#854442] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]
               border-1 border-accent bg-accent/15 text-brown-dark
               hover:bg-accent/30
               dark:shadow-[3px_3px_0px_0px_#00F5FF] dark:active:shadow-none dark:active:translate-x-[3px] dark:active:translate-y-[3px]
               dark:border-cyber-cyan dark:bg-cyber-cyan/30 dark:text-cyber-cyan
               hover:dark:bg-cyber-cyan/40"
                                                >
                                                    <ChevronDown
                                                        size={20}
                                                        className="mr-2"
                                                    />
                                                    <span>
                                                        Add to Collection
                                                    </span>
                                                </button>

                                                {isAddToListOpen && (
                                                    <div className="absolute z-10 mt-2 w-full rounded-lg shadow-xl border border-brown-light/40 dark:border-cyber-cyan/40 overflow-hidden backdrop-blur-sm bg-lightBg/80 dark:bg-cyber-dark/80">
                                                        <Link
                                                            to={`/users/${user.name}`}
                                                            className="block w-full text-left px-4 py-3 text-brown-dark dark:text-cyber-cyan hover:bg-brown-light/20 dark:hover:bg-cyber-cyan/20 transition-colors font-medium text-sm"
                                                        >
                                                            Manage Lists
                                                        </Link>

                                                        <div className="py-1">
                                                            {userLists.length >
                                                            0 ? (
                                                                userLists.map(
                                                                    (list) => (
                                                                        <button
                                                                            key={
                                                                                list.id
                                                                            }
                                                                            onClick={() =>
                                                                                handleAddToList(
                                                                                    list.id
                                                                                )
                                                                            }
                                                                            className="flex justify-between items-center w-full text-left px-4 py-3 hover:bg-brown-light/10 dark:hover:bg-cyber-cyan/10 transition-colors text-brown-dark dark:text-cyber-cyan"
                                                                        >
                                                                            <span>
                                                                                {
                                                                                    list.name
                                                                                }
                                                                            </span>
                                                                        </button>
                                                                    )
                                                                )
                                                            ) : (
                                                                <p className="px-4 py-3 text-sm text-brown dark:text-gray-400">
                                                                    You don't
                                                                    have any
                                                                    lists yet
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Game Info */}
                            <div className="flex-1">
                                <div className="backdrop-blur-sm p-6 md:p-8 rounded-xl shadow-xl border-2 bg-lightBg/80 dark:bg-cyber-dark/80 border-brown-light dark:border-cyber-purple">
                                    {/* Header with Title and Scores */}
<div className="flex justify-between items-start mb-4">
    <div className="flex-1">
        <h1 className="text-3xl md:text-5xl font-bold leading-tight text-brown-dark dark:text-heading-dark">
            {game.name}
        </h1>
    </div>
    <div>
        <div className="p-4 mb-2 rounded-xl dark:bg-cyber-dark/50 border-brown-light/30 dark:border-cyber-purple/50">
            <div className="flex flex-col items-center">
                <div className="flex items-center justify-center space-x-6 mb-3">
                    <div className="scale-125 transform-gpu">
                        <RatingStars
                            gameId={game.id}
                            initialRating={userRating}
                            onRatingChange={(rating) =>
                                updateGameData({
                                    userRating: rating,
                                })
                            }
                            starClassName="text-4xl"
                            interactive={true}
                        />
                    </div>
                    
                    {/* Botón de Favoritos*/}
                    <button
                        onClick={toggleFavorite}
                        className="flex items-center justify-center transition-all duration-200"
                    >
                        <Heart
                            size={35}
                            className={`${
                                isFavorite
                                    ? "fill-rose-500 text-[#cc0000]"
                                    : "text-brown-dark/70 dark:text-[#4c0000]"
                            } hover:text-[#ff0000] dark:hover:text-[#ff0000] transition-colors`}
                            stroke="currentColor"
                            strokeWidth={2}
                        />
                    </button>
                </div>
                <span className="text-sm font-medium text-brown-dark dark:text-cyber-cyan">
                    Rate this game
                </span>
            </div>
        </div>
    </div>
</div>

                                    {/* Quick Stats */}
                                    <div className="flex flex-wrap justify-between">
                                        <div className="flex flex-wrap items-center gap-6 mb-6">
                                            <div className="flex items-center space-x-2">
                                                <Calendar
                                                    size={16}
                                                    className="text-brown-dark dark:text-cyber-cyan"
                                                />
                                                <span className="text-sm text-brown-dark dark:text-cyber-cyan">
                                                    {game.released
                                                        ? new Date(
                                                              game.released
                                                          ).toLocaleDateString()
                                                        : "TBA"}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Users
                                                    size={16}
                                                    className="text-brown-dark dark:text-cyber-cyan"
                                                />
                                                <span className="text-sm text-brown-dark dark:text-cyber-cyan">
                                                    {game.developers?.[0]
                                                        ?.name ||
                                                        "Unknown Developer"}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Monitor
                                                    size={16}
                                                    className="text-brown-dark dark:text-cyber-cyan"
                                                />
                                                <span className="text-sm text-brown-dark dark:text-cyber-cyan">
                                                    {game.platforms?.length ||
                                                        0}{" "}
                                                    platforms
                                                </span>
                                            </div>
                                        </div>
                                        {/* Scores */}
                                        <div className="flex gap-8 ml-8">
                                            {game.metacritic && (
                                                <div className="text-center">
                                                    <div
                                                        className={`text-4xl font-bold ${
                                                            game.metacritic >=
                                                            75
                                                                ? "text-success"
                                                                : game.metacritic >=
                                                                  50
                                                                ? "text-warning"
                                                                : "text-error"
                                                        }`}
                                                    >
                                                        {game.metacritic}
                                                    </div>
                                                    <div className="text-sm font-medium opacity-80 text-brown dark:text-textDark">
                                                        Critic Score
                                                    </div>
                                                </div>
                                            )}

                                            <div className="text-center">
                                                <div className="text-4xl font-bold text-brown dark:text-cyber-green">
                                                    {userScore}
                                                </div>
                                                <div className="text-sm font-medium opacity-80 text-brown dark:text-textDark">
                                                    User Score ({reviews.length}
                                                    )
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Screenshots*/}
                                    {game.screenshots?.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="font-semibold text-brown-dark dark:text-cyber-cyan mb-3">
                                                Screenshots
                                            </h3>
                                            <ScreenshotGallery
                                                screenshots={game.screenshots}
                                                gameName={game.name}
                                                onImageClick={
                                                    openScreenshotModal
                                                }
                                            />
                                        </div>
                                    )}

                                    {/* Description */}
                                    {game.description && (
                                        <div className="p-6 rounded-xl border-2 mb-6 bg-lightBg/50 dark:bg-cyber-dark/50 border-brown-light dark:border-cyber-purple">
                                            <SmartDescription
                                                text={game.description}
                                                maxCollapsedChars={500}
                                            />
                                        </div>
                                    )}

                                    {/* Quick Actions */}
                                    <div className="flex flex-wrap gap-3">
                                        {game.website && (
                                            <a
                                                href={game.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center px-4 py-2 rounded-xl transition-all border-2 hover:scale-105 bg-brown-light/10 dark:bg-cyber-cyan/10 text-brown-dark dark:text-cyber-cyan border-brown-light/30 dark:border-cyber-cyan/40"
                                            >
                                                <ExternalLink
                                                    size={16}
                                                    className="mr-2"
                                                />
                                                Official Site
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="py-8 space-y-8">
                        {/* Detailed Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="p-6 rounded-xl border-2 backdrop-blur-sm bg-lightBg/80 dark:bg-cyber-dark/80 border-brown-light dark:border-cyber-purple">
                                <h3 className="font-semibold mb-3 flex items-center text-brown-dark dark:text-cyber-cyan">
                                    <Calendar size={16} className="mr-2" />
                                    <span>Release Info</span>
                                </h3>
                                <div className="space-y-2 text-sm text-brown dark:text-textDark">
                                    <div>
                                        <span className="font-medium">
                                            Date:
                                        </span>
                                        <span className="ml-2 text-brown-dark dark:text-cyber-green">
                                            {game.released
                                                ? new Date(
                                                      game.released
                                                  ).toLocaleDateString()
                                                : "TBA"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium">
                                            Developer:
                                        </span>
                                        <span className="ml-2 text-brown-dark dark:text-cyber-green">
                                            {game.developers?.[0]?.name ||
                                                "N/A"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium">
                                            Publisher:
                                        </span>
                                        <span className="ml-2 text-brown-dark dark:text-cyber-green">
                                            {game.publishers?.[0]?.name ||
                                                "N/A"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-xl border-2 backdrop-blur-sm bg-lightBg/80 dark:bg-cyber-dark/80 border-brown-light dark:border-cyber-purple">
                                <h3 className="font-semibold mb-3 flex items-center text-brown-dark dark:text-cyber-cyan">
                                    <Monitor size={16} className="mr-2" />
                                    <span>Platforms</span>
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {game.platforms?.map((platform) => (
                                        <span
                                            key={platform.id}
                                            className="text-xs px-2 py-1 rounded border bg-brown-light/10 dark:bg-cyber-cyan/15 text-brown-dark dark:text-cyber-cyan border-brown-light/30 dark:border-cyber-cyan/40"
                                        >
                                            {platform.name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 rounded-xl border-2 backdrop-blur-sm bg-lightBg/80 dark:bg-cyber-dark/80 border-brown-light dark:border-cyber-purple">
                                <h3 className="font-semibold mb-3 flex items-center text-brown-dark dark:text-cyber-cyan">
                                    <Star size={16} className="mr-2" />
                                    <span>Ratings</span>
                                </h3>
                                <div className="space-y-2 text-sm text-brown dark:text-textDark">
                                    {game.metacritic && (
                                        <div>
                                            <span className="font-medium">
                                                Metacritic:
                                            </span>
                                            <span
                                                className={`ml-2 font-bold ${
                                                    game.metacritic >= 75
                                                        ? "text-success"
                                                        : game.metacritic >= 50
                                                        ? "text-warning"
                                                        : "text-error"
                                                }`}
                                            >
                                                {game.metacritic}/100
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="font-medium">
                                            User Score:
                                        </span>
                                        <span className="ml-2 font-bold text-brown-dark dark:text-cyber-green">
                                            {userScore}/5
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <div className="space-y-8">
                            <h2 className="text-3xl font-bold flex items-center">
                                <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-gradient-to-b from-accent to-accent-light dark:from-cyber-pink dark:via-cyber-purple dark:to-cyber-cyan rounded-full mr-3 sm:mr-4 shadow-[0_0_6px_2px_rgba(133,68,66,0.7)] dark:shadow-[0_0_8px_2px_rgba(0,245,255,0.6)]" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-light dark:from-cyber-pink dark:to-cyber-purple">
                                    Community Reviews
                                </span>
                            </h2>

                            {user && (
                                <div className="p-6 rounded-xl border-2 backdrop-blur-sm bg-lightBg/80 dark:bg-cyber-dark/80 border-brown-light dark:border-cyber-purple">
                                    <ReviewForm
                                        gameId={game.id}
                                        onReviewSubmit={fetchGameDetails}
                                    />
                                </div>
                            )}

                            {reviews.length > 0 ? (
                                <div className="space-y-6">
                                    {reviews.map((review) => (
                                        <div
                                            key={review.id}
                                            className="border-0 rounded-xl overflow-hidden backdrop-blur-sm bg-lightBg/80 dark:bg-cyber-dark/80"
                                        >
                                            <ReviewCard
                                                review={review}
                                                showUser={true}
                                                showGame={false}
                                                showGameImage={false}
                                                className=""
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 rounded-xl border-2 text-center backdrop-blur-sm bg-lightBg/80 dark:bg-cyber-dark/80 border-brown-light dark:border-cyber-purple">
                                    <h3 className="text-xl font-medium mb-2 text-brown-dark dark:text-cyber-cyan">
                                        No reviews yet
                                    </h3>
                                    <p className="text-brown dark:text-accent-light">
                                        Be the first to share your thoughts
                                        about {game.name}!
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Game Cover Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
                    <button
                        onClick={closeModal}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-20"
                    >
                        <X size={24} className="text-white" />
                    </button>
                    <div className="max-w-7xl max-h-[100vh] flex flex-col items-center">
                        <LazyImage
                            src={game.image_url || "/placeholder.svg"}
                            alt={game.name}
                            className="max-w-full max-h-full object-contain rounded-lg"
                            priority={true}
                        />
                        <h3 className="text-white text-xl font-semibold text-center mt-4">
                            {game.name}
                        </h3>
                    </div>
                </div>
            )}
        </div>
    );
}
