import React, {
  useState,
  useContext,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { Search, Filter, X, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet } from 'react-modal-sheet';
import { Badge } from '../../../components/ui/badge';
import { LayerContext } from '../../../contexts/LayerContext';
import {
  FilterState,
  SortOption,
  RarityFilter,
} from '../../../hooks/inventory/useInventoryFilters';
import { GenesisShipRarity } from '../../../types/Genesis';

// Rarity color mapping
const RARITY_COLORS = {
  COMMON: {
    gradient: 'linear-gradient(135deg, #6b7280, #9ca3af)',
    border: '#9ca3af',
  },
  UNCOMMON: {
    gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
    border: '#22c55e',
  },
  RARE: {
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    border: '#3b82f6',
  },
  EPIC: {
    gradient: 'linear-gradient(135deg, #a855f7, #9333ea)',
    border: '#a855f7',
  },
  LEGENDARY: {
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    border: '#f59e0b',
  },
  MYTHIC: {
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
    border: '#ef4444',
  },
  FLEET_COMMANDER: {
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    border: '#8b5cf6',
  },
  GOLD: {
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    border: '#f59e0b',
  },
  SILVER: {
    gradient: 'linear-gradient(135deg, #6b7280, #4b5563)',
    border: '#6b7280',
  },
  BRONZE: {
    gradient: 'linear-gradient(135deg, #d97706, #b45309)',
    border: '#d97706',
  },
};

// Custom Dropdown Component
interface DropdownOption {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  options,
  onChange,
  placeholder = 'Select option',
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {label && (
        <label className="mb-2 block text-sm font-medium text-white/70">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-md border border-reavers-border bg-reavers-bg px-3 py-2 text-sm text-white transition-colors hover:border-reavers-fill focus:border-reavers-fill focus:outline-none">
        <span className={selectedOption ? 'text-white' : 'text-white/50'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-[9999] mt-1 rounded-md border border-reavers-border bg-reavers-bg-secondary shadow-2xl backdrop-blur-sm"
            style={{
              boxShadow:
                '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
            }}>
            <div className="max-h-60 overflow-y-auto py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionClick(option.value)}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm text-white transition-colors hover:bg-reavers-fill/20 focus:bg-reavers-fill/20 focus:outline-none">
                  <span>{option.label}</span>
                  {value === option.value && (
                    <Check className="h-4 w-4 text-reavers-fill" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Memoized rarity badge component
const RarityBadge = React.memo(
  ({
    rarity,
    isActive,
    onClick,
  }: {
    rarity: string;
    isActive: boolean;
    onClick: () => void;
  }) => {
    const { gradient, border } =
      RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] ||
      RARITY_COLORS.COMMON;

    const style = {
      background: rarity === 'ALL' ? 'rgba(0, 0, 0, 0.3)' : gradient,
      borderColor: rarity === 'ALL' ? '#9ca3af' : border,
    };

    return (
      <Badge
        variant="outline"
        className={`cursor-pointer rounded-md border px-3 py-1.5 text-xs font-bold transition-all hover:scale-105 ${
          isActive
            ? 'shadow-lg ring-2 ring-white/50'
            : 'opacity-70 hover:opacity-100'
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

  // Sort options with proper dependencies
  const sortOptions = useMemo(() => {
    const commonOptions = [
      { label: 'Level (High to Low)', value: 'level-desc' },
      { label: 'Level (Low to High)', value: 'level-asc' },
      { label: 'Name (A to Z)', value: 'name-asc' },
      { label: 'Name (Z to A)', value: 'name-desc' },
    ];

    if (activeTab === 'Captains') {
      return [
        ...commonOptions,
        { label: 'Strength (High to Low)', value: 'strength-desc' },
        { label: 'Strength (Low to High)', value: 'strength-asc' },
        { label: 'Ship Level (High to Low)', value: 'ship-level-desc' },
        { label: 'Ship Level (Low to High)', value: 'ship-level-asc' },
        { label: 'Crew Level (High to Low)', value: 'crew-level-desc' },
        { label: 'Crew Level (Low to High)', value: 'crew-level-asc' },
        { label: 'Item Level (High to Low)', value: 'item-level-desc' },
        { label: 'Item Level (Low to High)', value: 'item-level-asc' },
      ];
    }

    if (activeTab !== 'Captains') {
      return [
        ...commonOptions,
        { label: 'Rarity (High to Low)', value: 'rarity-desc' },
        { label: 'Rarity (Low to High)', value: 'rarity-asc' },
      ];
    }

    return commonOptions;
  }, [activeTab]);

  // Rarity options
  const rarityOptions = useMemo(() => {
    if (activeTab === 'Genesis Ships') {
      return ['ALL', 'FLEET_COMMANDER', 'GOLD', 'SILVER', 'BRONZE'];
    }
    return ['ALL', 'COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'];
  }, [activeTab]);

  // Status options
  const statusOptions = useMemo(() => {
    if (activeTab === 'Captains') {
      return [
        { label: 'All', value: 'all' },
        { label: 'On Mission', value: 'on-mission' },
        { label: 'Not On Mission', value: 'not-on-mission' },
      ];
    } else if (activeTab === 'Genesis Ships') {
      return [{ label: 'All', value: 'all' }];
    } else {
      return [
        { label: 'All', value: 'all' },
        { label: 'Equipped', value: 'equipped' },
        { label: 'Not Equipped', value: 'not-equipped' },
      ];
    }
  }, [activeTab]);

  // Event handlers
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...filters, search: e.target.value });
    },
    [filters, onChange],
  );

  const handleSortChange = useCallback(
    (value: string) => {
      onChange({ ...filters, sortBy: value as SortOption });
    },
    [filters, onChange],
  );

  const handleRarityChange = useCallback(
    (rarity: RarityFilter) => {
      onChange({ ...filters, rarity });
    },
    [filters, onChange],
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      onChange({ ...filters, status: value as any });
    },
    [filters, onChange],
  );

  const clearSearch = useCallback(() => {
    onChange({ ...filters, search: '' });
  }, [filters, onChange]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== '' ||
      filters.rarity !== 'ALL' ||
      filters.status !== 'all' ||
      filters.sortBy !== 'level-desc'
    );
  }, [filters]);

  const toggleDesktopFilters = useCallback(() => {
    setDesktopFilterVisible((prev) => !prev);
  }, []);

  const openMobileFilters = useCallback(() => {
    setFilterSheetOpen(true);
  }, []);

  const closeMobileFilters = useCallback(() => {
    setFilterSheetOpen(false);
  }, []);

  const resetAndCloseFilters = useCallback(() => {
    resetFilters();
    setFilterSheetOpen(false);
  }, [resetFilters]);

  return (
    <div className="space-y-4">
      {/* Main Filter Controls */}
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            placeholder={`Search ${activeTab.toLowerCase()}...`}
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full rounded-md border border-reavers-border bg-reavers-bg py-2 pl-10 pr-4 text-sm text-white placeholder-white/50 transition-colors focus:border-reavers-fill focus:outline-none"
          />
          {filters.search && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 transition-colors hover:text-white">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          {/* Active filters indicator */}
          {hasActiveFilters && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-full bg-reavers-fill px-2 py-1 text-xs font-medium text-white">
              {
                [
                  filters.search && 'Search',
                  filters.rarity !== 'ALL' && 'Rarity',
                  filters.status !== 'all' && 'Status',
                  filters.sortBy !== 'level-desc' && 'Sort',
                ].filter(Boolean).length
              }{' '}
              active
            </motion.span>
          )}

          {/* Filter button */}
          <button
            onClick={isMobile ? openMobileFilters : toggleDesktopFilters}
            className="flex items-center gap-2 rounded-md border border-reavers-border bg-reavers-bg px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-reavers-fill/20">
            <Filter className="h-4 w-4" />
            Filters
            {!isMobile && (
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isDesktopFilterVisible ? 'rotate-180' : ''
                }`}
              />
            )}
          </button>
        </div>
      </div>

      {/* Desktop filters */}
      {!isMobile && (
        <AnimatePresence>
          {isDesktopFilterVisible && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-visible">
              <div className="mt-4 space-y-4 rounded-lg border border-reavers-border bg-reavers-bg-secondary p-4">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  {/* Sort */}
                  <CustomDropdown
                    label="Sort By"
                    value={filters.sortBy}
                    options={sortOptions}
                    onChange={handleSortChange}
                    placeholder="Select sorting option"
                  />

                  {/* Status */}
                  <CustomDropdown
                    label={
                      activeTab === 'Captains'
                        ? 'Mission Status'
                        : 'Equipment Status'
                    }
                    value={filters.status}
                    options={statusOptions}
                    onChange={handleStatusChange}
                    placeholder="Select status"
                  />

                  {/* Reset */}
                  <div className="flex items-end">
                    <button
                      onClick={resetFilters}
                      disabled={!hasActiveFilters}
                      className="w-full rounded-md border border-reavers-border bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-reavers-fill/20 disabled:cursor-not-allowed disabled:opacity-50">
                      Reset Filters
                    </button>
                  </div>
                </div>

                {/* Rarity filters - Don't show for Captains tab */}
                {activeTab !== 'Captains' && (
                  <div>
                    <label className="mb-3 block text-sm font-medium text-white/70">
                      Rarity
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {rarityOptions.map((rarity) => (
                        <RarityBadge
                          key={rarity}
                          rarity={rarity}
                          isActive={filters.rarity === rarity}
                          onClick={() =>
                            handleRarityChange(rarity as RarityFilter)
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Mobile filter sheet */}
      {isMobile && (
        <Sheet isOpen={isFilterSheetOpen} onClose={closeMobileFilters}>
          <Sheet.Backdrop className="bg-black/60 backdrop-blur-sm" />
          <Sheet.Container>
            <Sheet.Header className="border-b border-reavers-border bg-reavers-bg-secondary">
              <div className="flex items-center justify-between p-4">
                <h3 className="text-lg font-semibold text-white">
                  Filter & Sort
                </h3>
                <button
                  onClick={closeMobileFilters}
                  className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </Sheet.Header>

            <div className="space-y-6 bg-reavers-bg p-4">
              {/* Sort */}
              <CustomDropdown
                label="Sort By"
                value={filters.sortBy}
                options={sortOptions}
                onChange={handleSortChange}
                placeholder="Select sorting option"
              />

              {/* Status */}
              <CustomDropdown
                label={
                  activeTab === 'Captains'
                    ? 'Mission Status'
                    : 'Equipment Status'
                }
                value={filters.status}
                options={statusOptions}
                onChange={handleStatusChange}
                placeholder="Select status"
              />

              {/* Rarity - Don't show for Captains tab */}
              {activeTab !== 'Captains' && (
                <div>
                  <label className="mb-3 block text-sm font-medium text-white/70">
                    Rarity
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {rarityOptions.map((rarity) => (
                      <RarityBadge
                        key={rarity}
                        rarity={rarity}
                        isActive={filters.rarity === rarity}
                        onClick={() =>
                          handleRarityChange(rarity as RarityFilter)
                        }
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Reset button */}
              <button
                onClick={resetAndCloseFilters}
                disabled={!hasActiveFilters}
                className="w-full rounded-md border border-reavers-border bg-transparent px-4 py-3 font-medium text-white transition-colors hover:bg-reavers-fill/20 disabled:cursor-not-allowed disabled:opacity-50">
                Reset All Filters
              </button>
            </div>
          </Sheet.Container>
        </Sheet>
      )}
    </div>
  );
};

export default InventoryFilters;
