import { Col } from 'antd';
import { Collection } from '../../types/Collections';
import { NFTType } from '../../types/BaseEntity';
import { AssetLocation } from './AssetCard';
import WalletIcon from '../../assets/wallet-icon';
import ControllerIcon from '../../assets/controller-icon';
import CaptainIcon from '../../assets/captain-icon';
import ShipIcon from '../../assets/ship-icon';
import ItemsIcon from '../../assets/items-icon';
import CrewIcon from '../../assets/crew-icon';
import TheSevenSeasIcon from '../../assets/the-seven-seas-icon';
import ReaversIcon from '../../assets/reavers-icon';
import BrohallaIcon from '../../assets/brohalla-icon';
import ElementerraIcon from '../../assets/elementerra-icon';
import LastHavenIcon from '../../assets/last-haven-icon';
import AtomsIcon from '../../assets/atoms-icon';

// Tabs data
export const gameTabs = [
  {
    name: 'IN WALLET',
    key: AssetLocation.IN_WALLET,
    icon: (
      <WalletIcon
        width={24}
        height={24}
        className="inline-block h-6 max-h-6 w-6 max-w-6"
      />
    ),
  },
  {
    name: 'IN GAME',
    key: AssetLocation.IN_GAME,
    icon: (
      <ControllerIcon
        width={24}
        height={24}
        className="inline-block h-6 max-h-6 w-6 max-w-6"
      />
    ),
  },
] as const;

export const secondaryTabs = [
  {
    name: 'CAPTAINS',
    key: 'CAPTAIN',
    icon: (
      <CaptainIcon
        width={24}
        height={24}
        className="inline-block h-6 max-h-6 w-6 max-w-6"
      />
    ),
  },
  {
    name: 'SHIPS',
    key: NFTType.SHIP,
    icon: (
      <ShipIcon
        width={24}
        height={24}
        className="inline-block h-6 max-h-6 w-6 max-w-6"
      />
    ),
  },
  {
    name: 'GENESIS SHIPS',
    key: NFTType.GENESIS_SHIP,
    icon: (
      <ShipIcon
        width={24}
        height={24}
        className="inline-block h-6 max-h-6 w-6 max-w-6"
      />
    ),
  },
  {
    name: 'ITEMS',
    key: NFTType.ITEM,
    icon: (
      <ItemsIcon
        width={24}
        height={24}
        className="inline-block h-6 max-h-6 w-6 max-w-6"
      />
    ),
  },
  {
    name: 'CREWS',
    key: NFTType.CREW,
    icon: (
      <CrewIcon
        width={24}
        height={24}
        className="inline-block h-6 max-h-6 w-6 max-w-6"
      />
    ),
  },
] as const;

export const rarityFilters = [
  { key: 'ALL', name: 'All', rarity: null },
  { key: 'COMMON', name: 'Common', rarity: 'COMMON' },
  { key: 'UNCOMMON', name: 'Uncommon', rarity: 'UNCOMMON' },
  { key: 'RARE', name: 'Rare', rarity: 'RARE' },
  { key: 'EPIC', name: 'Epic', rarity: 'EPIC' },
  { key: 'LEGENDARY', name: 'Legendary', rarity: 'LEGENDARY' },
] as const;

export const mintStatusOptions = [
  { title: 'Minted', value: 'minted' },
  { title: 'Not Minted', value: 'not-minted' },
] as const;

export type GameTabValue = (typeof gameTabs)[number]['key'];
export type SecondaryTabValue = (typeof secondaryTabs)[number]['key'];
export type RarityFilterValue = (typeof rarityFilters)[number]['key'];
export type MintStatusValue = (typeof mintStatusOptions)[number]['value'];
