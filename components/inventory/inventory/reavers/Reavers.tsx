import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNfts } from '../../../../contexts/NftContext';
import { CharacterNFT } from '../../../../types/NFT';
import ReaverCard from './ReaverCard';
import MagicEdenIcon from '../../../../assets/magic-eden-icon';

interface ReaversProps {
  filteredCharacters?: CharacterNFT[]; // Add this prop to accept filtered items
}

const Reavers: React.FC<ReaversProps> = ({ filteredCharacters }) => {
  const { charactersInGame, loading } = useNfts();

  // Use filteredCharacters if provided, otherwise fall back to all characters
  const charactersToDisplay = filteredCharacters || charactersInGame;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
        duration: 0.5,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  // Render loading state
  if (loading) {
    return (
      <motion.div
        className="flex h-full w-full items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}>
        <div className="text-center">
          <motion.div
            className="mb-6 text-xl text-white/80"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}>
            Loading your Captains...
          </motion.div>
          <motion.div
            className="flex justify-center"
            animate={{
              rotate: 360,
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'linear',
            }}>
            <div className="h-12 w-12 rounded-full border-b-2 border-r-2 border-t-2 border-white">
              <motion.div
                className="h-full w-full rounded-full border-l-2 border-white/30"
                animate={{ rotate: -360 }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
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
  if (!charactersToDisplay || charactersToDisplay.length === 0) {
    return (
      <motion.div
        className="flex h-[60vh] w-full flex-col items-center justify-center gap-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}>
        <span className="text-xl text-white/80">
          {filteredCharacters && filteredCharacters.length === 0
            ? 'No captains match your current filters.'
            : "You don't have any Reavers NFTs in-game."}
        </span>
        {(!filteredCharacters || filteredCharacters.length === 0) && (
          <motion.a
            href="https://magiceden.io/marketplace/reavers"
            target="_blank"
            className="flex items-center gap-3 rounded-md bg-indigo-700 px-6 py-3 text-lg font-medium text-white transition-colors hover:bg-indigo-600"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}>
            <span>Buy a Captain</span>
            <MagicEdenIcon className="h-6 w-6" />
          </motion.a>
        )}
      </motion.div>
    );
  }

  // Render reavers grid
  return (
    <div className="h-full w-full pt-6">
      <AnimatePresence>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="grid grid-cols-1 gap-6 pb-16 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {charactersToDisplay.map((character) => (
            <ReaverCard key={character.uid} character={character} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Reavers;
