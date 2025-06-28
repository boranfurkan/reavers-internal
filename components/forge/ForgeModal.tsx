// components/forge/ForgeModal.tsx - Updated for multiple selection
import React, { useContext, useState, useCallback } from 'react';
import { LayerContext } from '../../contexts/LayerContext';
import { useNfts } from '../../contexts/NftContext';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import { ForgeTabValue, ForgeAsset } from '../../types/forge';
import { ForgeDesktopModal } from './ForgeDesktopModal';
import { ForgeMobileModal } from './ForgeMobileModal';
import { ForgeConfirmModal } from './ForgeConfirmModal';
import { useForgeLogic } from '../../hooks/forge/useForgeLogic';

const ForgeModal: React.FC = React.memo(() => {
  const layerContext = useContext(LayerContext);
  const nftContext = useNfts();
  const auth = useAuth();
  const { user } = useUser();

  if (!layerContext) {
    throw new Error('ForgeModal must be used within a LayerProvider');
  }

  const { isForgeModalOpen, setForgeModalOpen, isMobile } = layerContext;

  // State management - Changed to support multiple assets
  const [activeTab, setActiveTab] = useState<ForgeTabValue>(
    ForgeTabValue.CAPTAIN,
  );
  const [selectedAssets, setSelectedAssets] = useState<ForgeAsset[]>([]); // Changed from selectedAsset
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Custom hook for forge logic
  const {
    currentAssets,
    currentRewards,
    handleAssetSelect,
    handleAssetSelectMultiple,
    handleTabChange,
    handleBurn,
    handleConfirmBurn,
    canSelectMultiple,
    handleSelectAll,
    handleClearSelection,
    loading: forgeLoading,
  } = useForgeLogic({
    nftContext,
    auth,
    activeTab,
    selectedAssets, // Changed from selectedAsset
    setActiveTab,
    setSelectedAssets, // Changed from setSelectedAsset
    setIsConfirmModalOpen,
    setIsLoading,
  });

  // Close modal handler
  const handleClose = useCallback(() => {
    setForgeModalOpen(false);
    setSelectedAssets([]); // Clear all selections
    setIsConfirmModalOpen(false);
  }, [setForgeModalOpen]);

  if (!isForgeModalOpen) return null;

  return (
    <>
      {/* Desktop Version */}
      {!isMobile && (
        <ForgeDesktopModal
          isOpen={isForgeModalOpen}
          onClose={handleClose}
          activeTab={activeTab}
          selectedAssets={selectedAssets} // Changed from selectedAsset
          currentAssets={currentAssets}
          currentRewards={currentRewards}
          isLoading={isLoading || forgeLoading}
          nftsLoading={nftContext.loading}
          onTabChange={handleTabChange}
          onAssetSelect={handleAssetSelect}
          onAssetSelectMultiple={handleAssetSelectMultiple}
          onBurn={handleBurn}
          canSelectMultiple={canSelectMultiple}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
        />
      )}

      {/* Mobile Version */}
      {isMobile && (
        <ForgeMobileModal
          isOpen={isForgeModalOpen}
          onClose={handleClose}
          activeTab={activeTab}
          selectedAssets={selectedAssets} // Changed from selectedAsset
          currentAssets={currentAssets}
          currentRewards={currentRewards}
          isLoading={isLoading || forgeLoading}
          nftsLoading={nftContext.loading}
          onTabChange={handleTabChange}
          onAssetSelect={handleAssetSelect}
          onAssetSelectMultiple={handleAssetSelectMultiple}
          onBurn={handleBurn}
          canSelectMultiple={canSelectMultiple}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
        />
      )}

      {/* Confirmation Modal */}
      <ForgeConfirmModal
        isOpen={isConfirmModalOpen}
        selectedAssets={selectedAssets} // Changed from selectedAsset to selectedAssets
        isLoading={isLoading || forgeLoading}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmBurn}
      />
    </>
  );
});

ForgeModal.displayName = 'ForgeModal';
export default ForgeModal;
