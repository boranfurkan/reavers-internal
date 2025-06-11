import { fetcher } from '../../../utils/helpers';
import { config } from '../../../config';
import useSWR from 'swr';
import { useAuth } from '../../../contexts/AuthContext';

interface EligibleCaptainsResponse {
  eligibleUids: string[];
}

export const useGetEligibleCaptains = ({
  missionName,
}: {
  missionName?: string;
}) => {
  const auth = useAuth();
  const jwtToken = auth.isLoggedIn ? auth.jwtToken : null;

  const endpoint =
    auth.isLoggedIn && missionName
      ? `${config.worker_server_url}/missions/eligible-nfts`
      : null;

  const { data, error, isLoading, mutate } = useSWR<EligibleCaptainsResponse>(
    endpoint ? [endpoint, missionName] : null,
    ([url, missionName]) =>
      fetcher({
        url,
        body: JSON.stringify({ missionName }),
        method: 'POST',
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
    eligibleCaptains: data || { eligibleUids: [], usdcBootyPrice: 0 },
    isLoading,
    error,
    mutate,
  };
};
