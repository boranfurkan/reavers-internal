import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNfts } from '../../../../contexts/NftContext';
import CrewCard from './CrewCard';
import { CrewNFT } from '../../../../types/NFT';
import { animations } from '../../../../utils/inventory-helpers';

interface CrewsProps {
  filteredCrews?: CrewNFT[];
}

const Crews: React.FC<CrewsProps> = ({ filteredCrews }) => {
  const { crewsInGame, loading } = useNfts();

  // Use filteredCrews if provided, otherwise fall back to all crews
  const crewsToDisplay = filteredCrews || crewsInGame;

  // Render loading state
  if (loading) {
    return (
      <motion.div
        className="flex h-full w-full items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}>
        <div className="text-center">
          <motion.div
            className="mb-4 text-white/80"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}>
            Loading your Crews...
          </motion.div>
          <motion.div
            className="flex justify-center"
            variants={animations.spinnerVariants}
            animate="animate">
            <div className="h-8 w-8 rounded-full border-b-2 border-t-2 border-white">
              <motion.div
                className="h-full w-full rounded-full border-r-2 border-transparent"
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: 0.7,
                  ease: 'linear',
                  repeatType: 'loop',
                }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Render empty state
  if (!crewsToDisplay || crewsToDisplay.length === 0) {
    return (
      <motion.div
        className="flex h-full w-full items-center justify-center"
        variants={animations.emptyStateVariants}
        initial="hidden"
        animate="visible">
        <div className="text-center opacity-70">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}>
            {filteredCrews && filteredCrews.length === 0
              ? 'No crews match your current filters.'
              : "You don't have any Crews in-game yet."}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Render crews grid
  return (
    <div className="h-full w-full">
      <AnimatePresence>
        <motion.div
          layout
          variants={animations.containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {crewsToDisplay.map((crew) => (
            <CrewCard key={crew.uid} crew={crew as CrewNFT} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Crews;
