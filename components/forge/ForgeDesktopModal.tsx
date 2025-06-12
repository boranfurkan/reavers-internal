import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import ModalCloseButton from '../HUD/modals/ModalCloseButton';
import { ForgeModalProps } from '../../types/forge';
import { ForgeTabNavigation } from './ForgeTabNavigation';
import { ForgeAssetGrid } from './ForgeAssetGrid';
import { ForgeBurnPreview } from './ForgeBurnPreview';

export const ForgeDesktopModal: React.FC<ForgeModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  selectedAsset,
  currentAssets,
  currentRewards,
  isLoading,
  nftsLoading,
  onTabChange,
  onAssetSelect,
  onBurn,
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
        {/* Header */}
        <div className="absolute left-0 right-0 top-0 z-20 flex h-[60px] items-center justify-between border-b border-reavers-border bg-reavers-bg-secondary py-3 pl-4 pr-0 sm:h-[73px] sm:py-4 sm:pl-6">
          <div className="flex items-center gap-3">
            <Flame className="h-5 w-5 text-orange-500 sm:h-6 sm:w-6" />
            <h2 className="font-Header text-lg font-bold uppercase text-white sm:text-xl">
              The Forge
            </h2>
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
                selectedAsset={selectedAsset}
                onAssetSelect={onAssetSelect}
                isLoading={nftsLoading}
                activeTab={activeTab}
                gridCols="grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
              />
            </div>
          </div>

          {/* Vertical Divider - Hidden on mobile */}
          <div className="hidden w-px bg-reavers-border lg:block"></div>

          {/* Right Panel - Burn Preview */}
          <div className="flex w-full flex-col border-t border-reavers-border lg:w-1/2 lg:border-t-0">
            {/* Right Panel Header */}
            <div className="flex h-[50px] flex-shrink-0 items-center border-b border-reavers-border bg-reavers-bg-secondary px-4 py-3 sm:h-[60px]">
              <h3 className="font-Header text-base font-bold uppercase text-white sm:text-lg">
                Burn Rewards
              </h3>
            </div>

            {/* Right Panel Content */}
            <div className="flex-1 overflow-y-auto bg-reavers-bg p-3 sm:p-4">
              <ForgeBurnPreview
                selectedAsset={selectedAsset}
                currentRewards={currentRewards}
                isLoading={isLoading}
                onBurn={onBurn}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
