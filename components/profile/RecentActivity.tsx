import Image from 'next/image';
import { useState, useEffect, useContext, useMemo } from 'react';
import { PostMission } from '../../lib/types';
import { useUser } from '../../contexts/UserContext';
import { LayerContext } from '../../contexts/LayerContext';
import { Spin } from 'antd';
// import { fetchRecentActivity } from "../../lib/api/missions/recentActivity";
import { useAuth } from '../../contexts/AuthContext';
import { getIslandIconImage } from '../../utils/helpers';
import SkullIcon from '../../assets/skull-icon';

function RecentActivity() {
  const layerContext = useContext(LayerContext);

  if (!layerContext) {
    throw new Error('LayerMap must be used within a LayerProvider');
  }

  const { missions, items } = layerContext;

  const [missionFeed, setMissionFeed] = useState<PostMission[]>([]);

  const [queryOffset, setQueryOffset] = useState(0);
  const [displayOffset, setDisplayOffset] = useState(0);
  const [isQuerying, setIsQuerying] = useState(false);
  const displayedFeed = 5;
  const queryLimit = 10;

  // const [activityData, setActivityData] = useState(null);
  const [recentActivity, setRecentActivity] = useState<PostMission[]>([]);

  const user = useUser();
  const auth = useAuth();

  // useEffect(() => {
  //   let isCancelled = false;

  //   const fetchActivity = async () => {
  //     if (user.user?.wallet && auth.jwtToken) {
  //       setIsQuerying(true);

  //       try {
  //         const response = await fetchRecentActivity(user.user?.wallet, queryLimit, auth.jwtToken);

  //         if (!isCancelled) {
  //           let newMissions: PostMission[] = [];

  //           response.data.forEach((newMission: PostMission) => {
  //             const missionData = missions.find(
  //               (m) => m.missionStats?.path === newMission.missionRef.path
  //             );

  //             const itemImage =
  //               items.find(
  //                 (item) => item.name === missionData?.missionStats?.yield
  //               )?.image || "/images/axe.svg";

  //             newMissions.push({
  //               ...newMission,
  //               mission: missionData,
  //               itemImage
  //             });
  //           });

  //           setRecentActivity((prevMissions) => [
  //             ...prevMissions,
  //             ...newMissions
  //           ]);
  //           setDisplayOffset((prev) => prev + displayedFeed);
  //         }
  //       } catch (error) {
  //         if (!isCancelled) {
  //           decreaseOffset();
  //           console.error("Error fetching recent activity: ", error);
  //         }
  //       } finally {
  //         if (!isCancelled) {
  //           setIsQuerying(false);
  //         }
  //       }
  //     }
  //   };

  //   fetchActivity();

  //   return () => {
  //     isCancelled = true;
  //   };
  // }, [queryOffset]);

  const increaseOffset = () => {
    if (displayOffset + displayedFeed <= missionFeed.length - 1) {
      setDisplayOffset((prev) => prev + displayedFeed);
    } else if (
      displayOffset + displayedFeed <=
      (user.user?.missionsPlayed || 0)
    ) {
      setQueryOffset((prev) => prev + 1);
    }
  };
  const decreaseOffset = () => {
    if (displayOffset - displayedFeed >= 0) {
      setDisplayOffset((prev) => prev - displayedFeed);
    }
  };

  const { rightArrowOpacity, leftArrowOpacity } = useMemo(() => {
    const rightOpacity =
      displayOffset + displayedFeed <= (user.user?.missionsPlayed || 0) &&
      !isQuerying
        ? 100
        : 50;

    const leftOpacity =
      displayOffset - displayedFeed >= 0 && !isQuerying ? 100 : 50;

    return { rightArrowOpacity: rightOpacity, leftArrowOpacity: leftOpacity };
  }, [displayOffset, displayedFeed, user.user?.missionsPlayed, isQuerying]);

  return (
    <div className="flex w-full flex-col items-start justify-start gap-3 border-b border-b-reavers-border p-8">
      <div className="flex w-full flex-row items-center justify-between">
        <p className="myConnect font-SemiBold font-semibold uppercase opacity-50">
          Recent Activity
        </p>
        <div className="flex select-none flex-row items-center justify-center gap-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`h-6 w-6 rotate-90 cursor-pointer opacity-${leftArrowOpacity}`}
            onClick={isQuerying ? () => {} : decreaseOffset}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
          <div className="flex min-w-[70px] items-center justify-center">
            <p>{displayOffset / displayedFeed + 1}</p>
            <p>/</p>
            <p>
              {Math.floor((user.user?.missionsPlayed || 0) / displayedFeed) + 1}
            </p>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`h-6 w-6 -rotate-90 cursor-pointer opacity-${rightArrowOpacity}`}
            onClick={isQuerying ? () => {} : increaseOffset}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </div>
      </div>
      <div className="flex w-full flex-col items-center justify-center gap-4">
        {isQuerying ? (
          <div className="flex min-h-[530px] w-full items-center justify-center">
            <Spin />
          </div>
        ) : (
          missionFeed
            .slice(displayOffset, displayOffset + displayedFeed)
            .map((item, index) => {
              const islandNumber = item.mission?.missionStats?.layer;
              const imageUrl = getIslandIconImage(islandNumber || 1);
              return (
                <div
                  key={index}
                  className="relative flex w-full flex-row items-center justify-between gap-2 overflow-hidden rounded-lg border border-white border-opacity-20 bg-black">
                  <div className="rounded-7xl absolute left-0 top-0 z-20 h-full w-full bg-loginGradient"></div>
                  <Image
                    src={imageUrl}
                    alt="map"
                    width={800}
                    height={800}
                    className="absolute right-0 top-0 z-0 h-full w-full object-cover opacity-50"
                    unoptimized
                  />
                  <div className="grid w-full grid-cols-4 items-center justify-between gap-2 p-4">
                    <div className="relative z-30 flex h-full flex-row items-center justify-start gap-4">
                      <Image
                        src={item.userAvatar || '/images/no_pfp.webp'}
                        alt="profile"
                        width={400}
                        height={400}
                        className="h-[70px] w-[70px] overflow-hidden rounded-md object-cover"
                        unoptimized
                      />
                      <div className="flex flex-col items-start justify-center gap-2">
                        <p className="font-Body text-[10px]  font-thin uppercase tracking-tighter opacity-50">
                          Reaver
                        </p>
                        <span className="w-full truncate text-start">
                          #2542
                        </span>
                      </div>
                    </div>

                    <div className="relative z-30 flex h-full flex-col items-start justify-center gap-2">
                      <p className="font-Body text-[10px]  font-thin uppercase tracking-tighter opacity-50">
                        Island {item.mission?.missionStats?.layer}
                      </p>
                      <span className="w-full truncate text-start">
                        {item.mission?.name === "Riddick's Hideout"
                          ? "Riddick's Hideout"
                          : item.mission?.name}
                      </span>
                    </div>

                    <div className="relative z-30 flex h-full flex-col items-start justify-center gap-2">
                      <p className="font-Body text-[10px]  font-thin uppercase tracking-tighter opacity-50">
                        Outcome
                      </p>
                      <div className="relative z-30 flex w-full flex-row items-center justify-between">
                        {(item.outcome.type === 'success' ||
                          (item.gemsReward && item.gemsReward > 0)) && (
                          <div
                            className={`${
                              item.outcome.multiplier &&
                              item.outcome.multiplier >= 5
                                ? 'fiveMultiply'
                                : 'bg-activity-success'
                            } -mr-8 rounded-sm p-1 pt-1.5 text-[10px]`}>
                            <span className="px-2 text-white">
                              Success{' '}
                              {item.outcome.multiplier &&
                              item.outcome.multiplier > 1
                                ? `x${item.outcome.multiplier}`
                                : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="relative z-30 flex h-full flex-col items-end justify-center gap-2">
                      <div className="flex flex-col items-start justify-start gap-2">
                        {/* Plunders and Success */}
                        {item.type === 'Plunders' && item.arrrReward > 0 && (
                          <div
                            className={`flex flex-row items-center justify-center gap-[8px] rounded-[6px] border border-success-mission bg-[#0e1f12] bg-opacity-60 p-[8px] py-[4px] text-failed-mission backdrop-blur-lg`}>
                            <span className="font-SemiBold text-[13px] tracking-tight text-success-mission">
                              +{item.arrrReward}
                            </span>
                            <SkullIcon
                              height={18}
                              width={18}
                              className="h-[18px] w-[18px]"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}

export default RecentActivity;
