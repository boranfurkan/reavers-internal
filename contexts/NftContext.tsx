import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { ActiveMission, ItemData } from '../lib/types';
import { LayerContext } from './LayerContext';
import { config } from '../config';
import { useAuth } from './AuthContext';
import { useDatabaseNFTs } from '../hooks/api/nfts/useDatabaseNFTs';
import { useOnChainNFTs } from '../hooks/api/nfts/useOnChainNFTs';
import { useActiveMissions } from '../hooks/api/missions/useActiveMissions';
import { useItems } from '../hooks/api/items/useItems';
import { mutate } from 'swr';
import { CharacterNFT, CrewNFT, GenesisShipNFT, ShipNFT } from '../types/NFT';
import { useGetGenesisShips } from '../hooks/api/genesis-ships/useGetGenesisShips';
import { calculateCharacterStrength } from '../utils/helpers';
import { GenesisShip } from '../types/Genesis';

interface NftContextType {
  loadedInventory: ItemData[];
  itemsInGame: ItemData[];
  itemsNotInGame: ItemData[];

  characters: CharacterNFT[];
  charactersInGame: CharacterNFT[];
  charactersNotInGame: CharacterNFT[];

  crews: CrewNFT[];
  crewsInGame: CrewNFT[];
  crewsNotInGame: CrewNFT[];

  ships: ShipNFT[];
  shipsInGame: ShipNFT[];
  shipsNotInGame: ShipNFT[];

  genesisShips: GenesisShipNFT[];
  genesisShipsInGame: GenesisShipNFT[];
  genesisShipsNotInGame: GenesisShipNFT[];

  restingNfts: CharacterNFT[];
  restingSpecialNfts: CharacterNFT[];
  nftsOnMission: CharacterNFT[];
  filteredActiveMissions: ActiveMission[];
  activeMissions: ActiveMission[];
  specialActiveMissions: ActiveMission[];
  loading: boolean;
  error: boolean;
  activeMissionsLoaded: boolean;
  refreshGenesisShips: () => Promise<void>; // Function to refresh genesis ships
}

const defaultNftContextValue: NftContextType = {
  loadedInventory: [],
  itemsInGame: [],
  itemsNotInGame: [],
  characters: [],
  charactersInGame: [],
  charactersNotInGame: [],
  crews: [],
  crewsInGame: [],
  crewsNotInGame: [],
  ships: [],
  shipsInGame: [],
  shipsNotInGame: [],
  genesisShips: [],
  genesisShipsInGame: [],
  genesisShipsNotInGame: [],
  restingNfts: [],
  restingSpecialNfts: [],
  nftsOnMission: [],
  activeMissions: [],
  specialActiveMissions: [],
  filteredActiveMissions: [],
  loading: false,
  error: false,
  activeMissionsLoaded: false,
  refreshGenesisShips: async () => {},
};

const NFTContext = createContext<NftContextType>(defaultNftContextValue);

export const useNfts = () => useContext(NFTContext);

