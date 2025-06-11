import { fetcher } from '../../../utils/helpers';
import { config } from '../../../config';
import useSWR from 'swr';
import { useAuth } from '../../../contexts/AuthContext';
import { DynamicExchangeItem, ExchangeItem } from '../../../lib/types';

export const useGetExchangeItems = () => {
  const auth = useAuth();
  const jwtToken = auth.isLoggedIn ? auth.jwtToken : null;

  const endpoint = jwtToken
    ? `${config.worker_server_url}/exchange/fetch-exchange-items`
    : null;

  const { data, error, isLoading, mutate } = useSWR<{
    exchangeItems: ExchangeItem[];
    dynamicExchangeItems: DynamicExchangeItem[];
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

  return {
    exchangeItems: data || { exchangeItems: [], dynamicExchangeItems: [] },
    isLoading,
    error,
    mutate,
  };
};
