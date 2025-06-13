import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import { useCookies } from 'react-cookie';
import { nanoid } from 'nanoid';

// Import data sources
import layer1 from '../public/missions/layer1.json';
import layer2 from '../public/missions/layer2.json';
import layer3 from '../public/missions/layer3.json';

// Import types
import {
  ActiveMission,
  ItemStats,
  MissionStats,
  PostMission,
  ItemData,
  MarketPlaceItem,
  ExchangeItem,
  PriceData,
  DynamicExchangeItem,
} from '../lib/types';
import { CookieSetOptions } from 'universal-cookie';

// Import API functions and hooks
import { fetchMissions } from '../lib/api/missions/missions';
import { useGlobalMissionFeed } from '../hooks/api/missions/useGlobalMissionFeed';
import { useItemStats } from '../hooks/api/items/useItemStats';
import { useGetMarketplaceItems } from '../hooks/api/marketplace/useMarketplaceItems';
import { useGetExchangeItems } from '../hooks/api/exchange/useGetExchangeItems';
import { useGetPrices } from '../hooks/api/prices/useGetPrices';

const LAYER_MISSION_TYPES: Record<number, string[]> = {
  1: ['Events'],
  2: ['Events', 'Plunders'],
  3: ['Burners', 'Plunders', 'Specials'],
};

// Type definitions
export interface Mission {
  id: number;
  name: string;
  description: string;
  x: number;
  y: number;
  missionStats?: MissionStats;
  image: string;
}

export interface Layer {
  id: number;
  uniqueId: string;
  image: string;
  icon: string;
  scale: number;
  name: string;
  location: string;
  layer: number;
  fallback: string;
  missions: Mission[];
  coords: string[];
}

// Tab interface definitions
interface Tab {
  name: string;
  image: string;
  disabled: boolean;
  hideInModal: boolean;
  onClick?: () => void;
}

interface InventoryTab {
  name: string;
  image: string;
  disabled: boolean;
}

// Define modal state interface to avoid repetition
interface ModalState {
  layerAndMissionSelect: boolean;
  hideout: boolean;
  mission: boolean;
  profile: boolean;
  nftManagement: boolean;
  levelUnlock: boolean;
  missionResult: boolean;
  equip: boolean;
  fleetCommander: boolean;
  crewEquip: boolean;
  shipEquip: boolean;
  equipped: boolean;
  equipItems: boolean;
  bottomCenter: boolean;
  level: boolean;
  activityFeedSite: boolean;
  menuDropdown: boolean;
  walletDropdown: boolean;
  scrollMission: boolean;
  shopBuy: boolean;
  market: boolean;
  nftMovement: boolean;
}

// Define the context type with backward compatibility for old modal state setters
interface LayerContextType {
  // Layers and Missions
  levels: Layer[];
  currentLevel: Layer;
  setCurrentLevel: React.Dispatch<React.SetStateAction<Layer>>;
  missions: Mission[];
  setMissions: React.Dispatch<React.SetStateAction<Mission[]>>;
  currentMission: Mission | null;
  setCurrentMission: React.Dispatch<React.SetStateAction<Mission | null>>;

  // Modals - using nested object for better organization
  modals: ModalState;
  setModalState: (modalKey: keyof ModalState, value: boolean) => void;

