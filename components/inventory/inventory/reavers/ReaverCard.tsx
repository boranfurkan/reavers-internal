import React, { memo, useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { toast } from 'sonner';
import { Spin } from 'antd';
import { mutate } from 'swr';

import { useAuth } from '../../../../contexts/AuthContext';
import { LayerContext } from '../../../../contexts/LayerContext';
import { useNfts } from '../../../../contexts/NftContext';
import { NotificationContext } from '../../../../contexts/NotificationContext';
import { useUser } from '../../../../contexts/UserContext';

import { CharacterNFT, CrewNFT, ShipNFT } from '../../../../types/NFT';
import { NFTType, NFTMaxLevels } from '../../../../types/BaseEntity';
import { ItemData } from '../../../../lib/types';
import {
  isArrayOfItemData,
  getLevelRarity,
  cn,
} from '../../../../utils/helpers';
import {
  getRarityBorderColor,
  getRarityGradient,
  getStrengthBorderColor,
  getStrengthColor,
  getStrengthPercentage,
} from '../../../../utils/inventory-helpers';
import { config } from '../../../../config';

import StrengthDisplay from '../../../missions/StrengthDisplay';
import GoldBarDisplay from '../../../missions/GoldBarDisplay';

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

// Helper components
type EntityBadgeProps = {
  nftType: NFTType.CREW | NFTType.ITEM | NFTType.SHIP;
  level: number;
  isLegendary?: boolean;
  className?: string;
};

const EntityBadge = ({
  nftType,
  level,
  isLegendary = false,
  className = '',
}: EntityBadgeProps) => {
  const rarityText = getLevelRarity(nftType, level, isLegendary);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.3 }}
      className={`absolute left-1 top-1 z-10 inline-flex items-center rounded border px-0.5 py-0.5 
      text-[6px] font-bold uppercase tracking-wider text-white shadow-sm sm:text-[7px] ${className}`}
      style={{
        ...getRarityGradient(rarityText),
        ...getRarityBorderColor(rarityText),
      }}>
      {rarityText}
      <span className="ml-0.5 text-[5px] sm:ml-1 sm:text-[6px]">({level})</span>
    </motion.div>
  );
};

type EmptySlotProps = {
  onClick: () => void;
};

const EmptySlot = ({ onClick }: EmptySlotProps) => (
  <div
    className="flex h-16 cursor-pointer items-center justify-center rounded border border-dashed border-white/20 bg-black/20 transition-colors hover:border-white/40 hover:bg-black/30 sm:h-20"
    onClick={onClick}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-4 w-4 text-white/50 sm:h-5 sm:w-5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  </div>
);

type UnequipTooltipProps = {
  entityName: string;
  actionLabel: string;
  onUnequip: (e: React.MouseEvent) => void;
  isLoading: boolean;
  entityType?: string;
  entityLevel?: number;
  setActiveTooltip: (value: null | string) => void;
};

const UnequipTooltip = ({
  entityName,
  actionLabel,
  onUnequip,
  isLoading,
  entityType = '',
  entityLevel = 1,
  setActiveTooltip,
}: UnequipTooltipProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.2 }}
    className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-sm bg-black/90 p-2 backdrop-blur-sm">
    <div className="mb-1 text-center">
      {entityType && (
        <div className="flex flex-col text-[9px] font-bold text-white">
          <span>{entityType}</span>
          <span>Level {entityLevel}</span>
        </div>
      )}
    </div>
    <div className="flex w-full space-x-2">
      <button
        className="w-1/2 rounded-md border border-white/20 bg-white/5 px-2 py-1.5 text-[9px] font-medium text-white transition-colors hover:bg-white/10"
        onClick={(e) => {
          e.stopPropagation();
          setActiveTooltip(null);
        }}>
        Cancel
      </button>
      <button
        className="w-1/2 rounded-md bg-gradient-to-r from-red-800 to-red-600 px-2 py-1.5 text-[9px] font-medium text-white transition-colors hover:from-red-700 hover:to-red-500"
        onClick={onUnequip}
        disabled={isLoading}>
        {isLoading ? <Spin size="small" /> : actionLabel}
      </button>
    </div>
  </motion.div>
);

// Entity slot component to reduce repetition
type EntitySlotProps = {
  entity: ItemData | CrewNFT | ShipNFT | null;
  nftType: NFTType;
  activeTooltip: string | null;
  tooltipKey: string;
  onTooltipToggle: (key: string | null) => void;
  onUnequip: (e: React.MouseEvent) => void;
  onEmptySlotClick: () => void;
  isLoading: boolean;
  isLegendary?: boolean;
  animationDelay?: number;
};

