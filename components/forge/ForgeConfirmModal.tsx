import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  AlertTriangle,
  Flame,
  Users,
  Shield,
  InfoIcon,
  Crown,
} from 'lucide-react';
import { ForgeAsset, ForgeTabValue } from '../../types/forge';

interface ForgeConfirmModalProps {
  isOpen: boolean;
  selectedAssets: ForgeAsset[];
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ForgeConfirmModal: React.FC<ForgeConfirmModalProps> = ({
  isOpen,
  selectedAssets,
  isLoading,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !selectedAssets || selectedAssets.length === 0) {
    return null;
  }

  const isMultipleSelection = selectedAssets.length > 1;
  const hasMintedAssets = selectedAssets.some((asset) => asset.minted);
  const hasNonMintedAssets = selectedAssets.some((asset) => !asset.minted);
  const hasLevel1Assets = selectedAssets.some(
    (asset) => asset.level === 1 && asset.type !== ForgeTabValue.CAPTAIN,
  );
  const hasMintedCaptains = selectedAssets.some(
    (asset) => asset.minted && asset.type === ForgeTabValue.CAPTAIN,
  );
  const hasMintedNonCaptains = selectedAssets.some(
    (asset) => asset.minted && asset.type !== ForgeTabValue.CAPTAIN,
  );
  const firstAsset = selectedAssets[0];

  // Group assets by type for better display
  const assetsByType = selectedAssets.reduce((acc, asset) => {
    const type = asset.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(asset);
    return acc;
  }, {} as Record<ForgeTabValue, ForgeAsset[]>);

  // Calculate total levels
  const totalLevels = selectedAssets.reduce(
    (sum, asset) => sum + asset.level,
    0,
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg rounded-lg border border-red-500/30 bg-black/95 bg-gradient-to-br from-red-500/10 to-orange-500/10 p-6 text-white shadow-2xl backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-Header text-xl font-bold text-white">
                  Confirm Burn
                </h3>
                <p className="text-sm text-white/60">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Selection Summary */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-white" />
                <span className="font-medium text-white">
                  {isMultipleSelection
                    ? `Burning ${selectedAssets.length} Assets`
                    : 'Burning 1 Asset'}
                </span>
              </div>

              {isMultipleSelection ? (
                // Multiple assets summary
                <div className="space-y-3">
                  {Object.entries(assetsByType).map(([type, assets]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between">
                      <span className="text-sm text-white/80">
                        {assets.length} {type.toLowerCase()}
                        {assets.length > 1 ? 's' : ''}
                      </span>
                      <div className="flex -space-x-1">
                        {assets.slice(0, 3).map((asset, index) => (
                          <img
                            key={asset.id}
                            src={asset.imageUrl}
                            alt={asset.name}
                            className="h-6 w-6 rounded border border-white/20 object-cover"
                            style={{ zIndex: assets.length - index }}
                          />
                        ))}
                        {assets.length > 3 && (
                          <div className="flex h-6 w-6 items-center justify-center rounded border border-white/20 bg-black/60 text-xs font-medium text-white">
                            +{assets.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="mt-3 border-t border-white/10 pt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Total Level Sum:</span>
                      <span className="font-medium text-white">
                        {totalLevels}
                      </span>
                    </div>
                    {hasMintedAssets && hasNonMintedAssets && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Selection Type:</span>
                        <span className="font-medium text-yellow-400">
                          Mixed
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Single asset details
                <div className="flex items-center gap-3">
                  <img
                    src={firstAsset.imageUrl}
                    alt={firstAsset.name}
                    className="h-12 w-12 flex-shrink-0 rounded border border-white/20 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-white">
                      {firstAsset.name}
                    </div>
                    <div className="text-sm text-white/60">
                      Level {firstAsset.level} • {firstAsset.rarity}
                    </div>
                    {firstAsset.minted && (
                      <div className="mt-1 inline-flex items-center gap-1 rounded bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
                        <Shield className="h-3 w-3" />
                        Minted NFT
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Warnings */}
            <div className="space-y-3">
              {/* Level 1 Assets Warning */}
              {hasLevel1Assets && (
                <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <InfoIcon className="h-4 w-4 flex-shrink-0 text-orange-500" />
                    <span className="text-sm font-medium text-orange-500">
                      Level 1 Assets Notice
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-orange-500/80">
                    Level 1 ships, crews, and items will be burned but won't
                    provide token rewards to prevent market abuse.
                  </p>
                </div>
              )}

              {/* Captain's Club NFT Info */}
              {hasMintedCaptains && (
                <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <Crown className="h-4 w-4 flex-shrink-0 text-purple-500" />
                    <span className="text-sm font-medium text-purple-500">
                      Captain's Club NFT
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-purple-500/80">
                    {isMultipleSelection
                      ? `You'll receive new NFTs from The Captain's Club collection with the same metadata, images, and descriptions as your burned captains.`
                      : `You'll receive a new NFT from The Captain's Club collection with the same metadata, image, and description as your burned captain.`}
                  </p>
                </div>
              )}

              {/* Minted NFT warning for non-captains */}
              {hasMintedNonCaptains && (
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 flex-shrink-0 text-blue-500" />
                    <span className="text-sm font-medium text-blue-500">
                      Minted NFT Warning
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-blue-500/80">
                    {isMultipleSelection
                      ? `${
                          selectedAssets.filter(
                            (a) => a.minted && a.type !== ForgeTabValue.CAPTAIN,
                          ).length
                        } of your selected assets are minted NFTs. They will be permanently destroyed.`
                      : 'This minted NFT will be permanently destroyed and cannot be recovered.'}
                  </p>
                </div>
              )}

              {/* General warning */}
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Flame className="h-4 w-4 flex-shrink-0 text-red-500" />
                  <span className="text-sm font-medium text-red-500">
                    Permanent Action
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-red-500/80">
                  {isMultipleSelection
                    ? 'All selected assets will be permanently destroyed. This action cannot be undone.'
                    : 'This asset will be permanently destroyed. This action cannot be undone.'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex flex-1 items-center justify-center rounded-lg border border-white/20 bg-white/5 py-3 font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-50">
                Cancel
              </button>

              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex flex-1 items-center justify-center rounded-lg bg-gradient-to-r from-red-500 to-orange-500 py-3 font-bold text-white transition-all hover:shadow-lg hover:shadow-red-500/25 disabled:cursor-not-allowed disabled:opacity-50">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Burning...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Flame className="h-4 w-4" />
                    {isMultipleSelection
                      ? `Burn ${selectedAssets.length} Assets`
                      : 'Burn Asset'}
                  </div>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
