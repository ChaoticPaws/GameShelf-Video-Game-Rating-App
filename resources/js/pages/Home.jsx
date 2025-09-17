"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { GameCard } from "../components/GameCard"
import { ReviewCard } from "../components/ReviewCard"
import { useTheme } from "../contexts/ThemeContext"
import { useLoading } from "../contexts/LoadingContext"
import { HomeSkeleton } from "../components/HomeSkeleton"
import BlackHole from '../components/BlackHole';

export function Home() {
  const [topGames, setTopGames] = useState([])
  const [recentReviews, setRecentReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { theme } = useTheme();
  const { setLoading } = useLoading()
  const [isPaused, setIsPaused] = useState(false)
  const carouselRef = useRef(null)
  const animationRef = useRef(null)
  const positionRef = useRef(0)
  const lastTimestampRef = useRef(0)
  const speedRef = useRef(40)
  const [windowWidth, setWindowWidth] = useState(0)
  
 // Colores para los títulos según el tema
  const titleColors = {
    dark: {
      primary: '#FF00A0',    
      secondary: '#00F0FF',  
      accent: '#39FF14'      
    },
    light: {
      primary: '#4b3832',    
      secondary: '#5a4e47',  
      accent: '#7a6a63'      
    }
  };

  // Asegurar que el modo oscuro se aplique al body o contenedor principal
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Detectar tamaño de ventana para responsive
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const isMobile = windowWidth < 768
  const isTablet = windowWidth >= 768 && windowWidth < 1024

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true)
      setIsLoading(true)
      try {
        const [gamesResponse, reviewsResponse] = await Promise.all([
          axios.get("/api/top-games?limit=10"),
          axios.get("/api/reviews/recent?limit=12"),
        ])

        // Handle games response
        const gamesData = Array.isArray(gamesResponse.data) ? gamesResponse.data : gamesResponse.data?.data || []

        // Format reviews data
        const formattedReviews = (reviewsResponse.data || []).map((review) => ({
          ...review,
          user: {
            id: review.user?.id,
            username: review.user?.username || `user-${review.user?.id}`,
            name: review.user?.name,
            avatar: review.user?.profile_pic,
          },
          game: {
            id: review.game?.id,
            name: review.game?.name,
            slug: review.game?.slug,
            image_url: review.game?.image_url,
          },
          text: review.text,
          star_rating: review.star_rating,
          likes: review.likes || 0,
          created_at: review.created_at,
        }))

        setTopGames(gamesData)
        setRecentReviews(formattedReviews)
      } catch (error) {
        console.error("Error fetching home data:", error)
        setTopGames([])
        setRecentReviews([])
      } finally {
        setLoading(false)
        setIsLoading(false)
      }
    }

    fetchHomeData()
  }, [setLoading])

useEffect(() => {
  if (isPaused) {
    const speedLinesLeft = document.getElementById('speed-lines-left');
    const speedLinesRight = document.getElementById('speed-lines-right');
    
    if (speedLinesLeft) speedLinesLeft.classList.add('paused');
    if (speedLinesRight) speedLinesRight.classList.add('paused');
  } else {
    const speedLinesLeft = document.getElementById('speed-lines-left');
    const speedLinesRight = document.getElementById('speed-lines-right');
    
    if (speedLinesLeft) speedLinesLeft.classList.remove('paused');
    if (speedLinesRight) speedLinesRight.classList.remove('paused');
  }

  if (recentReviews.length <= 4) return;

  const animate = (timestamp) => {
    if (!lastTimestampRef.current) {
      lastTimestampRef.current = timestamp;
    }
    
    if (isPaused) {
      lastTimestampRef.current = timestamp;
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    
    const deltaTime = (timestamp - lastTimestampRef.current) / 1000;
    lastTimestampRef.current = timestamp;
    
    // Ajustar velocidad según dispositivo
    const adjustedSpeed = isMobile ? speedRef.current * 0.3 : isTablet ? speedRef.current * 0.6 : speedRef.current * 0.8;
    positionRef.current += adjustedSpeed * deltaTime;
    
    const carouselWidth = carouselRef.current?.scrollWidth / 2 || 0;
    if (positionRef.current >= carouselWidth) {
      positionRef.current = 0;
    }
    
    if (carouselRef.current) {
      carouselRef.current.style.transform = `translateX(-${positionRef.current}px)`;
      if (!isMobile) {
        applyPortalEffects();
      }
    }
    
    animationRef.current = requestAnimationFrame(animate);
  };

  animationRef.current = requestAnimationFrame(animate);
  
  return () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };
}, [recentReviews.length, isPaused, isMobile, isTablet]);


