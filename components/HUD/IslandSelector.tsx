import React, { useContext, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layer, LayerContext } from '../../contexts/LayerContext';
import IslandIcon from '../../assets/IslandIcon';

const IslandSelector: React.FC = () => {
  const layerContext = useContext(LayerContext);
  const [isVisible, setIsVisible] = useState(false);
  const [activeIsland, setActiveIsland] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [currentLevel, setCurrentLevelState] = useState<number | null>(null);

  if (!layerContext) {
    throw new Error('IslandSelector must be used within a LayerProvider');
  }

  const { levels, setCurrentLevel, isMobile } = layerContext;

  // Get all 7 islands
  const islands: (Layer | null)[] = [...levels.slice(0, 7)];

  // Handle click outside to close the mobile selector
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    if (isVisible && isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, isMobile]);

  // Set current level indicator on load
  useEffect(() => {
    const index = levels.findIndex(
      (level) => level === layerContext.currentLevel,
    );
    if (index !== -1) {
      setCurrentLevelState(index);
    }
  }, [layerContext.currentLevel, levels]);

  const handleIslandSelect = (level: Layer | null, index: number) => {
    if (level) {
      // Visual feedback animation
      setActiveIsland(index);
      setCurrentLevelState(index);

      // Reset after animation completes
      setTimeout(() => {
        setActiveIsland(null);
        setCurrentLevel(level);
        if (isMobile) {
          setIsVisible(false); // Close after selection on mobile only
        }
      }, 300);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle number keys 1-7
      const key = parseInt(e.key);
      if (!isNaN(key) && key >= 1 && key <= 7) {
        const index = key - 1;
        if (islands[index]) {
          handleIslandSelect(islands[index], index);
        }
      }

      // Toggle mobile visibility with Tab
      if (e.key === 'Tab' && isMobile) {
        e.preventDefault();
        setIsVisible((prev) => !prev);
      }

      // Close on Escape for mobile
      if (e.key === 'Escape' && isMobile) {
        setIsVisible(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [islands, isMobile]);

  // Desktop animation variants - improved timing and transitions
  const desktopItemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        delay: i * 0.06,
        ease: [0.25, 0.1, 0.25, 1], // Custom cubic-bezier for smoother motion
      },
    }),
  };

  // Mobile container animation variants - improved
  const mobileContainerVariants = {
    hidden: {
      opacity: 0,
      y: 15,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.25,
        ease: 'easeOut',
        staggerChildren: 0.04,
      },
    },
    exit: {
      opacity: 0,
      y: 10,
      scale: 0.95,
      transition: { duration: 0.2, ease: 'easeIn' },
    },
  };

  // Mobile item animation variants - improved
  const mobileItemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 5 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.15, ease: 'easeIn' },
    },
  };

  // Show/hide toggle button for mobile
  const handleToggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  const renderDesktopIslands = () => (
    <div className="fixed right-4 top-1/2 z-50 flex w-14 -translate-y-1/2 flex-col gap-3 p-1">
      {islands.map((level, index) => (
        <motion.div
          key={level?.uniqueId || `empty-${index}`}
          custom={index}
          initial="hidden"
          animate="visible"
          variants={desktopItemVariants}
          onClick={() => handleIslandSelect(level, index)}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          className={`group relative flex h-14 min-h-14 w-14 min-w-14 cursor-pointer items-center justify-center rounded-lg bg-black/50 backdrop-blur-md transition-all duration-200 ${
            hoveredIndex === index
              ? 'scale-105 shadow-lg shadow-black/30 brightness-110'
              : 'shadow-md shadow-black/20 brightness-100'
          } ${
            currentLevel === index
              ? 'ring-1 ring-white/80 ring-offset-1 ring-offset-black/50'
              : 'ring-1 ring-white/10'
          }`}>
          {level ? (
            <>
              {/* Island icon with better fit */}
              <div className="absolute inset-0 flex items-center justify-center overflow-visible rounded-md">
                {level.icon ? (
                  <div className="h-full w-full p-1">
                    <img
                      src={level.icon}
                      alt={`Island ${index + 1}`}
                      className={`h-full w-full rounded object-cover transition-all duration-300 ${
                        hoveredIndex === index ? 'scale-105' : 'scale-100'
                      }`}
                    />
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-md bg-gradient-to-br from-gray-800 to-gray-950">
                    <span className="text-lg font-medium text-white/90">
                      {index + 1}
                    </span>
                  </div>
                )}
              </div>

              {/* Number indicator with improved styling */}
              <div className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-md border border-white/80 bg-black/90 text-[10px] font-bold text-white shadow-sm">
                {index + 1}
              </div>
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-800 to-gray-950">
              <span className="text-lg font-medium text-white/40">
                {index + 1}
              </span>
            </div>
          )}
        </motion.div>
      ))}
      {/* Improved keyboard hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7, transition: { delay: 0.8, duration: 0.4 } }}
        className="mt-1 text-center text-[10px] font-medium tracking-wide text-white/60">
        Press 1-7
      </motion.div>
    </div>
  );

  // For mobile: Improved compact grid
  const renderMobileIslands = () => (
    <div className="fixed bottom-6 right-2 z-50" ref={mobileMenuRef}>
      {/* Toggle button with improved styling */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
        onClick={handleToggleVisibility}
        className="relative flex h-10 w-14 items-center justify-center rounded-[3px] bg-black/80 shadow-lg shadow-black/30 ring-1 ring-white/20"
        style={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}>
        <IslandIcon width={20} fill="white" />

        {/* Current level indicator with improved styling */}
        {currentLevel !== null && (
          <div className="absolute -right-1.5 -top-2 flex h-5 w-5 items-center justify-center rounded-[3px] bg-white text-[10px] font-bold text-black shadow-md">
            {currentLevel + 1}
          </div>
        )}
      </motion.button>

      {/* Mobile islands grid selector with improved styling */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            variants={mobileContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute bottom-14 right-0 mb-2 grid grid-cols-4 gap-2 rounded-xl bg-black/85 p-3 shadow-xl ring-1 ring-white/10 backdrop-blur-md"
            style={{ width: '220px' }}>
            {islands.map((level, index) => (
              <motion.div
                key={level?.uniqueId || `empty-${index}`}
                variants={mobileItemVariants}
                onClick={() => handleIslandSelect(level, index)}
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.05 }}
                className={`relative flex h-11 w-11 cursor-pointer items-center justify-center overflow-visible rounded-lg shadow-md transition-all duration-200 ${
                  currentLevel === index
                    ? 'ring-2 ring-white/80'
                    : 'ring-1 ring-white/10'
                }`}>
                {level ? (
                  <>
                    {/* Island icon with improved styling */}
                    <div className="absolute inset-0 rounded-lg bg-gray-900/60">
                      {level.icon ? (
                        <div className="relative h-full w-full overflow-hidden">
                          <img
                            src={level.icon}
                            alt={`Island ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-transparent to-black/30" />
                        </div>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-800 to-gray-950">
                          <span className="text-base text-white/70">
                            {index + 1}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Island number with improved styling */}
                    <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-black text-[9px] font-medium text-white shadow-sm">
                      {index + 1}
                    </div>

                    {/* Active selection animation */}
                    {activeIsland === index && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.3, 0] }}
                        transition={{ duration: 0.4, times: [0, 0.5, 1] }}
                        className="absolute inset-0 rounded-lg bg-white"
                      />
                    )}
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-800 to-gray-950">
                    <span className="text-base text-white/40">{index + 1}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return <>{isMobile ? renderMobileIslands() : renderDesktopIslands()}</>;
};

export default IslandSelector;
