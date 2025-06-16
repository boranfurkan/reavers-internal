import useSWRInfinite from 'swr/infinite';
import { useAuth } from '../../../contexts/AuthContext';
import { fetcher } from '../../../utils/helpers';
import { config } from '../../../config';
import {
  ArenaLeaderboardResponse,
  ArenaLeaderboardStat,
} from '../../../lib/types';
import { useContext } from 'react';
import { LayerContext } from '../../../contexts/LayerContext';

export const useArenaLeaderboard = (limit: number = 10) => {
  const auth = useAuth();
  const layerContext = useContext(LayerContext);
  const isLeaderboardVisible =
    layerContext &&
    layerContext.isHideoutModalOpen &&
    layerContext.activeTab.name === 'the arena';

  const jwtToken = auth.isLoggedIn ? auth.jwtToken : null;
  const endpoint =
    auth.isLoggedIn && isLeaderboardVisible
      ? `${config.worker_server_url}/arena/leaderboard`
      : null;

  const getKey = (pageIndex: number) => {
    // Return null if endpoint is null - this prevents SWR from making requests
    if (!endpoint || !jwtToken) {
      return null;
    }

    return {
      url: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        currentPage: pageIndex + 1,
        pageSize: limit,
      }),
    };
  };

  const { data, error, isLoading, isValidating, mutate, size, setSize } =
    useSWRInfinite<ArenaLeaderboardResponse>(
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

  // Transform the data to match the expected format
  const transformedData = data?.map((response) => response.leaderboard) || [];

  return {
    data: transformedData as ArenaLeaderboardStat[][],
    isLoading,
    error,
    mutate,
    isValidating,
    size,
    setCurrentPage: setSize,
    totalPlayers: data?.[0]?.totalPlayers,
    totalPages: data?.[0]?.totalPages,
  };
};
