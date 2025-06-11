import { AnimatePresence, motion } from 'framer-motion';
import React, { useContext, useMemo, useState, useCallback } from 'react';
import { LayerContext } from '../../contexts/LayerContext';
import styled from 'styled-components';
import Image from 'next/image';
import ControlButtons from './ControlButtons';
import { debounce } from 'lodash';
import { useLeaderboardContext } from '../../contexts/LeaderboardContext';

const StyledImage = styled(Image)<{ src: any; alt: any }>``;

const modalVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const LayerAndMissionSelectModal = () => {
  const layerContext = useContext(LayerContext);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  if (!layerContext) {
    throw new Error('LayerMap must be used within a LayerProvider');
  }

  const {
    isMobile,
    levels,
    setCurrentLevel,
    setIsLayerAndMissionSelectModalOpen,
    /*     setArenaModalOpen, */
    setFleetCommanderModalOpen,
    isLayerAndMissionSelectModalOpen,
  } = layerContext;

  const leaderboardContext = useLeaderboardContext();

  const layerItems = useMemo(() => {
    const layers = levels.map((layer) => ({
      id: `Island ${layer.id}`,
      name: layer.name,
      image: layer.icon,
      onClick: () => {
        if (!isDragging) {
          setCurrentLevel(layer);
          setIsLayerAndMissionSelectModalOpen(false);
        }
      },
    }));

    return [
      ...layers,
      {
        id: 'Dashboard 1',
        name: 'Fleet Command',
        image: '/images/fleet-commander-icon.webp',
        onClick: () => {
          if (!isDragging) {
            setIsLayerAndMissionSelectModalOpen(false);
            setFleetCommanderModalOpen(true);
          }
        },
      },
    ];
  }, [
    levels,
    setCurrentLevel,
    setIsLayerAndMissionSelectModalOpen,
    isDragging,
  ]);

  const navigate = useCallback(
    (newDirection: number) => {
      if (isAnimating) return;

      setDirection(newDirection);
      setIsAnimating(true);
      setCurrentIndex((prev) =>
        newDirection > 0
          ? prev === layerItems.length - 1
            ? 0
            : prev + 1
          : prev === 0
          ? layerItems.length - 1
          : prev - 1,
      );
    },
    [isAnimating, layerItems.length],
  );

  const debouncedNavigate = useMemo(
    () => debounce(navigate, 300, { leading: true, trailing: false }),
    [navigate],
  );

  const handleUpClick = () => debouncedNavigate(-1);
  const handleDownClick = () => debouncedNavigate(1);

  const slideVariants = {
    enter: (direction: number) => ({
      y: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: isMobile ? 1 : 0.8,
    }),
    center: {
      zIndex: 1,
      y: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      y: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: isMobile ? 1 : 0.8,
    }),
  };

  const swipeConfidenceThreshold = isMobile ? 5000 : 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  return (
    <AnimatePresence>
      {isLayerAndMissionSelectModalOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalVariants}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex h-full w-screen flex-col items-center justify-center bg-black">
          <div className="relative flex w-full flex-col items-center justify-center px-4 md:absolute md:left-1/2 md:top-1/2 md:w-auto md:-translate-x-1/2 md:-translate-y-1/2 md:px-0">
            <AnimatePresence
              initial={false}
              custom={direction}
              mode="wait"
              onExitComplete={() => setIsAnimating(false)}>
              <motion.div
                key={layerItems[currentIndex].id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  y: { type: 'spring', stiffness: 200, damping: 25 },
                  opacity: { duration: 0.5 },
                  scale: { duration: 0.5 },
                }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={1}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.y, velocity.y);
                  if (swipe < -swipeConfidenceThreshold) {
                    handleDownClick();
                  } else if (swipe > swipeConfidenceThreshold) {
                    handleUpClick();
                  }
                  // Reset dragging state after a small delay
                  setTimeout(() => setIsDragging(false), 100);
                }}
                className="z-10 flex w-full flex-col items-center justify-start gap-1.5 text-center font-Body md:w-[33vw] md:scale-[1.66]">
                <p className="text-thin text-Body text-xs uppercase text-white opacity-50 md:text-[0.75rem]">
                  {layerItems[currentIndex].id}
                </p>
                <h1 className="text-lg font-thin uppercase text-white md:text-xl lg:text-2xl">
                  {layerItems[currentIndex].name}
                </h1>
                <div
                  className="w-full max-w-sm cursor-pointer md:max-w-md"
                  onClick={layerItems[currentIndex].onClick}>
                  <StyledImage
                    src={layerItems[currentIndex].image}
                    alt={layerItems[currentIndex].name}
                    width={isMobile ? 300 : 400}
                    height={isMobile ? 300 : 400}
                    className="pointer-events-none w-full select-none rounded-lg"
                    priority={true}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <ControlButtons
            onUpButtonClick={handleUpClick}
            onDownButtonClick={handleDownClick}
            onMiddleButtonClick={() =>
              setIsLayerAndMissionSelectModalOpen(false)
            }
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LayerAndMissionSelectModal;