  // Legacy modal setters for backward compatibility
  isLayerAndMissionSelectModalOpen: boolean;
  setIsLayerAndMissionSelectModalOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  isMissionModalOpen: boolean;
  setMissionModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isHideoutModalOpen: boolean;
  setHideoutModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isProfileModalOpen: boolean;
  setProfileModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isNftManagementModalOpen: boolean;
  setNftManagementModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isLevelUnlockModalOpen: boolean;
  setLevelUnlockModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMissionResultModalOpen: boolean;
  setMissionResultModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isEquipModalOpen: boolean;
  setEquipModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isFleetCommanderModalOpen: boolean;
  setFleetCommanderModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isCrewEquipModalOpen: boolean;
  setIsCrewEquipModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isShipEquipModalOpen: boolean;
  setIsShipEquipModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isEquippedModalOpen: boolean;
  setEquippedModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isEquipItemsModalOpen: boolean;
  setEquipItemsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isBottomCenterOpen: boolean;
  setBottomCenterOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isLevelModalOpen: boolean;
  setLevelModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isActivityFeedSiteOpen: boolean;
  setIsActivityFeedSiteOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMenuDropdownOpen: boolean;
  setMenuDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isWalletDropdownOpen: boolean;
  setWalletDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isScrollMissionModalOpen: boolean;
  setScrollMissionModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isShopBuyModalOpen: boolean;
  setShopBuyModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMarketModalOpen: boolean;
  setMarketModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSetNftMovementOpen: boolean;
  setNftMovementOpen: React.Dispatch<React.SetStateAction<boolean>>;

  isForgeModalOpen: boolean;
  setForgeModalOpen: (open: boolean) => void;

  // Tabs
  tabs: Tab[];
  activeTab: Tab;
  setActiveTab: React.Dispatch<React.SetStateAction<Tab>>;
  toggleTab: (tab: string) => void;

  // Inventory Tabs
  inventoryTabs: InventoryTab[];
  activeInventoryTab: InventoryTab;
  setActiveInventoryTab: React.Dispatch<React.SetStateAction<InventoryTab>>;
  toggleInventoryTab: (tab: string) => void;

  // inputRef and mission selection
  inputRef: React.RefObject<HTMLInputElement>;
  selectedMissions: ActiveMission[];
  setSelectedMissions: React.Dispatch<React.SetStateAction<ActiveMission[]>>;
  claimedMissions: PostMission[];
  setClaimedMissions: React.Dispatch<React.SetStateAction<PostMission[]>>;
  handleMissionClick: (mission: ActiveMission) => void;

  // Cookies
  sessionCookie: string;
  setCookie: (
    name: 'sessionCookie',
    value: any,
    options?: CookieSetOptions | undefined,
  ) => void;
  cookies: any;

  // State flags
  error: boolean;
  loading: boolean;

  // Items and marketplace data
  items: ItemStats[];
  itemsLoading: boolean;
  shopItems: MarketPlaceItem[];
  shopItemsLoading: boolean;
  exchangeItems: {
    exchangeItems: ExchangeItem[];
    dynamicExchangeItems: DynamicExchangeItem[];
  };
  exchangeItemsLoading: boolean;
  selectedItemForEquip: ItemData | null;
  setSelectedItemForEquip: React.Dispatch<
    React.SetStateAction<ItemData | null>
  >;

  // Mission Feed
  missionFeed: PostMission[];
  missionFeedLoaded: boolean;

  // Refs for UI elements
  walletRef: React.RefObject<HTMLDivElement>;
  profileRef: React.RefObject<HTMLDivElement>;
  inventoryRef: React.RefObject<HTMLLIElement>;
  assetManagerRef: React.RefObject<HTMLLIElement>;
  islandRef: React.RefObject<HTMLButtonElement>;
  onMissionRef: React.RefObject<HTMLDivElement>;
  menuRef: React.RefObject<HTMLDivElement>;
  chatRef: React.RefObject<HTMLDivElement>;
  missionsRef: React.RefObject<HTMLDivElement>;

  // Mobile detection
  isMobile: boolean;
  setIsMobile: React.Dispatch<React.SetStateAction<boolean>>;

  // Prices
  pricesData: PriceData;
  isPriceLoading: boolean;
}

const initialModalState: ModalState = {
  layerAndMissionSelect: false,
  hideout: false,
  mission: false,
  profile: false,
  nftManagement: false,
  levelUnlock: false,
  missionResult: false,
  equip: false,
  fleetCommander: false,
  crewEquip: false,
  shipEquip: false,
  equipped: false,
  equipItems: false,
  bottomCenter: false,
  level: false,
  activityFeedSite: false,
  menuDropdown: false,
  walletDropdown: false,
  scrollMission: false,
  shopBuy: false,
  market: false,
  nftMovement: false,
};

