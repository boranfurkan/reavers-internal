import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { ForgeAsset, ForgeTabValue } from '../../types/forge';

interface ForgeConfirmModalProps {
  isOpen: boolean;
  selectedAsset: ForgeAsset | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ForgeConfirmModal: React.FC<ForgeConfirmModalProps> = ({
  isOpen,
  selectedAsset,
  isLoading,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !selectedAsset) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 mx-4 max-w-md rounded-md border border-reavers-border bg-reavers-bg shadow-2xl backdrop-blur-md">
        <div className="p-4 sm:p-6">
          <div className="text-center">
            <Flame className="mx-auto mb-4 h-10 w-10 text-orange-500 sm:h-12 sm:w-12" />

            <h3 className="mb-2 font-Header text-lg font-bold text-white sm:text-xl">
              Confirm Burn
            </h3>

            <p className="mb-4 font-Body text-sm text-white/80 sm:mb-6 sm:text-base">
              Are you sure you want to burn{' '}
              <strong>{selectedAsset.name}</strong>? This action cannot be
              undone.
            </p>

            {/* Show special message for captains */}
            {selectedAsset.type === ForgeTabValue.CAPTAIN && (
              <div className="mb-4 rounded-md border border-purple-400/30 bg-purple-500/20 p-3 sm:mb-6">
                <p className="font-Body text-xs text-purple-200 sm:text-sm">
                  You will receive a replacement NFT from The Captain's Club
                  Collection
                </p>
              </div>
            )}

            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 rounded-md border border-reavers-border py-2 font-Body text-sm text-white transition-colors hover:bg-reavers-bg-secondary disabled:opacity-50 sm:text-base">
                Cancel
              </button>

              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 rounded-md border border-orange-500/50 bg-gradient-to-r from-orange-600 to-red-600 py-2 font-Body text-sm font-bold text-white transition-colors hover:from-orange-700 hover:to-red-700 disabled:opacity-50 sm:text-base">
                {isLoading ? 'Burning...' : 'Burn'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
