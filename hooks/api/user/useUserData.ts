import useSWR from 'swr';
import { useAuth } from '../../../contexts/AuthContext';
import { fetcher } from '../../../utils/helpers';
import { config } from '../../../config';
import { useMemo } from 'react';

export const useUserData = () => {
  const auth = useAuth();
  const jwtToken = auth.isLoggedIn ? auth.jwtToken : null;

  // Get user data
  const meEndpoint = useMemo(() => {
    return auth.isLoggedIn ? `${config.worker_server_url}/users/me` : null;
  }, [auth.isLoggedIn]);
  const {
    data: user,
    error: userError,
    isLoading: userLoading,
  } = useSWR(
    meEndpoint,
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

  //Get on chain balance
  const onChainBalanceEndpoint = auth.isLoggedIn
    ? `${config.worker_server_url}/rpc/onChainBalance`
    : null;

  const {
    data: onChainBalanceData,
    error: onChainBalanceError,
    isLoading: onChainBalanceLoading,
  } = useSWR(
    onChainBalanceEndpoint,
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

  // Attach onChainBalance to user data
  // It can be a good idea to keep onChainBalance fetching separate as it makes a call to RPC
  // This allows us to force revalidated to refetch without needing to refetch user data (when needed)
  if (user) {
    user.onChainAr = onChainBalanceData ? onChainBalanceData.booty : 0;
    user.onChainGold = onChainBalanceData ? onChainBalanceData.gold : 0;
  }

  return {
    data: user,
    isLoading: userLoading,
    error: userError,
  };
};
