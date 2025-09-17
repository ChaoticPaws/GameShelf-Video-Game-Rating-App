"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../contexts/AuthContext"
import { UserProfileSkeleton } from "../components/UserProfileSkeleton"
import { useTheme } from "../contexts/ThemeContext"
import { ProgressBarUsers } from "../components/ProgressBarUsers"
import UserLists from "../components/UserLists"
import {
  Settings,
  Plus,
  Check,
  X,
  Heart,
  MessageSquare,
  List,
  Activity,
  Star,
  Gamepad2,
  ChevronLeft,
  Target,
  Shield,
  Search,
  Trash2,
  Edit2,
  ChevronRight,
  Zap,
  Calendar,
  Trophy,
} from "lucide-react"
import { GenreChart } from "../components/GenreChart"

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
})

export function UserProfile() {
  const [profileState, setProfileState] = useState({
    user: null,
    favoriteGames: [],
    recentReviews: [],
    userLists: [],
    genreStats: [],
    listGenreStats: [],
    userFavorites: [],
  })

  const [uiState, setUIState] = useState({
    activeTab: "reviews",
    isLoading: true,
    error: null,
    successMessage: null,
    currentReviewPage: 0,
    currentSlide: 0,
  })

  const [modalState, setModalState] = useState({
    isHofModalOpen: false,
    selectedHofSlot: null,
    draggedHofGame: null,
    dragOverHofSlot: null,
    searchResults: [],
    isLoadingSearch: false,
  })

  const [editState, setEditState] = useState({
    isCreatingList: false,
    newListName: "",
    editingListId: null,
    editingListName: "",
  })

  // Estados para búsqueda
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")

  const { username } = useParams()
  const navigate = useNavigate()
  const { user: currentUser, token } = useAuth()
  const { theme } = useTheme()

  const reviewsPerPage = 4
  const maxReviewsToShow = 8
  const isOwnProfile = currentUser && profileState.user && currentUser.id === profileState.user.id

  const averageRating = useMemo(() => {
    return profileState.recentReviews.length > 0
      ? (
          profileState.recentReviews.reduce((acc, review) => acc + review.star_rating, 0) /
          profileState.recentReviews.length
        ).toFixed(1)
      : 0
  }, [profileState.recentReviews])

  const limitedReviews = useMemo(() => {
    return profileState.recentReviews.slice(0, maxReviewsToShow)
  }, [profileState.recentReviews])

  const currentReviews = useMemo(() => {
    const startIndex = uiState.currentReviewPage * reviewsPerPage
    const endIndex = startIndex + reviewsPerPage
    return limitedReviews.slice(startIndex, endIndex)
  }, [limitedReviews, uiState.currentReviewPage])

  const totalGames = useMemo(() => {
    return (
      profileState.favoriteGames.length +
      profileState.userLists.reduce((acc, list) => acc + (list.games?.length || 0), 0)
    )
  }, [profileState.favoriteGames, profileState.userLists])

  // Implementar debouncing para búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [searchQuery])

  // Función para buscar juegos en el modal
  const searchGamesForModal = async (query) => {
    if (query.length < 2) {
      setModalState((prev) => ({ ...prev, searchResults: [], isLoadingSearch: false }))
      return
    }

    setModalState((prev) => ({ ...prev, isLoadingSearch: true }))

    try {
      const response = await fetch(`/api/search-games?query=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()

      const sortedGames = data.games?.sort((a, b) => {
        const exactMatchA = a.name.toLowerCase() === query.toLowerCase()
        const exactMatchB = b.name.toLowerCase() === query.toLowerCase()
        if (exactMatchA !== exactMatchB) return exactMatchA ? -1 : 1
        return (b.metacritic_score || 0) - (a.metacritic_score || 0)
      })

      setModalState((prev) => ({
        ...prev,
        searchResults: sortedGames || [],
        isLoadingSearch: false,
      }))
    } catch (error) {
      console.error("Error searching games:", error)
      setModalState((prev) => ({ ...prev, isLoadingSearch: false, searchResults: [] }))
    }
  }

  // Efecto para búsqueda debounced
  useEffect(() => {
    if (debouncedSearchQuery && modalState.isHofModalOpen) {
      searchGamesForModal(debouncedSearchQuery)
    }
  }, [debouncedSearchQuery, modalState.isHofModalOpen])

  useEffect(() => {
    if (isOwnProfile) {
      const fetchUserFavorites = async () => {
        try {
          const response = await api.get(`/users/${username}/favorites`)
          setProfileState((prev) => ({ ...prev, userFavorites: response.data }))
        } catch (error) {
          console.error("Failed to fetch user favorites:", error)
        }
      }
      fetchUserFavorites()
      document.documentElement.style.scrollBehavior = "smooth"
      return () => {
        document.documentElement.style.scrollBehavior = "auto"
      }
    }
  }, [username, isOwnProfile])

  const handleHofGameSelect = useCallback(
    (game) => {
      if (modalState.selectedHofSlot !== null) {
        const updatedFavorites = [...profileState.favoriteGames]
        const isAlreadyInHof = profileState.favoriteGames.some((favGame) => favGame?.id === game.id)

        if (isAlreadyInHof) {
          setUIState((prev) => ({ ...prev, error: "This game is already in your Hall of Fame" }))
          return
        }

        updatedFavorites[modalState.selectedHofSlot] = game
        setProfileState((prev) => ({ ...prev, favoriteGames: updatedFavorites }))
        setModalState((prev) => ({ ...prev, isHofModalOpen: false, searchResults: [], searchQuery: "" }))
        updateHallOfFame(updatedFavorites)
      }
    },
    [modalState.selectedHofSlot, profileState.favoriteGames],
  )

  const updateHallOfFame = useCallback(
  async (updatedFavorites, fallbackFavorites = null) => {
    try {
     
      const hofGames = updatedFavorites
        .map((game, index) => {
          if (!game) return null;
          return { 
            id: game.id, 
            position: index + 1 
          };
        })
        .filter(game => game !== null);

      console.log('Updating Hall of Fame with:', hofGames); // Debug
      console.log('Username:', username); // Debug
      console.log('Token exists:', !!token); // Debug

      const response = await api.put(
        `/users/${username}/hall-of-fame`,
        { games: hofGames },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setUIState((prev) => ({ 
          ...prev, 
          successMessage: "Hall of Fame updated successfully!" 
        }));
        setTimeout(() => setUIState((prev) => ({ ...prev, successMessage: null })), 3000);
        
       
        if (response.data.updatedFavorites) {
          setProfileState((prev) => ({ 
            ...prev, 
            favoriteGames: response.data.updatedFavorites 
          }));
        }
      } else {
        throw new Error(response.data.message || "Failed to update Hall of Fame");
      }
    } catch (error) {
      console.error("Error updating Hall of Fame:", error);
      console.error("Error response:", error.response); // Debug
      
      setUIState((prev) => ({
        ...prev,
        error: error.response?.data?.message || error.message || "Failed to update Hall of Fame. Please try again.",
      }));

      
      if (fallbackFavorites) {
        setProfileState((prev) => ({ 
          ...prev, 
          favoriteGames: fallbackFavorites
        }));
      }
    }
  },
  [username, token]
);

  const handleHofDragStart = useCallback(
    (index) => {
      if (profileState.favoriteGames[index]) {
        setModalState((prev) => ({ 
        ...prev, 
        draggedHofGame: profileState.favoriteGames[index],
        dragOverHofSlot: null 
      }))
      }
    },
    [profileState.favoriteGames],
  )

  const handleHofDragOver = useCallback((e, index) => {
    e.preventDefault()
    setModalState((prev) => ({ ...prev, dragOverHofSlot: index }))
  }, [])

  const handleHofDrop = useCallback(
  (e, index) => {
    e.preventDefault();
    if (modalState.draggedHofGame && modalState.draggedHofGame !== profileState.favoriteGames[index]) {
      const updatedFavorites = [...profileState.favoriteGames];
      const draggedIndex = profileState.favoriteGames.findIndex(
        (game) => game && game.id === modalState.draggedHofGame.id
      );
      const previousFavorites = [...profileState.favoriteGames];
      updatedFavorites[index] = modalState.draggedHofGame;
      if (draggedIndex !== -1) {
        updatedFavorites[draggedIndex] = profileState.favoriteGames[index];
      }

      setProfileState((prev) => ({ ...prev, favoriteGames: updatedFavorites }));
      updateHallOfFame(updatedFavorites, previousFavorites);
    }
    setModalState((prev) => ({ ...prev, dragOverHofSlot: null }));
  },
  [modalState.draggedHofGame, profileState.favoriteGames, updateHallOfFame],
);

  const removeFromHallOfFame = useCallback(
  (index) => {
    if (confirm("Are you sure you want to remove this game from your Hall of Fame?")) {
      const updatedFavorites = [...profileState.favoriteGames];
      updatedFavorites[index] = null;
      
     
      const previousFavorites = [...profileState.favoriteGames];
      
      setProfileState((prev) => ({ ...prev, favoriteGames: updatedFavorites }));
      
    
      updateHallOfFame(updatedFavorites, previousFavorites);
    }
  },
  [profileState.favoriteGames, updateHallOfFame],
);

  const handleDeleteReview = useCallback(
    async (reviewId) => {
      if (!confirm("Are you sure you want to delete this review?")) return

      try {
        await api.delete(`/reviews/${reviewId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setProfileState((prev) => ({
          ...prev,
          recentReviews: prev.recentReviews.filter((review) => review.id !== reviewId),
        }))
        setUIState((prev) => ({ ...prev, successMessage: "Review deleted successfully!" }))
        setTimeout(() => setUIState((prev) => ({ ...prev, successMessage: null })), 3000)
      } catch (error) {
        console.error("Error deleting review:", error)
        setUIState((prev) => ({
          ...prev,
          error: error.response?.data?.message || error.message || "Failed to delete review.",
        }))
      }
    },
    [token],
  )

  useEffect(() => {
    const fetchUserProfile = async () => {
      setUIState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const userResponse = await api.get(`/users/${username}`)
        if (!userResponse.data || userResponse.data.message === "User not found") {
          throw new Error("User not found.")
        }

        const userData = {
          id: userResponse.data.id,
          name: userResponse.data.name,
          profile_pic: userResponse.data.profile_pic,
          bio: userResponse.data.bio,
          created_at: userResponse.data.created_at,
          updated_at: userResponse.data.updated_at,
        }

        const [favorites, reviews, lists, stats, listGenreStats] = await Promise.all([
          api.get(`/users/${username}/favorites`).catch(() => ({ data: [] })),
          api.get(`/users/${username}/reviews`).catch(() => ({ data: [] })),
          api
            .get(`/users/${username}/lists`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              withCredentials: true,
            })
            .catch(() => ({ data: [] })),
          api.get(`/users/${username}/stats/genres`).catch(() => ({ data: [] })),
          api.get(`/users/${username}/stats/list-genres`).catch(() => ({ data: [] })),
        ])

        const formattedReviews = reviews.data.map((review) => ({
          ...review,
          game: {
            id: review.game?.id || null,
            name: review.game?.name || "Unknown Game",
            image_url: review.game?.image_url || "",
          },
          text: review.text || "",
          star_rating: review.star_rating || 0,
          likes: review.likes || 0,
        }))

        setProfileState({
          user: userData,
          favoriteGames: favorites.data,
          recentReviews: formattedReviews,
          userLists: lists.data,
          genreStats: stats.data,
          listGenreStats: listGenreStats.data,
          userFavorites: [],
        })
      } catch (error) {
        console.error("Failed to load user profile:", error)
        setUIState((prev) => ({
          ...prev,
          error: error.response?.data?.message || error.message || "Failed to load user profile.",
        }))
        setProfileState((prev) => ({ ...prev, user: null }))
      } finally {
        setUIState((prev) => ({ ...prev, isLoading: false }))
      }
    }

    fetchUserProfile()
  }, [username, token])

  const createList = useCallback(async () => {
    if (!editState.newListName.trim()) {
      setUIState((prev) => ({ ...prev, error: "List name cannot be empty" }))
      return
    }

    try {
      await axios.get("/sanctum/csrf-cookie", { withCredentials: true })

      const response = await api.post(
        "/lists",
        { name: editState.newListName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          withCredentials: true,
        },
      )

      setProfileState((prev) => ({ ...prev, userLists: [...prev.userLists, response.data] }))
      setEditState({ isCreatingList: false, newListName: "", editingListId: null, editingListName: "" })
      setUIState((prev) => ({ ...prev, successMessage: "List created successfully!" }))
      setTimeout(() => setUIState((prev) => ({ ...prev, successMessage: null })), 3000)
    } catch (error) {
      console.error("Error creating list:", error)
      setUIState((prev) => ({
        ...prev,
        error: error.response?.data?.message || error.message || "Failed to create list.",
      }))
      if (error.response?.status === 401) {
        alert("Your session has expired. Please log in again.")
      }
    }
  }, [editState.newListName, token])

  const updateList = useCallback(
    async (listId) => {
      if (!editState.editingListName.trim()) {
        setUIState((prev) => ({ ...prev, error: "List name cannot be empty" }))
        return
      }

      try {
        await axios.get("/sanctum/csrf-cookie", { withCredentials: true })

        await api.put(
          `/lists/${listId}`,
          { name: editState.editingListName },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            withCredentials: true,
          },
        )

        const updatedLists = profileState.userLists.map((list) =>
          list.id === listId ? { ...list, name: editState.editingListName } : list,
        )

        setProfileState((prev) => ({ ...prev, userLists: updatedLists }))
        setEditState((prev) => ({ ...prev, editingListId: null, editingListName: "" }))
        setUIState((prev) => ({ ...prev, successMessage: "List updated successfully!" }))
        setTimeout(() => setUIState((prev) => ({ ...prev, successMessage: null })), 3000)
      } catch (error) {
        console.error("Error updating list:", error)
        setUIState((prev) => ({
          ...prev,
          error: error.response?.data?.message || error.message || "Failed to update list.",
        }))
        if (error.response?.status === 401) {
          alert("Your session has expired. Please log in again.")
        }
      }
    },
    [editState.editingListName, profileState.userLists, token],
  )

  const deleteList = useCallback(
    async (listId) => {
      if (!confirm("Are you sure you want to delete this list?")) return

      try {
        await axios.get("/sanctum/csrf-cookie", { withCredentials: true })

        await api.delete(`/lists/${listId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          withCredentials: true,
        })

        setProfileState((prev) => ({
          ...prev,
          userLists: prev.userLists.filter((list) => list.id !== listId),
        }))
        setUIState((prev) => ({ ...prev, successMessage: "List deleted successfully!" }))
        setTimeout(() => setUIState((prev) => ({ ...prev, successMessage: null })), 3000)
      } catch (error) {
        console.error("Error deleting list:", error)
        setUIState((prev) => ({
          ...prev,
          error: error.response?.data?.message || error.message || "Failed to delete list.",
        }))
        if (error.response?.status === 401) {
          alert("Your session has expired. Please log in again.")
        }
      }
    },
    [profileState.userLists, token],
  )

  const nextSlide = useCallback(() => {
    const maxSlides = Math.ceil(profileState.favoriteGames.length / 5) - 1
    setUIState((prev) => ({
      ...prev,
      currentSlide: prev.currentSlide >= maxSlides ? 0 : prev.currentSlide + 1,
    }))
  }, [profileState.favoriteGames.length])

  const prevSlide = useCallback(() => {
    const maxSlides = Math.ceil(profileState.favoriteGames.length / 5) - 1
    setUIState((prev) => ({
      ...prev,
      currentSlide: prev.currentSlide <= 0 ? maxSlides : prev.currentSlide - 1,
    }))
  }, [profileState.favoriteGames.length])

  if (uiState.isLoading) {
    return <UserProfileSkeleton />
  }

  if (uiState.error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 sm:p-12 border border-red-300/30 dark:border-red-500/30 max-w-md w-full">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Shield size={32} className="sm:w-10 sm:h-10 text-red-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 text-center">System Error</h2>
          <p className="text-gray-300 mb-6 sm:mb-8 text-center text-sm sm:text-base">{uiState.error}</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 ease-in-out transform hover:scale-[1.02] shadow-lg hover:shadow-purple-500/25 text-sm sm:text-base"
          >
            <ChevronLeft size={18} className="mr-2" />
            Return to Base
          </Link>
        </div>
      </div>
    )
  }

  if (!profileState.user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 sm:p-12 border border-purple-300/30 dark:border-purple-500/30 max-w-md w-full">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Target size={32} className="sm:w-10 sm:h-10 text-purple-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 text-center">Player Not Found</h2>
          <p className="text-gray-300 mb-6 sm:mb-8 text-center text-sm sm:text-base">
            @{username} doesn't exist in our database or is in stealth mode.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 ease-in-out transform hover:scale-[1.02] shadow-lg hover:shadow-purple-500/25 text-sm sm:text-base"
          >
            <ChevronLeft size={18} className="mr-2" />
            Return to Base
          </Link>
        </div>
      </div>
    )
  }

  if (!profileState.user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 sm:p-12 border border-purple-300/30 dark:border-purple-500/30 max-w-md w-full">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Target size={32} className="sm:w-10 sm:h-10 text-purple-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 text-center">Player Not Found</h2>
          <p className="text-gray-300 mb-6 sm:mb-8 text-center text-sm sm:text-base">
            @{username} doesn't exist in our database or is in stealth mode.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 ease-in-out transform hover:scale-[1.02] shadow-lg hover:shadow-purple-500/25 text-sm sm:text-base"
          >
            <ChevronLeft size={18} className="mr-2" />
            Return to Base
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <div className="relative container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 max-w-7xl">
        <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 relative overflow-hidden border-2 shadow-lg transition-all duration-300 bg-lightBg dark:bg-cyber-dark border-brown-light dark:border-cyber-purple">
          {/* Profile Header - Improved Responsive Layout */}
          <div className="relative mb-6 sm:mb-8 md:mb-14">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
              {/* Profile Image */}
              <div className="relative group w-24 h-24 sm:w-28 sm:h-28 lg:w-36 lg:h-36 xl:w-44 xl:h-44 flex-shrink-0">
                <img
                  src={profileState.user.profile_pic || "/placeholder.svg?height=112&width=112"}
                  alt={`${profileState.user.name}'s avatar`}
                  className="relative w-full h-full rounded-2xl object-cover border-double border-2 border-brown-dark dark:border-cyber-cyan"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg?height=112&width=112"
                  }}
                />
              </div>

              {/* Bio and Name Container */}
              <div className="w-full lg:flex-1 backdrop-blur-sm rounded-xl border-2 border-brown-light dark:border-cyber-cyan p-4 sm:p-5 lg:p-6 bg-lightBg/80 dark:bg-cyber-dark/80">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 text-center lg:text-left text-brown-dark dark:text-cyber-pink">
                  {profileState.user.name}
                </h1>

                {profileState.user.bio && (
                  <p className="text-brown dark:text-cyber-cyan text-sm sm:text-base lg:text-lg leading-relaxed text-center lg:text-left">
                    {profileState.user.bio}
                  </p>
                )}
              </div>

              {/* Configure Button - Positioned appropriately for all screens */}
              {isOwnProfile && (
                <div className="w-full lg:w-auto flex justify-center lg:justify-end mt-2 lg:mt-0">
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2.5 bg-brown-light/20 dark:bg-cyber-dark border-2 border-brown-light/40 dark:border-cyber-cyan/40 text-brown-dark dark:text-cyber-cyan rounded-xl hover:bg-brown-light/30 dark:hover:bg-cyber-cyan/10 transition-all"
                  >
                    <Settings size={18} className="sm:w-5 sm:h-5 text-brown-dark dark:text-cyber-cyan" />
                    <span className="font-medium ml-2 text-sm">Configure</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Grid - Usando valores memoizados */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-7 mx-2 sm:mx-4 my-4 sm:my-6">
            {[
              {
                icon: Gamepad2,
                label: "Total Games",
                value: totalGames,
                color: "from-blue-500 to-cyan-500",
                bgColor: "from-blue-500/40 to-cyan-500/10",
              },
              {
                icon: Heart,
                label: "Favorites",
                value: profileState.favoriteGames.length,
                color: "from-pink-500 to-rose-500",
                bgColor: "from-pink-500/40 to-rose-500/10",
              },
              {
                icon: MessageSquare,
                label: "Reviews",
                value: profileState.recentReviews.length,
                color: "from-green-500 to-emerald-500",
                bgColor: "from-green-500/40 to-emerald-500/10",
              },
              {
                icon: Star,
                label: "Avg Rating",
                value: `${averageRating}/5`,
                color: "from-yellow-500 to-orange-500",
                bgColor: "from-yellow-500/40 to-orange-500/10",
              },
            ].map(({ icon: Icon, label, value, color, bgColor }) => (
              <div
                key={label}
                className={`
                  relative group bg-gradient-to-br ${bgColor} backdrop-blur-sm
                  rounded-xl p-3 sm:p-4 md:p-5 border-2 border-gray-300 dark:border-gray-700
                  hover:border-accent/50 dark:hover:border-cyber-cyan/50 transition-all duration-300
                  hover:scale-[1.03] min-w-0 overflow-hidden
                `}
              >
                {/* Gradient Border */}
                <div
                  className="absolute inset-0 rounded-xl p-[1.5px] pointer-events-none"
                  style={{
                    background:
                      theme === "dark"
                        ? "linear-gradient(to right, #339999, #33cc99, #33ff99, #32faca, #58d0cb, #7fa5cb, #a57bcc, #db58dc)"
                        : "linear-gradient(to right, #854442, #a85d5b, #be9b7b, #4b3832)",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                  }}
                />

                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 md:space-x-4 w-full">
                  {/* Icon - Arriba en móvil, izquierda en desktop */}
                  <div
                    className={`
                    flex-shrink-0 bg-gradient-to-br ${color} rounded-xl
                    flex items-center justify-center shadow-lg
                    w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14
                    transition-all duration-300
                    group-hover:shadow-[0_0_15px_-3px] group-hover:shadow-current/50
                  `}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>

                  {/* Text - Abajo en móvil, derecha en desktop */}
                  <div className="min-w-0 flex-1 flex flex-col justify-center text-center sm:text-left">
                    <p
                      className={`
                      font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400
                      text-[0.6rem] sm:text-[0.65rem] md:text-sm lg:text-base
                      leading-tight
                    `}
                    >
                      {label}
                    </p>
                    <p
                      className={`
                      font-bold text-brown-dark dark:text-white
                      text-sm sm:text-lg md:text-2xl
                      leading-tight
                    `}
                    >
                      {value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid - Responsive */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6 p-3 sm:p-6 mb-6 sm:mb-8 md:mb-12">
            {/* Genre Chart */}
            <div className="xl:col-span-3">
              <div className="backdrop-blur-xl rounded-2xl border-2 border-brown-light dark:border-cyber-purple overflow-hidden shadow-2xl bg-lightBg/80 dark:bg-cyber-dark/80">
                <div className="bg-gradient-to-r from-brown-light/20 to-brown/20 dark:from-cyber-purple/20 dark:to-cyber-pink/20 p-4 sm:p-6 border-b border-brown-light dark:border-cyber-purple">
                  <h3 className="text-xl sm:text-2xl font-bold flex items-center text-brown-dark dark:text-cyber-pink">
                    <div
                      className="w-1 sm:w-1.5 h-6 sm:h-8 
                                  bg-gradient-to-b from-brown to-brown-light 
                                  dark:from-cyber-pink dark:to-cyber-purple 
                                  rounded-full mr-3 sm:mr-4 
                                  shadow-[0_0_6px_2px_rgba(133,68,66,0.7)] 
                                  dark:shadow-[0_0_8px_2px_rgba(255,0,160,0.6)]"
                    />
                    Gaming Preferences
                  </h3>
                  <p className="text-brown dark:text-cyber-cyan mt-2 text-sm sm:text-base">
                    Your gaming preferences decoded
                  </p>
                </div>
                {profileState.listGenreStats.length > 0 ? (
                  <div className="p-4 sm:p-6">
                    <div className="h-48 sm:h-64 md:h-80 lg:h-96 transition-all duration-300">
                      <GenreChart data={profileState.listGenreStats} />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 sm:p-6">
                    <div className="h-48 sm:h-64 md:h-80 lg:h-96 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-brown-light/20 to-brown/20 dark:from-cyber-purple/20 dark:to-cyber-pink/20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                          <Gamepad2 size={32} className="sm:w-10 sm:h-10 text-brown-dark dark:text-cyber-pink" />
                        </div>
                        <p className="text-lg sm:text-xl font-bold text-brown-dark dark:text-cyber-pink mb-2">
                          No Data Collected
                        </p>
                        <p className="text-brown dark:text-cyber-cyan text-sm sm:text-base">
                          Add games to your lists to unlock your gaming DNA
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="backdrop-blur-xl rounded-2xl border-2 border-brown-light dark:border-cyber-green shadow-2xl h-fit bg-lightBg/80 dark:bg-cyber-dark/80">
              <div className="bg-gradient-to-r from-brown-light/20 to-brown/20 dark:from-cyber-green/20 dark:to-emerald-600/20 p-4 sm:p-6 border-b border-brown-light dark:border-cyber-green rounded-t-2xl">
                <h3 className="text-lg sm:text-xl font-bold flex items-center text-brown-dark dark:text-cyber-green">
                  <div className="relative mr-2 sm:mr-3">
                    <Activity
                      size={18}
                      className="sm:w-5 sm:h-5 text-brown-dark dark:text-cyber-green 
                                drop-shadow-[0_0_6px_rgba(133,68,66,0.8)] 
                                dark:drop-shadow-[0_0_8px_rgba(0,255,71,0.6)]"
                    />
                    <div
                      className="absolute inset-0 w-full h-full 
                                  bg-gradient-to-br from-brown-light/40 to-brown/40 
                                  dark:from-cyber-green/30 dark:to-emerald-500/30 
                                  rounded-full blur-[6px] -z-10"
                    />
                  </div>
                  Recent Activity
                </h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {profileState.recentReviews.slice(0, 5).map((review, index) => (
                    <div key={review.id} className="flex items-start space-x-3 sm:space-x-4 group">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-brown-light/20 to-brown/20 dark:from-cyber-purple/20 dark:to-cyber-pink/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-brown-light/20 dark:border-cyber-purple/20">
                        <MessageSquare size={14} className="sm:w-4 sm:h-4 text-brown-dark dark:text-cyber-pink" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-brown dark:text-cyber-cyan text-xs sm:text-sm">
                          Reviewed{" "}
                          <span className="font-bold text-brown-dark dark:text-cyber-pink">{review.game.name}</span>
                        </p>
                        <div className="flex items-center mt-1 sm:mt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={`sm:w-3 sm:h-3 ${
                                i < review.star_rating
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-400 dark:text-gray-600"
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-500">
                            {review.star_rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {profileState.recentReviews.length === 0 && (
                    <div className="text-center py-6 sm:py-8">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-brown-light/20 to-brown/20 dark:from-cyber-purple/20 dark:to-cyber-pink/20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                        <MessageSquare size={24} className="sm:w-8 sm:h-8 text-brown-dark dark:text-cyber-pink" />
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-brown-dark dark:text-cyber-pink mb-2">
                        No Activity Yet
                      </p>
                      <p className="text-brown dark:text-cyber-cyan text-sm sm:text-base">
                        Start reviewing games to see your activity here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Hall of Fame - Usando profileState.favoriteGames */}
          <div className="mb-6 sm:mb-8 md:mb-12 lg:mb-16">
            <div className="flex items-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-heading dark:text-cyber-pink flex items-center">
                <div className="w-0.5 sm:w-1 h-8 sm:h-10 bg-gradient-to-b from-heading to-accent dark:from-cyber-pink dark:to-cyber-purple rounded-full mr-3 sm:mr-4"></div>
                Hall of Fame
                {isOwnProfile && profileState.favoriteGames.length === 5 && (
                  <span className="ml-2 sm:ml-3 px-2 py-1 text-xs bg-green-500/20 text-emerald-300 rounded-full flex items-center">
                    <Check className="mr-1" size={10} /> Completed
                  </span>
                )}
              </h2>
            </div>

            {/* Responsive Hall of Fame Grid */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-4 sm:mb-6 md:mb-8 lg:mb-12 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => {
                const game = profileState.favoriteGames[index]
                const isEmpty = !game
                const positionColors =
                  index < 3
                    ? [
                        {
                          // Posición 1 - Oro
                          border: "border-amber-500 dark:border-amber-400",
                          text: "text-amber-700 dark:text-amber-200",
                          numberBg: "bg-gradient-to-b from-amber-400 to-amber-500",
                          numberText: "text-amber-800 dark:text-amber-900 font-bold",
                          borderGlow: "shadow-[0_0_0_0.5px_rgba(180,83,9,0.3)]",
                        },
                        {
                          // Posición 2 - Plata
                          border: "border-gray-200 dark:border-gray-300",
                          text: "text-gray-500 dark:text-gray-200",
                          numberBg: "bg-gradient-to-b from-gray-100 to-gray-300",
                          numberText: "text-gray-600 dark:text-gray-700 font-bold",
                          borderGlow: "",
                        },
                        {
                          // Posición 3 - Bronce
                          border: "border-amber-700 dark:border-amber-600",
                          text: "text-amber-800 dark:text-amber-200",
                          numberBg: "bg-gradient-to-b from-amber-600 to-amber-700",
                          numberText: "text-amber-100 font-bold",
                          medalColor: "bg-amber-600",
                        },
                      ][index]
                    : {
                        // Posiciones 4 y 5
                        border: "border-gray-150 dark:border-gray-500",
                        text: "text-gray-400 dark:text-gray-400",
                        numberBg: "bg-gray-100 dark:bg-gray-600",
                        numberText: "text-gray-500 dark:text-gray-300",
                        borderGlow: "",
                      }

                return (
                  <div
                    key={game ? game.id : `hof-placeholder-${index}`}
                    className={`group relative transition-all duration-300 ${isEmpty ? "cursor-pointer" : ""}`}
                    draggable={!!game && isOwnProfile}
                    onDragStart={() => isOwnProfile && handleHofDragStart(index)}
                    onDragOver={(e) => isOwnProfile && handleHofDragOver(e, index)}
                    onDrop={(e) => isOwnProfile && handleHofDrop(e, index)}
                    onDragLeave={() => isOwnProfile && setModalState((prev) => ({ ...prev, dragOverHofSlot: null }))}
                  >
                    <div
                      className={`absolute -top-2 sm:-top-3 -left-2 sm:-left-3 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center z-10 ${positionColors.numberBg} ${
                        modalState.dragOverHofSlot === index ? "ring-2 ring-accent dark:ring-cyber-cyan" : ""
                      }`}
                    >
                      <span className={`text-xs sm:text-sm font-bold ${positionColors.numberText}`}>{index + 1}</span>
                    </div>

                    {isOwnProfile && game && (
                      <button
                        onClick={() => removeFromHallOfFame(index)}
                        className="absolute -top-2 sm:-top-3 -right-2 sm:-right-3 w-5 h-5 sm:w-7 sm:h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:scale-110"
                        title="Remove from Hall of Fame"
                      >
                        <X size={12} className="sm:w-3.5 sm:h-3.5 text-white" />
                      </button>
                    )}

                    <div
                      className={`relative h-full rounded-xl sm:rounded-2xl overflow-hidden border-2 ${positionColors.border} ${
                        game ? "hover:shadow-xl" : "border-dashed"
                      } transition-all duration-300 group-hover:-translate-y-1 ${
                        modalState.dragOverHofSlot === index
                          ? "ring-2 ring-accent dark:ring-cyber-cyan bg-accent/10 dark:bg-cyber-cyan/10"
                          : ""
                      }`}
                      onClick={() => {
                        if (isEmpty && isOwnProfile) {
                          setModalState((prev) => ({ ...prev, selectedHofSlot: index, isHofModalOpen: true }))
                          setSearchQuery("")
                        }
                      }}
                    >
                      {game ? (
                        <Link to={`/games/${game.slug}`} className="block h-full">
                          <div className="bg-purple-100/50 dark:bg-gray-800 h-full flex flex-col">
                            <div className="aspect-[3/4] overflow-hidden relative">
                              <img
                                src={game.image_url || "/placeholder.svg?height=300&width=225"}
                                alt={game.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <div className="p-2 sm:p-3 md:p-4 flex-1 flex flex-col justify-between">
                              <h4 className="font-bold text-textLight dark:text-textDark line-clamp-2 group-hover:text-accent dark:group-hover:text-cyber-cyan transition-colors min-h-[2.5rem] sm:min-h-[3rem] text-xs sm:text-sm leading-tight">
                                {game.name}
                              </h4>
                              <div className="mt-1 sm:mt-2 flex justify-between items-center">
                                {game.released && (
                                  <p className="text-gray-400 text-[0.65rem] sm:text-xs font-medium">
                                    {new Date(game.released).getFullYear()}
                                  </p>
                                )}
                                {game.rating && (
                                  <div className="flex items-center text-[0.65rem] sm:text-xs bg-gray-200 dark:bg-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                                    <Star className="fill-yellow-400 text-yellow-400 mr-0.5 sm:mr-1" size={10} />
                                    {game.rating.toFixed(1)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div className="bg-purple-50/60 dark:bg-gray-800/50 backdrop-blur-sm h-full flex flex-col">
                          <div className="aspect-[3/4] flex items-center justify-center bg-gray-100/50 dark:bg-gray-700/50">
                            <div className="text-center p-2 sm:p-4">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 mx-auto bg-gray-200/80 dark:bg-gray-600/80 rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-accent/20 dark:group-hover:bg-cyber-cyan/20 transition-all duration-300 group-hover:scale-110">
                                <Plus
                                  size={20}
                                  className="sm:w-6 sm:h-6 text-gray-400 dark:text-gray-500 group-hover:text-accent dark:group-hover:text-cyber-cyan transition-colors duration-300"
                                />
                              </div>
                              <p className="text-[0.65rem] sm:text-xs text-gray-400 dark:text-gray-500 font-medium">
                                {isOwnProfile ? "Add Game" : "Empty Slot"}
                              </p>
                            </div>
                          </div>
                          <div className="p-2 sm:p-3 md:p-4 flex-1 flex items-center justify-center">
                            <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 font-medium text-center">
                              Position #{index + 1}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Hall of Fame Modal */}
            {modalState.isHofModalOpen && (
              <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                <div className="bg-lightBg dark:bg-cyber-dark rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                  <div className="p-4 sm:p-6 border-b border-brown-light dark:border-cyber-purple flex justify-between items-center">
                    <h3 className="text-lg sm:text-xl font-bold text-brown-dark dark:text-cyber-pink">
                      Select a game for position #{modalState.selectedHofSlot + 1}
                    </h3>
                    <button
                      onClick={() =>
                        setModalState((prev) => ({
                          ...prev,
                          isHofModalOpen: false,
                          searchResults: [],
                          searchQuery: "",
                        }))
                      }
                      className="p-1 rounded-full hover:bg-brown-light/20 dark:hover:bg-cyber-purple/20 text-brown-dark dark:text-cyber-cyan"
                    >
                        <X size={20} className="sm:w-6 sm:h-6" />
                      </button>
                    </div>

                    {/* Barra de búsqueda */}
                    <div className="p-4 border-b border-brown-light dark:border-cyber-purple">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown dark:text-cyber-cyan w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search games..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-brown-light/10 dark:bg-cyber-purple/10 border border-brown-light/30 dark:border-cyber-purple/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-cyber-cyan text-brown-dark dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="p-4 sm:p-6 overflow-y-auto">
                      {modalState.isLoadingSearch ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent dark:border-cyber-cyan"></div>
                        </div>
                      ) : searchQuery.length > 0 && modalState.searchResults.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                          {modalState.searchResults.map((game) => (
                            <div
                              key={`search-result-${game.id}`}
                              onClick={() => handleHofGameSelect(game)}
                              className="cursor-pointer group"
                            >
                              <div className="aspect-[3/4] relative rounded-lg overflow-hidden">
                                <img
                                  src={game.image_url || game.background_image || "/placeholder.svg"}
                                  alt={game.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button className="bg-accent dark:bg-cyber-cyan hover:bg-accent-dark dark:hover:bg-cyber-cyan/80 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all">
                                    Select
                                  </button>
                                </div>
                              </div>
                              <h4 className="mt-2 text-xs sm:text-sm font-medium text-brown-dark dark:text-white line-clamp-2">
                                {game.name}
                              </h4>
                              {game.released && (
                                <p className="text-xs text-brown dark:text-cyber-cyan">
                                  {new Date(game.released).getFullYear()}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : searchQuery.length > 0 && modalState.searchResults.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-brown dark:text-cyber-cyan">No games found matching "{searchQuery}"</p>
                        </div>
                      ) : profileState.userFavorites.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                          {profileState.userFavorites
                            .filter((fav) => {
                              return !profileState.favoriteGames.some((hofGame) => hofGame?.id === fav.id)
                            })
                            .map((game) => (
                              <div
                                key={`hof-modal-${game.id}`}
                                onClick={() => handleHofGameSelect(game)}
                                className="cursor-pointer group"
                              >
                                <div className="aspect-[3/4] relative rounded-lg overflow-hidden">
                                  <img
                                    src={game.image_url || "/placeholder.svg"}
                                    alt={game.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button className="bg-accent dark:bg-cyber-cyan hover:bg-accent-dark dark:hover:bg-cyber-cyan/80 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all">
                                      Select
                                    </button>
                                  </div>
                                </div>
                                <h4 className="mt-2 text-xs sm:text-sm font-medium text-brown-dark dark:text-white line-clamp-2">
                                  {game.name}
                                </h4>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-brown dark:text-cyber-cyan">No favorite games available to add</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
 {/* Progress Bar */}
{isOwnProfile && profileState.favoriteGames.length < 5 && (
  <div className="text-center mt-6 sm:mt-8 px-4">
    <ProgressBarUsers
      current={profileState.favoriteGames.length}
      total={5} 
    />
  </div>
)}
            </div>

            {/* Tabs Section */}
            <div
              className="backdrop-blur-xl rounded-2xl border border-brown-light dark:border-cyber-cyan/30 shadow-2xl"
              style={{
                background:
                  theme === "dark"
                    ? "rgba(10, 10, 31, 0.8)"
                    : "linear-gradient(135deg, rgba(190, 155, 123, 0.1) 0%, rgba(133, 68, 66, 0.05) 40%)",
              }}
            >
              <div className="border-b border-brown-light/30 dark:border-cyber-cyan/30">
                <div className="overflow-x-auto pb-2 -mx-2 sm:mx-0">
                  <nav className="flex space-x-4 sm:space-x-6 md:space-x-8 px-4 sm:px-6 md:px-8 min-w-max">
                    {[
                      { id: "reviews", label: "Reviews", icon: MessageSquare, color: "text-green-500" },
                      { id: "lists", label: "Lists", icon: List, color: "text-blue-500" },
                    ].map(({ id, label, icon: Icon, color }) => (
                      <button
                        key={id}
                        onClick={() => setUIState((prev) => ({ ...prev, activeTab: id }))}
                        className={`flex items-center space-x-2 sm:space-x-3 py-4 sm:py-6 border-b-2 font-bold text-xs sm:text-sm transition-all duration-300 ${
                          uiState.activeTab === id
                            ? "border-brown-dark dark:border-cyber-cyan text-brown-dark dark:text-cyber-cyan"
                            : "border-transparent text-brown/70 dark:text-gray-400 hover:text-brown-dark dark:hover:text-cyber-cyan"
                        }`}
                      >
                        <Icon
                          size={16}
                          className={`sm:w-5 sm:h-5 ${uiState.activeTab === id ? "text-brown-dark dark:text-cyber-cyan" : color}`}
                        />
                        <span>{label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              <div className="p-4 sm:p-6 md:p-8">
                {uiState.successMessage && (
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 backdrop-blur-sm">
                    <div className="flex items-center">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                        <Check size={14} className="sm:w-4 sm:h-4 text-white" />
                      </div>
                      <p className="text-green-700 dark:text-green-300 font-medium text-sm sm:text-base">
                        {uiState.successMessage}
                      </p>
                    </div>
                  </div>
                )}

                {uiState.error && (
                  <div className="bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/30 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 backdrop-blur-sm">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                          <X size={14} className="sm:w-4 sm:h-4 text-white" />
                        </div>
                        <p className="text-red-700 dark:text-red-300 font-medium text-sm sm:text-base">{uiState.error}</p>
                      </div>
                      <button
                        onClick={() => setUIState((prev) => ({ ...prev, error: null }))}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                      >
                        <X size={16} className="sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Reviews Tab */}
                {uiState.activeTab === "reviews" && (
                  <div className="space-y-6 sm:space-y-8">
                    {profileState.recentReviews.length > 0 ? (
                      <>
                        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 lg:grid-cols-2">
                          {currentReviews.map((review, index) => (
                            <div
                              key={review.id}
                              className="group relative bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-sm rounded-2xl border border-brown-light/30 dark:border-cyber-cyan/30 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                              {isOwnProfile && (
                                <button
                                  onClick={() => handleDeleteReview(review.id)}
                                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-600"
                                  title="Delete review"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}

                              <div className="flex items-start space-x-3 sm:space-x-4 mb-4">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 border border-brown-light/30 dark:border-cyber-cyan/30">
                                  <img
                                    src={review.game.image_url || "/placeholder.svg?height=64&width=64"}
                                    alt={review.game.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.src = "/placeholder.svg?height=64&width=64"
                                    }}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-brown-dark dark:text-cyber-pink text-sm sm:text-base line-clamp-2 mb-1">
                                    {review.game.name}
                                  </h4>
                                  <div className="flex items-center space-x-2 mb-2">
                                    <div className="flex items-center">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          size={14}
                                          className={`sm:w-4 sm:h-4 ${
                                            i < review.star_rating
                                              ? "text-yellow-500 fill-yellow-500"
                                              : "text-gray-300 dark:text-gray-600"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-xs sm:text-sm font-medium text-brown-dark dark:text-cyber-cyan">
                                      {review.star_rating}/5
                                    </span>
                                  </div>
                                  <p className="text-xs sm:text-sm text-brown dark:text-cyber-cyan">
                                    {new Date(review.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>

                              {review.text && (
                                <div className="mb-4">
                                  <p className="text-brown-dark dark:text-white text-sm sm:text-base leading-relaxed line-clamp-4">
                                    {review.text}
                                  </p>
                                </div>
                              )}

                              <div className="flex items-center justify-between pt-3 border-t border-brown-light/20 dark:border-cyber-cyan/20">
                                <div className="flex items-center space-x-2">
                                  <Heart size={14} className="sm:w-4 sm:h-4 text-red-500" />
                                  <span className="text-xs sm:text-sm text-brown dark:text-cyber-cyan">
                                    {review.likes || 0} likes
                                  </span>
                                </div>
                                <Link
                                  to={`/games/${review.game.slug || review.game.id}`}
                                  className="text-xs sm:text-sm text-accent dark:text-cyber-cyan hover:text-accent-dark dark:hover:text-cyber-pink transition-colors font-medium"
                                >
                                  View Game →
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pagination for Reviews */}
                        {limitedReviews.length > reviewsPerPage && (
                          <div className="flex justify-center items-center space-x-4 mt-6 sm:mt-8">
                            <button
                              onClick={() =>
                                setUIState((prev) => ({
                                  ...prev,
                                  currentReviewPage: Math.max(0, prev.currentReviewPage - 1),
                                }))
                              }
                              disabled={uiState.currentReviewPage === 0}
                              className="flex items-center px-3 sm:px-4 py-2 bg-brown-light/20 dark:bg-cyber-purple/20 text-brown-dark dark:text-cyber-cyan rounded-lg hover:bg-brown-light/30 dark:hover:bg-cyber-purple/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                              <ChevronLeft size={16} className="mr-1" />
                              Previous
                            </button>
                            <span className="text-sm text-brown dark:text-cyber-cyan">
                              Page {uiState.currentReviewPage + 1} of {Math.ceil(limitedReviews.length / reviewsPerPage)}
                            </span>
                            <button
                              onClick={() =>
                                setUIState((prev) => ({
                                  ...prev,
                                  currentReviewPage: Math.min(
                                    Math.ceil(limitedReviews.length / reviewsPerPage) - 1,
                                    prev.currentReviewPage + 1,
                                  ),
                                }))
                              }
                              disabled={
                                uiState.currentReviewPage >= Math.ceil(limitedReviews.length / reviewsPerPage) - 1
                              }
                              className="flex items-center px-3 sm:px-4 py-2 bg-brown-light/20 dark:bg-cyber-purple/20 text-brown-dark dark:text-cyber-cyan rounded-lg hover:bg-brown-light/30 dark:hover:bg-cyber-purple/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                              Next
                              <ChevronRight size={16} className="ml-1" />
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12 sm:py-16">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-brown-light/20 dark:bg-cyber-cyan/20 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 border border-brown-light/30 dark:border-cyber-cyan/30">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brown-light/30 dark:bg-cyber-cyan/30 rounded-xl sm:rounded-2xl flex items-center justify-center">
                            <MessageSquare size={32} className="sm:w-10 sm:h-10 text-brown-dark dark:text-cyber-cyan" />
                          </div>
                        </div>
                        <h4 className="text-2xl sm:text-3xl font-bold text-brown-dark dark:text-cyber-cyan mb-3 sm:mb-4">
                          No Reviews Yet
                        </h4>
                        <p className="text-brown dark:text-cyber-cyan mb-6 sm:mb-8 max-w-md mx-auto text-base sm:text-lg">
                          {isOwnProfile
                            ? "Share your gaming experiences and help other players discover amazing games!"
                            : "This player hasn't shared any reviews yet."}
                        </p>
                        {isOwnProfile && (
                          <button
                            onClick={() => navigate("/games")}
                            className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-brown to-brown-light dark:from-cyber-purple dark:to-cyber-pink text-white rounded-xl hover:from-brown-dark hover:to-brown dark:hover:from-cyber-pink dark:hover:to-cyber-purple transition-all duration-200 ease-in-out transform hover:scale-[1.02] shadow-lg hover:shadow-brown/25 dark:hover:shadow-cyber-purple/25 text-sm sm:text-base font-medium"
                          >
                            <MessageSquare size={18} className="mr-2" />
                            Write Your First Review
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Lists Tab */}
                {uiState.activeTab === "lists" && (
  <UserLists
    profileState={profileState}
    isOwnProfile={isOwnProfile}
    editState={editState}
    setEditState={setEditState}
    createList={createList}
    updateList={updateList}
    deleteList={deleteList}
    username={username}
  />
)}
                      </div>
                    )
                  </div>
                )
              </div>
            </div>
          </div>
  )
}
