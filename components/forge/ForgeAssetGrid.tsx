import React from 'react';
import { motion } from 'framer-motion';
import ReaverLoaderNoOverlay from '../ReaverLoaderNoOverlay';
import { ForgeAsset, ForgeTabValue } from '../../types/forge';
import { cn } from '../../utils/helpers';

interface ForgeAssetGridProps {
  assets: ForgeAsset[];
  selectedAsset: ForgeAsset | null;
  onAssetSelect: (asset: ForgeAsset) => void;
  isLoading: boolean;
  activeTab: ForgeTabValue;
  isMobile?: boolean;
  gridCols?: string;
}

export const ForgeAssetGrid: React.FC<ForgeAssetGridProps> = ({
  assets,
  selectedAsset,
  onAssetSelect,
  isLoading,
  activeTab,
  isMobile = false,
  gridCols = 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3',
}) => {
  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center sm:h-40">
        <ReaverLoaderNoOverlay />
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center font-Body text-sm text-white/60 sm:h-40 sm:text-base">
        No {activeTab.toLowerCase()}s available to burn
      </div>
    );
  }

  return (
    <div className={`grid gap-2 sm:gap-3 ${gridCols}`}>
      {assets.map((asset, index) => (
        <ForgeAssetCard
          key={`forge-asset-${activeTab}-${asset.id}-${index}`}
          asset={asset}
          isSelected={selectedAsset?.id === asset.id}
          onSelect={() => onAssetSelect(asset)}
          index={index}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
};

interface ForgeAssetCardProps {
  asset: ForgeAsset;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
  isMobile: boolean;
}

const ForgeAssetCard: React.FC<ForgeAssetCardProps> = ({
  asset,
  isSelected,
  onSelect,
  index,
  isMobile,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15, delay: index * 0.02 }}
      whileHover={!isMobile ? { scale: 1.02 } : undefined}
      whileTap={{ scale: 0.98 }}
      className={`cursor-pointer rounded-md border-2 p-2 backdrop-blur-md transition-all duration-200 sm:p-3 ${
        isSelected
          ? 'border-reavers-fill bg-reavers-fill/20 shadow-lg'
          : 'border-reavers-border bg-reavers-bg-secondary/50 hover:border-reavers-fill/60'
      }`}
      onClick={onSelect}>
      <div className="relative mb-2 aspect-square overflow-hidden rounded-md">
        <img
          src={asset.imageUrl}
          alt={asset.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />

        {/* Level Badge */}
        <div className="absolute right-1 top-1 rounded bg-black/80 px-1.5 py-0.5 font-Body text-[9px] text-white">
          Lvl {asset.level}
        </div>

        <div
          className={cn(
            'absolute left-1 top-1 rounded px-1.5 py-0.5 font-Body text-[9px] font-bold text-black',
            asset.minted ? 'bg-reavers-fill/90' : 'bg-red-500 text-white/80',
          )}>
          {asset.minted ? 'MINTED' : 'NOT-MINTED'}
        </div>
      </div>

      <div className="text-center">
        <div className="truncate font-Body text-xs font-medium text-white sm:text-sm">
          {asset.name}
        </div>
        <div className="font-Body text-xs uppercase text-white/60">
          {asset.rarity}
        </div>
      </div>
    </motion.div>
  );
};
