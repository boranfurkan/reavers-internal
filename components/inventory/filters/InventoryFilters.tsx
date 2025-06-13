import React, { useState, useContext, useCallback, memo } from 'react';
import { Sheet } from 'react-modal-sheet';
import { AnimatePresence, motion } from 'framer-motion';
import { LayerContext } from '../../../contexts/LayerContext';
import { RARITY_COLORS } from '../../../utils/inventory-helpers';
import {
  FilterState,
  RarityFilter,
  SortOption,
  EquippedFilter,
  MissionFilter,
  GenesisRarityFilter,
  StandardRarityFilter,
} from '../../../hooks/inventory/useInventoryFilters';
import { ChevronUp, ChevronDown, Filter, X } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';

// Animation variants for filter expansion
const filterAnimationVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    transition: {
      height: { duration: 0.3, ease: [0.33, 1, 0.68, 1] },
      opacity: { duration: 0.2 },
    },
  },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: {
      height: { duration: 0.3, ease: [0.33, 1, 0.68, 1] },
      opacity: { duration: 0.2, delay: 0.1 },
      staggerChildren: 0.05,
    },
  },
};

// Animation variants for filter children
const filterChildrenVariants = {
  hidden: { opacity: 0, y: -5 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2 },
  },
};

// Memoized Filter Tab Component
const FilterTab = memo(
  ({
    label,
    value,
    activeValue,
    onClick,
  }: {
    label: string;
    value: string;
    activeValue: string;
    onClick: (value: string) => void;
  }) => (
    <Button
      variant={activeValue === value ? 'default' : 'outline'}
      size="sm"
      onClick={() => onClick(value)}
      className={
        activeValue === value
          ? 'bg-[#6535c9] hover:bg-[#5425b9]'
          : 'border-white/20 bg-black/20 text-white/70 hover:bg-black/30 hover:text-white'
      }>
      {label}
    </Button>
  ),
);

FilterTab.displayName = 'FilterTab';

// Memoized Rarity Badge Component
const RarityBadge = memo(
  ({
    rarity,
    isActive,
    onClick,
  }: {
    rarity: RarityFilter;
    isActive: boolean;
    onClick: () => void;
  }) => {
    const rarityKey = rarity as keyof typeof RARITY_COLORS;

    // Get style based on rarity type
    let style: React.CSSProperties = {};

    const gradient =
      RARITY_COLORS[rarityKey]?.gradient || RARITY_COLORS.COMMON.gradient;
    const border =
      RARITY_COLORS[rarityKey]?.border || RARITY_COLORS.COMMON.border;
    style = {
      background: rarity === 'ALL' ? 'rgba(0, 0, 0, 0.3)' : gradient,
      borderColor: rarity === 'ALL' ? '#9ca3af' : border,
    };

    return (
      <Badge
        variant="outline"
        className={`cursor-pointer rounded-md border px-3 py-1.5 text-xs font-bold transition-all ${
          isActive ? 'shadow-lg ring-2 ring-white/50' : 'opacity-70'
        }`}
        style={style}
        onClick={onClick}>
        {rarity}
      </Badge>
    );
  },
);

RarityBadge.displayName = 'RarityBadge';

interface InventoryFiltersProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  resetFilters: () => void;
  activeTab: string;
}

