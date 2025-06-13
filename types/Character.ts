import { BaseEntity, NFTType } from './BaseEntity';

export type CharacterType = NFTType.FM | NFTType.QM | NFTType.UNIQUE;

export interface Character extends BaseEntity {
  type: CharacterType;
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
  shipType: 'Mythic' | 'Common';
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
