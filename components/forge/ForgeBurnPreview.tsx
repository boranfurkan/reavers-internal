import React from 'react';
import { motion } from 'framer-motion';
import {
  Coins,
  Flame,
  Users,
  AlertTriangle,
  TrendingUp,
  Crown,
  Gift,
  Star,
  Zap,
  InfoIcon,
} from 'lucide-react';

import CaptainIcon from '../../assets/captain-icon';
import { ForgeAsset, ForgeReward, ForgeTabValue } from '../../types/forge';
import ShipIcon from '../../assets/ship-icon';
import CrewIcon from '../../assets/crew-icon';
import ItemsIcon from '../../assets/items-icon';
import GoldTokenIcon from '../../assets/gold-token-icon';
import { useUser } from '../../contexts/UserContext';

interface ForgeBurnPreviewProps {
  selectedAssets: ForgeAsset[];
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
  const { user } = useUser();
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
            ? 'assets to see burn rewards and proceed.'
            : 'assets from the left panel to see burn rewards and proceed with the operation.'}
        </p>
      </div>
    );
  }

  const isMultipleSelection = selectedAssets.length > 1;
  const firstAsset = selectedAssets[0];
  const hasLevel1Assets = selectedAssets.some(
    (asset) => asset.level === 1 && asset.type !== ForgeTabValue.CAPTAIN,
  );

  // Group assets by type for better display
  const assetsByType = selectedAssets.reduce((acc, asset) => {
    const type = asset.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(asset);
    return acc;
  }, {} as Record<ForgeTabValue, ForgeAsset[]>);

  // Calculate detailed statistics
  const totalLevels = selectedAssets.reduce(
    (sum, asset) => sum + asset.level,
    0,
  );
  const averageLevel = Math.round(totalLevels / selectedAssets.length);

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

  const canBurn = selectedAssets.length > 0;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-6">
        {/* Header with Statistics */}
        <div>
          <h3 className="mb-4 flex items-center gap-2 font-Header text-lg font-bold text-white">
            <Users className="h-5 w-5" />
            {isMultipleSelection
              ? `${selectedAssets.length} Assets Selected`
              : 'Asset to Burn'}
          </h3>

          {/* Detailed Statistics */}
          {isMultipleSelection && (
            <div className="mb-4 grid grid-cols-3 gap-3 rounded-lg border border-reavers-border bg-reavers-bg-secondary p-3">
              <div className="text-center">
                <div className="text-lg font-bold text-white">
                  {totalLevels}
                </div>
                <div className="text-xs text-white/60">Total Levels</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">
                  {averageLevel}
                </div>
                <div className="text-xs text-white/60">Avg Level</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">
                  {Object.keys(assetsByType).length}
                </div>
                <div className="text-xs text-white/60">Asset Types</div>
              </div>
            </div>
          )}

          {/* Level 1 Warning */}
          {hasLevel1Assets && (
            <div className="mb-4 rounded-lg border border-orange-500/30 bg-orange-500/10 p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-500">
                  Level 1 Assets Notice
                </span>
              </div>
              <p className="mt-1 text-xs text-orange-500/80">
                Level 1 ships, crews, and items will be burned but won't provide
                any token rewards to prevent market abuse.
              </p>
            </div>
          )}

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
                      <span className="text-xs text-white/60">
                        Avg Lv.{' '}
                        {Math.round(
                          assets.reduce((sum, a) => sum + a.level, 0) /
                            assets.length,
                        )}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {assets.slice(0, 8).map((asset) => (
                        <div key={asset.id} className="relative">
                          <div className="aspect-square overflow-hidden rounded border border-reavers-border">
                            <img
                              src={asset.imageUrl}
                              alt={asset.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          {asset.minted && (
                            <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-reavers-fill" />
                          )}
                          <div className="mt-1 truncate text-xs text-white/70">
                            Lv.{asset.level}
                          </div>
                        </div>
                      ))}
                      {assets.length > 8 && (
                        <div className="flex aspect-square items-center justify-center rounded border border-reavers-border bg-reavers-bg text-xs font-medium text-white">
                          +{assets.length - 8}
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
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-reavers-border">
                    <img
                      src={firstAsset.imageUrl}
                      alt={firstAsset.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex h-full min-w-0 flex-1 flex-col items-start gap-1.5 text-left">
                    <div className="w-full truncate font-Body text-base font-medium text-white">
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
          </div>
        </div>

        {/* Enhanced Burn Outcomes Section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h4 className="flex items-center gap-2 font-Header text-base font-bold text-white">
              <Gift className="h-4 w-4" />
              Burn Outcomes
            </h4>
          </div>

          <div className="space-y-3">
            {/* Captain Club NFT */}
            {currentRewards?.captainClubNFT &&
              currentRewards.captainClubNFT > 0 && (
                <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-purple-400" />
                      <span className="text-base font-semibold text-purple-400">
                        Captain's Club NFT
                      </span>
                    </div>
                    <div className="text-lg font-bold text-purple-400">
                      {currentRewards.captainClubNFT}
                    </div>
                  </div>
                  <div className="text-sm leading-relaxed text-purple-400/80">
                    You'll receive a new NFT from{' '}
                    <strong>The Captain's Club</strong> collection with the same
                    metadata, image, and description as your burned captain.
                  </div>
                </div>
              )}

            {/* Ship Tokens */}
            {currentRewards?.shipTokens && currentRewards.shipTokens > 0 && (
              <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShipIcon className="h-5 w-5 text-blue-400" />
                    <span className="text-base font-semibold text-blue-400">
                      Ship Tokens
                    </span>
                  </div>
                  <div className="text-lg font-bold text-blue-400">
                    {currentRewards.shipTokens.toLocaleString()}
                  </div>
                </div>
                <div className="text-sm text-blue-400/80">
                  You receive 1 ship token per level of ship burned (excluding
                  level 1 ships).
                </div>
              </div>
            )}

            {/* Mythic Tokens */}
            {currentRewards?.mythicTokens &&
              currentRewards.mythicTokens > 0 && (
                <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-400" />
                      <span className="text-base font-semibold text-yellow-400">
                        Mythic Tokens
                      </span>
                    </div>
                    <div className="text-lg font-bold text-yellow-400">
                      {currentRewards.mythicTokens.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm text-yellow-400/80">
                    Bonus reward for burning mythic ships - you receive 2 mythic
                    tokens per mythic ship.
                  </div>
                </div>
              )}

            {/* Crew Tokens */}
            {currentRewards?.crewTokens && currentRewards.crewTokens > 0 && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CrewIcon className="h-5 w-5 text-green-400" />
                    <span className="text-base font-semibold text-green-400">
                      Crew Tokens
                    </span>
                  </div>
                  <div className="text-lg font-bold text-green-400">
                    {currentRewards.crewTokens.toLocaleString()}
                  </div>
                </div>
                <div className="text-sm text-green-400/80">
                  You receive 1 crew token per level of crew burned (excluding
                  level 1 crews).
                </div>
              </div>
            )}

            {/* Item Tokens */}
            {currentRewards?.itemTokens && currentRewards.itemTokens > 0 && (
              <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ItemsIcon className="h-5 w-5 text-purple-400" />
                    <span className="text-base font-semibold text-purple-400">
                      Item Tokens
                    </span>
                  </div>
                  <div className="text-lg font-bold text-purple-400">
                    {currentRewards.itemTokens.toLocaleString()}
                  </div>
                </div>
                <div className="text-sm text-purple-400/80">
                  You receive 1 item token per level of item burned (excluding
                  level 1 items).
                </div>
              </div>
            )}

            {/* Gold Airdrop */}
            {currentRewards?.goldTokens && currentRewards.goldTokens > 0 && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-400" />
                    <span className="text-base font-semibold text-amber-400">
                      Gold Airdrop
                    </span>
                  </div>
                  <div className="text-lg font-bold text-amber-400">
                    {currentRewards.goldTokens.toLocaleString()}
                  </div>
                </div>
                <div className="text-sm text-amber-400/80">
                  Bonus gold reward for burning minted NFTs - you receive gold
                  equal to the asset level × 2.
                </div>
              </div>
            )}

            {/* No Rewards Warning */}
            {!currentRewards ||
              (!currentRewards.captainClubNFT &&
                !currentRewards.shipTokens &&
                !currentRewards.crewTokens &&
                !currentRewards.itemTokens &&
                !currentRewards.goldTokens &&
                !currentRewards.mythicTokens && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <InfoIcon className="h-5 w-5 text-red-400" />
                      <span className="text-base font-semibold text-red-400">
                        No Token Rewards
                      </span>
                    </div>
                    <div className="text-sm text-red-400/80">
                      These assets will be burned but won't provide any token
                      rewards. This typically happens with level 1 ships, crews,
                      and items to prevent market abuse.
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>

      {/* Burn Button */}
      <div className="border-t border-reavers-border pt-6">
        <motion.button
          whileHover={{ scale: canBurn ? 1.02 : 1 }}
          whileTap={{ scale: canBurn ? 0.98 : 1 }}
          onClick={onBurn}
          disabled={!canBurn || isLoading}
          className={`w-full rounded-lg border-2 py-3 font-Header text-base font-bold uppercase transition-all duration-200 ${
            canBurn && !isLoading
              ? 'border-red-500 bg-gradient-to-r from-red-500 to-orange-500 text-white hover:shadow-lg hover:shadow-red-500/25'
              : 'cursor-not-allowed border-reavers-border bg-reavers-bg-secondary text-white/50'
          }`}>
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Burning...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Flame className="h-4 w-4" />
              Burn{' '}
              {isMultipleSelection
                ? `${selectedAssets.length} Assets`
                : 'Asset'}
            </div>
          )}
        </motion.button>

        {/* Warning text */}
        <p className="mb-10 mt-3 text-center text-xs text-white/60">
          This action cannot be undone. Assets will be permanently destroyed.
        </p>
      </div>
    </div>
  );
};
