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

  // State management
  const [activeTab, setActiveTab] = useState<ForgeTabValue>(
    ForgeTabValue.CAPTAIN,
  );
  const [selectedAsset, setSelectedAsset] = useState<ForgeAsset | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Custom hook for forge logic
  const {
    currentAssets,
    currentRewards,
    handleAssetSelect,
    handleTabChange,
    handleBurn,
    handleConfirmBurn,
    calculateRewards,
  } = useForgeLogic({
    nftContext,
    auth,
    activeTab,
    selectedAsset,
    setActiveTab,
    setSelectedAsset,
    setIsConfirmModalOpen,
    setIsLoading,
  });

  // Close modal handler
  const handleClose = useCallback(() => {
    setForgeModalOpen(false);
    setSelectedAsset(null);
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
          selectedAsset={selectedAsset}
          currentAssets={currentAssets}
          currentRewards={currentRewards}
          isLoading={isLoading}
          nftsLoading={nftContext.loading}
          onTabChange={handleTabChange}
          onAssetSelect={handleAssetSelect}
          onBurn={handleBurn}
        />
      )}

      {/* Mobile Version */}
      {isMobile && (
        <ForgeMobileModal
          isOpen={isForgeModalOpen}
          onClose={handleClose}
          activeTab={activeTab}
          selectedAsset={selectedAsset}
          currentAssets={currentAssets}
          currentRewards={currentRewards}
          isLoading={isLoading}
          nftsLoading={nftContext.loading}
          onTabChange={handleTabChange}
          onAssetSelect={handleAssetSelect}
          onBurn={handleBurn}
        />
      )}

      {/* Confirmation Modal */}
      <ForgeConfirmModal
        isOpen={isConfirmModalOpen}
        selectedAsset={selectedAsset}
        isLoading={isLoading}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmBurn}
      />
    </>
  );
});

ForgeModal.displayName = 'ForgeModal';
export default ForgeModal;
