import { ActiveMission } from '../lib/types';

export enum NFTType {
  CREW = 'CREW',
  SHIP = 'SHIP',
  CAPTAIN = 'CAPTAIN',
  /* NFT characters depending on their role */
  QM = 'QM',
  FM = 'FM',
  UNIQUE = '1/1',
  ITEM = 'ITEM',
  GENESIS_SHIP = 'GENESIS_SHIP',
}

export enum NFTMaxLevels {
  CREW = 125,
  COMMON_SHIP = 125,
  MYTHIC_SHIP = 250,
  QM = 50,
  FM = 50,
  UNIQUE = 100,
  ITEM = 120,
  GENESIS_SHIP = 260,
}

export interface BaseMetadata {
  name: string;
  image: string;
  description: string;
}

type UplevelingHistory = Array<{
  level: number;
  failedAttempts: number;
}>;

export interface BaseEntity {
  mint: string;
  minted: boolean;
  isDelegated: boolean;

  level: number;
  uplevelingHistory: UplevelingHistory;

  currentMission: string;
  currentMissionLoaded?: ActiveMission;

  type: NFTType;

  isDeposited: boolean;
  owner: string;

  uid: string;

  metadata: BaseMetadata;
}
