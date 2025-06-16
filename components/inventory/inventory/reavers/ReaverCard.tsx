import React, { memo, useContext, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Plus } from 'lucide-react';

import { LayerContext } from '../../../../contexts/LayerContext';
import { CharacterNFT } from '../../../../types/NFT';
import { NFTMaxLevels } from '../../../../types/BaseEntity';
import { cn } from '../../../../utils/helpers';
import {
  getRarityGradient,
  getStrengthBorderColor,
  getStrengthColor,
  getStrengthPercentage,
} from '../../../../utils/inventory-helpers';
import { useUser } from '../../../../contexts/UserContext';

import StrengthDisplay from '../../../missions/StrengthDisplay';
import GoldBarDisplay from '../../../missions/GoldBarDisplay';
import ItemsIcon from '../../../../assets/items-icon';
import CrewIcon from '../../../../assets/crew-icon';
import ShipIcon from '../../../../assets/ship-icon';
import LevelUpModal from '../../LevelUpModal';
import { ShipRarity } from '../../../../types/Character';

// Enhanced animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
  hover: {
    y: -5,
    scale: 1.01,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

// Child element animation variants
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4 },
  },
};

const fadeInLeftVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
};

const fadeInRightVariants = {
  hidden: { opacity: 0, x: 15 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
};

// Enhanced Level display component with plus icon
type LevelDisplayProps = {
  icon: React.ReactNode;
  level: number;
  label: string;
  animationDelay?: number;
  onLevelUp: () => void;
  entityType: 'ship' | 'crew' | 'item';
  hasTokens: boolean;
};

const LevelDisplay = ({
  icon,
  level,
  label,
  animationDelay = 0,
  onLevelUp,
  entityType,
  hasTokens,
}: LevelDisplayProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // Debug log
  console.log(`${label} (${entityType}) - hasTokens:`, hasTokens);

  // Debug log
  React.useEffect(() => {
    console.log(`${label} (${entityType}) - hasTokens:`, hasTokens);
  }, [hasTokens, label, entityType]);

  return (
    <motion.div
      variants={itemVariants}
      transition={{ delay: animationDelay }}
      className="relative flex flex-col items-center justify-center rounded-md border border-white/20 bg-black/30 p-2 sm:p-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <div className="mb-1 flex items-center justify-center text-white/70">
        {icon}
      </div>
      <span className="text-[8px] uppercase text-white/70 sm:text-[10px]">
        {label}
      </span>
      <span className="text-sm font-bold text-white sm:text-base">{level}</span>

      {/* Plus Icon - only show if user has tokens */}
      {hasTokens && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log(`Plus button clicked for ${entityType}`);
            onLevelUp();
          }}
          className={`absolute -right-1 -top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 transition-all duration-200 ${
            entityType === 'ship'
              ? 'bg-blue-600 hover:bg-blue-700'
              : entityType === 'crew'
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-purple-600 hover:bg-purple-700'
          } ${isHovered ? 'scale-110 opacity-100' : 'scale-100 opacity-90'}`}
          title={`Level up ${label} (${entityType})`}>
          <Plus className="h-3 w-3 text-white" />
        </button>
      )}
    </motion.div>
  );
};

// Main component
type ReaverCardProps = {
  character: CharacterNFT;
};

