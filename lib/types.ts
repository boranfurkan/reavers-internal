import {
  DocumentData,
  DocumentReference,
  QueryDocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { DAS } from 'helius-sdk';
import { Mission } from '../contexts/LayerContext';
import { Character } from '../types/Character';
import { CharacterNFT } from '../types/NFT';
import { Token } from '../types/Token';
import { BaseMetadata } from '../types/BaseEntity';

export interface ItemData
  extends Partial<DAS.GetAssetResponse>,
    Partial<Item> {}

//Social Data
interface socialData {
  username: string;
  profilePicture: string;
}

// User
export interface User {
  wallet: string; // Unique ID of the user.
  username: string; // Username chosen by the player.
  profilePicture: string; // URL of the profile picture.
  missionsPlayed: number;
  missionsWon: number;
  missionsLost: number;
  arAmount: number;
  scroll: number;
  tickets: number;
  wantedPosters: number;
  scrapMetals: number;
  pieceOfWoods: number;
  legendaryShipToken: number;
  arEarned: number;
  goldAmount: number;
  gemsAmount: number;
  gemsEarned: number;
  battleTokens: number;
  itemsStolen: number;
  timePlayed: number;
  inventory: Array<string>;
  twitterData?: socialData;
  discordData?: socialData;
  // Added on client
  onChainAr?: number;
  onChainGold?: number;
  // For leaderboard:
  rank?: number;
  doc?: QueryDocumentSnapshot<DocumentData>;
  rankedNfts?: Character[];
  burnedBooty?: number;
  // Temporary
  treasureAmount: number;
  fleetCommanderLevel: number;

  shipLevelToken: number;
  crewLevelToken: number;
  itemLevelToken: number;
}

interface BaseLeaderboardTreasureResponse {
  rank: number;
  allocation: number;
  value: number;
}

export interface LeaderboardTreasueNFTResponse
  extends BaseLeaderboardTreasureResponse {
  uid: string;
  imageURL: string;
  goldBar: number;
  walletAddress: string;
}

export interface LeaderboardTreasureUserResponse
  extends BaseLeaderboardTreasureResponse {
  owner: string;
  goldBurned: number;
}

export interface ArenaLeaderboardResponse {
  currentPage: number;
  pageSize: number;
  totalPlayers: number;
  totalPages: number;
  leaderboard: ArenaLeaderboardStat[];
}

export interface ArenaLeaderboardMeResponse {
  rank: number;
  username: string;
  xp: number;
  level: number;
  totalMessages: number;
  arenaNft?: {
    createdAt: Timestamp;
    nftId: string;
    reward: number;
    userId: string;
    nftName: string;
    nftImage: string;
    nftLevel: number;
  };
}

export interface ArenaLeaderboardStat {
  rank: number;
  username: string;
  level: number;
  xp: number;
  messageCount: number;
}

// Items
export interface ItemStats {
  name: string;
  image: string;
  description: string;
  collection: string;
  symbol: string;
  creators: any[];
  path: string;
  attributes?: DAS.Attribute[];

  // Added on client
  ref: DocumentReference<DocumentData>;
}

export interface ItemData {
  cost?: { group: string; price: number }[];
  itemStatsRef?: ItemStats;
  description?: string;
}

interface CrewData {
  cost?: number;
  level: number;
  description?: string;
  image?: string;
}

// TODO:

export interface Item {
  equipped: boolean;
  equippedTo?: string;
  isDeposited: boolean;
  mint: string;
  minted: boolean;
  level: number;
  metadata?: {
    name: string;
    image: string;
    description: string;
  };
  owner: string;
  name: string;
  path: string;
  itemStats?: ItemStats;
  uid: string;
}

// Missions
export interface Outcome {
  type: 'failure' | 'success';
  multiplier?: number;
  rate: number;
  effect?: string;
  level?: number;
  itemInfo?: ItemInfo;
}

interface ItemInfo {
  image?: string;
  rarity?: string;
  stat?: number;
}

export interface MissionStats {
  name: string;
  layer: number;
  yield: string; // Indicates the Item that the user can receive
  cost?: number;
  deployment?: number; // Updated
  minLevel?: number; // Added
  maxLevel?: number; // Added
  riskLevel?: number; // Updated
  currency?: Token.BOOTY | Token.GOLD;
  yieldImage: string;
  yieldText: string;
  first_mate_multiplier?: number; // Might be unnecessary
  outcomes?: Outcome[];
  success_rate?: number;
  gems_when_failed: string;
  required_items?: string[];
  // Added in client:
  color?: string;
  kind: 'Plunders' | 'Events' | 'Burners' | 'Specials';
  path: string;
  id: string;
  specialMission?: boolean;
  isPayWithGems?: boolean;
  strengthCap?: number;
  missionEndDate: {
    _nanoseconds: number;
    _seconds: number;
  };
  totalActiveMissions?: number;
}

export interface ActiveMission {
  missionRef: DocumentReference; // AVOID USING IT | FIREBASE (DE)SERIALIZATION DOES NOT WORK PROPERLY | USE missionName INSTEAD
  missionName?: string;
  mission?: Mission;
  type: 'Plunders' | 'Events' | 'Burners';
  nftIds: string[];
  loading: boolean;
  nfts: Array<DocumentReference>; // AVOID USING IT | FIREBASE (DE)SERIALIZATION DOES NOT WORK PROPERLY | USE nftIds INSTEAD
  nftsLoaded?: Array<CharacterNFT>;
  userId: string;
  startTime: number;
  duration: number;
  id: string;
  totalLuck: number;
  totalYield: number;
  userName?: string;
  userAvatar?: string;
  // Added in client
  endTimeCalculated?: number;
  stakedSpecial?: boolean;
  path: string;
  ref: {
    _path: {
      segments: string[];
    };
  };

  strength?: number;
  reward?: number;
  missionEndTime?: number;
}

export interface PostMission extends ActiveMission {
  outcome: Outcome;
  arrrReward: number;
  gemsReward?: number;
  endTime?: number;
  // On client
  itemImage?: string;
}

export interface MarketPlaceItem {
  uid: string;
  name: string;
  image: string;
  type: 'CREW' | 'SHIP' | 'ITEM';
  price: number;
  description: string;
  active: boolean;
  amountMinted: number;
  amountAvailable: number;
  rarity?: string;
}

export interface ExchangeItem {
  id: string;
  name: string;
  image: string;
  active: boolean;
  costType: 'gemsAmount' | 'treasureAmount' | 'arAmount';
  costAmount: number;
  yieldType: 'arAmount' | 'goldAmount' | 'battleTokens';
  yieldAmount: number;
}

export interface DynamicExchangeItem {
  amountAvailable: number;
  active: boolean;
  image: string;
  name: string;
  type: 'BOOTY_TO_GOLD' | 'GOLD_TO_BOOTY';
  costType: 'goldAmount' | 'arAmount';
  costAmount: number;
  yieldType: 'goldAmount' | 'arAmount';
  yieldAmount: number;
}

export type HideoutStats = {
  totalWorth: number;
  coins: HideoutCoin[];
};

type HideoutCoin = {
  name: string;
  symbol: string;
  logoURL: string;
  amount: number;
  worthUSD: number;
  weightPercentage: number;
  currentPrice: number;
};

export interface PriceData {
  sol_booty_price: number;
  sol_usdc_price: number;
  usdc_booty_price: number;
  usdc_gold_price: number;
  updateDate: Date;
}
