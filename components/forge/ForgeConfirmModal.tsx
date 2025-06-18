// components/forge/ForgeConfirmModal.tsx - Updated for multiple assets
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Flame } from 'lucide-react';
import { ForgeAsset, ForgeTabValue } from '../../types/forge';

interface ForgeConfirmModalProps {
  isOpen: boolean;
  selectedAssets: ForgeAsset[]; // Changed from selectedAsset
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
  const firstAsset = selectedAssets[0];

  // Group assets by type for better display
  const assetsByType = selectedAssets.reduce((acc, asset) => {
    const type = asset.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(asset);
    return acc;
  }, {} as Record<ForgeTabValue, ForgeAsset[]>);

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
          className="relative w-full max-w-md rounded-lg border border-red-500/30 bg-black/95 bg-gradient-to-br from-red-500/10 to-orange-500/10 p-6 text-white shadow-2xl backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-500/20 p-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <h2 className="text-xl font-bold uppercase text-red-400">
                Confirm Burn
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Warning Message */}
          <div className="mb-6 space-y-4">
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4">
              <div className="flex items-start gap-3">
                <Flame className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                <div>
                  <p className="text-sm font-medium text-red-300">
                    {isMultipleSelection
                      ? `You are about to permanently burn ${selectedAssets.length} assets.`
                      : 'You are about to permanently burn this asset.'}
                  </p>
                  <p className="mt-2 text-xs text-red-400/80">
                    This action cannot be undone. The{' '}
                    {isMultipleSelection ? 'assets' : 'asset'} will be destroyed
                    and converted to tokens.
                  </p>
                </div>
              </div>
            </div>

            {/* Assets to be burned */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-white/80">
                {isMultipleSelection
                  ? 'Assets to be burned:'
                  : 'Asset to be burned:'}
              </h4>

              {isMultipleSelection ? (
                // Multiple assets summary
                <div className="space-y-2">
                  {Object.entries(assetsByType).map(([type, assets]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between rounded bg-black/30 p-2">
                      <span className="text-sm text-white/80">
                        {type.charAt(0) + type.slice(1).toLowerCase()}
                        {assets.length > 1 ? 's' : ''}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          {assets.length}
                        </span>
                        <div className="flex -space-x-1">
                          {assets.slice(0, 3).map((asset, index) => (
                            <div
                              key={asset.id}
                              className="h-6 w-6 overflow-hidden rounded border border-white/20">
                              <img
                                src={asset.imageUrl}
                                alt={asset.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                          {assets.length > 3 && (
                            <div className="flex h-6 w-6 items-center justify-center rounded border border-white/20 bg-black/50 text-xs text-white/60">
                              +{assets.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Single asset detail
                <div className="flex items-center gap-3 rounded bg-black/30 p-3">
                  <div className="h-12 w-12 overflow-hidden rounded border border-white/20">
                    <img
                      src={firstAsset.imageUrl}
                      alt={firstAsset.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {firstAsset.name}
                    </p>
                    <p className="text-xs text-white/60">
                      Level {firstAsset.level} • {firstAsset.rarity}
                      {firstAsset.minted && ' • MINTED'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Special warnings */}
            {hasMintedAssets && (
              <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3">
                <p className="text-xs text-yellow-300">
                  ⚠️{' '}
                  {isMultipleSelection
                    ? 'Some of these assets are'
                    : 'This asset is'}{' '}
                  minted NFTs and will provide bonus gold tokens when burned.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-md border border-white/20 bg-transparent py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-50">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 rounded-md bg-gradient-to-r from-red-500 to-orange-500 py-2 text-sm font-medium text-white transition-all hover:from-red-600 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-50">
              {isLoading
                ? 'Burning...'
                : `Burn ${
                    isMultipleSelection
                      ? `${selectedAssets.length} Assets`
                      : 'Asset'
                  }`}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
