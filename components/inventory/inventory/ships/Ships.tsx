import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNfts } from '../../../../contexts/NftContext';
import ShipCard from './ShipCard';
import { animations } from '../../../../utils/inventory-helpers';
import { ShipNFT } from '../../../../types/NFT';

interface ShipsProps {
  filteredShips?: ShipNFT[];
}

const Ships: React.FC<ShipsProps> = ({ filteredShips }) => {
  const { shipsInGame, loading } = useNfts();

  // Use filteredShips if provided, otherwise fall back to all ships
  const shipsToDisplay = filteredShips || shipsInGame;

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
            Loading your Ships...
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
  if (!shipsToDisplay || shipsToDisplay.length === 0) {
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
            {filteredShips && filteredShips.length === 0
              ? 'No ships match your current filters.'
              : "You don't have any Ships in-game yet."}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Render ships grid
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
          {shipsToDisplay.map((ship) => (
            <ShipCard key={ship.uid} ship={ship} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Ships;
