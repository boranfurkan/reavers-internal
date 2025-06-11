import useSWR from 'swr';
import { useAuth } from '../../../contexts/AuthContext';
import { fetcher } from '../../../utils/helpers';
import { config } from '../../../config';
import { ArenaLeaderboardMeResponse } from '../../../lib/types';

export const useArenaLeaderboardMe = () => {
  const auth = useAuth();
  const jwtToken = auth.isLoggedIn ? auth.jwtToken : null;

  const endpoint = jwtToken
    ? `${config.worker_server_url}/arena/leaderboard/me`
    : null;

  const { data, error, isLoading, mutate } = useSWR(
    endpoint,
    (requestData) =>
      fetcher({
        url: endpoint!,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }),
    {
      refreshInterval: 120000,
      revalidateOnFocus: true,
    },
  );

  return {
    data: data ? (data as ArenaLeaderboardMeResponse) : undefined,
    isLoading,
    error,
    mutate,
  };
};
