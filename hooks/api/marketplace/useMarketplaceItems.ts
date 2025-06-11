import { fetcher } from '../../../utils/helpers';
import { config } from '../../../config';
import useSWR from 'swr';
import { useAuth } from '../../../contexts/AuthContext';
import { MarketPlaceItem } from '../../../lib/types';

export const useGetMarketplaceItems = () => {
  const auth = useAuth();
  const jwtToken = auth.isLoggedIn ? auth.jwtToken : null;
  const endpoint = `${config.worker_server_url}/shop/fetch-shop-items`;

  const { data, error, isLoading, mutate } = useSWR<{
    marketplaceItems: MarketPlaceItem[];
  }>(
    endpoint,
    (url: string) =>
      fetcher({
        url,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      }),
    {
      refreshInterval: 120000,
      revalidateOnFocus: false,
    },
  );

  const refetchMarketplaceItems = () => {
    mutate();
  };

  return {
    marketPlaceItems: data?.marketplaceItems || [],
    isLoading,
    error,
    refetchMarketplaceItems,
  };
};
