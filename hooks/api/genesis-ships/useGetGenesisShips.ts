import useSWR from 'swr';
import { useAuth } from '../../../contexts/AuthContext';
import { fetcher } from '../../../utils/helpers';
import { config } from '../../../config';
import { useMemo } from 'react';
import { GenesisShip } from '../../../types/Genesis';
import { GenesisShipNFT } from '../../../types/NFT';

export const useGetGenesisShips = (): {
  data: GenesisShipNFT[];
  isLoading: boolean;
  error: any;
  mutate: (data?: any, options?: any) => Promise<GenesisShip[]>;
} => {
  const auth = useAuth();
  const jwtToken = auth.isLoggedIn ? auth.jwtToken : null;

  const dbNftsEndpoint = useMemo(() => {
    return auth.isLoggedIn
      ? `${config.worker_server_url}/genesis/genesis-ships`
      : null;
  }, [auth.isLoggedIn]);

  const { data, error, isLoading, mutate } = useSWR(
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
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
      dedupingInterval: 5000,
      keepPreviousData: true,
      revalidateIfStale: false,
    },
  );

  const revalidate = async (data?: any, options?: any) => {
    return mutate(data, {
      revalidate: true,
      populateCache: true,
      optimisticData: (currentData: GenesisShip[] | undefined) => {
        return currentData || [];
      },
      ...options,
    });
  };

  return {
    data: data || [],
    isLoading,
    error,
    mutate: revalidate,
  };
};
