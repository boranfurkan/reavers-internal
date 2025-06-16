import React, { useContext, useState } from 'react';
import Reavers from './inventory/reavers/Reavers';
import { LayerContext } from '../../contexts/LayerContext';
import { useNfts } from '../../contexts/NftContext';
import {
  useInventoryFilters,
  FilterState,
  defaultFilters,
} from '../../hooks/inventory/useInventoryFilters';
import InventoryFilters from './filters/InventoryFilters';

import { CharacterNFT } from '../../types/NFT';
import InventoryStatistics from './inventory/InventoryStatistics';

function EnhancedInventoryTabComponent() {
  const layerContext = useContext(LayerContext);

  if (!layerContext) {
    throw new Error('InventoryTab must be used within a LayerProvider');
  }

  const { isMobile } = layerContext;
  const { charactersInGame } = useNfts();

  // Create filter state for captains
  const [captainsFilters, setCaptainsFilters] = useState<FilterState>({
    ...defaultFilters,
    sortBy: 'strength-desc', // Default sort for captains is by strength
  });

  // Filter captains
  const { filteredItems: filteredCaptains } = useInventoryFilters(
    charactersInGame,
    'Captains',
    captainsFilters,
  );

  // Reset filters function
  const resetFilters = () => {
    setCaptainsFilters({
      ...defaultFilters,
      sortBy: 'strength-desc', // Maintain default sort by strength for captains
    });
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      {/* Statistics Section - now expandable and compact */}
      <div className="mb-3 w-full px-4 pt-2 md:px-8 md:pt-3">
        <InventoryStatistics />
      </div>

      {/* Mobile Filters */}
      {isMobile && (
        <div className="mx-auto w-2/3 py-1.5">
          <InventoryFilters
            filters={captainsFilters}
            onChange={setCaptainsFilters}
            resetFilters={resetFilters}
            activeTab="Captains"
          />
        </div>
      )}

      {/* Desktop Filters */}
      {!isMobile && (
        <div className="w-full px-4 pb-2 pt-0 md:px-8 md:pb-4">
          <InventoryFilters
            filters={captainsFilters}
            onChange={setCaptainsFilters}
            resetFilters={resetFilters}
            activeTab="Captains"
          />
        </div>
      )}

      {/* Captains Grid */}
      <div className="tab-content h-full w-full flex-grow overflow-y-scroll border-t border-t-reavers-border px-2 md:px-8">
        <Reavers filteredCharacters={filteredCaptains as CharacterNFT[]} />
      </div>
    </div>
  );
}

export default EnhancedInventoryTabComponent;