const applyPortalEffects = () => {
  if (!carouselRef.current || isMobile) return;

  const cards = carouselRef.current.children;
  const leftPortal = document.querySelector('.blackhole-portal-left');
  const rightPortal = document.querySelector('.blackhole-portal-right');

  if (!leftPortal || !rightPortal) return;

  const leftRect = leftPortal.getBoundingClientRect();
  const rightRect = rightPortal.getBoundingClientRect();

  const leftPortalCenter = leftRect.left + leftRect.width / 2;
  const rightPortalCenter = rightRect.left + rightRect.width / 2;
  const portalRadius = leftRect.width * 1.5;

  let leftPortalActive = false;
  let rightPortalActive = false;

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const rect = card.getBoundingClientRect();
    const cardCenterX = rect.left + rect.width / 2;

    // Calcular distancia a los portales
    const distLeft = Math.abs(cardCenterX - leftPortalCenter);
    const distRight = Math.abs(cardCenterX - rightPortalCenter);

    // Solo animar tarjetas visibles en viewport
    if (rect.right < 0 || rect.left > window.innerWidth) {
      card.style.transform = 'translateX(0) scale(1)';
      card.style.opacity = '1';
      card.style.filter = 'none';
      continue;
    }

    // PORTAL IZQUIERDO - Efecto de succión extremo (AZUL)
    if (distLeft < portalRadius) {
      leftPortalActive = true;
      const progress = 1 - (distLeft / portalRadius);
      
      // Efectos dramáticos de succión solo para portal izquierdo
      const scale = 1 - (progress * 0.7);
      const rotate = progress * -10;
      const opacity = 1 - (progress * 0.5);
      const blur = progress * 5;
      const stretchX = 1 + (progress * 0.5);
      const stretchY = 1 - (progress * 0.3);

      card.style.transform = `translateX(${progress * -20}px) scale(${scale}) scaleX(${stretchX}) scaleY(${stretchY}) rotate(${rotate}deg)`;
      card.style.opacity = `${opacity}`;
      card.style.filter = `blur(${blur}px) brightness(${0.3 + progress * 0.7})`;
      card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }
   // PORTAL DERECHO - Efecto de aparición con movimiento original pero visible
    else if (distRight < portalRadius) {
      rightPortalActive = true;
      const progress = distRight / portalRadius; // Cálculo ORIGINAL
      
      // Efecto de movimiento continuo: visible desde el principio
      const translateX = (1 - progress) * 50; // Movimiento suave desde la derecha
      const opacity = 0.8 + (progress * 0.2); // Comienza con 80% de opacidad (visible)
      const blur = (1 - progress) * 5; // Desenfoque moderado

      card.style.transform = `translateX(${translateX}px) scale(1)`;
      card.style.opacity = `${opacity}`;
      card.style.filter = `blur(${blur}px) brightness(${0.8 + progress * 0.2})`;
      card.style.transition = 'all 0.3s ease-out';
    }
    // FUERA DE LOS PORTALES - Estado normal
    else {
      card.style.transform = 'translateX(0) scale(1)';
      card.style.opacity = '1';
      card.style.filter = 'none';
    }
  }

  // Activar/desactivar líneas de velocidad
  const speedLinesLeft = document.getElementById('speed-lines-left');
  const speedLinesRight = document.getElementById('speed-lines-right');
  
  if (speedLinesLeft) {
    speedLinesLeft.classList.toggle('active', leftPortalActive && !isPaused);
  }
  if (speedLinesRight) {
    speedLinesRight.classList.toggle('active', rightPortalActive && !isPaused);
  }
};
{/* Overlay de fusión solo para portal izquierdo */}
{!isMobile && (
  <div className="portal-overlay-left"></div>
)}
  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsPaused(true);
    }
  }

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsPaused(false);
    }
  }

  // Para dispositivos móviles, mantener la animación pero permitir pausa al tocar
  const handleTouchStart = () => {
    if (isMobile) {
      setIsPaused(true);
    }
  }

  const handleTouchEnd = () => {
    if (isMobile) {
      // Reactivar la animación después de un breve delay
      setTimeout(() => setIsPaused(false), 1000);
    }
  };

   // Calcular el ancho de las tarjetas según el dispositivo
  const getCardWidth = () => {
    if (isMobile) return "w-[85vw] max-w-[320px]";
    if (isTablet) return "w-[400px]";
    return "w-[520px]";
  };

  // Calcular el espacio entre tarjetas
  const getCardGap = () => {
    if (isMobile) return 16; // 16px = gap-4
    return 24; // 24px = gap-6
  };

  // Calcular el ancho exacto de cada tarjeta en píxeles
  const calculateCardWidth = () => {
    if (isMobile) return Math.min(320, window.innerWidth * 0.85);
    if (isTablet) return 400;
    return 520;
  };

  if (isLoading) {
    return <HomeSkeleton /> 
  }

  // Duplicar las reviews para efecto infinito en todos los dispositivos
  const duplicatedReviews = [...recentReviews, ...recentReviews];

  // Calcular el ancho total del carrusel
  const cardWidth = isMobile ? 320 : isTablet ? 400 : 520;
  const cardGap = getCardGap();
  const totalWidth = (cardWidth + cardGap) * duplicatedReviews.length;

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
       {/* Hero Section */}
