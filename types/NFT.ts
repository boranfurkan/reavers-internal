import { DAS } from 'helius-sdk';
import { Character } from './Character';
import { Crew } from './Crew';
import { Ship } from './Ship';
import { GenesisShip } from './Genesis';

export type CharacterNFT = Partial<DAS.GetAssetResponse> & Partial<Character>;
export type CrewNFT = Partial<DAS.GetAssetResponse> & Partial<Crew>;
export type ShipNFT = Partial<DAS.GetAssetResponse> & Partial<Ship>;
export type GenesisShipNFT = Partial<DAS.GetAssetResponse> &
  Partial<GenesisShip>;

export type NFT = CharacterNFT | CrewNFT | ShipNFT | GenesisShipNFT;
