import { useContext, useEffect, useState } from 'react';
import { PostMission } from '../../../lib/types';
import { LayerContext } from '../../../contexts/LayerContext';
import Image from 'next/image';
import { toast } from 'sonner';
import { useMissionFeed } from '../../../hooks/api/missions/useMissionFeed';
import { Spin } from 'antd';
import GemIcon from '../../../assets/gem-icon';
import TreasureIcon from '../../../assets/treasure-icon';

const MissionActivityFeed: React.FC = () => {
  const layerContext = useContext(LayerContext);

  if (!layerContext) {
    throw new Error('LayerMap must be used within a LayerProvider');
  }

  const { missions, items, currentMission, claimedMissions } = layerContext;

  const [missionFeed, setMissionFeed] = useState<PostMission[]>([]);

  const { feed: postMissions, isLoading, error } = useMissionFeed();

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    } else if (!isLoading) {
      // Attach loaded items to NFTs
      (postMissions as PostMission[]).forEach((postMission) => {
        postMission.mission = missions.find(
          (m) => postMission.missionName === m.name,
        );

        const missionStats = missions.find(
          (missionStats) => missionStats.name === postMission.missionName,
        );

        const itemStats = items.find((item) =>
          missionStats?.missionStats?.kind !== 'Events'
            ? item.name === missionStats?.missionStats?.yield
            : item.name === postMission.outcome.effect,
        );

        if (itemStats && itemStats.image) {
          postMission.itemImage = itemStats.image;
        }
      });
      setMissionFeed(postMissions);
    }
  }, [currentMission, missions, claimedMissions, postMissions]);

  return (
    <div className="relative hidden h-full w-full flex-col gap-2.5 overflow-hidden md:flex">
      <div className="w-full justify-start text-start text-[10px] font-bold leading-[10px]">
        ACTIVITY FEED
      </div>
      <div className="absolute bottom-0 left-0 z-10 h-[64px] w-full bg-scrollable-gradient"></div>
      {!isLoading ? (
        <div className=" z-0 flex h-full w-full flex-col overflow-y-scroll">
          <div className="flex h-full w-full flex-col gap-2.5">
            {/* TO DO: Add feed objects accordingly */}
            {missionFeed /*.slice(0, 10)*/
              .map((item, index) => {
                // if (item.outcome.type === "failure") console.log(item, index);

                return (
                  <div
                    key={index}
                    className="relative flex h-full max-h-[44px] min-h-[44px] w-full flex-row items-center justify-between gap-2 overflow-hidden rounded-lg border border-[#2d2d2d]  bg-activity-gradient bg-[center_right_-78px] bg-no-repeat">
                    <div className="rounded-7xl absolute inset-0 left-0 top-0 z-20 h-full w-full bg-activityFeedGradient"></div>

                    <div
                      className={
                        'relative z-[99] mr-6 flex min-w-[81px] flex-row items-center justify-center -space-x-[1.5rem] rounded-lg py-2 max-2xl:mr-2 max-xl:mr-0 min-[1700px]:mr-10'
                      }>
                      {item.nftsLoaded &&
                        item.nftsLoaded.length > 0 &&
                        item.nftsLoaded
                          .slice(0, 3)
                          .map((nft, index: number) => (
                            <div
                              key={index}
                              className="relative my-2 h-full w-full  !rounded-md px-1 py-0"
                              style={{ zIndex: 50 + index }}>
                              <div className="w-fit !rounded-md bg-black px-[3px] py-[1px]">
                                <Image
                                  unoptimized
                                  src={
                                    nft.metadata?.image ||
                                    '/images/reavers.webp'
                                  }
                                  alt={nft.metadata?.name || ''}
                                  width={400}
                                  height={200}
                                  className="h-[30px] min-h-[30px] w-[30px] min-w-[30px] !rounded-md object-contain"
                                />
                              </div>
                            </div>
                          ))}

                      {(!item.nftsLoaded || item.nftsLoaded.length === 0) &&
                        item.nftIds.map((id) => (
                          <div
                            key={index}
                            className="relative my-2 h-full w-full  !rounded-md px-1 py-0"
                            style={{ zIndex: 50 + index }}>
                            <div className="w-fit !rounded-md px-[3px] py-[1px]">
                              <Image
                                src={'/images/no_pfp.webp'}
                                alt={'Placeholder Image'}
                                width={400}
                                height={200}
                                className="h-[30px] min-h-[30px] w-[30px] min-w-[30px] !rounded-md object-contain blur-sm"
                                unoptimized
                              />
                            </div>
                          </div>
                        ))}

                      {item.nftIds.length > 3 && (
                        <div className="relative z-[53] h-full w-full px-1  py-0">
                          <div className="!rounded-md bg-black px-[5px] py-[2px]">
                            <div className="flex h-[54px] w-[52px] items-center justify-center !rounded-md bg-[#242424] pt-1 text-[14px] text-white">
                              +{item.nftIds.length - 3}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div
                      className={
                        'grid w-full grid-cols-2 items-center justify-between gap-2 whitespace-nowrap  py-2'
                      }>
                      <div className="relative z-30 flex h-full w-full flex-row items-center justify-between">
                        {item.outcome.type === 'success' && (
                          <div
                            className={`${
                              item.missionName === 'Raid and Plunder'
                                ? 'bg-treasure-primary/90'
                                : 'bg-activity-success'
                            } -mr-8 rounded-sm p-1 pt-1.5 text-[10px]`}>
                            <span className="px-2 uppercase text-white max-2xl:px-0.5">
                              Success
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="relative z-30 mr-2 flex h-full items-end justify-end gap-2">
                        {item.type === 'Plunders' &&
                          item.missionName !== 'Supply Store' && (
                            <div
                              className={`flex flex-row items-center justify-center gap-[8px] rounded-[6px] border bg-[#0e1f12] bg-opacity-60 p-[8px] py-[4px] backdrop-blur-lg ${
                                item.missionName === 'Raid and Plunder'
                                  ? 'border-treasure-primary'
                                  : 'border-success-mission'
                              }`}>
                              <span
                                className={`font-SemiBold text-[13px] tracking-tight ${
                                  item.missionName === 'Raid and Plunder'
                                    ? 'text-treasure-primary'
                                    : 'text-success-mission'
                                }`}>
                                +
                                {item.gemsReward &&
                                  item.gemsReward.toLocaleString()}
                              </span>
                              {item.missionName === 'Raid and Plunder' ? (
                                <TreasureIcon
                                  height={18}
                                  width={18}
                                  className="h-[18px] w-[18px]"
                                />
                              ) : (
                                <GemIcon
                                  height={18}
                                  width={18}
                                  className="h-[18px] w-[18px]"
                                />
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        <Spin />
      )}
    </div>
  );
};

export default MissionActivityFeed;
