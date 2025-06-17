import React, { memo, useContext, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Plus, Loader2 } from 'lucide-react';

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
import LegendaryShipTokenIcon from '../../../../assets/legendary-ship-token-icon';
import { useMythicShipUpgrade } from '../../../../hooks/api/inventory/useMythicShipUpgrade';

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
  onLevelUp: () => void;
  entityType: 'ship' | 'crew' | 'item';
  hasTokens: boolean;
  isMaxLevel: boolean;
};

const LevelDisplay = ({
  icon,
  level,
  label,
  animationDelay = 0,
  onLevelUp,
  entityType,
  hasTokens,
  isMaxLevel,
}: LevelDisplayProps) => {
  const [isHovered, setIsHovered] = useState(false);

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

      {hasTokens && !isMaxLevel && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLevelUp();
          }}
          className={`absolute -right-1 -top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 transition-all duration-200 ${getButtonColor()} ${
            isHovered ? 'scale-110 opacity-100' : 'scale-100 opacity-90'
          }`}
          title={`Level up ${label}`}>
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

  const [levelUpModal, setLevelUpModal] = useState<{
    isOpen: boolean;
    entityType: 'ship' | 'crew' | 'item' | null;
  }>({
    isOpen: false,
    entityType: null,
  });

  const [captainLevelUpModal, setCaptainLevelUpModal] = useState(false);

  // Use the mythic ship upgrade hook
  const { upgradeMythicShip, loading: mythicUpgradeLoading } =
    useMythicShipUpgrade();

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
    let maxLevel = NFTMaxLevels.QM;

    if (character.type === 'FM') {
      maxLevel = NFTMaxLevels.FM;
    } else if (character.type === '1/1') {
      maxLevel = NFTMaxLevels.UNIQUE;
    }

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
    if (character.type === 'FM') return NFTMaxLevels.FM;
    if (character.type === '1/1') return NFTMaxLevels.UNIQUE;
    return NFTMaxLevels.QM;
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

  // Check if user has enough legendary ship tokens for mythic upgrade
  const canUpgradeToMythic = () => {
    return (user?.legendaryShipToken || 0) >= 2;
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

  const handleMythicShipUpgrade = async () => {
    if (!character.uid && !character.id) {
      console.error('Character ID is missing');
      return;
    }

    const captainId = character.uid || character.id || '';
    const captainName = character.metadata?.name || 'Captain';

    await upgradeMythicShip(captainId, captainName);
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
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <motion.div
            variants={fadeInVariants}
            className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white sm:text-base">
                {getCharacterName()}
              </h3>
              <p className="text-[10px] uppercase text-white/70 sm:text-xs">
                {character.type || 'Captain'}
              </p>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="text-right">
                <span className="text-lg font-bold text-white sm:text-xl">
                  {character.level || 1}
                </span>
                <p className="text-[8px] uppercase text-white/70 sm:text-[10px]">
                  Level
                </p>
              </div>
              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-black/30 p-0.5 sm:h-7 sm:w-7">
                <div
                  className="h-full w-full rounded-full"
                  style={{
                    background: `conic-gradient(white ${getLevelPercentage()}%, transparent 0%)`,
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Main content grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-12 sm:gap-4">
            {/* Character image */}
            <motion.div
              variants={itemVariants}
              className="col-span-1 sm:col-span-4">
              <div className="relative aspect-[3/4] overflow-visible rounded-md">
                <Image
                  src={character.metadata?.image || '/images/reavers.webp'}
                  alt={character.metadata?.name || 'Captain'}
                  fill
                  className="rounded-lg object-cover"
                  unoptimized
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-1 py-0.5 text-center">
                  <span className="text-[8px] font-medium uppercase text-white sm:text-[10px]">
                    {character.type || 'Captain'}
                  </span>
                </div>

                {/* Captain Level Up Button */}
                {(user?.arAmount || 0) > 0 &&
                  (character.level || 1) < getCaptainMaxLevel() && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCaptainLevelUpClick();
                      }}
                      className="absolute -right-1 -top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-yellow-600 transition-all duration-200 hover:scale-110 hover:bg-yellow-700"
                      title="Level up Captain">
                      <Plus className="h-3 w-3 text-white" />
                    </button>
                  )}
              </div>
            </motion.div>

            {/* Level displays */}
            <div className="col-span-1 flex flex-col justify-between sm:col-span-8">
              {/* Ship and Crew levels */}
              <div className="mb-2 grid grid-cols-2 gap-2">
                <LevelDisplay
                  icon={<ShipIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
                  level={character.shipLevel || 0}
                  label="Ship"
                  animationDelay={0.1}
                  onLevelUp={() => handleLevelUpClick('ship')}
                  entityType="ship"
                  hasTokens={getTokenCount('ship') > 0}
                  isMaxLevel={
                    (character.shipRarity === ShipRarity.Legendary &&
                      (character.shipLevel || 0) >= NFTMaxLevels.MYTHIC_SHIP) ||
                    (character.shipRarity !== ShipRarity.Legendary &&
                      (character.shipLevel || 0) >= NFTMaxLevels.COMMON_SHIP)
                  }
                />
                <LevelDisplay
                  icon={<CrewIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
                  level={character.crewLevel || 0}
                  label="Crew"
                  animationDelay={0.2}
                  onLevelUp={() => handleLevelUpClick('crew')}
                  entityType="crew"
                  hasTokens={getTokenCount('crew') > 0}
                  isMaxLevel={(character.crewLevel || 0) >= NFTMaxLevels.CREW}
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
                  isMaxLevel={(character.itemLevel || 0) >= NFTMaxLevels.ITEM}
                />
              </div>
            </div>
          </div>

          <motion.div variants={itemVariants} className="mt-3">
            {/* Ship Rarity Display */}
            <div className="flex items-center justify-between rounded-md border border-white/20 bg-black/30 p-2 sm:p-3">
              <span className="text-[10px] uppercase text-white/70 sm:text-[12px]">
                Ship Rarity
              </span>
              {character.shipRarity === ShipRarity.Legendary ? (
                <span className="text-sm font-semibold text-yellow-700 sm:text-base">
                  Mythic
                </span>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMythicShipUpgrade();
                  }}
                  disabled={!canUpgradeToMythic() || mythicUpgradeLoading}
                  className={`flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold transition-all duration-200 ${
                    canUpgradeToMythic() && !mythicUpgradeLoading
                      ? 'border-yellow-700 bg-yellow-700/60 text-white hover:bg-yellow-700'
                      : 'cursor-not-allowed border-gray-600 bg-gray-600/60 text-gray-400'
                  }`}
                  title={
                    !canUpgradeToMythic()
                      ? 'Need 2 Legendary Ship Tokens'
                      : 'Upgrade to Mythic Ship'
                  }>
                  <div className="flex items-center gap-1">
                    {mythicUpgradeLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        <span>2X</span>
                        <LegendaryShipTokenIcon className="h-3 w-3" />
                      </>
                    )}
                    <span>
                      {mythicUpgradeLoading
                        ? 'Upgrading...'
                        : 'for Mythic Ship'}
                    </span>
                  </div>
                </button>
              )}
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
          captainId={character.uid || character.id || ''}
          onLevelUp={handleLevelUpConfirm}
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
