// hooks/forge/useForgeLogic.ts - Updated for multiple selection
import { useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import {
  ForgeAsset,
  ForgeReward,
  ForgeTabValue,
  SwapEntityRequest,
} from '../../types/forge';
import { CharacterNFT, CrewNFT, ShipNFT } from '../../types/NFT';
import { NFTType } from '../../types/BaseEntity';
import { getLevelRarity } from '../../utils/helpers';
import { ItemData } from '../../lib/types';
import { useSwapEntities } from '../../lib/api/inventory/useSwapEntities';

interface UseForgeLogicProps {
  nftContext: any;
  auth: any;
  activeTab: ForgeTabValue;
  selectedAssets: ForgeAsset[]; // Changed from selectedAsset to selectedAssets
  setActiveTab: (tab: ForgeTabValue) => void;
  setSelectedAssets: (assets: ForgeAsset[]) => void; // Changed setter
  setIsConfirmModalOpen: (open: boolean) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useForgeLogic = ({
  nftContext,
  auth,
  activeTab,
  selectedAssets,
  setActiveTab,
  setSelectedAssets,
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

  const { swapEntitiesWithTokens, loading: swapLoading } = useSwapEntities();

  // Calculate rewards based on selected assets (multiple)
  const calculateRewards = useCallback((assets: ForgeAsset[]): ForgeReward => {
    if (!assets || assets.length === 0)
      return { shipTokens: 0, crewTokens: 0, itemTokens: 0, goldTokens: 0 };

    return assets.reduce(
      (total, asset) => {
        const baseReward = asset.level;
        const goldBonus = asset.minted ? 150 : 0;

        switch (asset.type) {
          case ForgeTabValue.CAPTAIN:
            return total; // No tokens for captains
          case ForgeTabValue.SHIP:
            return {
              ...total,
              shipTokens: total.shipTokens + baseReward,
              goldTokens: total.goldTokens + goldBonus,
            };
          case ForgeTabValue.CREW:
            return {
              ...total,
              crewTokens: total.crewTokens + baseReward,
              goldTokens: total.goldTokens + goldBonus,
            };
          case ForgeTabValue.ITEM:
            return {
              ...total,
              itemTokens: total.itemTokens + baseReward,
              goldTokens: total.goldTokens + goldBonus,
            };
          default:
            return total;
        }
      },
      { shipTokens: 0, crewTokens: 0, itemTokens: 0, goldTokens: 0 },
    );
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

  // Get current assets for active tab with sorting
  const currentAssets = useMemo(() => {
    try {
      const assets = getForgeAssets(activeTab);

      // Sort assets: non-minted first, then by level (highest first), then by name
      return Array.isArray(assets)
        ? assets.sort((a, b) => {
            // First, sort by minted status (non-minted first)
            if (a.minted !== b.minted) {
              return a.minted ? 1 : -1;
            }
            // Then by level (highest first)
            if (a.level !== b.level) {
              return b.level - a.level;
            }
            // Finally by name
            return a.name.localeCompare(b.name);
          })
        : [];
    } catch (error) {
      console.error('Error getting forge assets:', error);
      return [];
    }
  }, [activeTab, getForgeAssets]);

  // Check if multiple selection is allowed (only non-minted or only minted, not mixed)
  const canSelectMultiple = useMemo(() => {
    if (selectedAssets.length === 0) return true;

    // Check if all selected assets have the same minted status
    const firstAssetMinted = selectedAssets[0].minted;
    return selectedAssets.every((asset) => asset.minted === firstAssetMinted);
  }, [selectedAssets]);

  // Handle individual asset selection with multiple selection logic
  const handleAssetSelect = useCallback(
    (asset: ForgeAsset) => {
      const isAlreadySelected = selectedAssets.some(
        (a: ForgeAsset) => a.id === asset.id,
      );

      if (isAlreadySelected) {
        // Remove from selection
        const newSelection = selectedAssets.filter(
          (a: ForgeAsset) => a.id !== asset.id,
        );
        setSelectedAssets(newSelection);
      } else {
        // Check if we can add this asset
        if (selectedAssets.length === 0) {
          // First selection
          setSelectedAssets([asset]);
          return;
        }

        // Check if minted status matches existing selection
        const firstAssetMinted = selectedAssets[0].minted;
        if (asset.minted !== firstAssetMinted) {
          toast.error(
            'Cannot mix minted and non-minted entities in the same selection',
          );
          return;
        }

        // Add to selection
        setSelectedAssets([...selectedAssets, asset]);
      }
    },
    [setSelectedAssets, selectedAssets],
  );

  // Handle multiple asset selection (for select all functionality)
  const handleAssetSelectMultiple = useCallback(
    (assets: ForgeAsset[]) => {
      setSelectedAssets(assets);
    },
    [setSelectedAssets],
  );

  // Select all non-minted assets
  const handleSelectAll = useCallback(() => {
    const nonMintedAssets = currentAssets.filter((asset) => !asset.minted);
    setSelectedAssets(nonMintedAssets);
    toast.success(
      `Selected ${
        nonMintedAssets.length
      } non-minted ${activeTab.toLowerCase()}s`,
    );
  }, [currentAssets, setSelectedAssets, activeTab]);

  // Clear all selections
  const handleClearSelection = useCallback(() => {
    setSelectedAssets([]);
  }, [setSelectedAssets]);

  // Handle tab change
  const handleTabChange = useCallback(
    (newTab: ForgeTabValue) => {
      setActiveTab(newTab);
      setSelectedAssets([]);
    },
    [setActiveTab, setSelectedAssets],
  );

  // Handle burn action
  const handleBurn = useCallback(() => {
    if (!selectedAssets || selectedAssets.length === 0) return;
    setIsConfirmModalOpen(true);
  }, [selectedAssets, setIsConfirmModalOpen]);

  // Handle confirm burn
  const handleConfirmBurn = useCallback(async () => {
    if (!selectedAssets || selectedAssets.length === 0 || !auth.jwtToken)
      return;

    setIsLoading(true);
    try {
      // Check if all selected assets are non-minted (burning minted assets not allowed for multiple)
      if (
        selectedAssets.length > 1 &&
        selectedAssets.some((asset) => asset.minted)
      ) {
        toast.error('Multiple burning is only allowed for non-minted entities');
        setIsLoading(false);
        return;
      }

      if (
        selectedAssets.length === 1 &&
        selectedAssets[0].type === ForgeTabValue.CAPTAIN
      ) {
        // Handle single captain burn (original logic)
        console.log('Burning captain:', selectedAssets[0]);
        // TODO: Implement captain burning logic when backend is ready
        toast.success(`Successfully burned ${selectedAssets[0].name}!`);
      } else {
        // Handle multiple asset burning using swap entities endpoint
        const swapRequests: SwapEntityRequest[] = selectedAssets.map(
          (asset) => ({
            type: asset.type as 'CREW' | 'SHIP' | 'ITEM',
            entityId: asset.id,
          }),
        );

        await swapEntitiesWithTokens(swapRequests);
      }

      setSelectedAssets([]);
      setIsConfirmModalOpen(false);
    } catch (error) {
      toast.error('Failed to burn assets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedAssets,
    auth.jwtToken,
    swapEntitiesWithTokens,
    setSelectedAssets,
    setIsConfirmModalOpen,
    setIsLoading,
  ]);

  // Calculate current rewards for all selected assets
  const currentRewards = useMemo(() => {
    return selectedAssets.length > 0 ? calculateRewards(selectedAssets) : null;
  }, [selectedAssets, calculateRewards]);

  return {
    currentAssets,
    currentRewards,
    handleAssetSelect,
    handleAssetSelectMultiple,
    handleTabChange,
    handleBurn,
    handleConfirmBurn,
    calculateRewards,
    canSelectMultiple,
    handleSelectAll,
    handleClearSelection,
    loading: swapLoading,
  };
};