const EntitySlot = ({
  entity,
  nftType,
  activeTooltip,
  tooltipKey,
  onTooltipToggle,
  onUnequip,
  onEmptySlotClick,
  isLoading,
  isLegendary = false,
  animationDelay = 0,
}: EntitySlotProps) => {
  if (!entity) {
    return (
      <motion.div
        variants={itemVariants}
        transition={{ delay: animationDelay }}>
        <EmptySlot onClick={onEmptySlotClick} />
      </motion.div>
    );
  }

  // Handle different entity types
  const level = 'level' in entity ? entity.level || 1 : 1;
  const name =
    'name' in entity
      ? entity.name
      : 'metadata' in entity && entity.metadata
      ? entity.metadata.name
      : 'Entity';

  const imageSrc =
    'itemStats' in entity && entity.itemStats
      ? entity.itemStats.image
      : 'metadata' in entity && entity.metadata
      ? entity.metadata.image
      : nftType === NFTType.CREW
      ? '/images/mission-modal/crew-nft.webp'
      : nftType === NFTType.ITEM
      ? '/images/weapon-axe.webp'
      : '/images/reavers.webp';

  // Get entity type name for display
  const entityTypeName =
    nftType === NFTType.ITEM
      ? 'Item'
      : nftType === NFTType.CREW
      ? 'Crew'
      : nftType === NFTType.SHIP
      ? 'Ship'
      : 'Entity';

  const rarityText = getLevelRarity(
    (nftType as NFTType.SHIP) || NFTType.CREW || NFTType.ITEM,
    level,
    isLegendary,
  );

  return (
    <motion.div
      variants={itemVariants}
      className="relative h-20 cursor-pointer overflow-hidden rounded border border-white/20 bg-black/30"
      onClick={() =>
        onTooltipToggle(activeTooltip === tooltipKey ? null : tooltipKey)
      }>
      <EntityBadge
        nftType={(nftType as NFTType.SHIP) || NFTType.CREW || NFTType.ITEM}
        level={level}
        isLegendary={isLegendary}
      />

      <div className="flex h-full w-full items-center justify-center">
        {nftType === NFTType.ITEM ? (
          <Image
            src={imageSrc || '/images/weapon-axe.webp'}
            alt={name || ''}
            className="h-12 w-12 object-contain sm:h-16 sm:w-16"
            width={64}
            height={64}
            unoptimized={true}
          />
        ) : (
          <div className="relative h-full w-full">
            <Image
              src={imageSrc || '/images/reavers.webp'}
              alt={name || ''}
              fill
              className="object-cover"
              unoptimized={true}
            />
          </div>
        )}
      </div>

      {activeTooltip === tooltipKey && (
        <UnequipTooltip
          entityName={name || ''}
          actionLabel={`Remove`}
          onUnequip={(e) => {
            e.stopPropagation();
            onUnequip(e);
            onTooltipToggle(null);
          }}
          isLoading={isLoading}
          entityType={`${rarityText} ${entityTypeName}`}
          entityLevel={level}
          setActiveTooltip={onTooltipToggle}
        />
      )}
    </motion.div>
  );
};

// Main component
type ReaverCardProps = {
  character: CharacterNFT;
  onItemSlotClick: (character: CharacterNFT) => void;
  onCrewSlotClick: (character: CharacterNFT) => void;
  onShipSlotClick: (character: CharacterNFT) => void;
};

