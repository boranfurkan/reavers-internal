import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNfts } from '../../../../contexts/NftContext';
import ItemCard from './ItemCard';
import { animations } from '../../../../utils/inventory-helpers';
import { ItemData } from '../../../../lib/types';

interface ItemsProps {
  filteredItems?: ItemData[];
}

const Items: React.FC<ItemsProps> = ({ filteredItems }) => {
  const { itemsInGame, loading } = useNfts();

  // Use filteredItems if provided, otherwise fall back to all items
  const itemsToDisplay = filteredItems || itemsInGame;

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
            Loading your Items...
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
  if (!itemsToDisplay || itemsToDisplay.length === 0) {
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
            {filteredItems && filteredItems.length === 0
              ? 'No items match your current filters.'
              : "You don't have any Items in-game yet."}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Render items grid
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
          {itemsToDisplay.map((item) => (
            <ItemCard key={item.uid || item.id} item={item} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Items;
