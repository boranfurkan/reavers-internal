import useSWR from 'swr';
import { useAuth } from '../../../contexts/AuthContext';
import { fetcher } from '../../../utils/helpers';
import { config } from '../../../config';
import { useContext, useMemo } from 'react';
import { LayerContext } from '../../../contexts/LayerContext';

interface useLeaderboardMeResponse {
  totalCaptainsOwned: number;
  totalGoldBurned: number;
  userTotalGoldBar: number;
  userAllocation: number;
  userValue: number;
  walletAddress: string;
}

export const useLeaderboardMe = () => {
  const auth = useAuth();
  const jwtToken = auth.isLoggedIn ? auth.jwtToken : null;
  const layerContext = useContext(LayerContext);
  const isLeaderboardVisible =
    layerContext &&
    layerContext.isHideoutModalOpen &&
    layerContext.activeTab.name == 'leaderboard';

  // Get user data
  const endpoint = useMemo(() => {
    return auth.isLoggedIn && isLeaderboardVisible
      ? `${config.worker_server_url}/leaderboard/me`
      : null;
  }, [auth.isLoggedIn, isLeaderboardVisible]);

  const { data, error, isLoading } = useSWR<useLeaderboardMeResponse>(
    endpoint,
    (endpoint) =>
      fetcher({
        url: endpoint,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      }),
    { refreshInterval: 120000, revalidateOnFocus: false },
  );

  return {
    data,
    error,
    isLoading,
  };
};
