import { BaseEntity, NFTType } from './BaseEntity';

export interface Character extends BaseEntity {
  type: NFTType.CAPTAIN;
  image: string;

  arEarned: number;
  gemsEarned: number;
  goldBurned: number;

  missionsPlayed: number;
  missionsWon: number;
  missionsLost: number;
  itemsStolen: number;

  timePlayed: number;
  timeSpentInPrison: number;

  staked?: StakeStatus;
  locked: LockStatus | null;
  strength: number;

  shipLevel: number;
  crewLevel: number;
  itemLevel: number;
  shipRarity: ShipRarity;

  isOneofOne: boolean;
  isCore: boolean;
}

export enum ShipRarity {
  Common = 'COMMON',
  Legendary = 'LEGENDARY',
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
