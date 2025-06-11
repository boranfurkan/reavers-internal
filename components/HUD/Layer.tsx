import React, { useCallback, useContext, useEffect, useState } from 'react';
import Building from '../missions/Building';
import { motion, AnimatePresence } from 'framer-motion';
import { LayerContext } from '../../contexts/LayerContext';
import { useDynamicContextWrapper } from '../../hooks/UseDynamicContextWrapper';

let buildingScale = 1;

interface LayerProps {
  setCurrentMission: any;
  location: 'top' | 'center' | 'bottom';
}

const variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.5 },
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5 },
  },
  exit: {
    opacity: 0,
    scale: 1.05,
    transition: { duration: 0.5 },
  },
};

const buildingVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 },
  },
};

function Layer(props: LayerProps) {
  const layerContext = useContext(LayerContext);

  if (!layerContext) {
    throw new Error('LayerMap must be used within a LayerProvider');
  }

  const { currentLevel, setMissionModalOpen } = layerContext;

  const { primaryWallet } = useDynamicContextWrapper();
  const [isVideoLoaded, setVideoLoaded] = useState<boolean>(false);
  const [loadBuilding, setLoadBuilding] = useState<boolean>(false);

  const handleBuildingClick = useCallback(
    (mission: any) => {
      props.setCurrentMission(mission);
      setMissionModalOpen((prev) => !prev);
    },
    [props.setCurrentMission, setMissionModalOpen],
  );

  function changeScale() {
    buildingScale = window.innerWidth / 1920;
  }

  useEffect(() => {
    window.addEventListener('resize', changeScale);
    changeScale();
    return () => window.removeEventListener('resize', changeScale);
  }, []);

  useEffect(() => {
    setLoadBuilding(false);
    const timer = setTimeout(() => setLoadBuilding(true), 500);
    return () => clearTimeout(timer);
  }, [currentLevel]);

  changeScale();

  return (
    <>
      {primaryWallet && primaryWallet.publicKey && (
        <div className="relative flex h-full w-full flex-col content-center items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLevel.image}
              id="MainParent"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={variants}
              className="map-parent">
              <video
                onLoadStart={() => {
                  setVideoLoaded(true);
                  setTimeout(() => setLoadBuilding(true), 100);
                }}
                style={{ display: `${isVideoLoaded ? 'block' : 'none'}` }}
                preload="auto"
                src={currentLevel.image}
                autoPlay
                loop
                muted
                playsInline
                id="map-video"
                className="map-video"
                onError={(e) => {
                  const target = e.target as HTMLVideoElement;
                  target.onerror = null;
                  target.src = currentLevel.fallback;
                }}>
                <source src={currentLevel.image} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              <AnimatePresence>
                {loadBuilding && (
                  <motion.div
                    className="map-buildings"
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={buildingVariants}>
                    {currentLevel.missions.map((mission: any, index: any) => (
                      <Building
                        key={index}
                        id={mission.id}
                        name={mission.name}
                        type={mission.missionStats?.kind}
                        image={mission.image}
                        x={mission.x}
                        y={mission.y}
                        width={mission.width}
                        height={mission.height}
                        scale={buildingScale}
                        display={loadBuilding}
                        gemYield={mission.missionStats?.yield}
                        onClick={() => handleBuildingClick(mission)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </>
  );
}

export default Layer;
