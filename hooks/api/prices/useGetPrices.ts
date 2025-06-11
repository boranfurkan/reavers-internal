import { fetcher } from '../../../utils/helpers';
import { config } from '../../../config';
import useSWR from 'swr';
import { PriceData } from '../../../lib/types';

export const useGetPrices = () => {
  const endpoint = `${config.worker_server_url}/spl-token/prices`;

  const { data, error, isLoading, mutate } = useSWR<PriceData>(
    endpoint,
    (url: string) =>
      fetcher({
        url,
        method: 'GET',
        headers: {
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
    prices: data || {
      sol_booty_price: 0,
      sol_usdc_price: 0,
      usdc_booty_price: 0,
      usdc_gold_price: 0,
      updateDate: new Date(),
    },
    isLoading,
    error,
    refetchMarketplaceItems,
  };
};
