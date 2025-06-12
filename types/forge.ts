export enum ForgeTabValue {
  CAPTAIN = 'CAPTAIN',
  SHIP = 'SHIP',
  CREW = 'CREW',
  ITEM = 'ITEM',
}

export interface ForgeAsset {
  id: string;
  name: string;
  imageUrl: string;
  level: number;
  type: ForgeTabValue;
  rarity: string;
  mint?: string;
  minted: boolean;
}

export interface ForgeReward {
  shipTokens: number;
  crewTokens: number;
  itemTokens: number;
  goldTokens: number;
}

export interface ForgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ForgeTabValue;
  selectedAsset: ForgeAsset | null;
  currentAssets: ForgeAsset[];
  currentRewards: ForgeReward | null;
  isLoading: boolean;
  nftsLoading: boolean;
  onTabChange: (tab: ForgeTabValue) => void;
  onAssetSelect: (asset: ForgeAsset) => void;
  onBurn: () => void;
}
