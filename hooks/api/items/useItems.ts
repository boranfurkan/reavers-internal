import useSWR from 'swr'
import { ItemData } from '../../../lib/types';
import { fetcher } from '../../../utils/helpers';
import { config } from '../../../config';
import { useUser } from '../../../contexts/UserContext';
import { useMemo } from 'react';


export const useItems = () => {
  const { user } = useUser();

  const inventory = user && user.inventory ? user.inventory : [];
  const endpoint = useMemo(() => (
    inventory.length === 0 ? null : `${config.worker_server_url}/items/fetch-items`
  ), [inventory.length]);

  const {
    data,
    error,
    isLoading
  } = useSWR(
    endpoint,
    (endpoint) => fetcher({
      url: endpoint as string, //If null, SWR would handle for you
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        itemPaths: inventory
      })
    }),
    {
      refreshInterval: 180000,
      revalidateOnFocus: false
    }
  );

  return {
    items: data ? data.items as ItemData[] || [] : [],
    isLoading,
    error,
  }
}
