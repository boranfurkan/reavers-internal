import axios from 'axios';
import { Mission } from '../contexts/LayerContext';
import { Item, ItemData, MissionStats, User } from '../lib/types';
import { GenesisShipRarity } from '../types/Genesis';
import { decryptData, encryptData } from '../stores/useAuthLocalStorage';
import { CSSProperties } from 'react';
import { CharacterNFT, NFT } from '../types/NFT';
import { NFTMaxLevels, NFTType } from '../types/BaseEntity';

import LevelUpDurations from '../data/levelUpDurationsInHour.json';
import LevelUpUsdCosts from '../data/entityLevelUpUsdCosts.json';

import { Collection } from '../types/Collections';
import { Token } from '../types/Token';
import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { getProjectConfig } from './projectConfig';

const getProjectUrls = () => {
  const projectName =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_NAME || 'reavers-56900';
  return getProjectConfig(projectName);
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const truncatePubkey = (pubkey: string) => {
  if (pubkey.length > 8) {
    return pubkey.slice(0, 4) + '...' + pubkey.slice(-4);
  }
  return pubkey;
};

export const getUserBootyOrGoldAmount = (
  user: User | undefined,
  type: Token.BOOTY | Token.GOLD,
) => {
  if (!user) return 0;

  const tokenAmount = type === Token.BOOTY ? user.arAmount : user.goldAmount;
  return tokenAmount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export const getUserOnChainBootyOrGoldAmount = (
  user: User | undefined,
  type: Token.BOOTY | Token.GOLD,
) => {
  if (!user) return 0;

  const tokenAmount = type === Token.BOOTY ? user.onChainAr : user.onChainGold;
  return tokenAmount?.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export function setWithExpiry<T>(
  key: string,
  owner: string,
  value: T,
  ttl: number,
  useLocalStorage: boolean = false,
) {
  const now = new Date();
  const data = {
    value: encryptData(
      JSON.stringify({ value }),
      process.env.NEXT_PUBLIC_LOCAL_ENCRYPTION_KEY!,
    ),
    owner,
    expiry: now.getTime() + ttl, // Set expiration time in milliseconds
  };

  if (useLocalStorage) {
    localStorage.setItem(key, JSON.stringify(data));
  } else {
    sessionStorage.setItem(key, JSON.stringify(data));
  }
}

export function getWithExpiry<T>(
  key: string,
  sessionUserName?: string,
  useLocalStorage: boolean = false,
): T | null {
  const strData = useLocalStorage
    ? localStorage.getItem(key)
    : sessionStorage.getItem(key);
  if (!strData) {
    return null; // Item does not exist in storage
  }

  const data = JSON.parse(strData);

  const now = new Date();

  if (
    now.getTime() > data.expiry ||
    (sessionUserName && data.owner != sessionUserName)
  ) {
    // Item has expired or does not belong to this user, remove it from LocalStorage
    localStorage.removeItem(key);
    return null;
  }

  try {
    const decryptedData = decryptData(
      data.value,
      process.env.NEXT_PUBLIC_LOCAL_ENCRYPTION_KEY!,
    );

    return decryptedData.value;
  } catch (err: any) {
    console.log(err);
    localStorage.removeItem(key);
    return null;
  }
}

export const fetcher = async ({
  url,
  method = 'GET',
  headers = {},
  body = '{}',
}: {
  url: string;
  method: string;
  headers?: any;
  body?: any;
}) => {
  const fetchOptions = {
    method,
    headers,
    data: body ? body : null,
  };

  try {
    const response = await axios(url, fetchOptions);
    if (response.status != 200) {
      // Handle non-successful responses here if needed
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.data;
    return data;
  } catch (error: any) {
    throw new Error(`Fetch error: ${error.message}`);
  }
};

export const getBuildingStyle = (buildingName: string): CSSProperties => {
  const style: CSSProperties = {
    position: 'absolute',
    top: -20,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 999,
  };

  // Gold Island buildings
  const goldIslandBuildings = [
    'The Bullion Bastion',
    'The Furnace Vault',
    'The Gilded Press',
    'The Refinery Deck',
    'The Smelters Hold',
  ];

  // Battle Island buildings
  const battleIslandBuildings = [
    'Supply Store',
    'Gem Emporium',
    'The Treasure Pit',
    'Genesis Cove Condominium',
    'The General Store',
  ];

  if (goldIslandBuildings.includes(buildingName)) {
    style.top = -70;
  } else if (battleIslandBuildings.includes(buildingName)) {
    style.top = -50;
  }

  return style;
};

export const isSpecialMission = (missionData: MissionStats | undefined) => {
  return missionData?.specialMission || false;
};

export const shortenBigNumber = (num: number) =>
  new Intl.NumberFormat('en', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num);
export const getErrorMessage = async (textBody: string) => {
  try {
    const jsonParsed = JSON.parse(textBody);
    if (!jsonParsed.error && !jsonParsed.message) {
      return 'Unknown error';
    }
    return (jsonParsed.error || jsonParsed.message) as string;
  } catch (err: any) {
    console.log(err);
    return textBody;
  }
};

export const getRarityColorWithOpacity = (rarity: string, opacity?: number) => {
  switch (rarity) {
    case 'COMMON':
      return `rgb(107 114 128 / ${opacity || 100}%)`; // Grey
    case 'UNCOMMON':
      return `rgb(34 197 94 / ${opacity || 100}%)`; // Green
    case 'RARE':
      return `rgb(59 130 246 / ${opacity || 100}%)`; // Blue
    case 'EPIC':
      return `rgb(170 59 246 / ${opacity || 100}%)`; // Purple
    case 'LEGENDARY':
      return `rgb(255 185 0 / ${opacity || 100}%)`; // Gold
    case 'MYTHIC':
      return `rgb(255 99 71 / ${opacity || 100}%)`; // Tomato
    default:
      return `rgb(107 114 128 / ${opacity || 100}%)`; // Default to Grey
  }
};

export const getLevelRarity = (
  type: NFTType.ITEM | NFTType.CREW | NFTType.SHIP | NFTType.GENESIS_SHIP,
  level: number,
  isLegendaryShip?: boolean,
) => {
  const maxShipLevel = isLegendaryShip
    ? NFTMaxLevels.MYTHIC_SHIP
    : NFTMaxLevels.COMMON_SHIP;

  const maxItemLevel = NFTMaxLevels.ITEM;
  const maxCrewLevel = NFTMaxLevels.CREW;

  switch (type) {
    case NFTType.ITEM:
      if (level == maxItemLevel) {
        return 'LEGENDARY';
      } else if (level >= maxItemLevel * 0.6) {
        return 'EPIC';
      } else if (level >= maxItemLevel * 0.4) {
        return 'RARE';
      } else if (level >= maxItemLevel * 0.2) {
        return 'UNCOMMON';
      } else {
        return 'COMMON';
      }
    case NFTType.CREW:
      if (level == maxCrewLevel) {
        return 'LEGENDARY';
      } else if (level >= maxCrewLevel * 0.6) {
        return 'EPIC';
      } else if (level >= maxCrewLevel * 0.4) {
        return 'RARE';
      } else if (level >= maxCrewLevel * 0.2) {
        return 'UNCOMMON';
      } else {
        return 'COMMON';
      }
    case NFTType.SHIP:
      if (level > 125) {
        return 'MYTHIC';
      } else if (level === 125) {
        return 'LEGENDARY';
      } else if (level >= maxShipLevel * 0.6) {
        return 'EPIC';
      } else if (level >= maxShipLevel * 0.4) {
        return 'RARE';
      } else if (level >= maxShipLevel * 0.2) {
        return 'UNCOMMON';
      } else {
        return 'COMMON';
      }
    case NFTType.GENESIS_SHIP:
      return 'COMMON';
  }
};

export const getCollectionNameFromSymbol = (collectionSymbol?: string) => {
  switch (collectionSymbol) {
    case 'REAVERS':
      return Collection.REAVERS;
    case 'REAVER':
      return Collection.REAVERS;
    case 'CREW':
      return Collection.REAVERS;
    case '7SEASHIPS':
      return Collection.SEVEN_SEAS;
    case 'BRO':
      return Collection.BROHALLA;
    case 'ATMS':
      return Collection.DRAGON_SOLS;
    case 'DRAGONSOLS':
      return Collection.DRAGON_SOLS;
    case 'ELE':
      return Collection.ELEMENTERRA_RABBITS;
    case 'LASTH':
      return Collection.LAST_HAVEN;
    case 'STEAMPUNKS':
      return Collection.STEAM_PUNKS;
    case 'ASGARD':
      return Collection.ASGARDIANS;
    default:
      return Collection.SEVEN_SEAS;
  }
};

export const getItemsImageUrlByName = (name: string) => {
  const { storageUrl } = getProjectUrls();

  const itemsImageUrls = {
    'Compass of Consciousness': `${storageUrl}/temp/compassTemp.png`,
    'Empty Bottle of Rum': `${storageUrl}/items/Bottle_of_rum.png`,
    'Flintlock Pistol': `${storageUrl}/items/Flintlock Pistol-tr.png`,
    'Golden Compass': `${storageUrl}/items/Compass-tr.png`,
    'Golden Scrolls': `${storageUrl}/items/Golden Scrolls.png`,
    'Heart of Davy Jones': `${storageUrl}/items/Heart of Davy Jones-tr.png`,
    'Jar of Dirt': `${storageUrl}/items/Jar of Dirt-tr.png`,
    'Jolly Roger Flag': `${storageUrl}/items/Jolly Roger Flag-tr.png`,
    'Obsidian Cannon': `${storageUrl}/items/Cannon-tr.png`,
    'Pirate Codex': `${storageUrl}/items/Pirate codex.png`,
    "Poseidon's Trident": `${storageUrl}/items/Poseidon's Trident-tr.png`,
    Scimitar: `${storageUrl}/items/Scimitar-tr.png`,
    Scroll: `${storageUrl}/items/Scroll-tr.png`,
    Skullsplitter: `${storageUrl}/items/Skullsplitter.png`,
    'Spiked Club': `${storageUrl}/items/Spiked Club.png`,
    Spyglass: `${storageUrl}/items/Spyglass-tr.png`,
    "Triton's Trident": `${storageUrl}/temp/tridentTemp.png`,
  };

  if (itemsImageUrls[name as keyof typeof itemsImageUrls]) {
    return itemsImageUrls[name as keyof typeof itemsImageUrls];
  } else {
    return '/images/reavers.webp';
  }
};

export const getAssetIdentifier = (asset: NFT | ItemData) => {
  const untypedAsset = asset as any;
  const hasId = !!(untypedAsset.uid || untypedAsset.id);
  if (!hasId && !untypedAsset.mint) {
    console.error('Asset does not have a unique identifier', untypedAsset);
    throw new Error('Asset does not have a unique identifier');
  }

  return (untypedAsset.uid || untypedAsset.id || untypedAsset.mint) as string;
};

export const formatNumberWithSuffix = (
  value: number | undefined,
  toFixed: number = 2,
): string => {
  if (value === undefined) {
    return '0';
  } else {
    if (value >= 1_000_000_000) {
      return (value / 1_000_000_000).toFixed(toFixed) + 'B';
    } else if (value >= 1_000_000) {
      return (value / 1_000_000).toFixed(toFixed) + 'M';
    } else if (value >= 1_000) {
      return (value / 1_000).toFixed(toFixed) + 'K';
    } else if (value >= 100) {
      return (value / 1_000).toFixed(toFixed) + 'K';
    } else {
      return value.toFixed(toFixed);
    }
  }
};

export const getIslandIconImage = (islandNumber: number) => {
  const imageUrl =
    islandNumber === 1
      ? '/images/maps/island-1-icon.webp'
      : '/images/maps/island-2-icon.webp';

  return imageUrl;
};

export const decideEntitiyToBeUpgraded = (name: string) => {
  switch (name) {
    case "Captain's Academy":
    case 'War Hall':
    case 'The Laboratory':
    case 'Mission Control':
    case 'The Gilded Press':
    case 'Dragons Roost':
      return 'Character';

    case 'Shipwright and Co':
    case "Skald's Shipyard":
    case 'The Aetherdock':
    case 'The Salvage Wharf':
    case 'Scaleport':
      return 'Ship';

    case 'The Blacksmith':
    case 'The Iron Armory':
    case 'The Gearsmiths Forge':
    case 'Wasteland Outfitters':
    case 'Fangvault':
      return 'Item';

    case 'The Docks':
    case 'The Mead Hall':
    case 'The Steamworks Union':
    case 'Survivors Hold':
    case 'The Hatchery':
      return 'Crew';
  }
};

export const getCostForLevelUp = (
  type: NFTType,
  prevLevel: number,
  newLevel: number,
  price: number,
) => {
  if (type === NFTType.GENESIS_SHIP) {
    const levelsToUpgrade = newLevel - prevLevel;
    return 50 * levelsToUpgrade;
  }
  type LevelCosts = { [key: number]: number };

  const typeCosts: LevelCosts =
    type === NFTType.CAPTAIN
      ? LevelUpUsdCosts['CAPTAIN']
      : LevelUpUsdCosts[type];

  if (typeCosts) {
    let totalCost = 0;

    for (let level = prevLevel + 1; level <= newLevel; level++) {
      if (typeCosts[level] !== undefined && typeCosts[level] !== null) {
        const usdcCost = typeCosts[level];
        const currencyCost = parseFloat((usdcCost * price).toFixed(2));
        totalCost += currencyCost;
      } else {
        console.error(`Couldn't fetch costs for ${type} at level ${level}`);
      }
    }
    return totalCost;
  } else {
    console.error(`Couldn't fetch costs for ${type}`);
    throw new Error(`Couldn't fetch costs for ${type}`);
  }
};

export const calculateEndtimeForEvents = (
  type: NFTType,
  prevLevel: number,
  newLevel: number,
) => {
  if (type === NFTType.GENESIS_SHIP) {
    return 0;
  }
  type LevelDurations = { [key: string]: number };

  const typeDurations = (
    type === NFTType.CAPTAIN
      ? LevelUpDurations['CAPTAIN']
      : LevelUpDurations[type]
  ) as LevelDurations;

  if (typeDurations) {
    let totalHours = 0;

    for (let level = prevLevel + 1; level <= newLevel; level++) {
      const levelKey = level.toString();
      if (levelKey in typeDurations && typeDurations[levelKey] !== null) {
        totalHours += typeDurations[levelKey];
      } else {
        throw new Error(
          `Couldn't fetch duration for ${type} at level ${level}`,
        );
      }
    }

    return totalHours;
  } else {
    throw new Error(`Couldn't fetch durations for ${type}`);
  }
};

export function formatHoursToHMS(hours: number): string {
  const totalSeconds = Math.floor(hours * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const hDisplay = `${h.toString().padStart(2, '0')}H`;
  const mDisplay = `${m.toString().padStart(2, '0')}M`;
  const sDisplay = `${s.toString().padStart(2, '0')}S`;

  return `${hDisplay} ${mDisplay} ${sDisplay}`;
}

export const BootyCostMultiplier: {
  [missionName: string]: number;
} = {
  //Island 1
  "Captain's Academy": 0,
  'Shipwright and Co': 0,
  'The Blacksmith': 0,
  'The Docks': 0,
  //Island 2
  "Skald's Shipyard": 0.2,
  'The Iron Armory': 0.2,
  'The Mead Hall': 0.2,
  'War Hall': 0.2,
  //Island 3
  'The Laboratory': 0.3,
  'The Aetherdock': 0.3,
  'The Steamworks Union': 0.3,
  'The Gearsmiths Forge': 0.3,
  //  Island 4
  'Mission Control': 0.3,
  'The Salvage Wharf': 0.3,
  'Wasteland Outfitters': 0.3,
  'Survivors Hold': 0.3,
  //Island 5
  'Dragons Roost': 0.5,
  Fangvault: 0.5,
  Scaleport: 0.5,
  'The Hatchery': 0.5,
};

export const DurationMultiplier: {
  [missionName: string]: number;
} = {
  //Island 1
  "Captain's Academy": 1,
  'Shipwright and Co': 1,
  'The Blacksmith': 1,
  'The Docks': 1,
  //Island 2
  "Skald's Shipyard": 0.8,
  'The Iron Armory': 0.8,
  'The Mead Hall': 0.8,
  'War Hall': 0.8,
  //Island 3
  'The Laboratory': 0.7,
  'The Aetherdock': 0.7,
  'The Steamworks Union': 0.7,
  'The Gearsmiths Forge': 0.7,

  //  Island 4
  'Mission Control': 0.6,
  'The Salvage Wharf': 0.6,
  'Wasteland Outfitters': 0.6,
  'Survivors Hold': 0.6,

  //Island 5
  'Dragons Roost': 0.3,
  Fangvault: 0.3,
  Scaleport: 0.3,
  'The Hatchery': 0.3,
};

export const adjustColor = (color: string, opacity: number): string => {
  const hex = color.replace('#', '');

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const alpha = opacity / 100;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const convertFirestoreDateToTimestamp = (seconds: number) => {
  return new Date(seconds * 1000).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export function findMaxLevelForEntity({
  type,
  isCaptainOneOfOne,
  isLegendarySpecial,
}: {
  type: NFTType;
  isCaptainOneOfOne?: boolean;
  isLegendarySpecial?: boolean;
}): number {
  switch (type) {
    case NFTType.CREW:
      return NFTMaxLevels.CREW;
    case NFTType.CAPTAIN:
      return isCaptainOneOfOne
        ? NFTMaxLevels.UNIQUE_CAPTAIN
        : NFTMaxLevels.CAPTAIN;
    case NFTType.ITEM:
      return NFTMaxLevels.ITEM;
    case NFTType.SHIP:
      return isLegendarySpecial
        ? NFTMaxLevels.MYTHIC_SHIP
        : NFTMaxLevels.COMMON_SHIP;
    case NFTType.GENESIS_SHIP:
      return NFTMaxLevels.GENESIS_SHIP;
    default:
      throw new Error('Invalid NFT type');
  }
}

export const calculateDurability = (tierBonus: number, level?: number) => {
  return ((level || 1) * tierBonus).toFixed(2);
};

export const shortenSolanaAddress = (address: string, length = 4): string => {
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(0)}%`;
};

export const calculateCharacterStrength = (character: CharacterNFT) => {
  const baseStrength = (character.crewLevel || 1) + (character.itemLevel || 1);
  const strength =
    baseStrength === 0
      ? (character.level || 1) * (character.shipLevel || 1)
      : (character.level || 1) * baseStrength * (character.shipLevel || 1);

  return strength;
};

export function getGenesisShipSpeed(rarity: GenesisShipRarity) {
  switch (rarity) {
    case GenesisShipRarity.FLEET_COMMANDER:
      return 200;
    case GenesisShipRarity.GOLD:
      return 100;
    case GenesisShipRarity.SILVER:
      return 50;
    case GenesisShipRarity.BRONZE:
      return 25;
    default:
      return 100;
  }
}

const getCostToLevel = (
  type: NFTType,
  targetLevel: number,
  price: number,
): number => {
  if (targetLevel <= 0) return 0;

  try {
    return getCostForLevelUp(type, 0, targetLevel, price);
  } catch (error) {
    console.error(
      `Error calculating cost to level ${targetLevel} for ${type}:`,
      error,
    );
    return 0;
  }
};

const getTotalBootyCost = (
  type: NFTType,
  price: number,
  maxLevel: number,
): number => {
  try {
    return getCostForLevelUp(type, 0, maxLevel, price);
  } catch (error) {
    console.error(`Error calculating total booty cost for ${type}:`, error);
    return 0;
  }
};

export const calculateTokenReward = (
  entityLevel: number,
  entityType: NFTType,
  price: number,
  maxLevel: number,
): number => {
  if (entityLevel <= 1)
    throw new Error(
      `Should be above level 1 to swap entities, current level: ${entityLevel}`,
    );

  if (entityLevel >= 27) return entityLevel;

  // Step 1: Calculate total booty cost for max level range (1 to maxLevel)
  const totalBootyCost = getTotalBootyCost(entityType, price, maxLevel);

  // Step 2: Calculate average cost per level
  const averageCostPerLevel = totalBootyCost / maxLevel;

  // Step 3: Calculate the cost of the specific level (0 to entityLevel)
  const assetCost = getCostToLevel(entityType, entityLevel, price);

  // Step 4: Divide asset cost by average cost
  const tokenReward = Math.floor(assetCost / averageCostPerLevel);

  return Math.max(1, tokenReward); // Ensure minimum reward of 1 token
};
