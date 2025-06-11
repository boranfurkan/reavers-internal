import useSWR from 'swr'
import { ActiveMission } from '../../../lib/types';
import { useAuth } from '../../../contexts/AuthContext';
import { fetcher } from '../../../utils/helpers';
import { config } from '../../../config';
import { useMemo } from 'react';

export const useActiveMissions = (): {
  activeMissions: ActiveMission[] | undefined;
  isLoading: boolean;
  error: any;
} => {
  const auth = useAuth();
  const jwtToken = auth.isLoggedIn ? auth.jwtToken : null;
  const endpoint = useMemo(() => auth.isLoggedIn ? `${config.worker_server_url}/missions/active-missions/` : null, [auth.isLoggedIn]);
  

  const {
    data,
    error,
    isLoading
  } = useSWR(
    endpoint,
    endpoint => fetcher({
      url: endpoint,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`
      }
    }),
    { refreshInterval: 60000 }
  );

  // const activeMissions = (error || isLoading || !data) ? [] : (data as ActiveMission[]);

  return {
    activeMissions: data,
    isLoading,
    error,
  }
}