const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  filters,
  onChange,
  resetFilters,
  activeTab,
}) => {
  const [isFilterSheetOpen, setFilterSheetOpen] = useState(false);
  const [isDesktopFilterVisible, setDesktopFilterVisible] = useState(false);
  const layerContext = useContext(LayerContext);
  const { isMobile } = layerContext || { isMobile: false };

  // Get sort options based on active tab - Memoized with useCallback
  const getSortOptions = useCallback(() => {
    const commonOptions = [
      { label: 'Level (High to Low)', value: 'level-desc' },
      { label: 'Level (Low to High)', value: 'level-asc' },
      { label: 'Name (A to Z)', value: 'name-asc' },
      { label: 'Name (Z to A)', value: 'name-desc' },
    ];

    // Add strength sorting for Captains
    if (activeTab === 'Captains') {
      return [
        ...commonOptions,
        { label: 'Strength (High to Low)', value: 'strength-desc' },
        { label: 'Strength (Low to High)', value: 'strength-asc' },
      ];
    }

    // Add rarity sorting for non-Captain tabs
    if (activeTab !== 'Captains') {
      return [
        ...commonOptions,
        { label: 'Rarity (High to Low)', value: 'rarity-desc' },
        { label: 'Rarity (Low to High)', value: 'rarity-asc' },
      ];
    }

    return commonOptions;
  }, [activeTab]);

  // Get rarity filters based on active tab - Memoized with useCallback
  const getRarityFilters = useCallback(() => {
    // No rarity filters for Captains
    if (activeTab === 'Captains') {
      return [];
    }

    // Genesis Ships have their own rarity tiers
    if (activeTab === 'Genesis Ships') {
      return [
        'ALL',
        'FLEET_COMMANDER',
        'GOLD',
        'SILVER',
        'BRONZE',
      ] as GenesisRarityFilter[];
    }

    // Standard rarity tiers for other tabs
    return [
      'ALL',
      'COMMON',
      'UNCOMMON',
      'RARE',
      'EPIC',
      'LEGENDARY',
      'MYTHIC',
    ] as StandardRarityFilter[];
  }, [activeTab]);

  // Get status filters based on active tab - Memoized with useCallback
  const getStatusFilters = useCallback(() => {
    if (activeTab === 'Captains') {
      // Mission status for Captains
      return [
        { label: 'All', value: 'all' },
        { label: 'On Mission', value: 'on-mission' },
        { label: 'Not On Mission', value: 'not-on-mission' },
      ];
    } else if (activeTab !== 'Genesis Ships') {
      // Equipped status for other items except Genesis Ships
      return [
        { label: 'All', value: 'all' },
        { label: 'Equipped', value: 'equipped' },
        { label: 'Not Equipped', value: 'not-equipped' },
      ];
    }

    return [];
  }, [activeTab]);

  // Optimized filter handlers with useCallback
  const handleRarityChange = useCallback(
    (rarity: RarityFilter) => {
      onChange({ ...filters, rarity });
    },
    [onChange, filters],
  );

  const handleSortChange = useCallback(
    (sortBy: SortOption) => {
      onChange({ ...filters, sortBy });
    },
    [onChange, filters],
  );

  const handleStatusChange = useCallback(
    (status: EquippedFilter | MissionFilter) => {
      onChange({ ...filters, status });
    },
    [onChange, filters],
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...filters, search: e.target.value });
    },
    [onChange, filters],
  );

  const toggleDesktopFilters = useCallback(() => {
    setDesktopFilterVisible((prev) => !prev);
  }, []);

  // Memoized Filter Rendering Components
  const sortOptions = getSortOptions();
  const rarityFilters = getRarityFilters();
  const statusFilters = getStatusFilters();

  // Render status filters
  const renderStatusFilters = useCallback(() => {
    if (statusFilters.length === 0) return null;

    return (
      <motion.div
        variants={filterChildrenVariants}
        className="flex items-center space-x-2">
        <span className="w-16 whitespace-nowrap text-xs text-white/70">
          Status:
        </span>
        <div className="flex space-x-2">
          {statusFilters.map((filter) => (
            <FilterTab
              key={filter.value}
              label={filter.label}
              value={filter.value}
              activeValue={filters.status}
              onClick={(value) =>
                handleStatusChange(value as EquippedFilter | MissionFilter)
              }
            />
          ))}
        </div>
      </motion.div>
    );
  }, [statusFilters, filters.status, handleStatusChange]);

  // Render rarity filters
  const renderRarityFilters = useCallback(() => {
    if (rarityFilters.length === 0) return null;

    return (
      <motion.div
        variants={filterChildrenVariants}
        className="col-span-1 flex items-center space-x-2 lg:col-span-2">
        <span className="w-16 whitespace-nowrap text-xs text-white/70">
          Rarity:
        </span>
        <div className="flex flex-wrap gap-2">
          {rarityFilters.map((rarity) => (
            <RarityBadge
              key={rarity}
              rarity={rarity}
              isActive={filters.rarity === rarity}
              onClick={() => handleRarityChange(rarity)}
            />
          ))}
        </div>
      </motion.div>
    );
  }, [rarityFilters, filters.rarity, handleRarityChange]);

  // Mobile filter sheet custom styling
  const sheetStyle = {
    background: 'rgba(0, 0, 0, 0.95)',
    color: 'white',
    borderRadius: '12px 12px 0 0',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    maxHeight: '90vh',
  };

  // Render desktop filters with enhanced animation
  const renderDesktopFilters = useCallback(
    () => (
      <div className="w-full">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDesktopFilters}
            className="bg-white/20 text-white/70 transition-all duration-200 ease-in hover:bg-[#5425b9] hover:text-white">
            <Filter className="mr-2 h-4 w-4" />
            Filters & Sort
            {isDesktopFilterVisible ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4" />
            )}
          </Button>

          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search..."
              value={filters.search}
              onChange={handleSearchChange}
              className="h-8 w-48 border-white/20 bg-black/30 text-white placeholder:text-white/50"
            />

            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="h-8 border-white/20 bg-black/30 text-white/80 hover:bg-black/50 hover:text-white">
              <X className="mr-1 h-3 w-3" /> Reset
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isDesktopFilterVisible && (
            <motion.div
              variants={filterAnimationVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="overflow-hidden">
              <motion.div className="grid grid-cols-1 gap-4 py-4 lg:grid-cols-2">
                {/* Sort options */}
                <motion.div
                  variants={filterChildrenVariants}
                  className="flex items-center space-x-3">
                  <span className="w-16 whitespace-nowrap text-xs text-white/70">
                    Sort by:
                  </span>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) =>
                      handleSortChange(value as SortOption)
                    }>
                    <SelectTrigger className="h-8 border-white/20 bg-black/30 text-white">
                      <SelectValue placeholder="Select sort" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999] border-white/20 bg-black text-white">
                      {sortOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="hover:!bg-[#5425b9] focus:!bg-[#5425b9] active:!bg-[#5425b9]">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                {/* Status filters */}
                {renderStatusFilters()}

                {/* Rarity filters */}
                {renderRarityFilters()}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    ),
    [
      isDesktopFilterVisible,
      filters,
      toggleDesktopFilters,
      handleSearchChange,
      resetFilters,
      handleSortChange,
      sortOptions,
      renderStatusFilters,
      renderRarityFilters,
    ],
  );

  // Mobile filter sheet content
  const renderMobileSheetContent = useCallback(() => {
    return (
      <Sheet
        isOpen={isFilterSheetOpen && isMobile}
        onClose={() => setFilterSheetOpen(false)}
        detent="content-height">
        <Sheet.Container style={sheetStyle}>
          <Sheet.Header>
            <div className="flex items-center justify-between px-4 py-3">
              <h3 className="text-sm font-medium text-white">Filters & Sort</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-xs text-[#6535c9]">
                Reset All
              </Button>
            </div>
          </Sheet.Header>
          <Sheet.Content>
            <div className="px-4 pb-8">
              {/* Search */}
              <div className="mb-4">
                <label className="mb-1 block text-xs font-medium text-white/70">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={filters.search}
                  onChange={handleSearchChange}
                  className="w-full rounded-md border border-white/20 bg-black/30 px-3 py-2 text-sm text-white placeholder-white/50"
                />
              </div>

              {/* Sort options */}
              <div className="mb-4">
                <label className="mb-1 block text-xs font-medium text-white/70">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    handleSortChange(e.target.value as SortOption)
                  }
                  className="w-full rounded-md border border-white/20 bg-black/30 px-3 py-2 text-sm text-white">
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status filters */}
              {statusFilters.length > 0 && (
                <div className="mb-4">
                  <label className="mb-1 block text-xs font-medium text-white/70">
                    Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {statusFilters.map((filter) => (
                      <button
                        key={filter.value}
                        className={`rounded-md border px-3 py-2 text-sm ${
                          filters.status === filter.value
                            ? 'border-[#6535c9] bg-[#6535c9]/20 text-white'
                            : 'border-white/20 bg-black/30 text-white/70'
                        }`}
                        onClick={() =>
                          handleStatusChange(
                            filter.value as EquippedFilter | MissionFilter,
                          )
                        }>
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Rarity filters */}
              {rarityFilters.length > 0 && (
                <div className="mb-4">
                  <label className="mb-1 block text-xs font-medium text-white/70">
                    Rarity
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {rarityFilters.map((rarity) => {
                      // Get style for rarity badge
                      let style: React.CSSProperties = {};

                      const rarityKey = rarity as keyof typeof RARITY_COLORS;
                      const gradient =
                        RARITY_COLORS[rarityKey]?.gradient ||
                        RARITY_COLORS.COMMON.gradient;
                      const border =
                        RARITY_COLORS[rarityKey]?.border ||
                        RARITY_COLORS.COMMON.border;

                      style = {
                        background:
                          rarity === 'ALL' ? 'rgba(0, 0, 0, 0.3)' : gradient,
                        borderColor: rarity === 'ALL' ? '#9ca3af' : border,
                      };

                      return (
                        <div
                          key={rarity}
                          className={`cursor-pointer rounded-md border px-2 py-1.5 text-center text-sm font-medium ${
                            filters.rarity === rarity
                              ? 'ring-2 ring-white/20'
                              : 'opacity-70'
                          }`}
                          style={style}
                          onClick={() => handleRarityChange(rarity)}>
                          {rarity}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Apply button */}
              <button
                className="mt-2 w-full rounded-md bg-[#6535c9] py-3 text-sm font-medium text-white hover:bg-[#5425b9]"
                onClick={() => setFilterSheetOpen(false)}>
                Apply Filters
              </button>
            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop onTap={() => setFilterSheetOpen(false)} />
      </Sheet>
    );
  }, [
    isFilterSheetOpen,
    isMobile,
    filters,
    sortOptions,
    statusFilters,
    rarityFilters,
    handleSearchChange,
    handleSortChange,
    handleStatusChange,
    handleRarityChange,
    resetFilters,
  ]);

  // Main component render
  return (
    <>
      {/* Desktop filters */}
      {!isMobile && renderDesktopFilters()}

      {/* Mobile filter button */}
      {isMobile && (
        <Button
          size="sm"
          onClick={() => setFilterSheetOpen(true)}
          className="w-full bg-[#6535c9] hover:bg-[#5425b9]">
          <Filter className="mr-2 h-4 w-4" />
          Filters & Sort
        </Button>
      )}

      {/* Mobile filter sheet */}
      {renderMobileSheetContent()}
    </>
  );
};

export default memo(InventoryFilters);
