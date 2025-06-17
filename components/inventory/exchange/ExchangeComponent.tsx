// components/missions/ExchangeModal/ExchangeComponent.tsx
import React, { useContext, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { LayerContext } from '../../../contexts/LayerContext';
import ExchangeItemCard from './ExchangeItemCard';
import { ExchangeItem, DynamicExchangeItem } from '../../../lib/types';
import GemIcon from '../../../assets/gem-icon';
import TreasureIcon from '../../../assets/treasure-icon';
import SkullIcon from '../../../assets/skull-icon';
import GoldTokenIcon from '../../../assets/gold-token-icon';
import BattleTokenIcon from '../../../assets/battle-token-icon';
import { useUser } from '../../../contexts/UserContext';

interface ExchangeItemsContext {
  exchangeItems: {
    exchangeItems: ExchangeItem[];
  };
  exchangeItemsLoading: boolean;
}

type CategorizedItems = {
  GEMS: ExchangeItem[];
  TREASURE: ExchangeItem[];
  BATTLE_TOKEN: ExchangeItem[];
};

const TabOptions = [
  {
    name: 'GEMS',
    key: 'GEMS',
    icon: <GemIcon width={20} height={20} />,
  },
  {
    name: 'TREASURE',
    key: 'TREASURE',
    icon: <TreasureIcon width={20} height={20} />,
  },
  {
    name: 'BATTLE TOKEN',
    key: 'BATTLE_TOKEN',
    icon: <BattleTokenIcon width={20} height={20} />,
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const tabVariants = {
  inactive: {
    scale: 1,
    backgroundColor: 'transparent',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  active: {
    scale: 1,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    color: 'rgba(0, 0, 0, 1)',
    transition: { duration: 0.2 },
  },
  hover: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 1)',
    transition: { duration: 0.2 },
  },
};

const ExchangeComponent = () => {
  const layerContext = useContext(LayerContext);
  const { user } = useUser();
  if (!layerContext) {
    throw new Error('LayerContext must be used within a LayerProvider');
  }

  const { exchangeItems, exchangeItemsLoading } =
    layerContext as ExchangeItemsContext;

  const [activeTab, setActiveTab] = useState<keyof CategorizedItems>('GEMS');

  const categorizedItems: CategorizedItems = useMemo(() => {
    return {
      GEMS: exchangeItems.exchangeItems.filter(
        (item) => item.costType === 'gemsAmount',
      ),
      TREASURE: exchangeItems.exchangeItems.filter(
        (item) => item.costType === 'treasureAmount',
      ),
      BATTLE_TOKEN: exchangeItems.exchangeItems.filter(
        (item) => item.yieldType === 'battleTokens',
      ),
    };
  }, [exchangeItems]);

  const filteredItems = useMemo(
    () => categorizedItems[activeTab] || [],
    [categorizedItems, activeTab],
  );

  const handleTabChange = useCallback((key: keyof CategorizedItems) => {
    setActiveTab(key);
  }, []);

  if (exchangeItemsLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
          <p className="text-white/70">Loading exchange items...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex h-full w-full flex-col items-center overflow-y-auto pb-6 pt-6 text-white">
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="mb-6 flex w-full flex-col items-center gap-6">
        <h1 className="text-3xl font-bold uppercase tracking-wide text-white">
          Exchange Shop
        </h1>

        {/* Divider */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

        {/* Banner */}
        <div className="w-full overflow-hidden rounded-lg border border-white/20 bg-black/20">
          <Image
            src="/images/shop/shop-banner.webp"
            alt="shop banner"
            width={1920}
            height={500}
            className="h-auto w-full object-cover"
            unoptimized={true}
          />
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        variants={itemVariants}
        className="mb-8 flex flex-wrap justify-center gap-1 rounded-lg border border-white/20 bg-black/30 p-1">
        {TabOptions.map((tab) => (
          <motion.button
            key={tab.key}
            variants={tabVariants}
            initial="inactive"
            animate={tab.key === activeTab ? 'active' : 'inactive'}
            whileHover="hover"
            onClick={() => handleTabChange(tab.key as keyof CategorizedItems)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 font-semibold transition-all duration-300 md:px-6 md:py-3 ${
              tab.key === activeTab
                ? 'bg-white text-black shadow-md'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}>
            <span className="flex-shrink-0">{tab.icon}</span>
            <span className="text-sm md:text-base">{tab.name}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Cards Container */}
      <motion.div variants={containerVariants} className="w-full px-4">
        <AnimatePresence mode="wait">
          {filteredItems.length > 0 ? (
            <motion.div
              key={activeTab}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="grid grid-cols-1 justify-items-center gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredItems
                .sort(
                  (
                    a: ExchangeItem | DynamicExchangeItem,
                    b: ExchangeItem | DynamicExchangeItem,
                  ) => a.costAmount - b.costAmount,
                )
                .map((item, index) => (
                  <motion.div
                    key={`${item.image}-${activeTab}`}
                    variants={itemVariants}
                    custom={index}
                    className="w-full max-w-lg">
                    <ExchangeItemCard
                      item={item}
                      variant={
                        item.yieldType === 'battleTokens' ? 'slider' : 'button'
                      }
                      maxValue={Math.floor(user?.arAmount || 0)}
                    />
                  </motion.div>
                ))}
            </motion.div>
          ) : (
            <motion.div
              key="no-items"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mb-4 text-6xl opacity-30">🛍️</div>
                <h3 className="mb-2 text-xl font-semibold text-white/80">
                  No items available
                </h3>
                <p className="text-white/60">
                  There are currently no items in the{' '}
                  {activeTab.toLowerCase().replace('_', ' ')} category.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.section>
  );
};

export default ExchangeComponent;