<section className="mb-16 text-center">
  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-accent dark:text-cyber-pink">
    Discover & Share Game Experiences
  </h1>
<p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
  Find your next favorite game and see what the community is saying about the latest releases.
</p>
</section>

        {/* Top Rated Games Section */}
<section className="mb-16">
  <div className="flex items-center justify-between mb-8 px-2">
    <h2 className="text-2xl sm:text-3xl font-bold flex items-center">
      <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-gradient-to-b from-accent to-accent-light dark:from-cyber-pink dark:via-cyber-purple dark:to-cyber-cyan rounded-full mr-3 sm:mr-4 shadow-[0_0_6px_2px_rgba(133,68,66,0.7)] dark:shadow-[0_0_8px_2px_rgba(0,245,255,0.6)]" />
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-light dark:from-cyber-pink dark:to-cyber-purple">
        Top Rated Games
      </span>
    </h2>
    <a href="/games" className="text-sm font-medium text-accent hover:text-heading transition-colors dark:text-cyber-cyan dark:hover:text-cyber-green">
      View All →
    </a>
  </div>

          {topGames.length > 0 ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 px-2">
              {topGames.map((game) => (
                <GameCard 
                  key={game.id} 
                  game={game} 
                  className="transition-transform hover:scale-105 hover:shadow-xl bg-beige-50 dark:bg-cyber-dark/70" 
                />
              ))}
            </div>
          ) : (
            <div className="p-6 sm:p-8 rounded-xl bg-gradient-to-br from-lightBg/50 to-gray-100 dark:from-cyber-dark/70 dark:to-gray-900 text-center mx-2">
              <p className="text-textLight dark:text-gray-300">No top-rated games available. Check back later!</p>
              <a
                href="/games"
                className="mt-4 inline-block px-4 py-2 text-sm bg-accent text-white rounded-lg hover:bg-heading transition-colors dark:bg-cyber-cyan dark:text-cyber-dark dark:hover:bg-cyber-green"
              >
                Browse All Games
              </a>
            </div>
          )}
        </section>

       {/* Recent Reviews Section */}
