import React, { useState } from 'react';
import { Sheet } from 'react-modal-sheet';
import { Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ForgeModalProps } from '../../types/forge';
import { ForgeTabNavigation } from './ForgeTabNavigation';
import { ForgeAssetGrid } from './ForgeAssetGrid';
import { ForgeBurnPreview } from './ForgeBurnPreview';

type MobileView = 'assets' | 'preview';

export const ForgeMobileModal: React.FC<ForgeModalProps> = ({
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
  const [currentView, setCurrentView] = useState<MobileView>('assets');

  // Auto-switch to preview when asset is selected (only if currently on assets view)
  React.useEffect(() => {
    if (selectedAsset && currentView === 'assets') {
      setCurrentView('preview');
    }
  }, [selectedAsset]); // Remove currentView from dependencies to prevent conflicts

  // Reset view when asset is deselected or modal closes
  React.useEffect(() => {
    if (!selectedAsset) {
      setCurrentView('assets');
    }
  }, [selectedAsset]);

  // Reset view when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setCurrentView('assets');
    }
  }, [isOpen]);

  const handleAssetSelect = (asset: any) => {
    onAssetSelect(asset);
    // View change will be handled by useEffect
  };

  const handleBackToAssets = () => {
    setCurrentView('assets');
    // Optionally deselect the asset when going back
    // onAssetSelect(null);
  };

  const handleViewChange = (view: MobileView) => {
    // Only allow preview if an asset is selected
    if (view === 'preview' && !selectedAsset) {
      return;
    }
    setCurrentView(view);
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} snapPoints={[0.9]} initialSnap={0}>
      <Sheet.Backdrop
        className="bg-black/60 backdrop-blur-sm"
        onTap={onClose}
      />
      <Sheet.Container>
        <Sheet.Header className="rounded-t-lg border-0 border-reavers-border bg-reavers-bg-secondary">
          <Sheet.Header className="rounded-t-lg border-0 !bg-reavers-bg-secondary" />
          <div className="flex items-center justify-between border-t-[1px] border-white/5 p-4">
            <div className="flex items-center gap-3">
              {currentView === 'preview' && selectedAsset && (
                <button
                  onClick={handleBackToAssets}
                  className="flex items-center justify-center rounded-md bg-reavers-bg p-2 transition-colors hover:bg-reavers-border active:scale-95">
                  <ChevronLeft className="h-5 w-5 text-white" />
                </button>
              )}
              <Flame className="h-6 w-6 text-orange-500" />
              <h2 className="font-Header text-xl font-bold uppercase text-white">
                {currentView === 'preview' ? 'Burn Preview' : 'The Forge'}
              </h2>
            </div>

            {/* View indicator dots */}
            <div className="flex gap-2">
              <div
                className={`h-2 w-2 rounded-full transition-colors ${
                  currentView === 'assets' ? 'bg-reavers-fill' : 'bg-white/30'
                }`}
              />
              <div
                className={`h-2 w-2 rounded-full transition-colors ${
                  currentView === 'preview' ? 'bg-reavers-fill' : 'bg-white/30'
                }`}
              />
            </div>
          </div>
        </Sheet.Header>

        <Sheet.Content className="bg-reavers-bg-secondary !backdrop-blur-none backdrop-filter-none">
          <div className="relative h-full overflow-hidden">
            <AnimatePresence mode="wait">
              {currentView === 'assets' && (
                <motion.div
                  key="assets"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-full overflow-y-auto p-4">
                  <MobileAssetsView
                    activeTab={activeTab}
                    currentAssets={currentAssets}
                    selectedAsset={selectedAsset}
                    nftsLoading={nftsLoading}
                    onTabChange={onTabChange}
                    onAssetSelect={handleAssetSelect}
                  />
                </motion.div>
              )}

              {currentView === 'preview' && (
                <motion.div
                  key="preview"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-full overflow-y-auto p-4">
                  <MobilePreviewView
                    selectedAsset={selectedAsset}
                    currentRewards={currentRewards}
                    isLoading={isLoading}
                    onBurn={onBurn}
                    onBack={handleBackToAssets}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop />
    </Sheet>
  );
};

// Separate component for assets view
const MobileAssetsView: React.FC<{
  activeTab: any;
  currentAssets: any[];
  selectedAsset: any;
  nftsLoading: boolean;
  onTabChange: (tab: any) => void;
  onAssetSelect: (asset: any) => void;
}> = ({
  activeTab,
  currentAssets,
  selectedAsset,
  nftsLoading,
  onTabChange,
  onAssetSelect,
}) => (
  <div className="space-y-6">
    {/* Tab Navigation */}
    <div>
      <h3 className="mb-4 font-Header text-lg font-bold text-white">
        Select Asset Type
      </h3>
      <ForgeTabNavigation
        activeTab={activeTab}
        onTabChange={onTabChange}
        isMobile={true}
      />
    </div>

    {/* Asset Grid */}
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-Header text-lg font-bold text-white">
          Your {activeTab}s
        </h3>
        {currentAssets.length > 0 && (
          <span className="font-Body text-sm text-white/60">
            {currentAssets.length} available
          </span>
        )}
      </div>

      <ForgeAssetGrid
        assets={currentAssets}
        selectedAsset={selectedAsset}
        onAssetSelect={onAssetSelect}
        isLoading={nftsLoading}
        activeTab={activeTab}
        isMobile={true}
        gridCols="grid-cols-2 gap-3"
      />
    </div>

    {/* Selected Asset Quick Preview */}
    {selectedAsset && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-reavers-fill/30 bg-reavers-fill/10 p-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-md">
            <img
              src={selectedAsset.imageUrl}
              alt={selectedAsset.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="font-Body text-sm font-medium text-white">
              {selectedAsset.name}
            </div>
            <div className="font-Body text-xs text-white/60">
              Level {selectedAsset.level} • Selected
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-reavers-fill" />
        </div>
      </motion.div>
    )}
  </div>
);

// Separate component for preview view
const MobilePreviewView: React.FC<{
  selectedAsset: any;
  currentRewards: any;
  isLoading: boolean;
  onBurn: () => void;
  onBack: () => void;
}> = ({ selectedAsset, currentRewards, isLoading, onBurn, onBack }) => {
  if (!selectedAsset) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 font-Body text-white/60">No asset selected</div>
          <button
            onClick={onBack}
            className="rounded-md bg-reavers-fill px-4 py-2 font-Body text-black active:scale-95">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selected Asset Details */}
      <div>
        <h3 className="mb-4 font-Header text-lg font-bold text-white">
          Asset to Burn
        </h3>

        <div className="rounded-lg border border-reavers-border bg-reavers-bg-secondary p-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-lg border border-reavers-border">
              <img
                src={selectedAsset.imageUrl}
                alt={selectedAsset.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex h-full flex-1 flex-col items-start justify-between gap-1.5">
              <div className="font-Body text-base font-medium text-white">
                {selectedAsset.name}
              </div>
              <div className="font-Body text-sm text-white/60">
                Level {selectedAsset.level} • {selectedAsset.rarity}
              </div>
              {selectedAsset.minted && (
                <div className="inline-block rounded bg-reavers-fill/20 px-2 py-1 font-Body text-xs text-reavers-fill">
                  MINTED NFT
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Burn Preview */}
      <div>
        <h3 className="mb-4 font-Header text-lg font-bold text-white">
          Burn Rewards
        </h3>

        <ForgeBurnPreview
          selectedAsset={selectedAsset}
          currentRewards={currentRewards}
          isLoading={isLoading}
          onBurn={onBurn}
          isMobile={true}
        />
      </div>
    </div>
  );
};