const ReaverCard = ({
  character,
  onItemSlotClick,
  onCrewSlotClick,
  onShipSlotClick,
}: ReaverCardProps) => {
  const layerContext = useContext(LayerContext);
  const { notifications } = useContext(NotificationContext);
  const user = useUser();
  const auth = useAuth();
  const { crewsInGame, shipsInGame } = useNfts();

  // States
  const [equipLoading, setEquipLoading] = useState(false);
  const [jobId, setJobId] = useState('');
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  if (!layerContext) {
    throw new Error('ReaverCard must be used within a LayerProvider');
  }

  const { setHideoutModalOpen, setMissionModalOpen, setCurrentMission } =
    layerContext;

  // Get equipped items, crew, and ship
  let item1: ItemData | null = null;
  let item2: ItemData | null = null;
  let crewNft: CrewNFT | null = null;
  let shipNft: ShipNFT | null = null;

  // Extract equipped items
  if (isArrayOfItemData(character.equippedItemsLoaded)) {
    const [firstItem, secondItem] = character.equippedItemsLoaded;
    item1 = firstItem || null;
    item2 = secondItem || null;
  }

  // Find equipped crew
  if (
    character.equippedCrew &&
    character.equippedCrew !== null &&
    character.equippedCrew !== ''
  ) {
    crewNft = crewsInGame.find(
      (filteredNFT) => filteredNFT.uid === character.equippedCrew,
    ) as CrewNFT;
  }

  // Find equipped ship
  if (
    character.equippedShip &&
    character.equippedShip !== null &&
    character.equippedShip !== ''
  ) {
    shipNft = shipsInGame.find(
      (filteredNFT) => filteredNFT.uid === character.equippedShip,
    ) as ShipNFT;
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

  // Helper for character name
  const getCharacterName = () => {
    if (!character || !character.metadata) return '';
    const nameParts = character.metadata.name.split('#');
    return nameParts.length > 1 ? `#${nameParts[1]}` : character.metadata.name;
  };

  // API handlers - consolidated for readability
  const handleUnequip = async (character: CharacterNFT, itemUid: string) => {
    if (!character) {
      toast.error('No associated NFT found');
      return;
    }

    const associatedItem = character.equippedItemsLoaded?.find(
      (itemData: ItemData) => itemData.uid == itemUid,
    );

    if (!associatedItem) {
      toast.error('No associated item was found');
      return;
    }

    try {
      setEquipLoading(true);
      const idToken = auth.jwtToken;
      const res = await fetch(`${config.worker_server_url}/items/handleEquip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          nftuid: character.uid,
          itemuid: associatedItem.uid,
          action: false,
        }),
      });
      const responseBody = await res.json();

      if (res.status !== 200) {
        throw new Error(
          responseBody.error || 'An error occurred, try again later',
        );
      }

      setJobId(responseBody.jobId);
    } catch (error) {
      setEquipLoading(false);
      toast.error('Error Unequipping');
    }
  };

  const handleUnequipCrew = async (character: CharacterNFT) => {
    if (!character) {
      toast.error('No associated NFT found');
      return;
    }

    try {
      setEquipLoading(true);
      const idToken = auth.jwtToken;
      const res = await fetch(
        `${config.worker_server_url}/nfts/handleCrewEquip`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            nftuid: character.uid,
            crewuid: character.equippedCrew,
            action: false,
          }),
        },
      );

      const responseBody = await res.json();

      if (res.status !== 200) {
        throw new Error(
          responseBody.error || 'An error occurred, try again later',
        );
      }

      setJobId(responseBody.jobId);
    } catch (error) {
      setEquipLoading(false);
      toast.error((error as Error).message);
    }

    mutate(`${config.worker_server_url}/users/me`);
  };

  const handleUnequipShip = async (character: CharacterNFT) => {
    if (!character) {
      toast.error('No associated NFT found');
      return;
    }

    try {
      setEquipLoading(true);
      const idToken = auth.jwtToken;
      const res = await fetch(
        `${config.worker_server_url}/nfts/handleShipEquip`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            nftuid: character.uid,
            shipuid: character.equippedShip,
            action: false,
          }),
        },
      );

      const responseBody = await res.json();

      if (res.status !== 200) {
        throw new Error(
          responseBody.error || 'An error occurred, try again later',
        );
      }

      setJobId(responseBody.jobId);
    } catch (error) {
      setEquipLoading(false);
      toast.error((error as Error).message);
    }

    mutate(`${config.worker_server_url}/users/me`);
  };

  // Interaction handlers
  const handleItemSlotClick = () => {
    if (!isOnMission) {
      onItemSlotClick(character);
    }
  };

  const handleCrewSlotClick = () => {
    if (!isOnMission) {
      onCrewSlotClick(character);
    }
  };

  const handleShipSlotClick = () => {
    if (!isOnMission) {
      onShipSlotClick(character);
    }
  };

  // Track job status
  useEffect(() => {
    if (user?.user?.wallet && jobId !== '') {
      const notification = notifications.find(
        (n) =>
          n.data.id === jobId &&
          (n.type === 'handleCrewEquip' ||
            n.type === 'handleEquip' ||
            n.type === 'handleShipEquip'),
      );

      if (notification) {
        if (notification.data.error) {
          toast.error(notification.data.message);
        } else {
          const getSuccessMessage = () => {
            const { type, data } = notification;
            if (type === 'handleEquip' && !data.result.equipped) {
              return `Successfully Unequipped ${
                data.result.itemName
              } from NFT ${parseInt(data.result.nftUID) + 1}`;
            } else if (type === 'handleCrewEquip' && !data.result.equipped) {
              return `Successfully Unequipped ${
                data.result.crewName
              } from NFT ${parseInt(data.result.nftUID) + 1}`;
            } else if (type === 'handleShipEquip' && !data.result.equipped) {
              return `Successfully Unequipped ${
                data.result.shipName
              } from NFT ${parseInt(data.result.nftUID) + 1}`;
            }
            return 'Operation successful';
          };

          toast.success(getSuccessMessage());
        }

        mutate(`${config.worker_server_url}/users/me`);
        mutate(`${config.worker_server_url}/nfts`);
        mutate(`${config.worker_server_url}/items/fetch-items`);
        setEquipLoading(false);
        setJobId('');
      } else {
        const timeoutId = setTimeout(() => {
          mutate(`${config.worker_server_url}/users/me`);
          mutate(`${config.worker_server_url}/nfts`);
          mutate(`${config.worker_server_url}/items/fetch-items`);
          setEquipLoading(false);
          toast('Timeout, reloading...');
          setJobId('');
        }, 20000);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [jobId, user?.user?.wallet, notifications]);

  return (
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

          {/* Equipment slots - 2/3 of the width (8 cols out of 12) */}
          <div className="col-span-1 flex flex-col justify-between sm:col-span-8">
            {/* Item Slots - Top section */}
            <div className="mb-2 grid grid-cols-2 gap-2">
              {/* Section Labels */}
              <motion.div variants={itemVariants}>
                <span className="text-[8px] uppercase text-white/70 sm:text-[10px]">
                  Item Slot 1
                </span>
              </motion.div>
              <motion.div variants={itemVariants}>
                <span className="text-[8px] uppercase text-white/70 sm:text-[10px]">
                  Item Slot 2
                </span>
              </motion.div>

              {/* Item Slots */}
              <EntitySlot
                entity={item1}
                nftType={NFTType.ITEM}
                activeTooltip={activeTooltip}
                tooltipKey="item1"
                onTooltipToggle={setActiveTooltip}
                onUnequip={() => handleUnequip(character, item1?.uid || '')}
                onEmptySlotClick={handleItemSlotClick}
                isLoading={equipLoading}
                animationDelay={0.1}
              />
              <EntitySlot
                entity={item2}
                nftType={NFTType.ITEM}
                activeTooltip={activeTooltip}
                tooltipKey="item2"
                onTooltipToggle={setActiveTooltip}
                onUnequip={() => handleUnequip(character, item2?.uid || '')}
                onEmptySlotClick={handleItemSlotClick}
                isLoading={equipLoading}
                animationDelay={0.2}
              />
            </div>

            {/* Ship and Crew - Bottom section */}
            <div className="grid grid-cols-2 gap-2">
              {/* Section Labels */}
              <motion.div variants={itemVariants}>
                <span className="text-[8px] uppercase text-white/70 sm:text-[10px]">
                  Ship
                </span>
              </motion.div>
              <motion.div variants={itemVariants}>
                <span className="text-[8px] uppercase text-white/70 sm:text-[10px]">
                  Crew
                </span>
              </motion.div>

              {/* Ship and Crew slots */}
              <EntitySlot
                entity={shipNft}
                nftType={NFTType.SHIP}
                activeTooltip={activeTooltip}
                tooltipKey="ship"
                onTooltipToggle={setActiveTooltip}
                onUnequip={() => handleUnequipShip(character)}
                onEmptySlotClick={handleShipSlotClick}
                isLoading={equipLoading}
                isLegendary={shipNft?.rarity === 'LEGENDARY'}
                animationDelay={0.3}
              />
              <EntitySlot
                entity={crewNft}
                nftType={NFTType.CREW}
                activeTooltip={activeTooltip}
                tooltipKey="crew"
                onTooltipToggle={setActiveTooltip}
                onUnequip={() => handleUnequipCrew(character)}
                onEmptySlotClick={handleCrewSlotClick}
                isLoading={equipLoading}
                animationDelay={0.4}
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
  );
};

export default memo(ReaverCard);
