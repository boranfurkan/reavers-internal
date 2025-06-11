import useSWR from 'swr';
import { useAuth } from '../../../contexts/AuthContext';
import { fetcher } from '../../../utils/helpers';
import { config } from '../../../config';
import { useMemo } from 'react';
import { Character } from '../../../types/Character';
import { Ship } from '../../../types/Ship';
import { Crew } from '../../../types/Crew';

export const useDatabaseNFTs = (): {
  nfts: {
    characters: Character[];
    ships: Ship[];
    crews: Crew[];
  };
  isLoading: boolean;
  error: any;
} => {
  const auth = useAuth();
  const jwtToken = auth.isLoggedIn ? auth.jwtToken : null;

  const dbNftsEndpoint = useMemo(() => {
    return auth.isLoggedIn ? `${config.worker_server_url}/nfts` : null;
  }, [auth.isLoggedIn]);

  const { data, error, isLoading } = useSWR(
    dbNftsEndpoint,
    (endpoint) =>
      fetcher({
        url: endpoint,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      }),
    { refreshInterval: 60000 },
  );

  return {
    nfts: data,
    isLoading,
    error,
  };
};
