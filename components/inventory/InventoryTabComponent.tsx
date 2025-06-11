import React, { useContext, useEffect, useState, useMemo } from 'react';
import Reavers from './inventory/reavers/Reavers';
import { LayerContext } from '../../contexts/LayerContext';
import { toast } from 'sonner';
import { config } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import { Spin } from 'antd';
import { useUser } from '../../contexts/UserContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import { mutate } from 'swr';
import Crews from './inventory/crews/Crews';
import Ships from './inventory/ships/Ships';

import Items from './inventory/items/Items';

import { useNfts } from '../../contexts/NftContext';
import {
  useInventoryFilters,
  FilterState,
  defaultFilters,
} from '../../hooks/inventory/useInventoryFilters';
import InventoryFilters from './filters/InventoryFilters';
import { CharacterNFT, CrewNFT, ShipNFT } from '../../types/NFT';
import { ItemData } from '../../lib/types';
import { Button } from '../../components/ui/button';
import { GenesisShip } from '../../types/Genesis';

function EnhancedInventoryTabComponent() {
  const layerContext = useContext(LayerContext);

  if (!layerContext) {
    throw new Error('InventoryTab must be used within a LayerProvider');
  }

  const { inventoryTabs, activeInventoryTab, toggleInventoryTab, isMobile } =
    layerContext;
  const {
    charactersInGame,
    crewsInGame,
    shipsInGame,
    genesisShips,
    itemsInGame,
  } = useNfts();

  // For loading state
  const [isLoading, setIsLoading] = useState(false);
  const [jobId, setJobId] = useState('');

  const auth = useAuth();
  const { user } = useUser();
  const { notifications } = useContext(NotificationContext);

  // Create separate filter states for each inventory type
  const [captainsFilters, setCaptainsFilters] = useState<FilterState>({
    ...defaultFilters,
    sortBy: 'strength-desc', // Default sort for captains is by strength
  });
  const [crewsFilters, setCrewsFilters] = useState<FilterState>(defaultFilters);
  const [shipsFilters, setShipsFilters] = useState<FilterState>(defaultFilters);
  const [genesisShipsFilters, setGenesisShipsFilters] =
    useState<FilterState>(defaultFilters);
  const [itemsFilters, setItemsFilters] = useState<FilterState>(defaultFilters);

  // Call hooks at the top level for all entity types
  const { filteredItems: filteredCaptains } = useInventoryFilters(
    charactersInGame,
    'Captains',
    captainsFilters,
  );
  const { filteredItems: filteredCrews } = useInventoryFilters(
    crewsInGame,
    'Crews',
    crewsFilters,
  );
  const { filteredItems: filteredShips } = useInventoryFilters(
    shipsInGame,
    'Ships',
    shipsFilters,
  );

  const { filteredItems: filteredItems } = useInventoryFilters(
    itemsInGame,
    'Items',
    itemsFilters,
  );

  // Get the current active filters and setter based on the active tab
  const getCurrentFilters = useMemo(() => {
    switch (activeInventoryTab.name) {
      case 'Captains':
        return {
          filters: captainsFilters,
          setFilters: setCaptainsFilters,
          resetFilters: () =>
            setCaptainsFilters({
              ...defaultFilters,
              sortBy: 'strength-desc', // Maintain default sort by strength for captains
            }),
        };
      case 'Crews':
        return {
          filters: crewsFilters,
          setFilters: setCrewsFilters,
          resetFilters: () => setCrewsFilters(defaultFilters),
        };
      case 'Ships':
        return {
          filters: shipsFilters,
          setFilters: setShipsFilters,
          resetFilters: () => setShipsFilters(defaultFilters),
        };
      case 'Genesis Ships':
        return {
          filters: genesisShipsFilters,
          setFilters: setGenesisShipsFilters,
          resetFilters: () => setGenesisShipsFilters(defaultFilters),
        };
      case 'Items':
        return {
          filters: itemsFilters,
          setFilters: setItemsFilters,
          resetFilters: () => setItemsFilters(defaultFilters),
        };
      default:
        return {
          filters: defaultFilters,
          setFilters: () => {},
          resetFilters: () => {},
        };
    }
  }, [
    activeInventoryTab.name,
    captainsFilters,
    crewsFilters,
    shipsFilters,
    genesisShipsFilters,
    itemsFilters,
  ]);

  // Function to render the correct tab content with proper type casting
  const getTabContent = () => {
    switch (activeInventoryTab.name) {
      case 'Captains':
        return (
          <Reavers filteredCharacters={filteredCaptains as CharacterNFT[]} />
        );
      case 'Items':
        return <Items filteredItems={filteredItems as ItemData[]} />;
      case 'Crews':
        return <Crews filteredCrews={filteredCrews as CrewNFT[]} />;
      case 'Ships':
        return <Ships filteredShips={filteredShips as ShipNFT[]} />;
      default:
        return null;
    }
  };

  // Function to handle the auto-equip action
  const handleAutoEquip = async () => {
    setIsLoading(true);
    try {
      const idToken = auth.jwtToken;

      const response = await fetch(
        `${config.worker_server_url}/nfts/handleAutoEquip`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
        },
      );

      const responseBody = await response.json();

      if (response.status !== 200) {
        throw new Error(
          responseBody.error || 'An error occurred, try again later',
        );
      }
      setJobId(responseBody.jobId);
      toast.success('Auto Equip in progress');
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  useEffect(() => {
    if (user?.wallet && jobId !== '') {
      const notification = notifications.find(
        (n) => n.data.id === jobId && n.type === 'handleAutoEquip',
      );

      if (notification) {
        if (notification.data.error) {
          toast.error(notification.data.message);
        } else {
          toast.success('Auto Equip successful');
        }

        mutate(`${config.worker_server_url}/users/me`);
        mutate(`${config.worker_server_url}/nfts`);
        setIsLoading(false);
        setJobId('');
      } else {
        const timeoutId = setTimeout(() => {
          mutate(`${config.worker_server_url}/users/me`);
          setIsLoading(false);
          toast('Timeout, reloading...');
          setJobId('');
        }, 50000);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [jobId, user?.wallet, notifications]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div
        className={
          'flex w-full items-center justify-center px-4 pb-4 pt-4 md:flex-row md:justify-between md:px-8' +
          (isMobile ? ' flex-col gap-2 pb-2' : ' flex-row gap-8 ')
        }>
        <div className="flex w-full flex-row items-center gap-8 overflow-x-scroll">
          {inventoryTabs.map((tab, index) => (
            <div
              key={index}
              onClick={() => !tab.disabled && toggleInventoryTab(tab.name)}
              className={`flex h-full cursor-pointer flex-row items-center justify-center gap-8 border-b-2 border-b-white ${
                activeInventoryTab.name === tab.name
                  ? 'active-tab-class border-opacity-80 font-medium'
                  : 'inactive-tab-class border-opacity-0 font-thin opacity-50 hover:opacity-100'
              } ${tab.disabled ? 'cursor-not-allowed opacity-20' : ''}`}>
              <span
                className={
                  'text-[10px] uppercase ' + (isMobile && ' !font-Header ')
                }>
                {' '}
                {tab.name}
              </span>
            </div>
          ))}
        </div>
        <div className="flex w-full items-center justify-end gap-5">
          <Button
            className="h-8 max-w-[200px] bg-[#6535c9] text-xs uppercase text-white hover:bg-[#5425b9] disabled:bg-gray-800"
            disabled={isLoading}
            onClick={handleAutoEquip}>
            {isLoading && (
              <span className="mr-2">{isLoading && <Spin size="small" />}</span>
            )}
            Auto Equip All
          </Button>
          {isMobile && (
            <InventoryFilters
              filters={getCurrentFilters.filters}
              onChange={getCurrentFilters.setFilters}
              resetFilters={getCurrentFilters.resetFilters}
              activeTab={activeInventoryTab.name}
            />
          )}
        </div>
      </div>

      {/* Add filters component */}
      {!isMobile && (
        <div className="w-full px-4 md:px-8">
          <InventoryFilters
            filters={getCurrentFilters.filters}
            onChange={getCurrentFilters.setFilters}
            resetFilters={getCurrentFilters.resetFilters}
            activeTab={activeInventoryTab.name}
          />
        </div>
      )}

      <div className="tab-content h-full w-full flex-grow overflow-y-scroll border-t border-t-reavers-border px-2 md:px-8">
        {getTabContent()}
      </div>
    </div>
  );
}

export default EnhancedInventoryTabComponent;
