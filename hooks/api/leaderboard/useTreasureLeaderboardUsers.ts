import useSWRInfinite from 'swr/infinite';
import { useAuth } from '../../../contexts/AuthContext';
import { fetcher } from '../../../utils/helpers';
import { config } from '../../../config';
import { LeaderboardTreasureUserResponse } from '../../../lib/types';
import { useContext } from 'react';
import { LayerContext } from '../../../contexts/LayerContext';

export const useTreasureLeaderboardUsers = (limit: number = 10) => {
  const auth = useAuth();
  const layerContext = useContext(LayerContext);
  const isLeaderboardVisible =
    layerContext &&
    layerContext.isHideoutModalOpen &&
    layerContext.activeTab.name == 'leaderboard';

  const jwtToken = auth.isLoggedIn ? auth.jwtToken : null;
  const endpoint =
    auth.isLoggedIn && isLeaderboardVisible
      ? `${config.worker_server_url}/leaderboard/account`
      : null;

  const getKey = (pageIndex: number) => {
    return {
      url: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        currentPage: pageIndex + 1, //pageIndex starts from 0
        pageSize: limit,
      }),
    };
  };

  const { data, error, isLoading, isValidating, mutate, size, setSize } =
    useSWRInfinite(
      getKey,
      (requestData) =>
        fetcher({
          url: requestData.url!,
          method: requestData.method,
          headers: requestData.headers,
          body: requestData.body,
        }),
      { refreshInterval: 120000, revalidateOnFocus: false },
    );

  return {
    data: (data || []) as LeaderboardTreasureUserResponse[][],
    isLoading,
    error,
    mutate,
    isValidating,
    size,
    setCurrentPage: setSize,
  };
};
