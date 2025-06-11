import { BaseMetadata } from './BaseEntity';

export interface GenesisShip {
  id: string;
  imageURL: string;
  shipName: string;
  owner: string | null;
  tierBonus: number;
  rarity: GenesisShipRarity;
  assignedUserId: string | null;
  reward: number;
  allTimeRewardClaimed: number;
  allTimeTaxPaid: number;

  captainLicense1: boolean;
  captainLicense2: boolean;
  captainLicense3: boolean;
  isOnMission: boolean;
  isClaimable: boolean;

  isDeposited: boolean;
  mint: string;
  minted: boolean;

  metadata: BaseMetadata;
}

export enum GenesisShipRarity {
  FLEET_COMMANDER = 'FLEET_COMMANDER',
  GOLD = 'GOLD',
  SILVER = 'SILVER',
  BRONZE = 'BRONZE',
}

export const LicenseCostInBooty = {
  FLEET_COMMANDER: {
    1: 1000,
    2: 1500,
    3: 2000,
  },
  GOLD: {
    1: 1000,
    2: 1500,
    3: 2000,
  },
  SILVER: {
    1: 200,
    2: 300,
    3: 400,
  },
  BRONZE: {
    1: 100,
    2: 150,
    3: 200,
  },
} as const;

export const MissionCostsInBooty = {
  FLEET_COMMANDER: 45,
  GOLD: 45,
  SILVER: 9,
  BRONZE: 4.5,
} as const;

export const MissionCostsInGold = {
  FLEET_COMMANDER: 0,
  GOLD: 500,
  SILVER: 100,
  BRONZE: 50,
} as const;

export const MissionRewardsInTreasure = {
  FLEET_COMMANDER: 30000,
  GOLD: 15000,
  SILVER: 3000,
  BRONZE: 1500,
} as const;
