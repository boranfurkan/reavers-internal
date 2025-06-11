import useSWR from 'swr';
import { useAuth } from '../../../contexts/AuthContext';
import { fetcher } from '../../../utils/helpers';
import { config } from '../../../config';
import { DAS } from 'helius-sdk';
import { useMemo } from 'react';

export const useOnChainNFTs = (): {
  nfts: {
    characters: DAS.GetAssetResponse[];
    ships: DAS.GetAssetResponse[];
    genesisShips: DAS.GetAssetResponse[];
    crews: DAS.GetAssetResponse[];
    items: DAS.GetAssetResponse[];
  };
  isLoading: boolean;
  error: any;
} => {
  const auth = useAuth();
  const jwtToken = auth.isLoggedIn ? auth.jwtToken : null;

  const oChainEndpoint = useMemo(() => {
    return auth.isLoggedIn
      ? `${config.worker_server_url}/rpc/onChainAssets`
      : null;
  }, [auth.isLoggedIn]);

  const { data, error, isLoading } = useSWR(
    oChainEndpoint,
    (endpoint) =>
      fetcher({
        url: endpoint,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      }),
    { refreshInterval: 120000,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
     },
  );

  return {
    nfts: data,
    isLoading,
    error,
  };
};
