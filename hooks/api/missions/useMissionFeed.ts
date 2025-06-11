import useSWR from 'swr';
import { useAuth } from '../../../contexts/AuthContext';
import { fetcher } from '../../../utils/helpers';
import { config } from '../../../config';
import { OrderByDirection } from 'firebase/firestore';
import { getSignature } from '../../../utils/getSignature';
import { useContext, useMemo } from 'react';
import { LayerContext } from '../../../contexts/LayerContext';

export const useMissionFeed = (
  limit: number = 25,
  orderBy?: string,
  orderType?: OrderByDirection,
  startAfter?: any,
) => {
  const layerContext = useContext(LayerContext);
  const missionPath = layerContext?.currentMission?.missionStats?.path;

  const auth = useAuth();
  const jwtToken = auth.isLoggedIn ? auth.jwtToken : null;
  const endpoint = useMemo(() => {
    return auth.isLoggedIn && missionPath
      ? `${config.worker_server_url}/missions/mission-feed`
      : null;
  }, [auth.isLoggedIn, missionPath]);

  const signature = getSignature(
    JSON.stringify({
      missionPath,
      limit,
      startAfter,
      orderBy,
      orderType,
    }),
  );

  const { data, error, isLoading } = useSWR(
    { endpoint, missionPath },
    ({ endpoint }) =>
      fetcher({
        url: endpoint as string,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          data: {
            missionPath,
            limit,
            startAfter,
            orderBy,
            orderType,
          },
          signature,
        }),
      }),
  );

  // const missionFeed = data?.map((mission: PostMission) => {
  //   const missionStats = layerContext?.missions.find(
  //     (missionStats) => missionStats.name === mission.missionName
  //   );

  //   const itemStats = layerContext?.items.find(
  //     (item) => item.name === missionStats?.missionStats?.yield
  //   );

  //   return { ...mission, itemImage: itemStats?.image };
  // });

  return {
    feed: data,
    isLoading,
    error,
  };
};
