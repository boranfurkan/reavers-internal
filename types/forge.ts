// types/forge.ts - Updated to support multiple selection
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
  selectedAssets: ForgeAsset[]; // Changed from selectedAsset to selectedAssets
  currentAssets: ForgeAsset[];
  currentRewards: ForgeReward | null;
  isLoading: boolean;
  nftsLoading: boolean;
  onTabChange: (tab: ForgeTabValue) => void;
  onAssetSelect: (asset: ForgeAsset) => void;
  onAssetSelectMultiple?: (assets: ForgeAsset[]) => void; // New prop for multiple selection
  onBurn: () => void;
  canSelectMultiple?: boolean; // New prop to indicate if multiple selection is allowed
  onSelectAll?: () => void; // New prop for select all functionality
  onClearSelection?: () => void; // New prop for clear selection functionality
}

// New interface for swap entities request
export interface SwapEntityRequest {
  type: 'CREW' | 'SHIP' | 'ITEM';
  entityId: string;
}

export interface SwapEntitiesResponse {
  success: boolean;
  message: string;
  jobId?: string;
}
