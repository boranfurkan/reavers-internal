import useSWRImmutable from 'swr/immutable'
import { fetcher } from '../../../utils/helpers';
import { config } from '../../../config';
import { getSignature } from '../../../utils/getSignature';


export const useGlobalMissionFeed = () => {
  const endpoint = `${config.worker_server_url}/missions/mission-feed`;
  const limit = 25;


  const signature = getSignature(JSON.stringify({
    limit
  }));

  const {
    data,
    error,
    isLoading
  } = useSWRImmutable(
    endpoint,
    endpoint => fetcher({
      url: endpoint,
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        data: {
          limit
        },
        signature
      })
    })
  );

  return {
    data,
    isLoading,
    error,
  }
}