export const NFTProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isLoggedIn } = useAuth();
  const layerContext = useContext(LayerContext);

  // State
  const [state, setState] = useState<
    Omit<NftContextType, 'filteredActiveMissions'>
  >({
    ...defaultNftContextValue,
  });

  const { items } = useItems();
  const { nfts: dbNFTsData, isLoading: isDbNFTsLoading } = useDatabaseNFTs();
  const { nfts: onChainNFTsData, isLoading: isOnChainNFTsLoading } =
    useOnChainNFTs();
  const {
    data: genesisShips,
    isLoading: isGenesisShipsLoading,
    mutate: mutateGenesisShips,
  } = useGetGenesisShips();
  const { activeMissions: activeMissionData } = useActiveMissions();

  // Optimized refreshGenesisShips function to avoid full re-renders
  const refreshGenesisShips = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      // Use a more optimized approach to refresh only Genesis ships data
      await mutateGenesisShips(
        (currentData: GenesisShip[] | undefined) => {
          // Return undefined to trigger revalidation but keep current data visible
          return undefined;
        },
        {
          revalidate: true,
          populateCache: true,
          optimisticData: (currentData: GenesisShip[] | undefined) => {
            // Return current data to maintain UI stability
            return currentData || [];
          },
        },
      );

      // Also update user data for consistency, but do it after the UI update
      await mutate(`${config.worker_server_url}/users/me`);
    } catch (error) {
      console.error('Error refreshing Genesis Ships:', error);
    }
  }, [isLoggedIn, mutateGenesisShips]);

  const dataReady = Boolean(
    layerContext &&
      !layerContext.loading &&
      !layerContext.itemsLoading &&
      onChainNFTsData &&
      items?.length > 0,
  );

  const nftDataReady = Boolean(
    layerContext &&
      !layerContext.loading &&
      !layerContext.itemsLoading &&
      (dbNFTsData || onChainNFTsData),
  );

  const missionsDataReady = Boolean(
    isLoggedIn &&
      layerContext?.missions &&
      layerContext?.missions.length > 0 &&
      activeMissionData &&
      dbNFTsData,
  );

  // Update items
  useEffect(() => {
    if (!dataReady) return;

    const firebaseItems = items || [];
    const itemDatas = firebaseItems.map((item) => {
      const itemStats = layerContext?.items.find((i) => i.name === item.name);
      return { ...item, itemStats } as ItemData;
    });

    const itemsNotInGame = onChainNFTsData.items.filter(
      (item) => !itemDatas.some((itemData) => itemData.mint === item.id),
    );

    setState((prev) => ({
      ...prev,
      loadedInventory: itemDatas,
      itemsInGame: itemDatas.filter((item) => item.isDeposited === true),
      itemsNotInGame,
    }));
  }, [
    items,
    isLoggedIn,
    onChainNFTsData,
    layerContext?.loading,
    layerContext?.itemsLoading,
    dataReady,
  ]);

  useEffect(() => {
    if (!genesisShips) return;

    setState((prev) => ({
      ...prev,
      genesisShips,
    }));
  }, [genesisShips]);

  // Update NFTs
  useEffect(() => {
    if (!nftDataReady) return;

    setState((prev) => ({ ...prev, loading: true }));

    try {
      const firebaseNfts = isDbNFTsLoading
        ? { characters: [], crews: [], ships: [] }
        : dbNFTsData;

      const onChainNfts = isOnChainNFTsLoading
        ? { characters: [], crews: [], ships: [], genesisShips: [] }
        : onChainNFTsData;

      // Track filtered collections to avoid duplicates
      let filteredOnChainCharacters = [...onChainNfts.characters];
      let filteredOnChainCrews = [...onChainNfts.crews];
      let filteredOnChainShips = [...onChainNfts.ships];
      let filteredOnChainGenesisShips = [...onChainNfts.genesisShips];

      // Process crews first (we need them for strength calculation)
      let crews = firebaseNfts.crews.map((crew) => {
        const matchingEntry = onChainNfts.crews.find(
          (onChainCrew) => crew.mint === onChainCrew.id,
        );

        if (matchingEntry) {
          filteredOnChainCrews = filteredOnChainCrews.filter(
            (c) => c.id !== matchingEntry.id,
          );
        }

        const activeMission = state.activeMissions.find(
          (mission) =>
            mission.nftIds.includes(crew.uid) && !mission.stakedSpecial,
        );

        return {
          ...crew,
          ...matchingEntry,
          currentMissionLoaded: activeMission,
        } as CrewNFT;
      });

      // Add filtered on-chain crews
      crews = crews.concat(
        filteredOnChainCrews.filter((crew) =>
          crew.grouping?.some(
            (grouping) =>
              grouping.group_value === config.reavers_crew_collection_address,
          ),
        ),
      );

      const crewsInGame = crews.filter((crew) => crew.isDeposited === true);
      const crewsNotInGame = crews.filter(
        (crew) => !crewsInGame.some((c) => c.id === crew.id),
      );

      // Process ships (we need them for strength calculation)
      let ships = firebaseNfts.ships.map((ship) => {
        const matchingEntry = onChainNfts.ships.find(
          (onChainShip) => ship.mint === onChainShip.id,
        );

        if (matchingEntry) {
          filteredOnChainShips = filteredOnChainShips.filter(
            (s) => s.id !== matchingEntry.id,
          );
        }

        const activeMission = state.activeMissions.find(
          (mission) =>
            mission.nftIds.includes(ship.uid) && !mission.stakedSpecial,
        );

        return {
          ...ship,
          ...matchingEntry,
          currentMissionLoaded: activeMission,
        } as ShipNFT;
      });

      // Add filtered on-chain ships
      ships = ships.concat(
        filteredOnChainShips.filter((ship) =>
          ship.grouping?.some(
            (grouping) =>
              grouping.group_value === config.reavers_ship_collection_address,
          ),
        ),
      );

      const shipsInGame = ships.filter((ship) => ship.isDeposited === true);
      const shipsNotInGame = ships.filter(
        (ship) => !shipsInGame.some((s) => s.id === ship.id),
      );

      // Corrected implementation to match ships pattern
      // First filter out duplicates from filteredOnChainGenesisShips
      let processedGenesisShips = genesisShips.map((genesisShip) => {
        const matchingEntry = filteredOnChainGenesisShips.find(
          (onChainShip) => genesisShip.mint === onChainShip.id,
        );

        if (matchingEntry) {
          filteredOnChainGenesisShips = filteredOnChainGenesisShips.filter(
            (s) => s.id !== matchingEntry.id,
          );
        }

        return {
          ...genesisShip,
          ...matchingEntry,
        } as GenesisShipNFT;
      });

      // Then add remaining filtered on-chain genesis ships
      let concatenatedGenesisShips = processedGenesisShips.concat(
        filteredOnChainGenesisShips.filter((genesisShip) =>
          genesisShip.grouping?.some(
            (grouping) =>
              grouping.group_value === config.genesis_ships_collection_address,
          ),
        ),
      );

      const genesisShipsInGame = concatenatedGenesisShips.filter(
        (genesisShip) =>
          genesisShip.isDeposited && genesisShip.isDeposited === true,
      );

      const genesisShipsNotInGame = concatenatedGenesisShips.filter(
        (genesisShip) =>
          !genesisShipsInGame.some((s) => s.id === genesisShip.id),
      );

      // Process characters
      let characters = firebaseNfts.characters.map((character) => {
        const matchingEntry = onChainNfts.characters.find(
          (onChainCharacter) => character.mint === onChainCharacter.id,
        );

        if (matchingEntry) {
          filteredOnChainCharacters = filteredOnChainCharacters.filter(
            (char) => char.id !== matchingEntry.id,
          );
        }

        const activeMission = state.activeMissions.find(
          (mission) =>
            mission.nftIds.includes(character.uid) && !mission.stakedSpecial,
        );

        // Calculate strength and add it to the character
        const strength = calculateCharacterStrength(character);

        return {
          ...character,
          ...matchingEntry,
          currentMissionLoaded: activeMission,
          levelUpSuccessRate: 100,
          strength: strength,
          staked: {
            startTime: character.staked?.startTime || null,
            staked: character.staked?.staked || false,
            stakedLevel: character.staked?.stakedLevel || 1,
            currentMission: character.staked?.currentMission || null,
          },
        } as CharacterNFT;
      });

      // Add on-chain only characters
      const groupingAddresses = [
        config.reavers_collection_address,
        config.atoms_collection_address,
        config.saga_sirens_collection_address,
        config.steam_punks_collection_address,
        config.asgardians_collection_address,
        config.elementerra_collection_address,
      ];

      const creatorsAddresses = [
        config.reavers_collection_verified_creator,
        config.last_haven_collection_verified_creator,
        config.brohalla_collection_verified_creator,
      ];

      // Add filtered on-chain characters
      const onChainOnlyCharacters = filteredOnChainCharacters.filter(
        (character) =>
          character.grouping?.some((grouping) =>
            groupingAddresses.includes(grouping.group_value),
          ) ||
          character.creators?.some(
            (creator) =>
              creatorsAddresses.includes(creator.address) && creator.verified,
          ),
      );

      const enhancedOnChainCharacters = onChainOnlyCharacters.map((char) => {
        const baseChar = {
          ...char,
          equippedItems: [],
          equippedCrew: '',
          equippedShip: '',
          level: 1, // Default level
        } as CharacterNFT;

        const strength = calculateCharacterStrength(baseChar);

        return {
          ...baseChar,
          strength: strength,
        };
      });

      characters = characters.concat(enhancedOnChainCharacters);

      const charactersInGame = characters.filter(
        (character) => character.isDeposited === true,
      );

      const charactersNotInGame = characters.filter(
        (character) => !charactersInGame.some((c) => c.id === character.id),
      );

      const restingNfts = characters.filter(
        (character) => character && character.currentMission === '',
      );

      const restingSpecialNfts = characters.filter(
        (character) => character && character.staked?.staked === false,
      );

      setState((prev) => ({
        ...prev,
        characters,
        charactersInGame,
        charactersNotInGame,
        restingNfts,
        restingSpecialNfts,
        crews: crews as CrewNFT[],
        crewsInGame: crewsInGame as CrewNFT[],
        crewsNotInGame: crewsNotInGame as CrewNFT[],
        ships: ships as ShipNFT[],
        shipsInGame: shipsInGame as ShipNFT[],
        shipsNotInGame: shipsNotInGame as ShipNFT[],
        genesisShips: concatenatedGenesisShips,
        genesisShipsInGame: genesisShipsInGame as GenesisShipNFT[],
        genesisShipsNotInGame: genesisShipsNotInGame as GenesisShipNFT[],
        loading: false,
        error: false,
      }));
    } catch (error) {
      console.error('Error updating NFTs:', error);
      setState((prev) => ({ ...prev, loading: false, error: true }));
    }
  }, [
    isLoggedIn,
    layerContext?.loading,
    layerContext?.itemsLoading,
    dbNFTsData,
    onChainNFTsData,
    nftDataReady,
    genesisShips,
    isDbNFTsLoading,
    isOnChainNFTsLoading,
  ]);

  // Handle Active Missions Update
  useEffect(() => {
    if (!missionsDataReady) return;

    try {
      const processedActiveMissions = (activeMissionData || []).map(
        (activeMission) => {
          const endTime =
            activeMission.startTime + activeMission.duration * 60 * 60 * 1000;
          const missionData = layerContext?.missions.find(
            (mission) => mission.name === activeMission.missionName,
          );

          const nftDatas = activeMission.nftIds
            .map((nftId) =>
              state.characters.find(
                (characterNFT) =>
                  characterNFT.uid === nftId &&
                  characterNFT.currentMission === activeMission.id,
              ),
            )
            .filter(Boolean) as CharacterNFT[];

          return {
            ...activeMission,
            endTimeCalculated: endTime,
            mission: missionData,
            nftsLoaded: nftDatas,
          };
        },
      );

      const specialActiveMissions = (activeMissionData || []).map(
        (activeMission) => {
          const endTime =
            activeMission.startTime + activeMission.duration * 60 * 60 * 1000;
          const missionData = layerContext?.missions.find(
            (mission) => mission.name === activeMission.missionName,
          );

          const nftDatas = activeMission.nftIds
            .map((nftId) =>
              state.characters.find(
                (characterNFT) =>
                  characterNFT.uid === nftId &&
                  characterNFT.staked?.staked &&
                  characterNFT.staked?.currentMission === activeMission.id,
              ),
            )
            .filter(Boolean) as CharacterNFT[];

          return {
            ...activeMission,
            endTimeCalculated: endTime,
            mission: missionData,
            nftsLoaded: nftDatas,
          };
        },
      );

      const nftsOnMission = state.characters
        .filter(
          (character) =>
            character && character.currentMission !== '' && character.uid,
        )
        .map((character) => {
          const missionData = processedActiveMissions.find((mission) =>
            mission.nftsLoaded?.some(
              (loadedNft) => loadedNft.uid === character?.uid,
            ),
          );

          return {
            ...character,
            currentMissionLoaded: missionData,
          };
        });

      setState((prev) => ({
        ...prev,
        activeMissions: processedActiveMissions,
        specialActiveMissions,
        nftsOnMission,
        activeMissionsLoaded: true,
      }));

      // Trigger refetches when missions change, but do it in the background
      // to avoid causing unwanted re-renders
      setTimeout(() => {
        mutate(`${config.worker_server_url}/nfts`);
        mutate(`${config.worker_server_url}/users/me`);
      }, 100);
    } catch (error) {
      console.error('Error updating active missions:', error);
    }
  }, [
    isLoggedIn,
    layerContext?.missions,
    activeMissionData,
    state.characters,
    missionsDataReady,
  ]);

  // Compute filtered missions with useMemo
  const filteredActiveMissions = useMemo(() => {
    if (!state.activeMissionsLoaded || !layerContext?.currentMission) {
      return [];
    }

    return state.activeMissions
      .filter(
        (mission) => mission.missionName === layerContext.currentMission?.name,
      )
      .sort((a, b) => {
        // First sort by number of NFTs
        if (a.nftIds.length !== b.nftIds.length) {
          return b.nftIds.length - a.nftIds.length;
        }

        // Then by highest level NFT
        const maxLevelA = Math.max(
          ...((a.nftsLoaded?.map((nft) => nft.level) || []).filter(
            Boolean,
          ) as number[]),
          0,
        );

        const maxLevelB = Math.max(
          ...((b.nftsLoaded?.map((nft) => nft.level) || []).filter(
            Boolean,
          ) as number[]),
          0,
        );

        return maxLevelB - maxLevelA;
      });
  }, [
    state.activeMissions,
    state.activeMissionsLoaded,
    layerContext?.currentMission,
  ]);

  const value = {
    ...state,
    filteredActiveMissions,
    refreshGenesisShips,
  };

  return <NFTContext.Provider value={value}>{children}</NFTContext.Provider>;
};
