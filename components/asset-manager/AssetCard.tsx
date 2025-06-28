import React, { useContext } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Collection } from '../../types/Collections';
import { NFTType } from '../../types/BaseEntity';
import { toast } from 'sonner';
import { LayerContext } from '../../contexts/LayerContext';
import GoldBarDisplay from '../missions/GoldBarDisplay';
import { getCollectionIcon } from '../../assets/helpers';
import CopyIcon from '../../assets/copy-icon';

export enum AssetLocation {
  IN_GAME = 'in-game',
  IN_WALLET = 'in-wallet',
}

export interface AssetCardProps {
  id: string;
  imageUrl: string;
  collection: Collection;
  type:
    | 'CAPTAIN'
    | NFTType.SHIP
    | NFTType.ITEM
    | NFTType.CREW
    | NFTType.GENESIS_SHIP;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
  name: string;
  level: number;
  location: AssetLocation;
  minted: boolean;
  mint?: string;
  isActionLimited: boolean;
  isSelected: boolean;
  loading?: boolean;
  handleSelect: (id: string) => void;
  handleAction?: (id: string) => any;
  goldBurned?: number;
}

const ActionButton: React.FC<{
  id: string;
  location: AssetLocation;
  type:
    | 'CAPTAIN'
    | NFTType.SHIP
    | NFTType.ITEM
    | NFTType.CREW
    | NFTType.GENESIS_SHIP;
  isActionLimited: boolean;
  loading?: boolean;
  handleAction?: (id: string) => any;
  isMobile: boolean;
  className?: string;
}> = ({
  id,
  location,
  type,
  isActionLimited,
  loading,
  handleAction,
  isMobile,
  className,
}) => {
  const isUnstakeDisabled =
    location === AssetLocation.IN_GAME &&
    (type === NFTType.CREW || type === NFTType.SHIP || type === NFTType.ITEM);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (isUnstakeDisabled) {
      const assetTypeName =
        type === NFTType.CREW
          ? 'Crew'
          : type === NFTType.SHIP
          ? 'Ship'
          : 'Item';
      toast.error(
        `Unstaking is currently disabled for ${assetTypeName}s. Only Captains and Genesis Ships can be unstaked.`,
      );
      return;
    }

    if (!handleAction) {
      toast.error(
        'An error occurred. Please try again later and contact support if the issue persists.',
      );
      return;
    }
    handleAction(id);
  };

  const isButtonDisabled =
    isActionLimited || (isMobile && loading) || isUnstakeDisabled;

  return (
    <button
      onClick={handleClick}
      className={`${
        isMobile ? 'w-full' : ''
      } rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        !isButtonDisabled
          ? 'bg-[#6535c9] text-white hover:bg-[#4a239a] hover:text-white'
          : 'cursor-not-allowed bg-gray-700 text-gray-400'
      } ${className}`}
      disabled={isButtonDisabled}>
      {isActionLimited
        ? 'Action Limited'
        : isUnstakeDisabled
        ? 'Unstake Disabled'
        : location === AssetLocation.IN_GAME
        ? 'UNSTAKE'
        : 'STAKE'}
    </button>
  );
};

