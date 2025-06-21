// components/forge/ForgeDesktopModal.tsx - Final version with all fixes
import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Users } from 'lucide-react';
import ModalCloseButton from '../HUD/modals/ModalCloseButton';
import { ForgeModalProps } from '../../types/forge';
import { ForgeTabNavigation } from './ForgeTabNavigation';
import { ForgeAssetGrid } from './ForgeAssetGrid';
import { ForgeBurnPreview } from './ForgeBurnPreview';

export const ForgeDesktopModal: React.FC<ForgeModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  selectedAssets,
  currentAssets,
  currentRewards,
  isLoading,
  nftsLoading,
  onTabChange,
  onAssetSelect,
  onAssetSelectMultiple,
  onBurn,
  canSelectMultiple,
  onSelectAll,
  onClearSelection,
}) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 mx-4 flex h-[600px] w-full max-w-6xl overflow-hidden rounded-lg border border-reavers-border bg-reavers-bg shadow-2xl lg:h-[700px]">
        {/* Clean Header */}
        <div className="absolute left-0 right-0 top-0 z-20 flex h-[60px] items-center justify-between border-b border-reavers-border bg-reavers-bg-secondary py-3 pl-4 pr-0 sm:h-[73px] sm:py-4 sm:pl-6">
          <div className="flex items-center gap-3">
            <Flame className="h-5 w-5 text-orange-500 sm:h-6 sm:w-6" />
            <h2 className="font-Header text-lg font-bold uppercase text-white sm:text-xl">
              The Forge
            </h2>

            {/* Simple selection indicator */}
            {selectedAssets.length > 0 && (
              <div className="flex items-center gap-1 rounded-md bg-reavers-fill/20 px-2 py-1 text-sm font-medium text-reavers-fill">
                <Users className="h-3 w-3" />
                {selectedAssets.length}
              </div>
            )}
          </div>

          <ModalCloseButton
            handleClose={onClose}
            className="flex w-max items-center justify-center"
            isWithBackground={false}
          />
        </div>

        {/* Main Content Container */}
        <div className="flex h-full w-full flex-col pt-[60px] sm:pt-[73px] lg:flex-row">
          {/* Left Panel - Asset Selection */}
          <div className="flex w-full flex-col lg:w-1/2">
            {/* Tab Navigation */}
            <div className="flex h-[50px] flex-shrink-0 items-center border-b border-reavers-border bg-reavers-bg-secondary px-4 py-3 sm:h-[60px]">
              <ForgeTabNavigation
                activeTab={activeTab}
                onTabChange={onTabChange}
              />
            </div>

            {/* Asset List */}
            <div className="flex-1 overflow-y-auto bg-reavers-bg p-3 sm:p-4">
              <ForgeAssetGrid
                assets={currentAssets}
                selectedAssets={selectedAssets}
                onAssetSelect={onAssetSelect}
                isLoading={nftsLoading}
                activeTab={activeTab}
                isMobile={false}
                gridCols="grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                canSelectMultiple={canSelectMultiple}
                onSelectAll={onSelectAll}
                onClearSelection={onClearSelection}
              />
            </div>
          </div>

          {/* Right Panel - Burn Preview */}
          <div className="hidden w-full border-l border-reavers-border bg-reavers-bg-secondary lg:block lg:w-1/2">
            {/* Simple Preview Header */}
            <div className="flex h-[50px] flex-shrink-0 items-center border-b border-reavers-border bg-reavers-bg-secondary px-4 py-3 sm:h-[60px]">
              <div className="flex items-center gap-2">
                <span className="font-Header text-base font-bold text-white">
                  Burn Preview
                </span>
                {selectedAssets.length > 0 && (
                  <span className="text-sm text-white/60">
                    {selectedAssets.length} selected
                  </span>
                )}
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex h-[calc(100%_-_60px)] flex-col overflow-y-auto p-4 sm:p-6">
              <ForgeBurnPreview
                selectedAssets={selectedAssets}
                currentRewards={currentRewards}
                isLoading={isLoading}
                onBurn={onBurn}
                isMobile={false}
              />
            </div>
          </div>
        </div>

        {/* Mobile Bottom Panel - Clean and Simple */}
        {selectedAssets.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-reavers-border bg-reavers-bg-secondary p-4 lg:hidden">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">
                  {selectedAssets.length} asset
                  {selectedAssets.length > 1 ? 's' : ''} selected
                </div>
                {currentRewards && (
                  <div className="text-xs text-white/60">Ready to burn</div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onBurn}
                disabled={isLoading}
                className={`rounded-lg border-2 px-4 py-2 font-Header text-sm font-bold uppercase transition-all duration-200 ${
                  !isLoading
                    ? 'border-red-500 bg-gradient-to-r from-red-500 to-orange-500 text-white hover:shadow-lg hover:shadow-red-500/25'
                    : 'cursor-not-allowed border-reavers-border bg-reavers-bg-secondary text-white/50'
                }`}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Burning...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Flame className="h-3 w-3" />
                    Burn {selectedAssets.length > 1 ? 'All' : 'Asset'}
                  </div>
                )}
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
