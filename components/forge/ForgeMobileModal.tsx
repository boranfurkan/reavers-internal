import React, { useState } from 'react';
import { Sheet } from 'react-modal-sheet';
import { Flame, ChevronLeft, Users, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ForgeModalProps, ForgeAsset } from '../../types/forge';
import { ForgeTabNavigation } from './ForgeTabNavigation';
import { ForgeAssetGrid } from './ForgeAssetGrid';
import { ForgeBurnPreview } from './ForgeBurnPreview';

type MobileView = 'assets' | 'preview';

export const ForgeMobileModal: React.FC<ForgeModalProps> = ({
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
  const [currentView, setCurrentView] = useState<MobileView>('assets');

  // Reset view when assets are deselected
  React.useEffect(() => {
    if (selectedAssets.length === 0) {
      setCurrentView('assets');
    }
  }, [selectedAssets.length]);

  // Reset view when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setCurrentView('assets');
    }
  }, [isOpen]);

  const handleAssetSelect = (asset: ForgeAsset) => {
    onAssetSelect(asset);
  };

  const handleBackToAssets = () => {
    setCurrentView('assets');
  };

  const handleViewPreview = () => {
    setCurrentView('preview');
  };

  const hasSelection = selectedAssets.length > 0;

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[0.9]}
      initialSnap={0}
      style={{
        zIndex: 1000, // Ensure it appears above other content
      }}>
      <Sheet.Backdrop
        className="bg-black/60 backdrop-blur-sm"
        onTap={onClose}
      />
      <Sheet.Container>
        <Sheet.Header className="rounded-t-lg border-0 border-reavers-border bg-reavers-bg-secondary">
          <Sheet.Header className="rounded-t-lg border-0 !bg-reavers-bg-secondary" />
          <div className="flex items-center justify-between border-t-[1px] border-white/5 p-4">
            <div className="flex items-center gap-3">
              {currentView === 'preview' && hasSelection && (
                <button
                  onClick={handleBackToAssets}
                  className="flex items-center justify-center rounded-md bg-reavers-bg p-2 transition-colors hover:bg-reavers-border active:scale-95">
                  <ChevronLeft className="h-5 w-5 text-white" />
                </button>
              )}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h2 className="font-Header text-xl font-bold uppercase text-white">
                  {currentView === 'preview' && hasSelection
                    ? 'Burn Preview'
                    : 'The Graveyard'}
                </h2>
                <p className="text-xs text-white/60">
                  {currentView === 'preview' && hasSelection
                    ? 'Review and confirm burn'
                    : 'Burn assets for rewards'}
                </p>
              </div>

              {/* Clean mobile selection indicator */}
              {selectedAssets.length > 0 && currentView === 'assets' && (
                <div className="ml-2 flex items-center gap-1 rounded-md bg-reavers-fill/20 px-2 py-1 text-sm font-medium text-reavers-fill">
                  <Users className="h-3 w-3" />
                  {selectedAssets.length}
                </div>
              )}
            </div>

            {/* Clean view indicator dots */}
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
                    selectedAssets={selectedAssets}
                    nftsLoading={nftsLoading}
                    onTabChange={onTabChange}
                    onAssetSelect={handleAssetSelect}
                    canSelectMultiple={canSelectMultiple}
                    onSelectAll={onSelectAll}
                    onClearSelection={onClearSelection}
                    onViewPreview={handleViewPreview}
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
                    selectedAssets={selectedAssets}
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

        {/* Mobile Bottom Panel - Show when assets are selected and on assets view */}
        {selectedAssets.length > 0 && currentView === 'assets' && (
          <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-reavers-border bg-reavers-bg-secondary p-4">
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
                onClick={handleViewPreview}
                className="flex items-center gap-2 rounded-lg bg-reavers-fill px-4 py-2 font-Header text-sm font-bold uppercase text-white transition-all duration-200 hover:bg-reavers-fill/80">
                <Eye className="h-3 w-3" />
                Preview Burn
              </motion.button>
            </div>
          </div>
        )}
      </Sheet.Container>
    </Sheet>
  );
};

// Clean assets view for mobile - Updated with better organization
const MobileAssetsView: React.FC<{
  activeTab: any;
  currentAssets: ForgeAsset[];
  selectedAssets: ForgeAsset[];
  nftsLoading: boolean;
  onTabChange: (tab: any) => void;
  onAssetSelect: (asset: ForgeAsset) => void;
  canSelectMultiple?: boolean;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  onViewPreview?: () => void;
}> = ({
  activeTab,
  currentAssets,
  selectedAssets,
  nftsLoading,
  onTabChange,
  onAssetSelect,
  canSelectMultiple,
  onSelectAll,
  onClearSelection,
  onViewPreview,
}) => (
  <div className="space-y-6">
    {/* Asset Type Navigation */}
    <div>
      <div className="mb-4">
        <h3 className="mb-1 font-Header text-lg font-bold text-white">
          Select Asset Type
        </h3>
        <p className="text-xs text-white/60">
          Choose the type of assets you want to burn
        </p>
      </div>
      <ForgeTabNavigation
        activeTab={activeTab}
        onTabChange={onTabChange}
        isMobile={true}
      />
    </div>

    {/* Asset Grid with integrated controls */}
    <div className={selectedAssets.length > 0 ? 'pb-20' : ''}>
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-Header text-lg font-bold text-white">
            Your {activeTab}s
          </h3>
          {selectedAssets.length > 0 && onViewPreview && (
            <button
              onClick={onViewPreview}
              className="flex items-center gap-1 rounded-md bg-reavers-fill/20 px-2 py-1 text-xs font-medium text-reavers-fill transition-colors hover:bg-reavers-fill/30">
              <Eye className="h-3 w-3" />
              Preview ({selectedAssets.length})
            </button>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/60">
            Choose assets from your inventory to burn for rewards
          </p>
          {currentAssets.length > 0 && (
            <span className="font-Body text-xs text-white/60">
              {currentAssets.length} total
            </span>
          )}
        </div>
      </div>

      <ForgeAssetGrid
        assets={currentAssets}
        selectedAssets={selectedAssets}
        onAssetSelect={onAssetSelect}
        isLoading={nftsLoading}
        activeTab={activeTab}
        gridCols="grid-cols-2 gap-3"
        canSelectMultiple={canSelectMultiple}
        onSelectAll={onSelectAll}
        onClearSelection={onClearSelection}
      />
    </div>
  </div>
);

// Clean preview view for mobile
const MobilePreviewView: React.FC<{
  selectedAssets: ForgeAsset[];
  currentRewards: any;
  isLoading: boolean;
  onBurn: () => void;
  onBack: () => void;
}> = ({ selectedAssets, currentRewards, isLoading, onBurn, onBack }) => {
  if (!selectedAssets || selectedAssets.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <Flame className="mb-4 h-16 w-16 text-orange-500/50" />
        <h3 className="mb-2 text-lg font-semibold text-white/80">
          No Assets Selected
        </h3>
        <p className="mb-4 max-w-xs text-sm text-white/60">
          Go back and select assets to burn for rewards.
        </p>
        <button
          onClick={onBack}
          className="rounded-md bg-reavers-fill px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-reavers-fill/80">
          Back to Assets
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Use the enhanced burn preview component */}
      <ForgeBurnPreview
        selectedAssets={selectedAssets}
        currentRewards={currentRewards}
        isLoading={isLoading}
        onBurn={onBurn}
        isMobile={true}
      />
    </div>
  );
};