const ReaverCard = ({ character }: ReaverCardProps) => {
  const layerContext = useContext(LayerContext);
  const { user } = useUser();

  // Debug: Log token counts to console
  React.useEffect(() => {
    if (user) {
      console.log('User tokens:', {
        shipTokens: user.shipLevelToken,
        crewTokens: user.crewLevelToken,
        itemTokens: user.itemLevelToken,
      });
    }
  }, [user]);

  // Level up modal state
  const [levelUpModal, setLevelUpModal] = useState<{
    isOpen: boolean;
    entityType: 'ship' | 'crew' | 'item' | null;
  }>({
    isOpen: false,
    entityType: null,
  });

  if (!layerContext) {
    throw new Error('ReaverCard must be used within a LayerProvider');
  }

  const isOnMission = character.currentMission !== '';

  // Style helpers
  const getCardColor = () => {
    const strengthPercentage = getStrengthPercentage(
      character.strength || 0,
      character,
    );
    return getStrengthColor(strengthPercentage);
  };

  const getBorderColor = () => {
    const strengthPercentage = getStrengthPercentage(
      character.strength || 0,
      character,
    );
    return getStrengthBorderColor(strengthPercentage);
  };

  // Calculate level percentage for progress bar
  const getLevelPercentage = () => {
    const level = character.level || 1;
    let maxLevel = NFTMaxLevels.QM;

    if (character.type === 'FM') {
      maxLevel = NFTMaxLevels.FM;
    } else if (character.type === '1/1') {
      maxLevel = NFTMaxLevels.UNIQUE;
    }

    return (level / maxLevel) * 100;
  };

  const getCharacterName = () => {
    if (!character || !character.metadata) return '';
    const nameParts = character.metadata.name.split('#');
    return nameParts.length > 1 ? `#${nameParts[1]}` : character.metadata.name;
  };

  const getMaxLevel = (
    entityType: 'ship' | 'crew' | 'item',
    isLegendaryShip: boolean = false,
  ) => {
    switch (entityType) {
      case 'ship':
        return isLegendaryShip
          ? NFTMaxLevels.MYTHIC_SHIP
          : NFTMaxLevels.COMMON_SHIP;
      case 'crew':
        return NFTMaxLevels.CREW;
      case 'item':
        return NFTMaxLevels.ITEM;
      default:
        return 100;
    }
  };

  // Level up handlers
  const handleLevelUpClick = (entityType: 'ship' | 'crew' | 'item') => {
    setLevelUpModal({
      isOpen: true,
      entityType,
    });
  };

  const handleCloseLevelUpModal = () => {
    setLevelUpModal({
      isOpen: false,
      entityType: null,
    });
  };

  const handleLevelUpConfirm = (tokensToUse: number) => {
    if (!levelUpModal.entityType) return;

    console.log(
      `Leveling up ${levelUpModal.entityType} by ${tokensToUse} levels for character ${character.uid}`,
    );
  };

  // Get current modal data
  const getCurrentModalData = () => {
    if (!levelUpModal.entityType) return null;

    let currentLevel = 0;
    let entityName = '';
    let entityImage = character.metadata?.image || '/images/reavers.webp';

    switch (levelUpModal.entityType) {
      case 'ship':
        currentLevel = character.shipLevel || 0;
        entityName = `${character.metadata?.name || 'Captain'} Ship`;
        break;
      case 'crew':
        currentLevel = character.crewLevel || 0;
        entityName = `${character.metadata?.name || 'Captain'} Crew`;
        break;
      case 'item':
        currentLevel = character.itemLevel || 0;
        entityName = `${character.metadata?.name || 'Captain'} Items`;
        break;
    }

    const getTokenCount = (entityType: 'ship' | 'crew' | 'item'): number => {
      if (!user) return 0;
      switch (entityType) {
        case 'ship':
          return user.shipLevelToken || 0;
        case 'crew':
          return user.crewLevelToken || 0;
        case 'item':
          return user.itemLevelToken || 0;
        default:
          return 0;
      }
    };

    const availableTokens = getTokenCount(levelUpModal.entityType) || 100;
    const maxLevel = getMaxLevel(
      levelUpModal.entityType,
      character.shipRarity === ShipRarity.Legendary,
    );

    return {
      currentLevel,
      maxLevel,
      availableTokens,
      entityName,
      entityImage,
    };
  };

  const modalData = getCurrentModalData();

  return (
    <>
      <motion.div
        key={character.uid}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className={cn(
          `relative mx-auto w-full max-w-lg overflow-hidden rounded-lg border border-white/20`,
        )}
        style={{ ...getCardColor(), ...getBorderColor() }}
        data-mint={character.mint}>
        {/* Glass overlay with subtle animation */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          animate={{
            backgroundImage: [
              'linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.5))',
              'linear-gradient(to right, rgba(0,0,0,0.5), rgba(0,0,0,0.6))',
              'linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.5))',
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Mission overlay when on mission */}
        {isOnMission && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/30 p-4 text-center backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-3">
              <div className="text-sm font-bold uppercase text-white">
                Captain is on mission
              </div>
            </motion.div>
          </div>
        )}

        {/* Card Content with staggered animations */}
        <div className="relative z-10 flex flex-col gap-3 p-3">
          {/* Header section with character info */}
          <div className="mb-2 flex items-center justify-between border-b border-white/20 pb-2">
            <motion.div
              variants={fadeInLeftVariants}
              className="flex items-center gap-1 sm:gap-2">
              <h3 className="text-sm font-bold text-white sm:text-lg">
                {character.type} {getCharacterName()}
              </h3>
            </motion.div>

            <motion.div
              variants={fadeInRightVariants}
              className="flex items-center gap-1 sm:gap-2">
              <div className="flex flex-col items-end">
                <span className="text-[8px] text-white/60 sm:text-[10px]">
                  Level
                </span>
                <span className="text-sm font-bold text-white sm:text-base">
                  {character.level || 1}
                </span>
              </div>

              {/* Level progress indicator */}
              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-black/30 p-0.5 sm:h-7 sm:w-7">
                <div
                  className="h-full w-full rounded-full"
                  style={{
                    background: `conic-gradient(white ${getLevelPercentage()}%, transparent 0%)`,
                  }}
                />
              </div>
            </motion.div>
          </div>

          {/* Main content area - Balanced grid layout */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-12 sm:gap-3">
            {/* Character Image - 1/3 of the width (4 cols out of 12) */}
            <motion.div
              variants={fadeInVariants}
              className="col-span-1 overflow-hidden rounded-md bg-black/50 sm:col-span-4">
              <div className="relative aspect-square h-full w-full sm:aspect-[3/4]">
                <Image
                  src={character.metadata?.image || '/images/reavers.webp'}
                  alt={character.metadata?.name || 'Captain'}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-1 py-0.5 text-center">
                  <span className="text-[8px] font-medium uppercase text-white sm:text-[10px]">
                    {character.type || 'Captain'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Level displays - 2/3 of the width (8 cols out of 12) */}
            <div className="col-span-1 flex flex-col justify-between sm:col-span-8">
              {/* Ship and Crew levels - Top section */}
              <div className="mb-2 grid grid-cols-2 gap-2">
                <LevelDisplay
                  icon={<ShipIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
                  level={character.shipLevel || 0}
                  label="Ship"
                  animationDelay={0.1}
                  onLevelUp={() => handleLevelUpClick('ship')}
                  entityType="ship"
                  hasTokens={(user?.shipLevelToken || 0) > 0 || true} // Temporary: always show for testing
                />
                <LevelDisplay
                  icon={<CrewIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
                  level={character.crewLevel || 0}
                  label="Crew"
                  animationDelay={0.2}
                  onLevelUp={() => handleLevelUpClick('crew')}
                  entityType="crew"
                  hasTokens={(user?.crewLevelToken || 0) > 0 || true} // Temporary: always show for testing
                />
              </div>

              {/* Item level - Bottom section */}
              <div className="grid grid-cols-1 gap-2">
                <LevelDisplay
                  icon={<ItemsIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
                  level={character.itemLevel || 0}
                  label="Items"
                  animationDelay={0.3}
                  onLevelUp={() => handleLevelUpClick('item')}
                  entityType="item"
                  hasTokens={(user?.itemLevelToken || 0) > 0 || true} // Temporary: always show for testing
                />
              </div>
            </div>
          </div>

          {/* Footer with stats */}
          <motion.div
            variants={itemVariants}
            className="mt-3 flex items-center justify-between border-t border-white/20 pt-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}>
            <GoldBarDisplay goldBurned={character.goldBurned} />

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-[10px] uppercase text-white/70 sm:text-xs">
                Strength
              </span>
              <StrengthDisplay
                size="small"
                strength={character.strength || 0}
                character={character}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Level Up Modal */}
      {levelUpModal.isOpen && levelUpModal.entityType && modalData && (
        <LevelUpModal
          isOpen={levelUpModal.isOpen}
          onClose={handleCloseLevelUpModal}
          entityType={levelUpModal.entityType}
          currentLevel={modalData.currentLevel}
          maxLevel={modalData.maxLevel}
          availableTokens={modalData.availableTokens}
          entityName={modalData.entityName}
          entityImage={modalData.entityImage}
          onLevelUp={handleLevelUpConfirm}
        />
      )}
    </>
  );
};

export default memo(ReaverCard);
