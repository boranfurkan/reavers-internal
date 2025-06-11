import { ItemData } from '../lib/types';
import { BaseEntity, NFTType } from './BaseEntity';
import { CharacterNFT } from './NFT';

export type CharacterType = NFTType.FM | NFTType.QM | NFTType.UNIQUE;

export interface Character extends BaseEntity {
  equippedItems: string[]; // Array of Item IDs equipped to the NFT.
  equippedStatus: EquipStatus | null;
  equippedItemsLoaded?: ItemData[];

  equippedCrew?: string;
  equippedShip?: string;

  arEarned: number;
  gemsEarned: number;
  goldBurned: number;

  missionsPlayed: number;
  missionsWon: number;
  missionsLost: number;
  itemsStolen: number;

  timePlayed: number;
  timeSpentInPrison: number;

  type: CharacterType;

  levelUpSuccessRate: number;
  staked?: StakeStatus;
  locked: LockStatus | null;
  strength: number;
}

interface StakeStatus {
  staked: boolean;
  startTime: number | null;
  stakedLevel: number;
  currentMission?: string | null;
}

interface LockStatus {
  startTime: number;
  locked: boolean;
}

interface EquipStatus {
  luckSlot: string;
  yieldSlot: string;
}
