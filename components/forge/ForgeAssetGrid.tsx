// components/forge/ForgeAssetGrid.tsx - Fixed version addressing all issues
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Circle,
  Users,
  Plus,
  Minus,
  Shield,
  Coins,
} from 'lucide-react';
import ReaverLoaderNoOverlay from '../ReaverLoaderNoOverlay';
import { ForgeAsset, ForgeTabValue } from '../../types/forge';
import { cn } from '../../utils/helpers';

interface ForgeAssetGridProps {
  assets: ForgeAsset[];
  selectedAssets: ForgeAsset[];
  onAssetSelect: (asset: ForgeAsset) => void;
  isLoading: boolean;
  activeTab: ForgeTabValue;
  isMobile?: boolean;
  gridCols?: string;
  canSelectMultiple?: boolean;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
}

type AssetFilterTab = 'all' | 'non-minted' | 'minted';

export const ForgeAssetGrid: React.FC<ForgeAssetGridProps> = ({
  assets,
  selectedAssets,
  onAssetSelect,
  isLoading,
  activeTab,
  isMobile = false,
  gridCols = 'grid-cols-2 lg:grid-cols-3',
  canSelectMultiple = false,
  onSelectAll,
  onClearSelection,
}) => {
  const [filterTab, setFilterTab] = useState<AssetFilterTab>('all');

  // Memoize asset separation to prevent re-computation on every render
  const { mintedAssets, nonMintedAssets } = useMemo(() => {
    const minted = assets.filter((asset) => asset.minted);
    const nonMinted = assets.filter((asset) => !asset.minted);
    return { mintedAssets: minted, nonMintedAssets: nonMinted };
  }, [assets]);

  // Memoize filtered assets to prevent unnecessary re-renders
  const filteredAssets = useMemo(() => {
    switch (filterTab) {
      case 'minted':
        return mintedAssets;
      case 'non-minted':
        return nonMintedAssets;
      case 'all':
      default:
        return assets;
    }
  }, [filterTab, mintedAssets, nonMintedAssets, assets]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <ReaverLoaderNoOverlay />
      </div>
    );
  }

  if (!assets || assets.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <div className="mb-4 text-4xl opacity-50">🚫</div>
        <h3 className="mb-2 text-lg font-semibold text-white/80">
          No {activeTab}s Available
        </h3>
        <p className="text-sm text-white/60">
          You don't have any {activeTab.toLowerCase()}s in your inventory.
        </p>
      </div>
    );
  }

  // Helper functions
  const isAssetSelected = (asset: ForgeAsset) => {
    return selectedAssets.some((selected) => selected.id === asset.id);
  };

  const getSelectionNumber = (asset: ForgeAsset) => {
    const index = selectedAssets.findIndex(
      (selected) => selected.id === asset.id,
    );
    return index >= 0 ? index + 1 : null;
  };

  // Get counts for tabs
  const tabCounts = {
    all: assets.length,
    'non-minted': nonMintedAssets.length,
    minted: mintedAssets.length,
  };

  const AssetCard: React.FC<{ asset: ForgeAsset }> = ({ asset }) => {
    const selected = isAssetSelected(asset);
    const selectionNumber = getSelectionNumber(asset);
    const canSelect =
      canSelectMultiple || selectedAssets.length === 0 || selected;

    return (
      <motion.div
        layout // This prevents re-animation on re-renders
        className={cn(
          'group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200',
          selected
            ? 'border-reavers-fill bg-reavers-fill/10 shadow-lg shadow-reavers-fill/25'
            : 'border-reavers-border bg-reavers-bg-secondary hover:border-reavers-fill/50',
          !canSelect && !selected && 'cursor-not-allowed opacity-50',
        )}
        onClick={() => canSelect && onAssetSelect(asset)}>
        {/* Asset Image */}
        <div className="aspect-square overflow-hidden">
          <img
            src={asset.imageUrl}
            alt={asset.name}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        </div>

        {/* Selection Indicator */}
        <div className="absolute right-2 top-2 z-10">
          {selected ? (
            canSelectMultiple && selectedAssets.length > 1 ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-reavers-fill text-xs font-bold text-white">
                {selectionNumber}
              </div>
            ) : (
              <CheckCircle className="h-6 w-6 text-reavers-fill" />
            )
          ) : (
            <Circle className="h-6 w-6 text-white/40 transition-colors group-hover:text-reavers-fill/70" />
          )}
        </div>

        {/* Original Minted Badge - Restored */}
        {asset.minted && (
          <div className="absolute left-2 top-2">
            <div className="inline-block rounded bg-reavers-fill/20 px-2 py-1 font-Body text-xs text-reavers-fill">
              MINTED NFT
            </div>
          </div>
        )}

        {/* Asset Info */}
        <div className="p-3">
          <h4 className="mb-1 truncate font-Body text-sm font-medium text-white">
            {asset.name}
          </h4>
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60">Level {asset.level}</span>
            <span className="text-xs text-white/60">{asset.rarity}</span>
          </div>
        </div>

        {/* Selection Overlay */}
        {selected && <div className="absolute inset-0 bg-reavers-fill/10 " />}
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Compact Selection Info - Fixed expansion issue */}
      {selectedAssets.length > 0 && (
        <div className="rounded-lg border border-reavers-fill/30 bg-reavers-fill/10 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-reavers-fill" />
              <span className="text-sm font-medium text-reavers-fill">
                {selectedAssets.length} selected
              </span>
            </div>
            {canSelectMultiple && (
              <button
                onClick={onClearSelection}
                className="flex items-center gap-1 rounded-md bg-red-500/20 px-2 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/30">
                <Minus className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>

          {/* Compact preview - Limited to 5 items max */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex -space-x-1">
              {selectedAssets.slice(0, 5).map((asset, index) => (
                <img
                  key={asset.id}
                  src={asset.imageUrl}
                  alt={asset.name}
                  className="h-10 w-10 rounded border border-reavers-bg bg-reavers-fill object-cover"
                  style={{ zIndex: 5 - index }}
                />
              ))}
              {selectedAssets.length > 5 && (
                <div className="flex h-10 w-10 items-center justify-center rounded border border-reavers-bg bg-reavers-fill/20 text-xs font-medium text-white">
                  +{selectedAssets.length - 5}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-reavers-fill/80">
              <span>
                Minted: {selectedAssets.filter((a) => a.minted).length}
              </span>
              <span>
                Non-Minted: {selectedAssets.filter((a) => !a.minted).length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Tab System - Better sizing */}
      <div className="space-y-4">
        {/* Tab Navigation - Fixed sizing issues */}
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-3 gap-2 bg-reavers-bg-secondary p-1">
            {(
              [
                { key: 'all', label: 'All', icon: Coins },
                { key: 'non-minted', label: 'Non-Minted', icon: Circle },
                { key: 'minted', label: 'Minted', icon: Shield },
              ] as const
            ).map((tab) => {
              const count = tabCounts[tab.key];
              const Icon = tab.icon;

              return (
                <button
                  key={tab.key}
                  onClick={() => setFilterTab(tab.key)}
                  disabled={count === 0}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-all duration-200',
                    filterTab === tab.key
                      ? 'bg-reavers-fill text-white shadow-sm'
                      : count > 0
                      ? 'text-white/70 hover:bg-reavers-border hover:text-white'
                      : 'cursor-not-allowed text-white/30',
                  )}>
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{tab.label}</span>
                  <span
                    className={cn(
                      'flex-shrink-0 rounded bg-white/20 px-1.5 py-0.5 text-xs font-medium',
                      filterTab === tab.key ? 'bg-white/30' : 'bg-white/10',
                    )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Actions - Better sizing */}
          {canSelectMultiple &&
            filterTab === 'non-minted' &&
            nonMintedAssets.length > 0 && (
              <button
                onClick={onSelectAll}
                className="flex items-center gap-2 whitespace-nowrap rounded-md bg-reavers-fill/20 px-3 py-2 text-sm font-medium text-reavers-fill transition-colors hover:bg-reavers-fill/30">
                <Plus className="h-4 w-4" />
                Select All ({nonMintedAssets.length})
              </button>
            )}
        </div>

        {/* Assets Grid - No animation re-trigger */}
        {filteredAssets.length > 0 ? (
          <div className={cn('grid gap-3', gridCols)}>
            {filteredAssets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        ) : (
          <div className="flex h-32 flex-col items-center justify-center text-center">
            <div className="mb-2 text-2xl opacity-50">
              {filterTab === 'minted' ? '🔒' : '📦'}
            </div>
            <h4 className="mb-1 text-sm font-medium text-white/80">
              No {filterTab === 'all' ? '' : filterTab.replace('-', ' ')}{' '}
              {activeTab.toLowerCase()}s
            </h4>
            <p className="text-xs text-white/60">
              {filterTab === 'minted'
                ? 'No minted NFTs in this category'
                : 'No non-minted assets available'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
