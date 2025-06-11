import useSWR from 'swr';
import { ActiveMission, HideoutStats } from '../../../lib/types';
import { useAuth } from '../../../contexts/AuthContext';
import { fetcher } from '../../../utils/helpers';
import { config } from '../../../config';
import { useMemo } from 'react';

export const useHideout = (): {
  hideoutStats: HideoutStats;
  hideoutStatsError: any;
  hideoutStatsLoading: boolean;
} => {
  const auth = useAuth();
  const jwtToken = auth.isLoggedIn ? auth.jwtToken : null;
  // Get hideout data
  const hideoutEndpoint = useMemo(() => {
    return auth.isLoggedIn
      ? `${config.worker_server_url}/hideout/stats`
      : null;
  }, [auth.isLoggedIn]);
  const {
    data: hideoutStats,
    error: hideoutStatsError,
    isLoading: hideoutStatsLoading,
  } = useSWR(
    hideoutEndpoint,
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
    hideoutStats: hideoutStats,
    hideoutStatsError: hideoutStatsError,
    hideoutStatsLoading: hideoutStatsLoading,
  };
};