// Create context with default undefined value
export const LayerContext = createContext<LayerContextType | undefined>(
  undefined,
);

// Define the context provider
export const LayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  // Cookies
  const [cookies, setCookie] = useCookies(['sessionCookie']);

  // Create refs
  const inputRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);
  const inventoryRef = useRef<HTMLLIElement>(null);
  const assetManagerRef = useRef<HTMLLIElement>(null);
  const islandRef = useRef<HTMLButtonElement>(null);
  const onMissionRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const missionsRef = useRef<HTMLDivElement>(null);

  // Initialize layers with static data
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: 1,
      uniqueId: nanoid(),
      image: '/videos/island_1.mp4',
      icon: '/images/maps/island-1-icon.webp',
      fallback: '/images/maps/island-1-fallback.webp',
      scale: 1,
      name: 'Booty Bay',
      location: 'Caribbean Sea',
      layer: 1,
      coords: ['18.9712° N', ' 72.2852° W'],
      missions: layer1,
    },
    {
      id: 2,
      uniqueId: nanoid(),
      image: '/videos/island_2.mp4',
      icon: '/images/maps/island-2-icon.png',
      fallback: '/images/maps/island-2-fallback.jpg',
      scale: 1,
      name: 'Goldshire',
      location: 'Unknown',
      layer: 2,
      coords: ['18.9712° N', '72.2852° W'],
      missions: layer2,
    },
    {
      id: 3,
      uniqueId: nanoid(),
      image: '/videos/island_3.mp4',
      icon: '/images/maps/island-3-icon.png',
      fallback: '/images/maps/island-3-fallback.jpg',
      scale: 1,
      name: 'Steamshire',
      location: 'Unknown',
      layer: 3,
      coords: ['18.9712° N', '72.2852° W'],
      missions: layer3,
    },
  ]);

  // State for missions and current selections
  const [missions, setMissions] = useState<Mission[]>([]);
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);
  const [currentLevel, setCurrentLevel] = useState<Layer>(layers[0]);

  // State for modals using a single object
  const [modals, setModals] = useState<ModalState>(initialModalState);

  // Function to update a single modal's state
  const setModalState = (modalKey: keyof ModalState, value: boolean) => {
    setModals((prev) => ({
      ...prev,
      [modalKey]: value,
    }));
  };

  // Define tabs
  const tabs = useMemo<Tab[]>(
    () => [
      {
        name: 'treasure chest',
        image: '/images/menu/menu-inventory.webp',
        disabled: false,
        hideInModal: false,
      },
      {
        name: 'inventory',
        image: '/images/menu/menu-gamble.webp',
        disabled: false,
        hideInModal: false,
      },
      {
        name: 'Fleet Command',
        image: '/images/fleet-commander-icon.webp',
        disabled: false,
        hideInModal: true,
        onClick: () => setModalState('fleetCommander', true),
      },
      {
        name: 'the arena',
        image: '/images/menu/menu-arena.png',
        disabled: false,
        hideInModal: false,
      },
      {
        name: 'leaderboard',
        image: '/images/menu/menu-leaderboard.webp',
        disabled: false,
        hideInModal: false,
      },
      {
        name: 'the exchange',
        image: '/images/menu/menu-shop.webp',
        disabled: false,
        hideInModal: false,
      },
    ],
    [],
  );

  // Define inventory tabs
  const inventoryTabs = useMemo<InventoryTab[]>(
    () => [
      {
        name: 'Captains',
        image: '/images/menu/menu-hideout.webp',
        disabled: false,
      },
      {
        name: 'Crews',
        image: '/images/menu/menu-hideout.webp',
        disabled: false,
      },
      {
        name: 'Ships',
        image: '/images/menu/menu-hideout.webp',
        disabled: false,
      },
      {
        name: 'Items',
        image: '/images/menu/menu-inventory.webp',
        disabled: false,
      },
      {
        name: 'Genesis Ships',
        image: '/images/menu/menu-hideout.webp',
        disabled: false,
      },
    ],
    [],
  );

  // State for active tabs
  const [activeTab, setActiveTab] = useState<Tab>(tabs[0]);
  const [activeInventoryTab, setActiveInventoryTab] = useState<InventoryTab>(
    inventoryTabs[0],
  );

  // State for mission selection
  const [selectedMissions, setSelectedMissions] = useState<ActiveMission[]>([]);
  const [claimedMissions, setClaimedMissions] = useState<PostMission[]>([]);

  // State for mission feed
  const [missionFeed, setMissionFeed] = useState<PostMission[]>([]);
  const [missionFeedLoaded, setMissionFeedLoaded] = useState(false);

  const [isForgeModalOpen, setForgeModalOpen] = useState(false);

  // State for selected item
  const [selectedItemForEquip, setSelectedItemForEquip] =
    useState<ItemData | null>(null);

  // Loading and error states
  const [layersLoaded, setLayersLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Tab toggle functions
  const toggleTab = (tabName: string) => {
    const tab = tabs.find((tab) => tab.name === tabName);
    if (tab && !tab.disabled) {
      if (modals.mission) setModalState('mission', false);
      setActiveTab(tab);
      if (tab.onClick) tab.onClick();
    }
  };

  const toggleInventoryTab = (tabName: string) => {
    const tab = inventoryTabs.find((tab) => tab.name === tabName);
    if (tab && !tab.disabled) {
      setActiveInventoryTab(tab);
    }
  };

  // Mission click handler
  const handleMissionClick = (mission: ActiveMission) => {
    setSelectedMissions((prev) => {
      const alreadySelected = prev.some(
        (selected) => selected.id === mission.id,
      );
      return alreadySelected
        ? prev.filter((m) => m.id !== mission.id)
        : [...prev, mission];
    });
  };

  // Hook into API data
  const { data: feedData } = useGlobalMissionFeed();
  const { itemStats: items, isLoading: itemsLoading } = useItemStats();
  const { prices: priceData, isLoading: pricesLoading } = useGetPrices();
  const { marketPlaceItems: shopItems, isLoading: shopItemsLoading } =
    useGetMarketplaceItems();
  const { exchangeItems, isLoading: exchangeItemsLoading } =
    useGetExchangeItems();

  // Effect to handle responsive design
  useEffect(() => {
    const updateMedia = () => setIsMobile(window.innerWidth <= 768);
    updateMedia();
    window.addEventListener('resize', updateMedia);
    return () => window.removeEventListener('resize', updateMedia);
  }, []);

  // Effect to update layers with mission data
  useEffect(() => {
    const updateLayers = async () => {
      setLoading(true);

      try {
        const updatedLayers = await Promise.all(
          layers.map(async (layer) => {
            // Get only the mission types that exist for this layer
            const missionTypes = LAYER_MISSION_TYPES[layer.id] || [];

            // If no specific mission types are defined, fallback to all types (shouldn't happen)
            if (missionTypes.length === 0) {
              console.warn(
                `No mission types defined for layer ${layer.id}, skipping fetches`,
              );
              return layer;
            }

            // Fetch only the mission types that exist for this layer
            const fetchPromises = missionTypes.map((type) =>
              fetchMissions(layer.id, type),
            );

            // Wait for all fetches to complete
            const fetchedMissionsArrays = await Promise.all(fetchPromises);

            // Flatten the array of mission arrays
            const fetchedMissions = fetchedMissionsArrays.flat();

            // Update mission data in the layer
            const updatedMissions = layer.missions.map((mission) => {
              const fetchedMission = fetchedMissions.find(
                (fetchedMission) => fetchedMission.name === mission.name,
              );

              return fetchedMission
                ? { ...mission, missionStats: fetchedMission }
                : mission;
            });

            return {
              ...layer,
              missions: updatedMissions,
              missionCount: updatedMissions.length,
            };
          }),
        );

        // Update state with new layers
        setLayers(updatedLayers);
        setCurrentLevel(
          (prev) => updatedLayers.find((l) => l.id === prev.id) || prev,
        );

        // Flatten all missions from all layers
        const allMissions = updatedLayers.flatMap((layer) => layer.missions);
        setMissions(allMissions);

        // Update current mission if needed
        setCurrentMission((prev) =>
          prev === null
            ? prev
            : allMissions.find((m) => m.id === prev.id) || prev,
        );

        setLayersLoaded(true);
        setLoading(false);
        setError(false);
      } catch (error) {
        console.error('Error updating layers:', error);
        setLoading(false);
        setError(true);
      }
    };

    updateLayers();
  }, []); // Empty dependency array means this runs once on mount

  // Effect to get mission feed
  useEffect(() => {
    if (layersLoaded && feedData && items.length > 0) {
      const postMissions = [...(feedData as PostMission[])];

      // Process each mission in the feed
      postMissions.forEach((postMission) => {
        // Find corresponding mission data
        postMission.mission = missions.find(
          (m) => postMission.missionName === m.name,
        );

        // Find mission stats
        const missionStats = missions.find(
          (m) => m.name === postMission.missionName,
        );

        // Find item stats based on mission type
        const itemStats = items.find((item) =>
          missionStats?.missionStats?.kind !== 'Events'
            ? item.name === missionStats?.missionStats?.yield
            : item.name === postMission.outcome.effect,
        );

        if (itemStats?.image) {
          postMission.itemImage = itemStats.image;
        }
      });

      // Update mission feed
      setMissionFeed((prev) => [...postMissions, ...prev]);
      setMissionFeedLoaded(true);
    }
  }, [layersLoaded, missions, feedData, items]);

  // Effect to check modal interactions
  useEffect(() => {
    // Close mission modal if no current mission
    if (currentMission === null && modals.mission) {
      setModalState('mission', false);
    }

    // Close mission modal if other modals open
    if (modals.mission && (modals.profile || modals.nftManagement)) {
      setModalState('mission', false);
    }
  }, [modals.mission, modals.profile, modals.nftManagement, currentMission]);

  // Create backward-compatible setter functions for each modal
  // This ensures existing components still work while we transition to the new API
  const setIsLayerAndMissionSelectModalOpen = (
    value: boolean | ((prevState: boolean) => boolean),
  ) => {
    if (typeof value === 'function') {
      setModalState(
        'layerAndMissionSelect',
        value(modals.layerAndMissionSelect),
      );
    } else {
      setModalState('layerAndMissionSelect', value);
    }
  };

  const setMissionModalOpen = (
    value: boolean | ((prevState: boolean) => boolean),
  ) => {
    if (typeof value === 'function') {
      setModalState('mission', value(modals.mission));
    } else {
      setModalState('mission', value);
    }
  };

  const setProfileModalOpen = (
    value: boolean | ((prevState: boolean) => boolean),
  ) => {
    if (typeof value === 'function') {
      setModalState('profile', value(modals.profile));
    } else {
      setModalState('profile', value);
    }
  };

  const setNftManagementModalOpen = (
    value: boolean | ((prevState: boolean) => boolean),
  ) => {
    if (typeof value === 'function') {
      setModalState('nftManagement', value(modals.nftManagement));
    } else {
      setModalState('nftManagement', value);
    }
  };

  const setLevelUnlockModalOpen = (
    value: boolean | ((prevState: boolean) => boolean),
  ) => {
    if (typeof value === 'function') {
      setModalState('levelUnlock', value(modals.levelUnlock));
    } else {
      setModalState('levelUnlock', value);
    }
  };

  const setMissionResultModalOpen = (
    value: boolean | ((prevState: boolean) => boolean),
  ) => {
    if (typeof value === 'function') {
      setModalState('missionResult', value(modals.missionResult));
    } else {
      setModalState('missionResult', value);
    }
  };

  const setEquipModalOpen = (
    value: boolean | ((prevState: boolean) => boolean),
  ) => {
    if (typeof value === 'function') {
      setModalState('equip', value(modals.equip));
    } else {
      setModalState('equip', value);
    }
  };

  const setFleetCommanderModalOpen = (
    value: boolean | ((prevState: boolean) => boolean),
  ) => {
    if (typeof value === 'function') {
      setModalState('fleetCommander', value(modals.fleetCommander));
    } else {
      setModalState('fleetCommander', value);
    }
  };

  const setIsCrewEquipModalOpen = (
    value: boolean | ((prevState: boolean) => boolean),
  ) => {
    if (typeof value === 'function') {
      setModalState('crewEquip', value(modals.crewEquip));
    } else {
      setModalState('crewEquip', value);
    }
  };

  const setIsShipEquipModalOpen = (
    value: boolean | ((prevState: boolean) => boolean),
  ) => {
    if (typeof value === 'function') {
      setModalState('shipEquip', value(modals.shipEquip));
    } else {
      setModalState('shipEquip', value);
    }
  };

  const setEquippedModalOpen = (
    value: boolean | ((prevState: boolean) => boolean),
  ) => {
    if (typeof value === 'function') {
      setModalState('equipped', value(modals.equipped));
    } else {
      setModalState('equipped', value);
    }
  };

  const setEquipItemsModalOpen = (
    value: boolean | ((prevState: boolean) => boolean),
  ) => {
    if (typeof value === 'function') {
      setModalState('equipItems', value(modals.equipItems));
    } else {
      setModalState('equipItems', value);
    }
  };

  const setBottomCenterOpen = (
    value: boolean | ((prevState: boolean) => boolean),
  ) => {
    if (typeof value === 'function') {
      setModalState('bottomCenter', value(modals.bottomCenter));
    } else {
      setModalState('bottomCenter', value);
    }
  };

  const setLevelModalOpen = (
    value: boolean | ((prevState: boolean) => boolean),
  ) => {
    if (typeof value === 'function') {
      setModalState('level', value(modals.level));
    } else {
      setModalState('level', value);
    }
  };

  const setIsActivityFeedSiteOpen = (
    value: boolean | ((prevState: boolean) => boolean),
  ) => {
    if (typeof value === 'function') {
      setModalState('activityFeedSite', value(modals.activityFeedSite));
    } else {
      setModalState('activityFeedSite', value);
    }
  };

  const setMenuDropdownOpen = (
    value: boolean | ((prevState: boolean) => boolean),
  ) => {
    if (typeof value === 'function') {
      setModalState('menuDropdown', value(modals.menuDropdown));
    } else {
      setModalState('menuDropdown', value);
    }
  };

  const setWalletDropdownOpen = (
    value: boolean | ((prevState: boolean) => boolean),
  ) => {
    if (typeof value === 'function') {
      setModalState('walletDropdown', value(modals.walletDropdown));
    } else {
      setModalState('walletDropdown', value);
    }
  };

  const setScrollMissionModalOpen = (
    value: boolean | ((prevState: boolean) => boolean),
  ) => {
    if (typeof value === 'function') {
      setModalState('scrollMission', value(modals.scrollMission));
    } else {
      setModalState('scrollMission', value);
    }
  };

  const setShopBuyModalOpen = (
    value: boolean | ((prevState: boolean) => boolean),
  ) => {
    if (typeof value === 'function') {
      setModalState('shopBuy', value(modals.shopBuy));
    } else {
      setModalState('shopBuy', value);
    }
  };

  const setMarketModalOpen = (
    value: boolean | ((prevState: boolean) => boolean),
  ) => {
    if (typeof value === 'function') {
      setModalState('market', value(modals.market));
    } else {
      setModalState('market', value);
    }
  };

  const setNftMovementOpen = (
    value: boolean | ((prevState: boolean) => boolean),
  ) => {
    if (typeof value === 'function') {
      setModalState('nftMovement', value(modals.nftMovement));
    } else {
      setModalState('nftMovement', value);
    }
  };

  const setHideoutModalOpen = (
    value: boolean | ((prevState: boolean) => boolean),
  ) => {
    if (typeof value === 'function') {
      setModalState('hideout', value(modals.hideout));
    } else {
      setModalState('hideout', value);
    }
  };

  // Create context value object with both new API and legacy API for backward compatibility
  const contextValue: LayerContextType = {
    // Cookies
    sessionCookie: cookies.sessionCookie,
    setCookie,
    cookies,

    // Layers and Missions
    levels: layers,
    currentLevel,
    setCurrentLevel,
    currentMission,
    setCurrentMission,
    missions,
    setMissions,

    // Modals - both new and legacy APIs
    modals,
    setModalState,

    // Legacy modal state and setters for backward compatibility
    isLayerAndMissionSelectModalOpen: modals.layerAndMissionSelect,
    setIsLayerAndMissionSelectModalOpen,
    isHideoutModalOpen: modals.hideout,
    setHideoutModalOpen,
    isMissionModalOpen: modals.mission,
    setMissionModalOpen,
    isProfileModalOpen: modals.profile,
    setProfileModalOpen,
    isNftManagementModalOpen: modals.nftManagement,
    setNftManagementModalOpen,
    isLevelUnlockModalOpen: modals.levelUnlock,
    setLevelUnlockModalOpen,
    isMissionResultModalOpen: modals.missionResult,
    setMissionResultModalOpen,
    isEquipModalOpen: modals.equip,
    setEquipModalOpen,
    isFleetCommanderModalOpen: modals.fleetCommander,
    setFleetCommanderModalOpen,
    isCrewEquipModalOpen: modals.crewEquip,
    setIsCrewEquipModalOpen,
    isShipEquipModalOpen: modals.shipEquip,
    setIsShipEquipModalOpen,
    isEquippedModalOpen: modals.equipped,
    setEquippedModalOpen,
    isEquipItemsModalOpen: modals.equipItems,
    setEquipItemsModalOpen,
    isBottomCenterOpen: modals.bottomCenter,
    setBottomCenterOpen,
    isLevelModalOpen: modals.level,
    setLevelModalOpen,

    isActivityFeedSiteOpen: modals.activityFeedSite,
    setIsActivityFeedSiteOpen,
    isMenuDropdownOpen: modals.menuDropdown,
    setMenuDropdownOpen,
    isWalletDropdownOpen: modals.walletDropdown,
    setWalletDropdownOpen,
    isScrollMissionModalOpen: modals.scrollMission,
    setScrollMissionModalOpen,
    isShopBuyModalOpen: modals.shopBuy,
    setShopBuyModalOpen,
    isMarketModalOpen: modals.market,
    setMarketModalOpen,
    isSetNftMovementOpen: modals.nftMovement,
    setNftMovementOpen,

    isForgeModalOpen,
    setForgeModalOpen,

    // Tabs
    tabs,
    activeTab,
    setActiveTab,
    toggleTab,

    // Inventory Tabs
    inventoryTabs,
    activeInventoryTab,
    setActiveInventoryTab,
    toggleInventoryTab,

    // Input and mission selection
    inputRef,
    selectedMissions,
    setSelectedMissions,
    claimedMissions,
    setClaimedMissions,
    handleMissionClick,

    // Status
    loading,
    error,

    // Items
    items,
    itemsLoading,
    shopItems,
    shopItemsLoading,
    exchangeItems,
    exchangeItemsLoading,
    selectedItemForEquip,
    setSelectedItemForEquip,

    // Mission Feed
    missionFeed,
    missionFeedLoaded,

    // Refs
    walletRef,
    profileRef,
    inventoryRef,
    assetManagerRef,
    islandRef,
    onMissionRef,
    menuRef,
    chatRef,
    missionsRef,

    // Mobile
    isMobile,
    setIsMobile,

    // Prices
    pricesData: priceData,
    isPriceLoading: pricesLoading,
  };

  return (
    <LayerContext.Provider value={contextValue}>
      {children}
    </LayerContext.Provider>
  );
};
