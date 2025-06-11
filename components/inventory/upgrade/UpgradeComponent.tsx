import React, { useMemo, useState, useCallback, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNfts } from '../../../contexts/NftContext';
import { LayerContext } from '../../../contexts/LayerContext';
import { getLevelRarity } from '../../../utils/helpers';
import { CrewNFT, ShipNFT } from '../../../types/NFT';
import { NFTType } from '../../../types/BaseEntity';
import EnhancedUpgradeCard from './UpgradeCard';
import UpgradeFilters from './UpgradeFilters';
import { UpgradeFilterState } from './UpgradeFilters';

interface TabOption {
  name: string;
  type: string | string[];
}

// Tab options for filtering
const UpgradeTabOptions: TabOption[] = [
  { name: 'All', type: 'all' },
  { name: 'Captains', type: [NFTType.FM, NFTType.QM, NFTType.UNIQUE] },
  { name: 'Items', type: [NFTType.ITEM] },
  { name: 'Ships', type: [NFTType.SHIP] },
  { name: 'Crews', type: [NFTType.CREW] },
];

// Rarity sort order - normalized to lowercase for consistent comparison
const raritySortOrder = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
  'mythic',
];

// Define the extended types for our entities with additional properties
interface CommonItem {
  id: string;
  type: NFTType;
  level: number;
  imageURL: string;
  name: string;
  mint: string;
  calculatedRarity: string;
  isOnMission: boolean;
  isLegendarySpecial: boolean;
}

type ItemType = CommonItem;

