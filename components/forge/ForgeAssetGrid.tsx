// components/forge/ForgeAssetGrid.tsx - Updated for multiple selection
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Users, Filter } from 'lucide-react';
import ReaverLoaderNoOverlay from '../ReaverLoaderNoOverlay';
import { ForgeAsset, ForgeTabValue } from '../../types/forge';
import { cn } from '../../utils/helpers';

interface ForgeAssetGridProps {
  assets: ForgeAsset[];
  selectedAssets: ForgeAsset[]; // Changed from selectedAsset to selectedAssets
  onAssetSelect: (asset: ForgeAsset) => void;
  isLoading: boolean;
  activeTab: ForgeTabValue;
  isMobile?: boolean;
  gridCols?: string;
  canSelectMultiple: boolean;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

export const ForgeAssetGrid: React.FC<ForgeAssetGridProps> = ({
  assets,
  selectedAssets,
  onAssetSelect,
  isLoading,
  activeTab,
  isMobile = false,
  gridCols = 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3',
  canSelectMultiple,
  onSelectAll,
  onClearSelection,
}) => {
  // Calculate stats for selection tools
  const nonMintedAssets = assets.filter((asset) => !asset.minted);
  const selectedCount = selectedAssets.length;
  const isAllNonMintedSelected =
    nonMintedAssets.length > 0 &&
    nonMintedAssets.every((asset) =>
      selectedAssets.some((selected) => selected.id === asset.id),
    );

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
    <div className="space-y-4">
      {/* Selection Tools - Only show if there are non-minted assets */}
      {nonMintedAssets.length > 0 && (
        <div className="flex flex-col gap-3 border-b border-reavers-border pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Users className="h-4 w-4" />
              <span>
                {selectedCount} selected
                {nonMintedAssets.length > 0 &&
                  ` • ${nonMintedAssets.length} non-minted available`}
              </span>
            </div>

            {selectedCount > 0 && (
              <button
                onClick={onClearSelection}
                className="rounded border border-white/20 px-3 py-1 text-xs text-white/70 transition-colors hover:border-white/40 hover:text-white">
                Clear Selection
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onSelectAll}
              disabled={isAllNonMintedSelected}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all',
                isAllNonMintedSelected
                  ? 'cursor-not-allowed bg-reavers-border/50 text-white/50'
                  : 'border border-reavers-fill/50 bg-reavers-fill/20 text-reavers-fill hover:bg-reavers-fill/30',
              )}>
              <CheckCircle className="h-4 w-4" />
              Select All Non-Minted ({nonMintedAssets.length})
            </button>

            <div className="flex items-center gap-2 rounded-md bg-black/20 px-3 py-2 text-xs text-white/50">
              <Filter className="h-3 w-3" />
              <span>Only non-minted can be selected together</span>
            </div>
          </div>
        </div>
      )}

      {/* Assets Grid */}
      <div className={`grid gap-2 sm:gap-3 ${gridCols}`}>
        {assets.map((asset, index) => (
          <ForgeAssetCard
            key={`forge-asset-${activeTab}-${asset.id}-${index}`}
            asset={asset}
            isSelected={selectedAssets.some(
              (selected) => selected.id === asset.id,
            )}
            onSelect={() => onAssetSelect(asset)}
            index={index}
            isMobile={isMobile}
            canSelectMultiple={canSelectMultiple}
            selectionCount={selectedCount}
          />
        ))}
      </div>

      {/* Selection Info */}
      {selectedCount > 0 && (
        <div className="mt-4 rounded-md border border-reavers-fill/20 bg-reavers-fill/10 p-3">
          <div className="text-sm text-white/80">
            <strong>{selectedCount}</strong> {activeTab.toLowerCase()}
            {selectedCount > 1 ? 's' : ''} selected for burning
            {selectedCount > 1 && selectedAssets[0].minted && (
              <div className="mt-1 text-xs text-yellow-400">
                ⚠️ Minted entities can only be burned individually
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface ForgeAssetCardProps {
  asset: ForgeAsset;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
  isMobile: boolean;
  canSelectMultiple: boolean;
  selectionCount: number;
}

const ForgeAssetCard: React.FC<ForgeAssetCardProps> = ({
  asset,
  isSelected,
  onSelect,
  index,
  isMobile,
  canSelectMultiple,
  selectionCount,
}) => {
  // Determine if this asset can be selected based on current selection state
  const canBeSelected = () => {
    if (selectionCount === 0) return true; // No selection yet
    if (isSelected) return true; // Already selected, can be deselected

    // Check if the asset's minted status would conflict with existing selection
    // This logic is handled in the parent component, so we just show visual feedback
    return canSelectMultiple;
  };

  const isDisabled = !canBeSelected();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15, delay: index * 0.02 }}
      whileHover={!isMobile && !isDisabled ? { scale: 1.02 } : undefined}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative cursor-pointer rounded-md border-2 p-2 backdrop-blur-md transition-all duration-200 sm:p-3',
        isSelected
          ? 'border-reavers-fill bg-reavers-fill/20 shadow-lg'
          : isDisabled
          ? 'cursor-not-allowed border-reavers-border/50 bg-reavers-bg-secondary/30 opacity-50'
          : 'border-reavers-border bg-reavers-bg-secondary/50 hover:border-reavers-fill/60',
      )}
      onClick={isDisabled ? undefined : onSelect}>
      {/* Selection Indicator */}
      <div className="absolute right-1 top-1 z-10">
        {isSelected ? (
          <CheckCircle className="h-5 w-5 rounded-full bg-black/80 text-reavers-fill" />
        ) : selectionCount > 0 ? (
          <Circle className="h-5 w-5 rounded-full bg-black/60 text-white/40" />
        ) : null}
      </div>

      <div className="relative mb-2 aspect-square overflow-hidden rounded-md">
        <img
          src={asset.imageUrl}
          alt={asset.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />

        {/* Level Badge */}
        <div className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 font-Body text-[9px] text-white">
          Lvl {asset.level}
        </div>

        <div
          className={cn(
            'absolute left-1 top-1 rounded px-1.5 py-0.5 font-Body text-[9px] font-bold',
            asset.minted
              ? 'bg-reavers-fill/90 text-black'
              : 'bg-red-500 text-white/80',
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