const AssetCard: React.FC<AssetCardProps> = ({
  id,
  imageUrl,
  collection,
  type,
  name,
  level,
  rarity,
  location,
  minted,
  mint,
  isActionLimited,
  isSelected,
  loading,
  goldBurned,
  handleSelect,
  handleAction,
}) => {
  const layerContext = useContext(LayerContext);
  if (!layerContext) {
    throw new Error('LayerMap must be used within a LayerProvider');
  }

  const { isMobile } = layerContext;

  const collectionIcon = getCollectionIcon(collection, {
    width: 25,
    height: 25,
    className: 'ml-2',
  });

  // Define action-limited messages
  const getActionLimitedMessage = () => {
    if (type === 'CAPTAIN') {
      return (
        <span>
          The captain is currently on a mission or has equipped a
          CREW/ITEM/SHIP.
        </span>
      );
    } else if (type === NFTType.GENESIS_SHIP) {
      return <span>The Genesis ship is currently on a mission.</span>;
    } else if ([NFTType.CREW, NFTType.ITEM, NFTType.SHIP].includes(type)) {
      return (
        <span>
          {type[0].toUpperCase() + type.slice(1).toLowerCase()} is equipped to a
          captain. Please remove it first.
        </span>
      );
    }
    return null;
  };

  const handleCopyMintAddress = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (mint) {
      navigator.clipboard
        .writeText(mint)
        .then(() => {
          toast.success('Mint address copied to clipboard!');
        })
        .catch(() => {
          toast.error('Failed to copy mint address.');
        });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0.9 }}
      animate={{ opacity: 1 }}
      className={`relative flex w-[420px] cursor-pointer gap-4 rounded-lg border p-4 text-white transition-all duration-300 max-md:w-[350px] max-md:flex-wrap ${
        isSelected
          ? 'border-[#9b6afd] bg-[#4a239a] bg-opacity-20'
          : 'border-white border-opacity-[0.17] bg-transparent'
      } ${isActionLimited && 'cursor-not-allowed'} ${
        type === 'CAPTAIN' ? 'h-[210px]' : 'h-[192px]'
      } `}
      onClick={!isActionLimited ? () => handleSelect(id) : undefined}>
      {mint && (
        <button
          onClick={handleCopyMintAddress}
          className="absolute left-5 top-5 z-10 rounded-full bg-black p-1.5">
          <CopyIcon className="h-4 w-4" fill="white" />
        </button>
      )}
      <div className="relative h-[150px] w-[150px] space-y-2 max-md:h-[100px] max-md:w-[100px]">
        <Image
          src={imageUrl}
          alt={name}
          width={150}
          height={150}
          className="select-none rounded-md object-cover max-md:h-[100px] max-md:w-[100px]"
          unoptimized
        />
        <p
          className={`absolute bottom-0 left-0 rounded-bl-md p-2 py-0.5 text-xs ${
            minted ? 'bg-green-400 text-black' : 'bg-red-400 text-black'
          }`}>
          {minted ? 'Minted' : 'Not Minted'}
        </p>
        {type === 'CAPTAIN' && (
          <GoldBarDisplay className="w-max" goldBurned={goldBurned} />
        )}
      </div>

      <div className="flex flex-grow flex-col justify-between gap-4">
        <div className="flex w-full items-center justify-between">
          <h2 className="max-w-[20ch] overflow-hidden whitespace-nowrap text-base font-bold md:text-lg">
            {name}
          </h2>
          {collectionIcon}
        </div>

        {/* Type and Level */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            {type === NFTType.GENESIS_SHIP ? (
              <p className="text-sm">Type: {rarity}</p>
            ) : (
              <p className="text-sm">Type: {type}</p>
            )}
            {type !== NFTType.GENESIS_SHIP && (
              <p className="text-sm">Level: {level}</p>
            )}
          </div>

          <p className="w-full text-left text-sm">
            Location:{' '}
            {location === AssetLocation.IN_GAME ? 'In Game' : 'In Wallet'}
          </p>
        </div>

        {!isMobile && (
          <ActionButton
            id={id}
            location={location}
            type={type}
            isActionLimited={isActionLimited}
            loading={loading}
            handleAction={handleAction}
            isMobile={isMobile}
            className="mb-2"
          />
        )}
      </div>

      {isMobile && (
        <ActionButton
          id={id}
          location={location}
          type={type}
          isActionLimited={isActionLimited}
          loading={loading}
          handleAction={handleAction}
          isMobile={isMobile}
          className="mt-7"
        />
      )}

      {/* Action Limited Overlay */}
      {isActionLimited && (
        <div className="absolute inset-0 z-10 flex cursor-not-allowed flex-col items-center justify-center rounded-lg bg-black bg-opacity-85 p-4 text-center text-white">
          <p className="mb-4 text-sm font-semibold">
            {getActionLimitedMessage()}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default AssetCard;
