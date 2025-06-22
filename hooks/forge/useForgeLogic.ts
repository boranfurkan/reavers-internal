import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import { Wallet } from '@dynamic-labs/sdk-react-core';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { config } from '../../config';
import { useNfts } from '../../contexts/NftContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  ForgeAsset,
  ForgeReward,
  ForgeTabValue,
  SwapEntityRequest,
} from '../../types/forge';
import { ItemData } from '../../lib/types';
import { NFTType } from '../../types/BaseEntity';
import { getLevelRarity } from '../../utils/helpers';
import { useSwapEntities } from '../../lib/api/inventory/useSwapEntities';
import { useBurnMintedCaptain } from './useBurnMintedCaptain';
import { useBurnMintedEntity } from './useBurnMintedEntity';
import { CharacterNFT, CrewNFT, ShipNFT } from '../../types/NFT';

// DynamicWallet interface following project pattern
interface DynamicWallet {
  address?: string;
  getSigner: () => Promise<{
    signTransaction?: (tx: any) => Promise<any>;
  }>;
}

// Helper function to create DynamicWallet (following project pattern)
async function makeDynamicWallet(wallet: Wallet<any>): Promise<DynamicWallet> {
  // The published type lacks `.getSigner()`, so we cast to any:
  const signer = await (wallet as any).getSigner();
  if (!signer || typeof signer.signTransaction !== 'function') {
    throw new Error('No signTransaction method found on primaryWallet.');
  }

  return {
    address: wallet.address,
    getSigner: async () => ({
      signTransaction: async (tx) => {
        return await signer.signTransaction(tx);
      },
    }),
  };
}

interface UseForgeLogicProps {
  nftContext: ReturnType<typeof useNfts>;
  auth: ReturnType<typeof useAuth>;
  activeTab: ForgeTabValue;
  selectedAssets: ForgeAsset[];
  setActiveTab: (tab: ForgeTabValue) => void;
  setSelectedAssets: (assets: ForgeAsset[]) => void;
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
    shipsInGame,
    crewsInGame,
    itemsInGame,
    loading,
  } = nftContext;

  const { primaryWallet } = useDynamicContext();
  const { swapEntitiesWithTokens } = useSwapEntities();
  const { burnMintedCaptain, isLoading: captainBurnLoading } =
    useBurnMintedCaptain();
  const { burnMintedEntity, isLoading: entityBurnLoading } =
    useBurnMintedEntity();

  // Calculate rewards based on selected assets
  const calculateRewards = useCallback((assets: ForgeAsset[]): ForgeReward => {
    return assets.reduce(
      (total, asset) => {
        // Base reward calculation based on level
        const baseReward = asset.level * 10;
        // Bonus for minted assets
        const goldBonus = asset.minted ? asset.level * 150 : 0;

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
            // IMPORTANT: Filter out non-minted captains completely
            return captainsArray
              .filter((nft: CharacterNFT) => nft.minted === true) // Only show minted captains
              .map((nft: CharacterNFT, index: number) => ({
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

  // Get current rewards
  const currentRewards = useMemo(() => {
    return selectedAssets.length > 0 ? calculateRewards(selectedAssets) : null;
  }, [selectedAssets, calculateRewards]);

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

  // Handle confirm burn - Updated with proper wallet integration
  const handleConfirmBurn = useCallback(async () => {
    if (!selectedAssets || selectedAssets.length === 0 || !auth.jwtToken)
      return;

    if (!primaryWallet) {
      toast.error('Please connect your wallet first');
      return;
    }

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

      // Handle single minted asset burning
      if (selectedAssets.length === 1 && selectedAssets[0].minted) {
        const asset = selectedAssets[0];

        if (!asset.mint) {
          toast.error('Cannot burn asset without mint address');
          setIsLoading(false);
          return;
        }

        // Create DynamicWallet following project pattern
        const dynamicWallet = await makeDynamicWallet(primaryWallet);
        let success = false;

        if (asset.type === ForgeTabValue.CAPTAIN) {
          // Use captain-specific burning logic
          success = await burnMintedCaptain(asset.mint, dynamicWallet);
        } else {
          // Use general entity burning logic for ships, crews, items
          success = await burnMintedEntity(asset.mint, dynamicWallet);
        }

        if (success) {
          // Refresh NFT data
          mutate(`${config.worker_server_url}/nfts`);
          mutate(`${config.worker_server_url}/items/fetch-items`);
          mutate(`${config.worker_server_url}/users/me`);

          setSelectedAssets([]);
          setIsConfirmModalOpen(false);
        }
      } else {
        // Handle non-minted assets using existing swap entities endpoint
        const swapRequests: SwapEntityRequest[] = selectedAssets.map(
          (asset) => ({
            type: asset.type as 'CREW' | 'SHIP' | 'ITEM',
            entityId: asset.id,
          }),
        );

        await swapEntitiesWithTokens(swapRequests);
        setSelectedAssets([]);
        setIsConfirmModalOpen(false);
      }
    } catch (error) {
      console.error('Error burning assets:', error);
      toast.error('Failed to burn assets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedAssets,
    auth.jwtToken,
    primaryWallet,
    setIsLoading,
    setSelectedAssets,
    setIsConfirmModalOpen,
    burnMintedCaptain,
    burnMintedEntity,
    swapEntitiesWithTokens,
  ]);

  return {
    // Data
    currentAssets,
    currentRewards,
    loading: loading || captainBurnLoading || entityBurnLoading,

    // Actions
    handleAssetSelect,
    handleAssetSelectMultiple,
    handleTabChange,
    handleBurn,
    handleConfirmBurn,
    calculateRewards,
    canSelectMultiple,
    handleSelectAll,
    handleClearSelection,
  };
};