const EnhancedUpgradeComponent: React.FC = () => {
  const layerContext = useContext(LayerContext);
  if (!layerContext) {
    throw new Error('UpgradeComponent must be used within a LayerProvider');
  }

  const { isMobile } = layerContext;

  // Get NFT data
  const {
    charactersInGame,
    loadedInventory,
    crewsInGame,
    shipsInGame,
    nftsOnMission,
    loading,
  } = useNfts();

  // Set up filter state with defaults matching inventory component
  const [filters, setFilters] = useState<UpgradeFilterState>({
    type: UpgradeTabOptions[0].type,
    rarity: 'all',
    sortBy: 'rarity-desc',
    search: '',
    showOnMission: false,
  });

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: UpgradeFilterState) => {
    setFilters(newFilters);
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      type: UpgradeTabOptions[0].type,
      rarity: 'all',
      sortBy: 'rarity-desc',
      search: '',
      showOnMission: false,
    });
  }, []);

  // Create common pool of all upgradeable items
  const commonPool = useMemo(() => {
    const missionNftIds = nftsOnMission.map((nft) => nft.uid);

    // Process captains
    const captains = charactersInGame.map(
      (captain) =>
        ({
          id: captain.uid || '',
          type: captain.type ? captain.type : NFTType.QM,
          level: captain.level || 1,
          imageURL: captain.metadata?.image || '/images/weapon-axe.webp',
          name: captain.metadata?.name || 'CAPTAIN',
          mint: captain.mint || '',
          calculatedRarity: 'mythic', // Captains are always mythic rarity
          isOnMission: missionNftIds.includes(captain.uid),
          isLegendarySpecial: false,
        } as CommonItem),
    );

    // Process items
    const items = loadedInventory
      .filter((item) => item.isDeposited)
      .map(
        (item) =>
          ({
            id: item.uid || '',
            type: NFTType.ITEM as const,
            calculatedRarity: getLevelRarity(
              NFTType.ITEM,
              item.level || 1,
            ).toLowerCase(),
            level: item.level || 1,
            imageURL: item.itemStats?.image || '/images/weapon-axe.webp',
            name: item.itemStats?.name || '',
            mint: item.mint || '',
            isOnMission: missionNftIds.includes(item.equippedTo?.split('/')[1]),
            isLegendarySpecial: false,
          } as CommonItem),
      );

    // Process crews
    const crews = crewsInGame
      .filter((nft): nft is CrewNFT => nft.type === 'CREW')
      .map(
        (crew) =>
          ({
            id: crew.uid || '',
            level: crew.level || 1,
            imageURL: crew.metadata?.image || '/images/weapon-axe.webp',
            name: crew.metadata?.name || 'CREW',
            mint: crew.mint || '',
            type: NFTType.CREW as const,
            calculatedRarity: getLevelRarity(
              NFTType.CREW,
              crew.level || 1,
            ).toLowerCase(),
            isOnMission: missionNftIds.includes(crew.equippedTo?.split('/')[1]),
            isLegendarySpecial: false,
          } as CommonItem),
      );

    // Process ships
    const ships = shipsInGame
      .filter((nft): nft is ShipNFT => nft.type === 'SHIP')
      .map(
        (ship) =>
          ({
            id: ship.uid || '',
            level: ship.level || 1,
            imageURL: ship.metadata?.image || '/images/weapon-axe.webp',
            name: ship.metadata?.name || ship.name || 'SHIP',
            mint: ship.mint || '',
            type: NFTType.SHIP as const,
            calculatedRarity: getLevelRarity(
              NFTType.SHIP,
              ship.level || 1,
            ).toLowerCase(),
            isOnMission: missionNftIds.includes(ship.equippedTo?.split('/')[1]),
            isLegendarySpecial: ship.rarity === 'LEGENDARY' ? true : false,
          } as CommonItem),
      );

    return [...captains, ...items, ...crews, ...ships] as ItemType[];
  }, [
    loadedInventory,
    crewsInGame,
    shipsInGame,
    nftsOnMission,
    charactersInGame,
  ]);

  // Apply filters to get filtered and sorted items
  const filteredAndSortedItems = useMemo(() => {
    // Filter by type
    const typeFiltered = commonPool.filter((item) => {
      // Check if type matches
      const typeMatches =
        filters.type === 'all' ||
        (Array.isArray(filters.type)
          ? filters.type.includes(item.type)
          : item.type === filters.type);

      return typeMatches;
    });

    // Filter by search term
    const searchFiltered = filters.search
      ? typeFiltered.filter((item) =>
          item.name.toLowerCase().includes(filters.search.toLowerCase()),
        )
      : typeFiltered;

    // Filter by rarity (skip for captains)
    const isCaptainsFilter =
      Array.isArray(filters.type) &&
      (filters.type.includes('FM') ||
        filters.type.includes('QM') ||
        filters.type.includes('UNIQUE'));

    const rarityFiltered =
      isCaptainsFilter || filters.rarity === 'all'
        ? searchFiltered
        : searchFiltered.filter(
            (item) => item.calculatedRarity.toLowerCase() === filters.rarity,
          );

    // Filter by mission status
    const missionFiltered = !filters.showOnMission
      ? rarityFiltered.filter((item) => !item.isOnMission)
      : rarityFiltered;

    // Apply sorting
    return missionFiltered.sort((a, b) => {
      // Get rarity weights for standard sorting
      const rarityA = raritySortOrder.indexOf(a.calculatedRarity.toLowerCase());
      const rarityB = raritySortOrder.indexOf(b.calculatedRarity.toLowerCase());

      // Apply sort based on option
      switch (filters.sortBy) {
        case 'rarity-desc':
          return rarityB - rarityA;
        case 'rarity-asc':
          return rarityA - rarityB;
        case 'level-desc':
          return b.level - a.level;
        case 'level-asc':
          return a.level - b.level;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return rarityB - rarityA;
      }
    });
  }, [commonPool, filters]);

  // Animation variants for smooth transitions
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        duration: 0.5,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  // Empty state content
  const renderEmptyState = () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="rounded-lg border border-white/10 bg-black/30 p-6 text-center">
        <h3 className="text-lg font-medium text-white">No items found</h3>
        <p className="mt-2 text-white/60">
          Try adjusting your filters to see more results.
        </p>
      </div>
    </div>
  );

  // Loading state content
  const renderLoadingState = () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="text-center">
        <div className="text-lg text-white/80">Loading...</div>
        <div className="mt-4 h-8 w-8 animate-spin rounded-full border-2 border-white border-r-transparent border-t-transparent"></div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full w-full flex-col items-start justify-start">
      {/* Filters section - Match the style in inventory component */}
      <div className="flex w-full flex-col gap-5 border-b border-b-reavers-border px-4 pb-4 pt-4 md:px-8">
        <UpgradeFilters
          filters={filters}
          onChange={handleFilterChange}
          resetFilters={resetFilters}
          typeOptions={UpgradeTabOptions}
        />
      </div>

      {/* Cards grid */}
      <div className="tab-content h-full w-full flex-grow overflow-y-scroll px-4 py-6 md:px-8">
        {loading ? (
          renderLoadingState()
        ) : filteredAndSortedItems.length === 0 ? (
          renderEmptyState()
        ) : (
          <AnimatePresence>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAndSortedItems.map((item) => (
                <EnhancedUpgradeCard
                  key={`${item.id}-${item.mint}`}
                  uid={item.id}
                  imageURL={item.imageURL}
                  name={item.name}
                  type={item.type}
                  level={item.level}
                  isOnMission={item.isOnMission}
                  isLegendarySpecial={item.isLegendarySpecial}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default EnhancedUpgradeComponent;