<section className="mb-16">
  <div className="flex items-center justify-between mb-8 px-2">
    <h2 className="text-2xl sm:text-3xl font-bold flex items-center">
      <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-gradient-to-b from-accent to-accent-light dark:from-cyber-pink dark:via-cyber-purple dark:to-cyber-cyan rounded-full mr-3 sm:mr-4 shadow-[0_0_6px_2px_rgba(133,68,66,0.7)] dark:shadow-[0_0_8px_2px_rgba(0,245,255,0.6)]" />
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-light dark:from-cyber-pink dark:to-cyber-purple">
        Community Reviews
      </span>
    </h2>
  </div>

          {recentReviews.length > 0 ? (
  <div className="relative py-6 sm:py-10">
    {/* Contenedor principal con sombras en los extremos */}
    <div className="relative">
      {/* Fusión mejorada con los portales - SIN grises claros - CON bordes redondeados */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background via-[#000000] to-transparent pointer-events-none z-40 rounded-r-xl"></div>
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#000000] to-transparent pointer-events-none z-40 opacity-90 rounded-r-lg"></div>
      <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#000000] to-transparent pointer-events-none z-40 opacity-70 rounded-r-md"></div>

      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background via-[#000000] to-transparent pointer-events-none z-40 rounded-l-xl"></div>
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#000000] to-transparent pointer-events-none z-40 opacity-90 rounded-l-lg"></div>
      <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#000000] to-transparent pointer-events-none z-40 opacity-70 rounded-l-md"></div>
  
      {!isMobile && (
  <>
    <div className="blackhole-portal-left" style={{filter: 'none'}}>
      <BlackHole 
        color="blue" 
        className="w-full h-full" 
        opacity={0.9} 
        intensity={0.8}
        mode="day" 
        
      />
    </div>
    <div className="blackhole-portal-right" style={{filter: 'none'}}>
      <BlackHole 
        color="orange" 
        className="w-full h-full" 
        opacity={0.9} 
        intensity={0.8}
        mode="day" 
       
      />
    </div>
  </>
)}
               {/* speedlines */}
                {!isMobile && (
  <>
    <div id="speed-lines-left" className="speed-lines left">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="speed-line"></div>
      ))}
      {[...Array(4)].map((_, i) => (
        <div key={i+5} className="speed-particle"></div>
      ))}
    </div>
    <div id="speed-lines-right" className="speed-lines right">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="speed-line"></div>
      ))}
      {[...Array(4)].map((_, i) => (
        <div key={i+5} className="speed-particle"></div>
      ))}
    </div>
  </>
)}
                
                {/* Overlay de bordes */}
                {!isMobile && (
                  <>
                    <div className="carousel-edge-overlay left-0 bg-gradient-to-r from-background to-transparent dark:from-background dark:to-transparent"></div>
                    <div className="carousel-edge-overlay right-0 bg-gradient-to-l from-background to-transparent dark:from-background dark:to-transparent"></div>
                  </>
                )}
                
                {/* Contenedor del carrusel */}
                <div 
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
  onTouchStart={isMobile ? handleTouchStart : undefined}
  onTouchEnd={isMobile ? handleTouchEnd : undefined}
  className="carousel-container overflow-hidden relative z-30 mx-auto"
  style={{ maxWidth: "110%" }}
