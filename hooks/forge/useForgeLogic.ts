import { useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { ForgeAsset, ForgeReward, ForgeTabValue } from '../../types/forge';
import { CharacterNFT, CrewNFT, ShipNFT } from '../../types/NFT';
import { NFTType } from '../../types/BaseEntity';
import { getLevelRarity } from '../../utils/helpers';
import { ItemData } from '../../lib/types';

interface UseForgeLogicProps {
  nftContext: any;
  auth: any;
  activeTab: ForgeTabValue;
  selectedAsset: ForgeAsset | null;
  setActiveTab: (tab: ForgeTabValue) => void;
  setSelectedAsset: (asset: ForgeAsset | null) => void;
  setIsConfirmModalOpen: (open: boolean) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useForgeLogic = ({
  nftContext,
  auth,
  activeTab,
  selectedAsset,
  setActiveTab,
  setSelectedAsset,
  setIsConfirmModalOpen,
  setIsLoading,
}: UseForgeLogicProps) => {
  const {
    charactersInGame,
    charactersNotInGame,
    crewsInGame,
    shipsInGame,
    itemsInGame,
  } = nftContext;

  // Calculate rewards based on selected asset
  const calculateRewards = useCallback((asset: ForgeAsset): ForgeReward => {
    if (!asset)
      return { shipTokens: 0, crewTokens: 0, itemTokens: 0, goldTokens: 0 };

    const baseReward = asset.level;
    const goldBonus = asset.minted ? 150 : 0;

    switch (asset.type) {
      case ForgeTabValue.CAPTAIN:
        return {
          shipTokens: 0,
          crewTokens: 0,
          itemTokens: 0,
          goldTokens: goldBonus * 10,
        };
      case ForgeTabValue.SHIP:
        return {
          shipTokens: baseReward,
          crewTokens: 0,
          itemTokens: 0,
          goldTokens: goldBonus,
        };
      case ForgeTabValue.CREW:
        return {
          shipTokens: 0,
          crewTokens: baseReward,
          itemTokens: 0,
          goldTokens: goldBonus,
        };
      case ForgeTabValue.ITEM:
        return {
          shipTokens: 0,
          crewTokens: 0,
          itemTokens: baseReward,
          goldTokens: goldBonus,
        };
      default:
        return { shipTokens: 0, crewTokens: 0, itemTokens: 0, goldTokens: 0 };
    }
  }, []);

  // Memoize NFT arrays
  const captainsArray = useMemo(
    () => [...(charactersInGame || []), ...(charactersNotInGame || [])],
    [charactersInGame, charactersNotInGame],
  );
  const shipsArray = useMemo(() => [...(shipsInGame || [])], [shipsInGame]);
  const crewsArray = useMemo(() => [...(crewsInGame || [])], [crewsInGame]);
  const itemsArray = useMemo(() => [...(itemsInGame || [])], [itemsInGame]);

  // Convert NFTs to ForgeAssets
  const getForgeAssets = useCallback(
    (tabType: ForgeTabValue): ForgeAsset[] => {
      try {
        switch (tabType) {
          case ForgeTabValue.CAPTAIN:
            if (!captainsArray || captainsArray.length === 0) return [];
            return captainsArray.map((nft: CharacterNFT, index: number) => ({
              id: nft.uid || `captain-${index}`,
              name: nft.metadata?.name || 'Captain',
              imageUrl:
                nft.metadata?.image ||
                nft.content?.links?.image ||
                '/thesevenseas-logo.png',
              level: nft.level || 1,
              type: ForgeTabValue.CAPTAIN,
              rarity: 'MYTHIC',
              mint: nft.mint,
              minted: nft.minted || false,
            }));

          case ForgeTabValue.SHIP:
            if (!shipsArray || shipsArray.length === 0) return [];
            return shipsArray.map((nft: ShipNFT, index: number) => ({
              id: nft.uid || `ship-${index}`,
              name: nft.metadata?.name || nft.name || 'Ship',
              imageUrl:
                nft.metadata?.image ||
                nft.content?.links?.image ||
                '/thesevenseas-logo.png',
              level: nft.level || 1,
              type: ForgeTabValue.SHIP,
              rarity: getLevelRarity(NFTType.SHIP, nft.level || 1),
              mint: nft.mint,
              minted: nft.minted || false,
            }));

          case ForgeTabValue.CREW:
            if (!crewsArray || crewsArray.length === 0) return [];
            return crewsArray.map((nft: CrewNFT, index: number) => ({
              id: nft.uid || `crew-${index}`,
              name: nft.metadata?.name || 'Crew',
              imageUrl:
                nft.metadata?.image ||
                nft.content?.links?.image ||
                '/thesevenseas-logo.png',
              level: nft.level || 1,
              type: ForgeTabValue.CREW,
              rarity: getLevelRarity(NFTType.CREW, nft.level || 1),
              mint: nft.mint,
              minted: nft.minted || false,
            }));

          case ForgeTabValue.ITEM:
            if (!itemsArray || itemsArray.length === 0) return [];
            return itemsArray.map((item: ItemData, index: number) => ({
              id: item.uid || `item-${index}`,
              name: item.itemStats?.name || 'Item',
              imageUrl:
                item.metadata?.image ||
                item.content?.links?.image ||
                '/thesevenseas-logo.png',
              level: item.level || 1,
              type: ForgeTabValue.ITEM,
              rarity: getLevelRarity(NFTType.ITEM, item.level || 1),
              mint: item.mint,
              minted: item.minted || false,
            }));

          default:
            return [];
        }
      } catch (error) {
        console.error(`Error processing ${tabType} assets:`, error);
        return [];
      }
    },
    [captainsArray, shipsArray, crewsArray, itemsArray],
  );

  // Get current assets for active tab
  const currentAssets = useMemo(() => {
    try {
      const assets = getForgeAssets(activeTab);
      return Array.isArray(assets) ? assets : [];
    } catch (error) {
      console.error('Error getting forge assets:', error);
      return [];
    }
  }, [activeTab, getForgeAssets]);

  // Handle asset selection
  const handleAssetSelect = useCallback(
    (asset: ForgeAsset) => {
      const newSelectedAsset = selectedAsset?.id === asset.id ? null : asset;
      setSelectedAsset(newSelectedAsset);
    },
    [selectedAsset, setSelectedAsset],
  );

  // Handle tab change
  const handleTabChange = useCallback(
    (newTab: ForgeTabValue) => {
      setActiveTab(newTab);
      setSelectedAsset(null);
    },
    [setActiveTab, setSelectedAsset],
  );

  // Handle burn action
  const handleBurn = useCallback(() => {
    if (!selectedAsset) return;
    setIsConfirmModalOpen(true);
  }, [selectedAsset, setIsConfirmModalOpen]);

  // Handle confirm burn
  const handleConfirmBurn = useCallback(async () => {
    if (!selectedAsset || !auth.jwtToken) return;

    setIsLoading(true);
    try {
      console.log('Burning asset:', selectedAsset);
      // TODO: Implement actual burning logic when backend is ready

      const rewards = calculateRewards(selectedAsset);

      let successMessage = `Successfully burned ${selectedAsset.name}! `;

      if (selectedAsset.type === ForgeTabValue.CAPTAIN) {
        successMessage += `You will receive a new NFT from The Seven Seas: Captain's Collection. `;
      }

      const rewardParts = [];
      if (rewards.shipTokens > 0)
        rewardParts.push(`${rewards.shipTokens} Ship Tokens`);
      if (rewards.crewTokens > 0)
        rewardParts.push(`${rewards.crewTokens} Crew Tokens`);
      if (rewards.itemTokens > 0)
        rewardParts.push(`${rewards.itemTokens} Item Tokens`);
      if (rewards.goldTokens > 0)
        rewardParts.push(`${rewards.goldTokens} Gold Tokens`);

      if (rewardParts.length > 0) {
        successMessage += `Received: ${rewardParts.join(', ')}`;
      }

      toast.success(successMessage);

      setSelectedAsset(null);
      setIsConfirmModalOpen(false);
    } catch (error) {
      toast.error('Failed to burn asset. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedAsset,
    auth.jwtToken,
    calculateRewards,
    setSelectedAsset,
    setIsConfirmModalOpen,
    setIsLoading,
  ]);

  // Calculate current rewards
  const currentRewards = useMemo(() => {
    return selectedAsset ? calculateRewards(selectedAsset) : null;
  }, [
    selectedAsset?.id,
    selectedAsset?.level,
    selectedAsset?.type,
    selectedAsset?.minted,
    calculateRewards,
  ]);

  return {
    currentAssets,
    currentRewards,
    handleAssetSelect,
    handleTabChange,
    handleBurn,
    handleConfirmBurn,
    calculateRewards,
  };
};
