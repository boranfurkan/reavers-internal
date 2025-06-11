import { useMemo } from 'react';
import { CharacterNFT, CrewNFT, ShipNFT } from '../../types/NFT';
import { GenesisShip, GenesisShipRarity } from '../../types/Genesis';
import { ItemData } from '../../lib/types';
import { getLevelRarity } from '../../utils/helpers';
import { NFTType } from '../../types/BaseEntity';
import { getStrengthPercentage } from '../../utils/inventory-helpers';

// Define types for filters
export type StandardRarityFilter =
  | 'ALL'
  | 'COMMON'
  | 'UNCOMMON'
  | 'RARE'
  | 'EPIC'
  | 'LEGENDARY'
  | 'MYTHIC';
export type GenesisRarityFilter =
  | 'ALL'
  | 'FLEET_COMMANDER'
  | 'GOLD'
  | 'SILVER'
  | 'BRONZE';
export type RarityFilter = StandardRarityFilter | GenesisRarityFilter;

export type SortOption =
  | 'level-desc'
  | 'level-asc'
  | 'rarity-desc'
  | 'rarity-asc'
  | 'name-asc'
  | 'name-desc'
  | 'strength-desc'
  | 'strength-asc';

export type EquippedFilter = 'all' | 'equipped' | 'not-equipped';
export type MissionFilter = 'all' | 'on-mission' | 'not-on-mission';

export interface FilterState {
  rarity: RarityFilter;
  status: EquippedFilter | MissionFilter;
  sortBy: SortOption;
  search: string;
}

// Define a generic type for our NFT entities
type EntityType = CharacterNFT | CrewNFT | ShipNFT | GenesisShip | ItemData;

// Default filter state
export const defaultFilters: FilterState = {
  rarity: 'ALL',
  status: 'all',
  sortBy: 'level-desc',
  search: '',
};

export function useInventoryFilters<T extends EntityType>(
  items: T[],
  entityType: 'Captains' | 'Crews' | 'Ships' | 'Genesis Ships' | 'Items',
  filters: FilterState,
) {
  // Apply filters and sorting to the provided items
  const filteredItems = useMemo(() => {
    if (!items || items.length === 0) return [] as T[];

    // First apply search filter if any
    let result = [...items];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((item) => {
        const name =
          'name' in item
            ? item.name
            : 'shipName' in item
            ? item.shipName
            : 'metadata' in item && item.metadata
            ? item.metadata.name
            : '';

        return name?.toLowerCase().includes(searchLower);
      });
    }

    // Apply rarity filter
    if (filters.rarity !== 'ALL') {
      result = result.filter((item) => {
        // Genesis ships have their own rarity property
        if ('rarity' in item && entityType === 'Genesis Ships') {
          // For Genesis Ships, check directly against their rarity enum
          return (item as GenesisShip).rarity === filters.rarity;
        }

        // Other entities we compute rarity based on level
        const itemLevel = 'level' in item ? item.level || 1 : 1;
        const isLegendaryShip = 'rarity' in item && item.rarity === 'LEGENDARY';

        let itemType = NFTType.ITEM;
        if (entityType === 'Crews') itemType = NFTType.CREW;
        if (entityType === 'Ships') itemType = NFTType.SHIP;

        const rarity = getLevelRarity(itemType, itemLevel, isLegendaryShip);
        return rarity === filters.rarity;
      });
    }

    // Apply status filter (equipped/mission)
    if (filters.status !== 'all') {
      if (entityType === 'Captains') {
        // Mission filter for captains
        const isOnMission = filters.status === 'on-mission';
        result = result.filter((item) => {
          if ('currentMission' in item) {
            return isOnMission
              ? item.currentMission && item.currentMission !== ''
              : !item.currentMission || item.currentMission === '';
          }
          return true;
        });
      } else if (entityType !== 'Genesis Ships') {
        // Equipped filter for other entities
        const isEquipped = filters.status === 'equipped';
        result = result.filter((item) => {
          // Different entities have different "equipped" flags
          if ('equipped' in item) {
            return item.equipped === isEquipped;
          }
          if ('equippedTo' in item) {
            return !!item.equippedTo === isEquipped;
          }
          return true;
        });
      }
    }

    // Apply sorting
    result.sort((a, b) => {
      // Helper to get item name
      const getName = (item: any): string => {
        if ('name' in item && item.name) return item.name || '';
        if ('shipName' in item) return item.shipName || '';
        if ('metadata' in item && item.metadata && item.metadata.name)
          return item.metadata.name || '';
        return '';
      };

      // Helper to get item level
      const getLevel = (item: any): number => {
        return 'level' in item ? item.level || 1 : 1;
      };

      // Helper to get item strength (for captains)
      const getStrength = (item: any): number => {
        if (entityType === 'Captains' && 'strength' in item) {
          return item.strength || 0;
        }
        return 0;
      };

      // Helper to get item rarity weight (for sorting)
      const getRarityWeight = (item: any): number => {
        if ('rarity' in item && entityType === 'Genesis Ships') {
          const rarity = (item as GenesisShip).rarity;
          // Define weights for Genesis Ship rarities
          switch (rarity) {
            case GenesisShipRarity.FLEET_COMMANDER:
              return 4;
            case GenesisShipRarity.GOLD:
              return 3;
            case GenesisShipRarity.SILVER:
              return 2;
            case GenesisShipRarity.BRONZE:
              return 1;
            default:
              return 0;
          }
        }

        const itemLevel = getLevel(item);
        const isLegendaryShip = 'rarity' in item && item.rarity === 'LEGENDARY';

        let itemType = NFTType.ITEM;
        if (entityType === 'Crews') itemType = NFTType.CREW;
        if (entityType === 'Ships') itemType = NFTType.SHIP;

        const rarity = getLevelRarity(itemType, itemLevel, isLegendaryShip);

        // Define weights for standard rarities
        switch (rarity) {
          case 'MYTHIC':
            return 6;
          case 'LEGENDARY':
            return 5;
          case 'EPIC':
            return 4;
          case 'RARE':
            return 3;
          case 'UNCOMMON':
            return 2;
          case 'COMMON':
            return 1;
          default:
            return 0;
        }
      };

      // Apply sort based on selected option
      switch (filters.sortBy) {
        case 'level-desc':
          return getLevel(b) - getLevel(a);
        case 'level-asc':
          return getLevel(a) - getLevel(b);
        case 'rarity-desc':
          return getRarityWeight(b) - getRarityWeight(a);
        case 'rarity-asc':
          return getRarityWeight(a) - getRarityWeight(b);
        case 'strength-desc':
          return getStrength(b) - getStrength(a);
        case 'strength-asc':
          return getStrength(a) - getStrength(b);
        case 'name-asc':
          return getName(a).localeCompare(getName(b));
        case 'name-desc':
          return getName(b).localeCompare(getName(a));
        default:
          return getLevel(b) - getLevel(a); // Default to level-desc
      }
    });

    return result;
  }, [items, filters, entityType]);

  return {
    filteredItems,
  };
}
