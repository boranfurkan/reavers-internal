import React, { memo, useContext, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Plus } from 'lucide-react';

import { LayerContext } from '../../../../contexts/LayerContext';
import { CharacterNFT } from '../../../../types/NFT';
import { NFTMaxLevels } from '../../../../types/BaseEntity';
import { ShipRarity } from '../../../../types/Character';
import { cn } from '../../../../utils/helpers';
import {
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
import CaptainLevelUpModal from '../../CaptainLevelUpModal';

// Animation variants
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
    transition: { duration: 0.2, ease: 'easeOut' },
  },
};

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

// Level display component
type LevelDisplayProps = {
  icon: React.ReactNode;
  level: number;
  label: string;
  animationDelay?: number;
  onLevelUp?: () => void;
  entityType: 'ship' | 'crew' | 'item';
  hasTokens: boolean;
  isMaxLevel: boolean;
};

const LevelDisplay: React.FC<LevelDisplayProps> = ({
  icon,
  level,
  label,
  animationDelay = 0,
  onLevelUp,
  entityType,
  hasTokens,
  isMaxLevel,
}) => {
  const getButtonColor = () => {
    switch (entityType) {
      case 'ship':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'crew':
        return 'bg-green-600 hover:bg-green-700';
      case 'item':
        return 'bg-purple-600 hover:bg-purple-700';
    }
  };
  return (
    <motion.div
      variants={itemVariants}
      className="flex items-center justify-between rounded-md border border-white/20 bg-black/30 p-2 sm:p-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.3 }}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[10px] uppercase text-white/70 sm:text-[12px]">
          {label}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-white sm:text-base">
          {level}
        </span>

        {/* Updated level up button logic - show unless at absolute max level (250) */}
        {onLevelUp && hasTokens && !isMaxLevel && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLevelUp();
            }}
            className={`rounded-full ${getButtonColor()} p-1 transition-all duration-200 hover:scale-110 ${
              hasTokens ? 'scale-110 opacity-100' : 'scale-100 opacity-90'
            }`}
            title={`Level up ${label}`}>
            <Plus className="h-3 w-3 text-white" />
          </button>
        )}
      </div>
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

  const [levelUpModal, setLevelUpModal] = useState<{
    isOpen: boolean;
    entityType: 'ship' | 'crew' | 'item' | null;
  }>({
    isOpen: false,
    entityType: null,
  });

  const [captainLevelUpModal, setCaptainLevelUpModal] = useState(false);

  if (!layerContext) {
    throw new Error('ReaverCard must be used within a LayerProvider');
  }

  const isOnMission = character.currentMission !== '';

  // Helper functions
  const getCardColor = () => {
    const strengthPercentage = getStrengthPercentage(character.strength || 0);
    return getStrengthColor(strengthPercentage);
  };

  const getBorderColor = () => {
    const strengthPercentage = getStrengthPercentage(character.strength || 0);
    return getStrengthBorderColor(strengthPercentage);
  };

  const getLevelPercentage = () => {
    const level = character.level || 1;
    let maxLevel = character.isOneofOne
      ? NFTMaxLevels.UNIQUE_CAPTAIN
      : NFTMaxLevels.CAPTAIN;

    return (level / maxLevel) * 100;
  };

  const getCharacterName = () => {
    if (!character?.metadata) return '';
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

  const getCaptainMaxLevel = () => {
    return character.isOneofOne
      ? NFTMaxLevels.UNIQUE_CAPTAIN
      : NFTMaxLevels.CAPTAIN;
  };

  const getTokenCount = (entityType: 'ship' | 'crew' | 'item'): number => {
    if (!user) return 0;
    switch (entityType) {
      case 'ship':
        return user.shipLevelToken;
      case 'crew':
        return user.crewLevelToken;
      case 'item':
        return user.itemLevelToken;
      default:
        return 0;
    }
  };

  // Updated logic: Check if at absolute max level (250) for ships
  const isAtAbsoluteMaxLevel = (
    entityType: 'ship' | 'crew' | 'item',
  ): boolean => {
    switch (entityType) {
      case 'ship':
        return (character.shipLevel || 0) >= 250; // Max possible level for any ship
      case 'crew':
        return (character.crewLevel || 0) >= NFTMaxLevels.CREW;
      case 'item':
        return (character.itemLevel || 0) >= NFTMaxLevels.ITEM;
      default:
        return false;
    }
  };

  // Event handlers
  const handleLevelUpClick = (entityType: 'ship' | 'crew' | 'item') => {
    setLevelUpModal({ isOpen: true, entityType });
  };

  const handleCloseLevelUpModal = () => {
    setLevelUpModal({ isOpen: false, entityType: null });
  };

  const handleLevelUpConfirm = async (tokensToUse: number) => {
    if (!levelUpModal.entityType) return;
    console.log(
      `Leveling up ${levelUpModal.entityType} by ${tokensToUse} levels for character ${character.uid}`,
    );
  };

  const handleCaptainLevelUpClick = () => {
    setCaptainLevelUpModal(true);
  };

  const handleCaptainLevelUpClose = () => {
    setCaptainLevelUpModal(false);
  };

  // Modal data
  const getCurrentModalData = () => {
    if (!levelUpModal.entityType) return null;

    let currentLevel = 0;
    let entityName = '';
    const entityImage = character.metadata?.image || '/images/reavers.webp';

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

    const availableTokens = getTokenCount(levelUpModal.entityType);
    const maxLevel = getMaxLevel(
      levelUpModal.entityType,
      character.shipRarity === ShipRarity.Legendary,
    );

    return {
      currentLevel,
      entityName,
      entityImage,
      availableTokens,
      maxLevel,
    };
  };

  const modalData = getCurrentModalData();

  return (
    <>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className={cn(
          'relative cursor-pointer overflow-hidden rounded-lg border p-3 shadow-lg transition-all duration-300 sm:p-4',
          getBorderColor(),
          getCardColor(),
          isOnMission && 'opacity-60',
        )}
        style={{ ...getCardColor(), ...getBorderColor() }}>
        {/* Glass overlay */}
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
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Header with character info and level up button */}
          <motion.div
            variants={itemVariants}
            className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white/30 sm:h-14 sm:w-14">
                <Image
                  src={character.metadata?.image || '/images/reavers.webp'}
                  alt={character.metadata?.name || 'Captain'}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="text-left">
                <h3 className="font-Header text-sm font-bold text-white sm:text-base">
                  {getCharacterName()}
                </h3>
                <div className="font-Body text-xs text-white/70 sm:text-sm">
                  Level {character.level || 1}
                </div>
              </div>
            </div>

            {/* Captain level up button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCaptainLevelUpClick();
              }}
              className="rounded-full bg-yellow-600 p-2 transition-all duration-200 hover:scale-110 hover:bg-yellow-500">
              <Plus className="h-4 w-4 text-white" />
            </button>
          </motion.div>

          {/* Level Progress Bar */}
          <motion.div variants={itemVariants} className="mb-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-Body text-xs text-white/70">
                Level Progress
              </span>
              <span className="font-Body text-xs text-white">
                {getLevelPercentage().toFixed(1)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                initial={{ width: 0 }}
                animate={{ width: `${getLevelPercentage()}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </motion.div>

          {/* Entity Levels */}
          <motion.div
            variants={itemVariants}
            className="space-y-2 sm:space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {/* Ship level - Updated to show button unless at level 250 */}
              <LevelDisplay
                icon={
                  <ShipIcon
                    className={cn(
                      'h-4 w-4 sm:h-5 sm:w-5',
                      character.shipRarity === ShipRarity.Legendary
                        ? 'text-yellow-400'
                        : 'text-white',
                    )}
                  />
                }
                level={character.shipLevel || 0}
                label={
                  character.shipRarity === ShipRarity.Legendary
                    ? 'Mythic Ship'
                    : 'Ship'
                }
                animationDelay={0.1}
                onLevelUp={() => handleLevelUpClick('ship')}
                entityType="ship"
                hasTokens={getTokenCount('ship') > 0}
                isMaxLevel={isAtAbsoluteMaxLevel('ship')} // Changed logic
              />

              <LevelDisplay
                icon={<CrewIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
                level={character.crewLevel || 0}
                label="Crew"
                animationDelay={0.2}
                onLevelUp={() => handleLevelUpClick('crew')}
                entityType="crew"
                hasTokens={getTokenCount('crew') > 0}
                isMaxLevel={isAtAbsoluteMaxLevel('crew')}
              />
            </div>

            {/* Item level */}
            <div className="grid grid-cols-1 gap-2">
              <LevelDisplay
                icon={<ItemsIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
                level={character.itemLevel || 0}
                label="Items"
                animationDelay={0.3}
                onLevelUp={() => handleLevelUpClick('item')}
                entityType="item"
                hasTokens={getTokenCount('item') > 0}
                isMaxLevel={isAtAbsoluteMaxLevel('item')}
              />
            </div>
          </motion.div>

          {/* Footer */}
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

        {/* Mission overlay */}
        {isOnMission && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/30 p-4 text-center backdrop-blur-[2px]">
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
      </motion.div>

      {/* Level Up Modal - Will now include ship rarity display when entityType is 'ship' */}
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
          captainId={character.uid || character.id || ''}
          onLevelUp={handleLevelUpConfirm}
          character={character}
        />
      )}

      {/* Captain Level Up Modal */}
      {captainLevelUpModal && (
        <CaptainLevelUpModal
          isOpen={captainLevelUpModal}
          onClose={handleCaptainLevelUpClose}
          currentLevel={character.level || 1}
          maxLevel={getCaptainMaxLevel()}
          captainName={character.metadata?.name || 'Captain'}
          captainImage={character.metadata?.image || '/images/reavers.webp'}
          captainId={character.uid || character.id || ''}
        />
      )}
    </>
  );
};

export default memo(ReaverCard);
