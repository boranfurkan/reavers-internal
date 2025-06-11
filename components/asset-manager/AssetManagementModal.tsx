import React, {
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { motion } from 'framer-motion';
import { Sheet } from 'react-modal-sheet';
import { toast } from 'sonner';
import { mutate } from 'swr';

import ModalCloseButton from '../HUD/modals/ModalCloseButton';
import {
  gameTabs,
  GameTabValue,
  MintStatusValue,
  nftFilters,
  NftFilterValue,
  rarityFilters,
  RarityFilterValue,
  secondaryTabs,
  SecondaryTabValue,
} from './AssetManagementFilterOptions';

import AssetCard, { AssetLocation, AssetCardProps } from './AssetCard';
import MintStatusDropdown from './MintStatusDropdown';
import AssetChooseSlider from './AssetChooseSlider';
import ReaverLoaderNoOverlay from '../ReaverLoaderNoOverlay';
import AssetMovement from './AssetMovement';
import FilterOption from './tabs/FilterOption';
import TabItem from './tabs/TabItem';
// Remove TransactionStatus import

import { LayerContext } from '../../contexts/LayerContext';
import { useNfts } from '../../contexts/NftContext';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import { useNotifications } from '../../contexts/NotificationContext';

import { config } from '../../config';

import {
  assetActionVerifySelection,
  getAssetCardPropsFromNFT,
  processAction,
} from '../../utils/components/asset-manager';
import { NFTType } from '../../types/BaseEntity';

import { createUmi as createUmiCore, Umi } from '@metaplex-foundation/umi';
import { web3JsTransactionFactory } from '@metaplex-foundation/umi-transaction-factory-web3js';
import { createDynamicWalletPlugin } from '../../utils/identity/dynamicWalletIdentity';

// Import from Dynamic
import { useDynamicContext, Wallet } from '@dynamic-labs/sdk-react-core';
// Import necessary Lucide icons for toast customization
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const MAX_ASSET_CAP = 5;

/**
 * Overload createUmi for older usage
 */
interface LegacyCreateUmi {
  (endpoint: string): Umi;
}
const createUmi = createUmiCore as LegacyCreateUmi;

/** Local DynamicWallet interface for processAction() + createDynamicWalletPlugin(). */
interface DynamicWallet {
  address?: string;
  getSigner: () => Promise<{
    signTransaction: (tx: any) => Promise<any>;
  }>;
}

/**
 * Make a local "DynamicWallet" using the official dynamic-labs approach,
 * but cast to `(wallet as any)` to avoid TS errors about `getSigner()`.
 */
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

function AssetManagementModal() {
  const { primaryWallet } = useDynamicContext();
  const layerContext = useContext(LayerContext);
  if (!layerContext) {
    throw new Error('LayerMap must be used within a LayerProvider');
  }

  const { setNftManagementModalOpen, isMobile } = layerContext;

  // NFT data
  const {
    charactersInGame,
    charactersNotInGame,
    itemsInGame,
    itemsNotInGame,
    crewsInGame,
    crewsNotInGame,
    shipsInGame,
    shipsNotInGame,
    genesisShipsInGame,
    genesisShipsNotInGame,
    loading: nftsLoading,
  } = useNfts();

  const auth = useAuth();
  const { user } = useUser();
  const { notifications } = useNotifications();

  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [activeGameTab, setActiveGameTab] = useState<GameTabValue>(
    AssetLocation.IN_WALLET,
  );
  const [activeSecondaryTab, setActiveSecondaryTab] =
    useState<SecondaryTabValue>(secondaryTabs[0].key);
  const [mintStatus, setMintStatus] = useState<MintStatusValue>('minted');
  const [collectionNameFilter, setCollectionNameFilter] =
    useState<NftFilterValue>('all');
  const [rarityFilter, setRarityFilter] = useState<RarityFilterValue>('ALL');

  const [sliderValue, setSliderValue] = useState(0);
  const [jobId, setJobId] = useState<string>();
  const [isLoading, setLoading] = useState(false);
  const [isMobileFilterSheetOpen, setIsMobileFilterSheetOpen] = useState(false);

  useEffect(() => {
    if (activeGameTab === AssetLocation.IN_WALLET) {
      setMintStatus('minted');
    }
  }, [activeGameTab]);

  // Custom toast styling options
  const toastOptions = {
    duration: 10000, // 10 seconds
    position: 'top-center',
    className: 'custom-toast',
    style: {
      maxWidth: '320px',
      borderRadius: '6px',
    },
  };

  // Custom toast with mint info
  const showTransactionToast = (
    type: 'processing' | 'success' | 'error',
    message: string,
    mint?: string,
    error?: string,
  ) => {
    const mintInfo = mint;

    switch (type) {
      case 'success':
        toast.success(
          <div className="flex w-full flex-col items-center justify-center gap-1">
            <p className="font-medium">{message}</p>
            {mintInfo && <p className="text-[9px] opacity-75">{mintInfo}</p>}
          </div>,
          {
            icon: <CheckCircle className="h-4 w-4" />,
            ...toastOptions,
          },
        );
        break;
      case 'error':
        toast.error(
          <div className="flex w-full flex-col items-center justify-center gap-1">
            <p className="font-medium">{message}</p>
            {error && <p className="text-xs">{error}</p>}
            {mintInfo && <p className="text-[9px] opacity-75">{mintInfo}</p>}
          </div>,
          {
            icon: <XCircle className="h-4 w-4" />,
            ...toastOptions,
          },
        );
        break;
      case 'processing':
        toast(
          <div className="flex w-full flex-col items-center justify-center gap-1">
            <p className="font-medium">{message}</p>
            {mintInfo && <p className="text-[9px] opacity-75">{mintInfo}</p>}
          </div>,
          {
            icon: <AlertCircle className="h-4 w-4 animate-pulse" />,
            ...toastOptions,
          },
        );
        break;
    }
  };

  useEffect(() => {
    if (jobId) {
      const notification = notifications.find(
        (n) => n.data.id === jobId && n.type === 'handleAssets',
      );

      if (notification) {
        if (notification.data.error || notification.data.message === 'Failed') {
          const errorMessage =
            typeof notification.data.error === 'string'
              ? notification.data.error
              : notification.data.message || 'Transaction execution failed';

          const mintAddress = filteredAssets.find(
            (asset) => asset.id === selectedAssets[0],
          )?.mint;

          showTransactionToast(
            'error',
            'Transaction failed',
            mintAddress,
            errorMessage,
          );

          if (notification.data.error || notification.data.details) {
            toast.error(notification.data.error || notification.data.details);
          }
        } else if (
          notification.data.success ||
          notification.data.message === 'Success'
        ) {
          const mintAddress = filteredAssets.find(
            (asset) => asset.id === selectedAssets[0],
          )?.mint;

          showTransactionToast(
            'success',
            'Transaction completed successfully',
            mintAddress,
          );
        } else {
          const mintAddress = filteredAssets.find(
            (asset) => asset.id === selectedAssets[0],
          )?.mint;

          showTransactionToast(
            'error',
            'Transaction status unclear',
            mintAddress,
            'Unable to determine transaction result',
          );
        }

        setLoading(false);
        setJobId(undefined);

        setTimeout(() => {
          setSelectedAssets([]);
          setSliderValue(0);
          mutate(`${config.worker_server_url}/users/me`);
          mutate(`${config.worker_server_url}/rpc/onChainAssets`);
          mutate(`${config.worker_server_url}/nfts`);
        }, 2000);
      } else {
        const timeoutId = setTimeout(() => {
          const mintAddress = filteredAssets.find(
            (asset) => asset.id === selectedAssets[0],
          )?.mint;

          showTransactionToast(
            'error',
            'Transaction timed out',
            mintAddress,
            'No response received from server',
          );

          setLoading(false);
          setJobId(undefined);
        }, 30000);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [jobId, notifications, selectedAssets]);

  useEffect(() => {
    return () => {
      setJobId(undefined);
      setSelectedAssets([]);
      setSliderValue(0);
    };
  }, []);

  /**
   * createAssetCardProps, combine sets, filter
   */
  const createSelectionHandler = useCallback(
    (eligibleCount: number) => {
      return (id: string) => {
        if (nftsLoading) return;
        setSelectedAssets((prevSelected) => {
          if (prevSelected.includes(id)) {
            const newSelectedAssets = prevSelected.filter(
              (assetId) => assetId !== id,
            );
            setSliderValue(newSelectedAssets.length);
            return newSelectedAssets;
          }
          if (prevSelected.length < Math.min(MAX_ASSET_CAP, eligibleCount)) {
            const newSelectedAssets = [...prevSelected, id];
            setSliderValue(newSelectedAssets.length);
            return newSelectedAssets;
          }
          return prevSelected;
        });
      };
    },
    [nftsLoading],
  );

  const createAssetCardProps = useCallback(
    (params: {
      nfts: any[];
      type: NFTType;
      location: AssetLocation;
      selectedAssets: string[];
      eligibleCount: number;
    }) => {
      const handleSelect = createSelectionHandler(params.eligibleCount);
      return getAssetCardPropsFromNFT({
        ...params,
        handleSelect,
        type: params.type as
          | NFTType.CREW
          | NFTType.SHIP
          | NFTType.ITEM
          | NFTType.CAPTAIN
          | NFTType.GENESIS_SHIP,
      });
    },
    [createSelectionHandler],
  );

  const combinedCharacters = useMemo(() => {
    // Assets in IN_GAME tab with their original minted status
    const inGameAssets = createAssetCardProps({
      nfts: charactersInGame,
      type: NFTType.CAPTAIN,
      location: AssetLocation.IN_GAME,
      selectedAssets,
      eligibleCount: charactersInGame.length + charactersNotInGame.length,
    });

    // Assets in IN_WALLET tab - ensure they're always marked as minted
    const inWalletAssets = createAssetCardProps({
      nfts: charactersNotInGame,
      type: NFTType.CAPTAIN,
      location: AssetLocation.IN_WALLET,
      selectedAssets,
      eligibleCount: charactersInGame.length + charactersNotInGame.length,
    }).map((asset) => ({
      ...asset,
      minted: true, // Force all IN_WALLET assets to be considered minted
    }));

    return [...inGameAssets, ...inWalletAssets];
  }, [
    charactersInGame,
    charactersNotInGame,
    selectedAssets,
    createAssetCardProps,
  ]);

  const combinedItems = useMemo(() => {
    // Assets in IN_GAME tab with their original minted status
    const inGameAssets = createAssetCardProps({
      nfts: itemsInGame,
      type: NFTType.ITEM,
      location: AssetLocation.IN_GAME,
      selectedAssets,
      eligibleCount: itemsInGame.length + itemsNotInGame.length,
    });

    // Assets in IN_WALLET tab - ensure they're always marked as minted
    const inWalletAssets = createAssetCardProps({
      nfts: itemsNotInGame,
      type: NFTType.ITEM,
      location: AssetLocation.IN_WALLET,
      selectedAssets,
      eligibleCount: itemsInGame.length + itemsNotInGame.length,
    }).map((asset) => ({
      ...asset,
      minted: true, // Force all IN_WALLET assets to be considered minted
    }));

    return [...inGameAssets, ...inWalletAssets];
  }, [itemsInGame, itemsNotInGame, selectedAssets, createAssetCardProps]);

  const combinedCrews = useMemo(() => {
    // Assets in IN_GAME tab with their original minted status
    const inGameAssets = createAssetCardProps({
      nfts: crewsInGame,
      type: NFTType.CREW,
      location: AssetLocation.IN_GAME,
      selectedAssets,
      eligibleCount: crewsInGame.length + crewsNotInGame.length,
    });

    // Assets in IN_WALLET tab - ensure they're always marked as minted
    const inWalletAssets = createAssetCardProps({
      nfts: crewsNotInGame,
      type: NFTType.CREW,
      location: AssetLocation.IN_WALLET,
      selectedAssets,
      eligibleCount: crewsInGame.length + crewsNotInGame.length,
    }).map((asset) => ({
      ...asset,
      minted: true, // Force all IN_WALLET assets to be considered minted
    }));

    return [...inGameAssets, ...inWalletAssets];
  }, [crewsInGame, crewsNotInGame, selectedAssets, createAssetCardProps]);

  const combinedShips = useMemo(() => {
    // Assets in IN_GAME tab with their original minted status
    const inGameAssets = createAssetCardProps({
      nfts: shipsInGame,
      type: NFTType.SHIP,
      location: AssetLocation.IN_GAME,
      selectedAssets,
      eligibleCount: shipsInGame.length + shipsNotInGame.length,
    });

    // Assets in IN_WALLET tab - ensure they're always marked as minted
    const inWalletAssets = createAssetCardProps({
      nfts: shipsNotInGame,
      type: NFTType.SHIP,
      location: AssetLocation.IN_WALLET,
      selectedAssets,
      eligibleCount: shipsInGame.length + shipsNotInGame.length,
    }).map((asset) => ({
      ...asset,
      minted: true, // Force all IN_WALLET assets to be considered minted
    }));

    return [...inGameAssets, ...inWalletAssets];
  }, [shipsInGame, shipsNotInGame, selectedAssets, createAssetCardProps]);

  const combinedGenesisShips = useMemo(() => {
    const inGameAssets = createAssetCardProps({
      nfts: genesisShipsInGame,
      type: NFTType.GENESIS_SHIP,
      location: AssetLocation.IN_GAME,
      selectedAssets,
      eligibleCount: genesisShipsInGame.length + genesisShipsNotInGame.length,
    });

    // Assets in IN_WALLET tab - ensure they're always marked as minted
    const inWalletAssets = createAssetCardProps({
      nfts: genesisShipsNotInGame,
      type: NFTType.GENESIS_SHIP,
      location: AssetLocation.IN_WALLET,
      selectedAssets,
      eligibleCount: genesisShipsInGame.length + genesisShipsNotInGame.length,
    }).map((asset) => ({
      ...asset,
      minted: true, // Force all IN_WALLET assets to be considered minted
    }));

    return [...inGameAssets, ...inWalletAssets];
  }, [
    genesisShipsInGame,
    genesisShipsNotInGame,
    selectedAssets,
    createAssetCardProps,
  ]);

  const filteredAssets = useMemo(() => {
    const allAssets = [
      ...combinedCharacters,
      ...combinedItems,
      ...combinedCrews,
      ...combinedShips,
      ...combinedGenesisShips,
    ];

    return allAssets
      .filter((asset) => asset.location === activeGameTab)
      .filter(
        (asset) =>
          collectionNameFilter === 'all' ||
          asset.collection.toLowerCase() === collectionNameFilter.toLowerCase(),
      )
      .filter((asset) => {
        if (activeGameTab === AssetLocation.IN_WALLET) {
          return true;
        }
        return mintStatus === 'minted' ? asset.minted : !asset.minted;
      })
      .filter((asset) => activeSecondaryTab === asset.type)
      .filter(
        (asset) =>
          rarityFilter === 'ALL' ||
          asset.rarity.toLowerCase() === rarityFilter.toLowerCase(),
      )
      .sort((a, b) => b.level - a.level);
  }, [
    activeGameTab,
    combinedCharacters,
    combinedItems,
    combinedCrews,
    combinedShips,
    combinedGenesisShips,
    collectionNameFilter,
    mintStatus,
    activeSecondaryTab,
    rarityFilter,
  ]);

  const { eligibleAssets, selectableAssetCount } = useMemo(() => {
    const eligible = filteredAssets.filter((asset) => !asset.isActionLimited);
    const selectable = Math.min(MAX_ASSET_CAP, eligible.length);
    return { eligibleAssets: eligible, selectableAssetCount: selectable };
  }, [filteredAssets]);

  const handleSelectAll = () => {
    setSelectedAssets(
      filteredAssets
        .slice(0, selectableAssetCount)
        .filter((asset) => !asset.isActionLimited)
        .map((asset) => asset.id),
    );
    setSliderValue(selectableAssetCount);
  };

  const handleDeselectAll = () => {
    setSelectedAssets([]);
    setSliderValue(0);
  };

  useEffect(() => {
    const updateSelectedAssets = () => {
      const unselectedAssets = filteredAssets.filter(
        (asset) => !selectedAssets.includes(asset.id) && !asset.isActionLimited,
      );

      let newSelectedAssets;
      if (sliderValue > selectedAssets.length) {
        newSelectedAssets = [
          ...selectedAssets,
          ...unselectedAssets
            .slice(0, sliderValue - selectedAssets.length)
            .map((asset) => asset.id),
        ];
      } else {
        newSelectedAssets = selectedAssets.slice(0, sliderValue);
      }
      if (
        newSelectedAssets.length !== selectedAssets.length ||
        !newSelectedAssets.every((id, index) => id === selectedAssets[index])
      ) {
        setSelectedAssets(newSelectedAssets);
      }
    };
    updateSelectedAssets();
  }, [sliderValue, filteredAssets, selectedAssets]);

  useEffect(() => {
    if (user?.wallet && jobId) {
      const notification = notifications.find(
        (n) => n.data.id === jobId && n.type === 'handleAssets',
      );
      if (notification) {
        setLoading(false);
        toast(notification.data.message);

        setTimeout(() => {
          mutate(`${config.worker_server_url}/users/me`);
          mutate(`${config.worker_server_url}/rpc/onChainAssets`);
          mutate(`${config.worker_server_url}/nfts`);
          mutate(`${config.worker_server_url}/items/fetch-items`);
          mutate(`${config.worker_server_url}/shop/fetch-shop-items`);
        }, 4000);

        setJobId(undefined);
        setSelectedAssets([]);
        setSliderValue(0);
      } else {
        const timeoutId = setTimeout(() => {
          setLoading(false);
          toast('Timeout, reloading...');
          mutate(`${config.worker_server_url}/users/me`);
          mutate(`${config.worker_server_url}/rpc/onChainAssets`);
          mutate(`${config.worker_server_url}/nfts`);
          mutate(`${config.worker_server_url}/items/fetch-items`);
          mutate(`${config.worker_server_url}/shop/fetch-shop-items`);
          setJobId(undefined);
          setSelectedAssets([]);
          setSliderValue(0);
        }, 150000);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [jobId, user?.wallet, notifications]);

  /**
   * MAIN freeze/thaw/mint logic
   */
  const handleAction = useCallback(
    async (skipSliderValueCheck: boolean = false, ...assetIds: string[]) => {
      if (!primaryWallet) {
        toast.error('Please connect your wallet first');
        return;
      }

      let assets: AssetCardProps[] = [];
      try {
        if (!skipSliderValueCheck) {
          setSelectedAssets(assetIds);
          setSliderValue(assetIds.length);
        }
        const selection = assetIds.length > 0 ? assetIds : selectedAssets;
        assets = filteredAssets.filter((asset) => selection.includes(asset.id));
        if (assets.length === 0) {
          throw new Error('No assets selected');
        }

        assetActionVerifySelection({
          selectedAssets: assets,
          assetType: activeSecondaryTab,
          gameTab: activeGameTab,
          mintStatus,
          sliderValue,
          skipSliderValueCheck,
        });

        const actionType: 'freeze' | 'thaw' | 'mint-and-withdraw' =
          mintStatus === 'not-minted'
            ? 'mint-and-withdraw'
            : activeGameTab === 'in-game'
            ? 'thaw'
            : 'freeze';

        setLoading(true);

        // Show processing toast
        showTransactionToast(
          'processing',
          'Processing transaction...',
          assets[0]?.mint,
        );

        // Build a local "DynamicWallet" that calls wallet.getSigner()
        const dynamicWallet: DynamicWallet = await makeDynamicWallet(
          primaryWallet,
        );

        // Create a Umi instance, forcing solana_api_endpoint to string
        const txFactory = web3JsTransactionFactory();
        const walletPlugin = createDynamicWalletPlugin(dynamicWallet);

        const umi = createUmi(
          config.solana_api_endpoint! /* or ?? '' if needed */,
        )
          .use(txFactory)
          .use(walletPlugin);

        // processAction
        const result = await processAction({
          actionType,
          bearerToken: auth.jwtToken,
          selectedAssets: assets,
          assetType: activeSecondaryTab,
          umi,
          dynamicWallet,
        });

        if (typeof result !== 'string' && result?.jobId) {
          setJobId(result.jobId);

          // Update toast with submitted status
          showTransactionToast(
            'processing',
            'Transaction submitted, waiting for confirmation...',
            assets[0]?.mint,
          );
        } else {
          throw new Error('No job ID received from server');
        }
      } catch (error: any) {
        console.error('Action failed:', error);

        // Show error toast
        showTransactionToast(
          'error',
          'Transaction failed',
          assets[0]?.mint,
          error.message || 'Failed to process transaction',
        );
      } finally {
        setLoading(false);
      }
    },
    [
      primaryWallet,
      auth.jwtToken,
      selectedAssets,
      filteredAssets,
      activeSecondaryTab,
      activeGameTab,
      mintStatus,
      sliderValue,
    ],
  );

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex w-full flex-col items-start justify-start overflow-y-scroll bg-black bg-opacity-[0.8] pt-0 text-white backdrop-blur-xl"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1, transition: { duration: 0.2 } }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 1 } }}>
      <div className="flex min-h-[82px] w-full flex-row items-center justify-between border-b border-b-reavers-border">
        <h1 className="w-full p-4 font-Header text-[13px] max-md:px-2 md:text-[26px]">
          NFT Management
        </h1>
        <ModalCloseButton
          handleClose={() => setNftManagementModalOpen(false)}
        />
      </div>

      {/* Tabs */}
      <div className="flex w-full items-center justify-between border-b border-b-reavers-border border-opacity-50 p-4">
        <div className="flex items-center space-x-4 max-md:w-full">
          {gameTabs.map((tab) => (
            <TabItem
              key={tab.key}
              tab={tab}
              isActive={activeGameTab === tab.key}
              onClick={() => setActiveGameTab(tab.key)}
              className="max-md:w-full"
            />
          ))}
        </div>
        {!isMobile && (
          <div className="flex items-center space-x-4">
            {secondaryTabs.map((tab) => (
              <TabItem
                key={tab.key}
                tab={tab}
                isActive={activeSecondaryTab === tab.key}
                onClick={() => setActiveSecondaryTab(tab.key)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile filter sheet */}
      {isMobile ? (
        <>
          <button
            onClick={() => setIsMobileFilterSheetOpen(true)}
            className="mx-auto my-4 w-[90%] rounded-lg bg-[#6535c9] px-4 py-2 text-sm font-medium text-white hover:bg-[#4a239a]">
            Show Filters
          </button>

          <Sheet
            isOpen={isMobileFilterSheetOpen}
            onClose={() => setIsMobileFilterSheetOpen(false)}
            detent="content-height"
            className="rounded-t-lg">
            <Sheet.Container className="rounded-t-lg bg-reavers-bg">
              <Sheet.Header className="rounded-t-lg bg-reavers-bg" />
              <Sheet.Content className="bg-reavers-bg">
                <Sheet.Scroller>
                  <div className="flex w-full items-center justify-between border-b border-b-reavers-border border-opacity-50 p-4">
                    <div className="grid w-full grid-cols-2 gap-2">
                      {secondaryTabs.map((tab) => (
                        <TabItem
                          key={tab.key}
                          tab={tab}
                          isActive={activeSecondaryTab === tab.key}
                          onClick={() => setActiveSecondaryTab(tab.key)}
                        />
                      ))}
                    </div>
                  </div>

                  {activeGameTab === AssetLocation.IN_GAME && (
                    <div className="grid grid-cols-2 border-b border-b-reavers-border border-opacity-50 p-4">
                      <FilterOption
                        option={{ key: 'not-minted', name: 'Not Minted' }}
                        isActive={mintStatus === 'not-minted'}
                        onClick={() => setMintStatus('not-minted')}
                        className="max-md:justify-center"
                      />
                      <FilterOption
                        option={{ key: 'minted', name: 'Minted' }}
                        isActive={mintStatus === 'minted'}
                        onClick={() => setMintStatus('minted')}
                        className="max-md:justify-center"
                      />
                    </div>
                  )}

                  {activeSecondaryTab === 'CAPTAIN' ? (
                    <div className="mt-3 grid w-full grid-cols-1 gap-2 p-4 md:grid-cols-2">
                      {nftFilters.map((filterOption) => (
                        <FilterOption
                          key={filterOption.name}
                          option={filterOption}
                          isActive={collectionNameFilter === filterOption.key}
                          onClick={() =>
                            setCollectionNameFilter(filterOption.key)
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="grid w-full grid-cols-2 gap-2 border-b border-b-reavers-border border-opacity-50 p-4">
                        {rarityFilters.map((rarity) => (
                          <FilterOption
                            key={rarity.name}
                            option={rarity}
                            isActive={rarityFilter === rarity.key}
                            onClick={() => setRarityFilter(rarity.key)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </Sheet.Scroller>
              </Sheet.Content>
            </Sheet.Container>
            <Sheet.Backdrop onTap={() => setIsMobileFilterSheetOpen(false)} />
          </Sheet>
        </>
      ) : activeSecondaryTab === 'CAPTAIN' ? (
        <div className="grid w-full grid-cols-1 gap-2 p-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7">
          {nftFilters.map((filterOption) => (
            <FilterOption
              key={filterOption.name}
              option={filterOption}
              isActive={collectionNameFilter === filterOption.key}
              onClick={() => setCollectionNameFilter(filterOption.key)}
            />
          ))}
          {activeGameTab === AssetLocation.IN_GAME && (
            <MintStatusDropdown
              mintStatus={mintStatus}
              setMintStatus={setMintStatus}
            />
          )}
        </div>
      ) : (
        <div className="grid w-full grid-cols-1 gap-2 p-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {rarityFilters.map((rarity) => (
            <FilterOption
              key={rarity.name}
              option={rarity}
              isActive={rarityFilter === rarity.key}
              onClick={() => setRarityFilter(rarity.key)}
            />
          ))}
          {activeGameTab === AssetLocation.IN_GAME && (
            <MintStatusDropdown
              mintStatus={mintStatus}
              setMintStatus={setMintStatus}
            />
          )}
        </div>
      )}

      {nftsLoading ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4">
          <h2>We are loading your assets...</h2>
          <ReaverLoaderNoOverlay />
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="flex h-full w-full items-center justify-center gap-4">
          <p>No assets found that match the current filters.</p>
        </div>
      ) : (
        <div
          className="grid h-full w-full gap-4 overflow-y-scroll pb-24 max-md:pb-36"
          style={{
            gridTemplateColumns: isMobile
              ? 'repeat(auto-fit, minmax(350px, auto))'
              : 'repeat(auto-fit, minmax(420px, auto))',
            gridTemplateRows:
              activeSecondaryTab === 'CAPTAIN'
                ? 'repeat(auto-fit, minmax(210px, 210px))'
                : 'repeat(auto-fit, minmax(192px, 192px))',
            justifyContent: 'center',
            justifyItems: 'center',
            alignItems: 'start',
          }}>
          {filteredAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              {...asset}
              isSelected={selectedAssets.includes(asset.id)}
              handleSelect={asset.handleSelect}
              // Single-asset action
              handleAction={() => handleAction(true, asset.id)}
              loading={isLoading || !!jobId}
            />
          ))}
        </div>
      )}

      {/* Bulk freeze/thaw/mint */}
      <AssetChooseSlider
        gameTab={activeGameTab as AssetLocation}
        maxSliderValue={selectableAssetCount}
        sliderValue={sliderValue}
        setSliderValue={setSliderValue}
        selectAll={handleSelectAll}
        deselectAll={handleDeselectAll}
        onAction={handleAction}
        loading={nftsLoading || isLoading || !!jobId}
        selectedAssets={filteredAssets.filter((asset) =>
          selectedAssets.includes(asset.id),
        )}
        assetType={activeSecondaryTab}
        currentLocation={activeGameTab as AssetLocation}
        currentMintStatus={mintStatus}
      />

      {jobId && (
        <AssetMovement
          selectedAssets={filteredAssets.filter((asset) =>
            selectedAssets.includes(asset.id),
          )}
        />
      )}
    </motion.div>
  );
}

export default AssetManagementModal;