>
                  <div 
                    ref={carouselRef}
                    className={`flex ${isMobile ? 'gap-4' : 'gap-6'}`}
                    style={{
                      width: `${totalWidth}px`,
                      willChange: 'transform'
                    }}
                  >
                    {duplicatedReviews.map((review, index) => (
                      <div 
                        key={`${review.id}-${index}`} 
                        className={`${getCardWidth()} flex-shrink-0 transition-all duration-500 ease-out ${isMobile ? '' : 'card-warp'}`}
                        style={{ 
                          transform: 'translateZ(0)', 
                        }}
                      >
                        <ReviewCard
                          review={review}
                          showUser={true}
                          showGame={true}
                          showGameImage={true}
                          maxTextLength={isMobile ? 100 : isTablet ? 120 : 160}
                          className="h-full shadow-xl"
                          compact={isMobile}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8 rounded-xl bg-gradient-to-br from-lightBg/50 to-gray-100 dark:from-cyber-dark/70 dark:to-gray-900 text-center mx-2">
              <p className="text-textLight dark:text-gray-300">No reviews yet. Be the first to review a game!</p>
              <a
                href="/games"
                className="mt-4 inline-block px-6 py-2 bg-gradient-to-r from-accent to-heading text-white rounded-full hover:shadow-md transition-all dark:from-cyber-cyan dark:to-cyber-green dark:text-cyber-dark text-sm sm:text-base"
              >
                Browse Games
              </a>
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section 
          className="rounded-2xl p-6 sm:p-8 text-center text-white dark:border mx-2"
          style={{
            background: theme === 'dark' 
              ? 'linear-gradient(to bottom, #0a0a1a, #1a0033)' 
              : 'linear-gradient(to bottom, #4b3832, #7a6a63)',
            border: theme === 'dark' ? '1px solid rgba(0,245,255,0.3)' : 'none'
          }}
        >
          <h3 
            className="text-xl sm:text-2xl font-bold mb-4"
            style={{
              color: theme === 'dark' ? titleColors.dark.secondary : '#ffffff'
            }}
          >
            Ready to share your thoughts?
          </h3>
          <p 
            className="mb-6 max-w-2xl mx-auto text-sm sm:text-base"
            style={{
              color: theme === 'dark' ? 'rgba(200,200,200,0.9)' : 'rgba(255,255,255,0.9)'
            }}
          >
            Join our community of gamers and start reviewing your favorite games today!
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <a
              href="/register"
              className="px-4 sm:px-6 py-2 sm:py-3 font-medium rounded-lg transition-colors text-sm sm:text-base"
              style={{
                background: theme === 'dark' ? titleColors.dark.secondary : '#ffffff',
                color: theme === 'dark' ? '#0a0a1a' : titleColors.light.primary
              }}
              onMouseOver={(e) => {
                e.target.style.background = theme === 'dark' ? titleColors.dark.accent : '#f8f8f8';
              }}
              onMouseOut={(e) => {
                e.target.style.background = theme === 'dark' ? titleColors.dark.secondary : '#ffffff';
              }}
            >
              Sign Up
            </a>
            <a
              href="/games"
              className="px-4 sm:px-6 py-2 sm:py-3 border-2 font-medium rounded-lg transition-colors text-sm sm:text-base"
              style={{
                borderColor: theme === 'dark' ? titleColors.dark.secondary : '#ffffff',
                color: theme === 'dark' ? titleColors.dark.secondary : '#ffffff'
              }}
              onMouseOver={(e) => {
                e.target.style.background = theme === 'dark' 
                  ? 'rgba(0,240,255,0.1)' 
                  : 'rgba(255,255,255,0.1)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              Browse Games
            </a>
            <a
              href="/reviews/create"
              className="px-4 sm:px-6 py-2 sm:py-3 font-medium rounded-lg transition-colors text-sm sm:text-base"
              style={{
                background: theme === 'dark' 
                  ? 'rgba(0,240,255,0.2)' 
                  : 'rgba(255,255,255,0.2)',
                color: theme === 'dark' ? titleColors.dark.secondary : '#ffffff'
              }}
              onMouseOver={(e) => {
                e.target.style.background = theme === 'dark' 
                  ? 'rgba(0,240,255,0.3)' 
                  : 'rgba(255,255,255,0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = theme === 'dark' 
                  ? 'rgba(0,240,255,0.2)' 
                  : 'rgba(255,255,255,0.2)';
              }}
            >
              Write a Review
            </a>
          </div>
        </section>
      </div>  
       </div>  
  )
}