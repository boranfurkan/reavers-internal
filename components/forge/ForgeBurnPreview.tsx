// components/forge/ForgeBurnPreview.tsx - Updated for multiple assets
import React from 'react';
import { motion } from 'framer-motion';
import { Coins, Flame, Users } from 'lucide-react';
import Image from 'next/image';

import CaptainIcon from '../../assets/captain-icon';
import { ForgeAsset, ForgeReward, ForgeTabValue } from '../../types/forge';
import ShipIcon from '../../assets/ship-icon';
import CrewIcon from '../../assets/crew-icon';
import ItemsIcon from '../../assets/items-icon';
import GoldTokenIcon from '../../assets/gold-token-icon';

interface ForgeBurnPreviewProps {
  selectedAssets: ForgeAsset[]; // Changed from selectedAsset
  currentRewards: ForgeReward | null;
  isLoading: boolean;
  onBurn: () => void;
  isMobile?: boolean;
}

export const ForgeBurnPreview: React.FC<ForgeBurnPreviewProps> = ({
  selectedAssets,
  currentRewards,
  isLoading,
  onBurn,
  isMobile = false,
}) => {
  if (!selectedAssets || selectedAssets.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <Flame className="mb-4 h-16 w-16 text-orange-500/50" />
        <h3 className="mb-2 text-lg font-semibold text-white/80">
          Select Assets to Burn
        </h3>
        <p className="max-w-xs text-sm text-white/60">
          Choose one or more{' '}
          {isMobile
            ? ''
            : 'assets from the left panel to see burn rewards and proceed with the operation.'}
        </p>
      </div>
    );
  }

  const isMultipleSelection = selectedAssets.length > 1;
  const firstAsset = selectedAssets[0];
  const hasMintedAssets = selectedAssets.some((asset) => asset.minted);

  // Group assets by type for better display
  const assetsByType = selectedAssets.reduce((acc, asset) => {
    const type = asset.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(asset);
    return acc;
  }, {} as Record<ForgeTabValue, ForgeAsset[]>);

  const getTypeIcon = (type: ForgeTabValue) => {
    switch (type) {
      case ForgeTabValue.CAPTAIN:
        return <CaptainIcon className="h-4 w-4" />;
      case ForgeTabValue.SHIP:
        return <ShipIcon className="h-4 w-4" />;
      case ForgeTabValue.CREW:
        return <CrewIcon className="h-4 w-4" />;
      case ForgeTabValue.ITEM:
        return <ItemsIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div>
          <h3 className="mb-4 flex items-center gap-2 font-Header text-lg font-bold text-white">
            <Users className="h-5 w-5" />
            {isMultipleSelection
              ? `${selectedAssets.length} Assets Selected`
              : 'Asset to Burn'}
          </h3>

          {/* Selected Assets Display */}
          <div className="space-y-4">
            {isMultipleSelection ? (
              // Multiple assets - show grouped by type
              <div className="space-y-3">
                {Object.entries(assetsByType).map(([type, assets]) => (
                  <div
                    key={type}
                    className="rounded-lg border border-reavers-border bg-reavers-bg-secondary p-3">
                    <div className="mb-3 flex items-center gap-2">
                      {getTypeIcon(type as ForgeTabValue)}
                      <span className="text-sm font-medium text-white">
                        {assets.length} {type.toLowerCase()}
                        {assets.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {assets.slice(0, 6).map((asset, index) => (
                        <div key={asset.id} className="relative">
                          <div className="aspect-square overflow-hidden rounded border border-reavers-border/50">
                            <img
                              src={asset.imageUrl}
                              alt={asset.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="absolute -right-1 -top-1 rounded bg-black/80 px-1 text-xs text-white">
                            {asset.level}
                          </div>
                        </div>
                      ))}

                      {assets.length > 6 && (
                        <div className="flex aspect-square items-center justify-center rounded border border-reavers-border/50 bg-reavers-bg text-xs text-white/60">
                          +{assets.length - 6}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Single asset - show detailed view
              <div className="rounded-lg border border-reavers-border bg-reavers-bg-secondary p-4">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 overflow-hidden rounded-lg border border-reavers-border">
                    <img
                      src={firstAsset.imageUrl}
                      alt={firstAsset.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex h-full flex-1 flex-col items-start justify-between gap-1.5">
                    <div className="font-Body text-base font-medium text-white">
                      {firstAsset.name}
                    </div>
                    <div className="font-Body text-sm text-white/60">
                      Level {firstAsset.level} • {firstAsset.rarity}
                    </div>
                    {firstAsset.minted && (
                      <div className="inline-block rounded bg-reavers-fill/20 px-2 py-1 font-Body text-xs text-reavers-fill">
                        MINTED NFT
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Warning for minted assets */}
            {hasMintedAssets && isMultipleSelection && (
              <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3">
                <div className="text-sm text-yellow-400">
                  ⚠️ Warning: Multiple minted assets cannot be burned together.
                  Please select only one minted asset at a time.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Burn Rewards */}
        <div>
          <h3 className="mb-4 font-Header text-lg font-bold text-white">
            Burn Rewards
          </h3>

          {currentRewards ? (
            <div className="space-y-3">
              {/* Token Rewards */}
              {currentRewards.shipTokens > 0 && (
                <div className="flex items-center justify-between rounded-md bg-black/30 p-3">
                  <div className="flex items-center gap-3">
                    <ShipIcon className="h-5 w-5 text-blue-400" />
                    <span className="text-sm font-medium text-white">
                      Ship Tokens
                    </span>
                  </div>
                  <span className="text-lg font-bold text-blue-400">
                    +{currentRewards.shipTokens.toLocaleString()}
                  </span>
                </div>
              )}

              {currentRewards.crewTokens > 0 && (
                <div className="flex items-center justify-between rounded-md bg-black/30 p-3">
                  <div className="flex items-center gap-3">
                    <CrewIcon className="h-5 w-5 text-green-400" />
                    <span className="text-sm font-medium text-white">
                      Crew Tokens
                    </span>
                  </div>
                  <span className="text-lg font-bold text-green-400">
                    +{currentRewards.crewTokens.toLocaleString()}
                  </span>
                </div>
              )}

              {currentRewards.itemTokens > 0 && (
                <div className="flex items-center justify-between rounded-md bg-black/30 p-3">
                  <div className="flex items-center gap-3">
                    <ItemsIcon className="h-5 w-5 text-purple-400" />
                    <span className="text-sm font-medium text-white">
                      Item Tokens
                    </span>
                  </div>
                  <span className="text-lg font-bold text-purple-400">
                    +{currentRewards.itemTokens.toLocaleString()}
                  </span>
                </div>
              )}

              {currentRewards.goldTokens > 0 && (
                <div className="flex items-center justify-between rounded-md bg-black/30 p-3">
                  <div className="flex items-center gap-3">
                    <GoldTokenIcon className="h-5 w-5 text-yellow-400" />
                    <span className="text-sm font-medium text-white">
                      Gold Tokens
                    </span>
                  </div>
                  <span className="text-lg font-bold text-yellow-400">
                    +{currentRewards.goldTokens.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Special case for captains */}
              {firstAsset.type === ForgeTabValue.CAPTAIN && (
                <div className="rounded-md border border-purple-500/30 bg-purple-500/10 p-3">
                  <div className="text-sm text-purple-300">
                    🎭 Burning a Captain will grant you a new NFT from The
                    Captain's Club Collection
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-white/60">No rewards calculated</div>
          )}
        </div>
      </div>

      {/* Burn Button */}
      <div className="border-t border-reavers-border pt-4">
        <button
          onClick={onBurn}
          disabled={isLoading || (hasMintedAssets && isMultipleSelection)}
          className={`w-full rounded-md px-4 py-3 font-medium transition-all ${
            isLoading || (hasMintedAssets && isMultipleSelection)
              ? 'cursor-not-allowed bg-gray-600 text-gray-400'
              : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
          }`}>
          {isLoading
            ? 'Processing...'
            : hasMintedAssets && isMultipleSelection
            ? 'Cannot burn multiple minted assets'
            : `Burn ${selectedAssets.length} Asset${
                selectedAssets.length > 1 ? 's' : ''
              }`}
        </button>
      </div>
    </div>
  );
};
