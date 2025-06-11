import React, { useState, useContext, useCallback, memo } from 'react';
import { Sheet } from 'react-modal-sheet';
import { motion, AnimatePresence } from 'framer-motion';
import { LayerContext } from '../../../contexts/LayerContext';
import { RARITY_COLORS } from '../../../utils/inventory-helpers';
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
import { Switch } from '../../../components/ui/switch';
import { Label } from '../../../components/ui/label';

// Type definitions
type UpgradeRarityFilter =
  | 'all'
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic';

type UpgradeSortOption =
  | 'rarity-desc'
  | 'rarity-asc'
  | 'level-desc'
  | 'level-asc'
  | 'name-asc'
  | 'name-desc';

export interface UpgradeFilterState {
  type: string | string[]; // Can be a single type or array of types
  rarity: UpgradeRarityFilter;
  sortBy: UpgradeSortOption;
  search: string;
  showOnMission: boolean;
}

interface UpgradeFiltersProps {
  filters: UpgradeFilterState;
  onChange: (newFilters: UpgradeFilterState) => void;
  resetFilters: () => void;
  typeOptions: Array<{ name: string; type: string | string[] }>;
}

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

// Memoized RarityBadge component
const RarityBadge = memo(
  ({
    rarity,
    isActive,
    onClick,
  }: {
    rarity: UpgradeRarityFilter;
    isActive: boolean;
    onClick: () => void;
  }) => {
    // Function to get rarity style based on rarity type
    const getRarityStyle = () => {
      // Handle standard rarities
      if (rarity === 'all') {
        return {
          background: 'rgba(0, 0, 0, 0.3)',
          borderColor: '#9ca3af',
        };
      } else {
        const rarityKey = rarity.toUpperCase() as keyof typeof RARITY_COLORS;
        return {
          background:
            RARITY_COLORS[rarityKey]?.gradient || RARITY_COLORS.COMMON.gradient,
          borderColor:
            RARITY_COLORS[rarityKey]?.border || RARITY_COLORS.COMMON.border,
        };
      }
    };

    const style = getRarityStyle();

    return (
      <Badge
        variant="outline"
        className={`cursor-pointer rounded-md border px-3 py-1.5 text-xs font-bold capitalize transition-all ${
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

// Type filter tab component
const TypeFilterTab = memo(
  ({
    option,
    isActive,
    onClick,
  }: {
    option: { name: string; type: string | string[] };
    isActive: boolean;
    onClick: () => void;
    isMobile?: boolean;
  }) => (
    <div
      onClick={onClick}
      className={`flex h-full cursor-pointer flex-row items-center justify-center border-b-2 border-b-white ${
        isActive
          ? 'active-tab-class border-opacity-80 font-medium'
          : 'inactive-tab-class border-opacity-0 font-thin opacity-50 hover:opacity-100'
      }`}>
      <span className="text-[10px] uppercase">{option.name}</span>
    </div>
  ),
);

TypeFilterTab.displayName = 'TypeFilterTab';

const UpgradeFilters: React.FC<UpgradeFiltersProps> = ({
  filters,
  onChange,
  resetFilters,
  typeOptions,
}) => {
  const [isFilterSheetOpen, setFilterSheetOpen] = useState(false);
  const [isDesktopFilterVisible, setDesktopFilterVisible] = useState(false);
  const layerContext = useContext(LayerContext);
  const { isMobile } = layerContext || { isMobile: false };

  // Get sort options
  const sortOptions = [
    { label: 'Rarity (High to Low)', value: 'rarity-desc' },
    { label: 'Rarity (Low to High)', value: 'rarity-asc' },
    { label: 'Level (High to Low)', value: 'level-desc' },
    { label: 'Level (Low to High)', value: 'level-asc' },
    { label: 'Name (A to Z)', value: 'name-asc' },
    { label: 'Name (Z to A)', value: 'name-desc' },
  ];

  // Get the active entity type
  const isCapatinsActive =
    Array.isArray(filters.type) &&
    (filters.type.includes('FM') ||
      filters.type.includes('QM') ||
      filters.type.includes('UNIQUE'));

  // Get appropriate rarity filter options based on active entity type
  const getRarityOptions = useCallback(() => {
    if (isCapatinsActive) {
      // No rarity options for captains
      return [];
    } else {
      // Standard rarities for other entities
      return [
        { title: 'All Rarities', value: 'all' },
        { title: 'Common', value: 'common' },
        { title: 'Uncommon', value: 'uncommon' },
        { title: 'Rare', value: 'rare' },
        { title: 'Epic', value: 'epic' },
        { title: 'Legendary', value: 'legendary' },
        { title: 'Mythic', value: 'mythic' },
      ];
    }
  }, [isCapatinsActive]);

  // Optimized filter handlers with useCallback
  const handleTypeChange = useCallback(
    (type: string | string[]) => {
      // Reset rarity when changing type
      onChange({
        ...filters,
        type,
        // Reset rarity when switching between entity types
        rarity: 'all',
      });
    },
    [onChange, filters],
  );

  const handleRarityChange = useCallback(
    (rarity: UpgradeRarityFilter) => {
      onChange({ ...filters, rarity });
    },
    [onChange, filters],
  );

  const handleSortChange = useCallback(
    (sortBy: UpgradeSortOption) => {
      onChange({ ...filters, sortBy });
    },
    [onChange, filters],
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...filters, search: e.target.value });
    },
    [onChange, filters],
  );

  const handleShowOnMissionChange = useCallback(
    (checked: boolean) => {
      onChange({ ...filters, showOnMission: checked });
    },
    [onChange, filters],
  );

  const toggleDesktopFilters = useCallback(() => {
    setDesktopFilterVisible((prev) => !prev);
  }, []);

  // Is type active check
  const isTypeActive = useCallback(
    (type: string | string[]) => {
      if (type === 'all' && filters.type === 'all') return true;
      if (Array.isArray(type) && Array.isArray(filters.type)) {
        return JSON.stringify(type) === JSON.stringify(filters.type);
      }
      return type === filters.type;
    },
    [filters.type],
  );

  // Render tabs
  const renderTypeFilters = useCallback(
    () => (
      <div className="flex h-6 w-full flex-row items-center gap-8 overflow-x-scroll">
        {typeOptions.map((option) => (
          <TypeFilterTab
            key={option.name}
            option={option}
            isActive={isTypeActive(option.type)}
            onClick={() => handleTypeChange(option.type)}
          />
        ))}
      </div>
    ),
    [typeOptions, isTypeActive, handleTypeChange],
  );

  // Render rarity filters
  const renderRarityFilters = useCallback(() => {
    const rarityOptions = getRarityOptions();

    // Don't render if there are no options (e.g., for captains)
    if (rarityOptions.length === 0) {
      return null;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {rarityOptions.map((rarity) => (
          <RarityBadge
            key={rarity.value}
            rarity={rarity.value as UpgradeRarityFilter}
            isActive={filters.rarity === rarity.value}
            onClick={() =>
              handleRarityChange(rarity.value as UpgradeRarityFilter)
            }
          />
        ))}
      </div>
    );
  }, [filters.rarity, handleRarityChange, getRarityOptions]);

  // Mobile filter sheet custom styling
  const sheetStyle = {
    background: 'rgba(0, 0, 0, 0.95)',
    color: 'white',
    borderRadius: '12px 12px 0 0',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    maxHeight: '90vh',
  };

  // Render desktop filters
  const renderDesktopFilters = useCallback(
    () => (
      <div className="w-full">
        <div className="mb-4 flex items-center justify-between">
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
                      handleSortChange(value as UpgradeSortOption)
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

                {/* Mission toggle */}
                <motion.div
                  variants={filterChildrenVariants}
                  className="flex items-center gap-2">
                  <span className="w-16 whitespace-nowrap text-xs text-white/70">
                    Status:
                  </span>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={filters.showOnMission}
                      onCheckedChange={handleShowOnMissionChange}
                      className="data-[state=checked]:bg-[#6535c9]"
                    />
                    <Label className="text-xs text-white">
                      Show Items on Mission
                    </Label>
                  </div>
                </motion.div>

                {/* Rarity filters - only show if applicable */}
                {!isCapatinsActive && (
                  <motion.div
                    variants={filterChildrenVariants}
                    className="col-span-1 flex items-center space-x-2 lg:col-span-2">
                    <span className="w-16 whitespace-nowrap text-xs text-white/70">
                      Rarity:
                    </span>
                    {renderRarityFilters()}
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    ),
    [
      filters,
      isDesktopFilterVisible,
      toggleDesktopFilters,
      handleSearchChange,
      resetFilters,
      handleSortChange,
      handleShowOnMissionChange,
      renderRarityFilters,
      isCapatinsActive,
    ],
  );

  return (
    <>
      {/* Tab filters styled like inventory tabs */}
      <div className="w-full">{renderTypeFilters()}</div>

      {/* Desktop filters */}
      {!isMobile && renderDesktopFilters()}

      {/* Mobile filter button */}
      {isMobile && (
        <Button
          size="sm"
          onClick={() => setFilterSheetOpen(true)}
          className="my-3 w-full bg-[#6535c9] hover:bg-[#5425b9]">
          <Filter className="mr-2 h-4 w-4" />
          Filters & Sort
        </Button>
      )}

      {/* Mobile filter sheet */}
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

              {/* Type filters - now shown in mobile sheet as well */}
              <div className="mb-4">
                <label className="mb-1 block text-xs font-medium text-white/70">
                  Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {typeOptions.map((option) => (
                    <button
                      key={option.name}
                      className={`rounded-md border px-3 py-2 text-sm ${
                        isTypeActive(option.type)
                          ? 'border-[#6535c9] bg-[#6535c9]/20 text-white'
                          : 'border-white/20 bg-black/30 text-white/70'
                      }`}
                      onClick={() => handleTypeChange(option.type)}>
                      {option.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort options */}
              <div className="mb-4">
                <label className="mb-1 block text-xs font-medium text-white/70">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    handleSortChange(e.target.value as UpgradeSortOption)
                  }
                  className="w-full rounded-md border border-white/20 bg-black/30 px-3 py-2 text-sm text-white">
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rarity filters - only show if applicable */}
              {!isCapatinsActive && getRarityOptions().length > 0 && (
                <div className="mb-4">
                  <label className="mb-1 block text-xs font-medium text-white/70">
                    Rarity
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {getRarityOptions().map((rarity) => {
                      // Get style for rarity badge
                      let style: React.CSSProperties = {};

                      if (rarity.value === 'all') {
                        style = {
                          background: 'rgba(0, 0, 0, 0.3)',
                          borderColor: '#9ca3af',
                        };
                      } else {
                        const rarityKey =
                          rarity.value.toUpperCase() as keyof typeof RARITY_COLORS;
                        style = {
                          background:
                            RARITY_COLORS[rarityKey]?.gradient ||
                            RARITY_COLORS.COMMON.gradient,
                          borderColor:
                            RARITY_COLORS[rarityKey]?.border ||
                            RARITY_COLORS.COMMON.border,
                        };
                      }

                      return (
                        <div
                          key={rarity.value}
                          className={`cursor-pointer rounded-md border px-2 py-1.5 text-center text-sm font-medium capitalize ${
                            filters.rarity === rarity.value
                              ? 'ring-2 ring-white/20'
                              : 'opacity-70'
                          }`}
                          style={style}
                          onClick={() =>
                            handleRarityChange(
                              rarity.value as UpgradeRarityFilter,
                            )
                          }>
                          {rarity.title}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mission toggle */}
              <div className="mb-4 flex items-center justify-between">
                <label className="text-sm font-medium text-white">
                  Show Items on Mission
                </label>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={filters.showOnMission}
                    onChange={(e) =>
                      handleShowOnMissionChange(e.target.checked)
                    }
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#6535c9] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                </label>
              </div>

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
    </>
  );
};

export default memo(UpgradeFilters);
