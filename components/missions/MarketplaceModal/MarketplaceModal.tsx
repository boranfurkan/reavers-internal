import React, { useContext, useState, useMemo } from 'react';
import { LayerContext } from '../../../contexts/LayerContext';
import { AnimatePresence, motion } from 'framer-motion';
import styled from 'styled-components';
import ModalCloseButton from '../../HUD/modals/ModalCloseButton';
import FilterCard from './FilterCard';
import { MarketPlaceItem } from '../../../lib/types';
import ItemsCarousel from './ItemsCarousel';
import ArrowRightIcon from '../../../assets/arrow-right-icon';

type CategoryItem = {
  items: MarketPlaceItem[];
  title: string;
  subtitle: string;
  image: string;
};

type CategorizedItems = {
  ITEM: CategoryItem;
  SHIP: CategoryItem;
  MYTHICSHIP: CategoryItem;
  CREW: CategoryItem;
};

const MarketplaceModal = () => {
  const layerContext = useContext(LayerContext);
  if (!layerContext) {
    throw new Error('LayerContext must be used within a LayerProvider');
  }

  const { shopItems, setMarketModalOpen } = layerContext;

  const [actieveFilter, setActieveFilter] = useState<
    keyof CategorizedItems | ''
  >('');

  const categorizedItems = useMemo<CategorizedItems>(() => {
    return {
      ITEM: {
        items: shopItems.filter((item) => item.type === 'ITEM'),
        title: 'ITEMS',
        subtitle:
          'Equip your captain with legendary weapons and powerful items to dominate the seas and claim your treasure.',
        image: '/images/marketplace/items-card.jpeg',
      },
      SHIP: {
        items: shopItems.filter(
          (item) => item.type === 'SHIP' && item.rarity !== 'LEGENDARY',
        ),
        title: 'SHIPS',
        subtitle:
          'Command majestic ships, built for battle and exploration, to conquer the seven seas.',
        image: '/images/marketplace/ships-card.jpeg',
      },
      MYTHICSHIP: {
        items: shopItems.filter(
          (item) => item.type === 'SHIP' && item.rarity === 'LEGENDARY',
        ),
        title: 'MYTHIC SHIPS',
        subtitle:
          'Command majestic ships, built for battle and exploration, to conquer the seven seas.',
        image: '/images/marketplace/mythic-ships-card.jpeg',
      },
      CREW: {
        items: shopItems.filter((item) => item.type === 'CREW'),
        title: 'CREWS',
        subtitle:
          "Recruit a fearless crew to enhance your captain's strength and secure victory in every encounter.",
        image: '/images/marketplace/crewmate.jpeg',
      },
    };
  }, [shopItems]);

  const CardStaggerAnimationVariants = {
    container: {
      hidden: { opacity: 0 },
      animate: {
        opacity: 1,
        transition: {
          staggerChildren: 0.05,
        },
      },
    },
    item: {
      hidden: { opacity: 0, y: 40 },
      animate: { opacity: 1, y: 0, transition: { type: 'tween' } },
    },
  };

  const cardClassNames = [
    'col-span-full row-span-2',
    'sm:col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-3 row-span-1',
    'sm:col-span-1 md:col-span-1 lg:col-span-2 xl:col-span-3 row-span-2',
    'sm:col-span-2 md:col-span-3 lg:col-span-2 xl:col-span-3 row-span-1',
  ];

  return (
    <AnimatePresence>
      <ModalContent
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={modalVariants}
        className="overflow-y-scroll bg-black bg-opacity-[0.8] backdrop-blur-xl">
        <div className="flex min-h-[82px] w-full flex-row items-center justify-between border-b border-b-reavers-border">
          <h1 className="w-full p-4 font-Header text-[13px] max-md:px-2 md:text-[26px]">
            Marketplace
          </h1>
          <ModalCloseButton handleClose={() => setMarketModalOpen(false)} />
        </div>
        <AnimatePresence mode="wait">
          {!actieveFilter ? (
            <motion.div
              key="filter-grid"
              variants={CardStaggerAnimationVariants.container}
              initial="hidden"
              animate="animate"
              exit="exit"
              className="grid h-full w-full auto-rows-auto grid-cols-1 gap-3 overflow-y-auto 
                 p-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {(
                Object.keys(categorizedItems) as Array<keyof CategorizedItems>
              ).map((key, index) => {
                const category = categorizedItems[key];
                const baseClassName =
                  'bg-transparent rounded-md overflow-hidden shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105';
                const specificClassName = cardClassNames[index] || 'row-span-1';

                return (
                  <motion.div
                    key={key}
                    variants={CardStaggerAnimationVariants.item}
                    className={`${baseClassName} ${specificClassName}`}>
                    <FilterCard
                      key={'filter-' + key}
                      cardData={{
                        title: category.title,
                        subtitle: category.subtitle,
                        image: category.image,
                      }}
                      onClick={() => setActieveFilter(key)}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="items-carousel"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex h-full w-full flex-col items-center justify-center gap-5 py-10">
              <StyledBackButton
                onClick={() => setActieveFilter('')}
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{ scale: 0.95 }}>
                <ArrowRightIcon className="h-5 w-5 -scale-x-100 transform" />
                <span>Back to Shop</span>
              </StyledBackButton>
              <ItemsCarousel
                itemCardData={categorizedItems[actieveFilter].items}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </ModalContent>
    </AnimatePresence>
  );
};

export default MarketplaceModal;

const ModalContent = styled(motion.div)`
  position: fixed;
  z-index: 94;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* Start at the top */
  overflow-y: auto; /* Allow vertical scrolling if needed */
`;

const StyledBackButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #6e41a7 0%, #3c1f64 100%);
  border: none;
  border-radius: 50px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: 0.5s;
  }

  &:hover::before {
    left: 100%;
  }

  &:hover {
    background: linear-gradient(135deg, #7b4dbf 0%, #4c2980 100%);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(209, 179, 255, 0.5), 0 4px 6px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 10px 20px;
  }
`;

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};
