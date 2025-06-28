import Image from 'next/image';
import { useContext, useEffect, useState } from 'react';
import { LayerContext } from '../../contexts/LayerContext';
import { Spin } from 'antd';
import { getIslandIconImage, truncatePubkey } from '../../utils/helpers';
import SkullIcon from '../../assets/skull-icon';
import GemIcon from '../../assets/gem-icon';

function ActivityFeed() {
  const layerContext = useContext(LayerContext);

  if (!layerContext) {
    throw new Error('LayerSelect must be used within a LayerProvider');
  }

  const { missionFeed, missionFeedLoaded, isMobile } = layerContext;

  if (!missionFeedLoaded)
    return (
      <div className="flex h-[20vh] w-full items-center justify-center">
        <Spin />
      </div>
    );

  return (
    <div className="min-h-[180px] w-full max-w-[2400px] flex-col items-start justify-start text-start text-white ">
      <div className="my-3 mb-2 flex w-full flex-row items-center justify-between ">
        <p className="font-SemiBold text-base uppercase tracking-[-1.05]">
          Recent Activity
        </p>
        <div className="flex flex-row items-center justify-center gap-2 rounded-full border border-[#15db7f] bg-[#15db7f21] bg-opacity-[0.13] p-1 px-2 ">
          <div className="h-2 w-2 animate-pulse rounded-full bg-[#15db7f]"></div>
          <span className="text-[10px] uppercase  text-white">Live</span>
        </div>
      </div>
      <div className="relative w-full">
        <div
          className={`activityGradient absolute right-0 top-0 z-50 h-full w-40  ${
            isMobile && 'hidden'
          }`}
        />
        <div className="relative flex h-full w-full flex-row items-start justify-start gap-8 overflow-x-scroll">
          {missionFeed.map((item, index) => {
            const islandNumber = item.mission?.missionStats?.layer;
            const imageUrl = getIslandIconImage(islandNumber || 1);
            return (
              <div key={index} className="relative z-20 tracking-tight">
                <div className="absolute -right-1 top-4 z-[99] flex w-full items-center justify-end">
                  {!item.outcome?.type ||
                  item.outcome.type === 'success' ||
                  (item.gemsReward && item.gemsReward > 0) ? (
                    <div
                      className={`${
                        item.outcome?.multiplier && item.outcome.multiplier >= 5
                          ? 'fiveMultiply'
                          : 'bg-activity-success'
                      } rounded-sm p-[1px] pb-0.5 pt-1 text-[10px]`}>
                      <span className="h-3.5 px-1.5 uppercase text-white">
                        Success{' '}
                        {item.outcome?.multiplier && item.outcome.multiplier > 1
                          ? `${item.outcome.multiplier}x`
                          : ''}
                      </span>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
                <div
                  key={index}
                  className="relative flex h-[135px] w-[260px] min-w-[260px] flex-col items-start justify-between gap-0 overflow-hidden rounded-xl border border-white border-opacity-10 p-4">
                  <div className="rounded-7xl absolute left-0 top-0 z-20 h-full w-full bg-loginGradient"></div>
                  <Image
                    src={imageUrl}
                    alt="map"
                    width={400}
                    height={400}
                    className="absolute right-0 top-0 z-0 h-full w-full overflow-hidden rounded-lg object-cover"
                    unoptimized={true}
                  />
                  <div className="relative z-30 flex w-full flex-row items-center justify-start">
                    <span className="font-Body text-[12px] uppercase opacity-50">
                      Island {item.mission?.missionStats?.layer}
                    </span>
                  </div>
                  <p className="relative z-30 -mt-1 font-Body text-[14px] text-white">
                    {item.mission?.name}
                  </p>
                  {/* Profile Image and Name */}
                  <div className="relative z-30 flex w-full flex-row items-center justify-start gap-2">
                    <Image
                      src={item.userAvatar || '/images/no_pfp.webp'}
                      alt="profile"
                      width={400}
                      height={400}
                      className="h-[48px] w-[48px] overflow-hidden rounded-[6px] object-cover"
                      unoptimized={true}
                    />
                    <div className="-mt-1 flex flex-col items-start justify-start gap-[4px]">
                      <p className="font-SemiBold text-[14px] tracking-tighter">
                        {item.userName && item.userName.length
                          ? truncatePubkey(item.userName)
                          : truncatePubkey(item.userId)}
                      </p>
                      {/* Outcomes */}
                      {/* Plunders and Success */}
                      {item.type === 'Plunders' && item.arrrReward > 0 && (
                        <div
                          className={`flex flex-row items-center justify-center gap-[8px] rounded-[6px] border border-success-mission bg-[#0e1f12] bg-opacity-60 p-[8px] py-[4px] text-failed-mission backdrop-blur-lg`}>
                          <span className="font-SemiBold text-[13px] tracking-tight text-success-mission">
                            +
                            {item.arrrReward &&
                              item.arrrReward.toLocaleString()}
                          </span>
                          <SkullIcon className="h-[18px] w-[18px]" />
                        </div>
                      )}
                      {item.type === 'Plunders' &&
                      item.gemsReward &&
                      item.gemsReward > 0 ? (
                        <div
                          className={`flex flex-row items-center justify-center gap-[8px] rounded-[6px] border border-success-mission bg-[#0e1f12] bg-opacity-60 p-[8px] py-[4px] text-failed-mission backdrop-blur-lg`}>
                          <span className="font-SemiBold text-[13px] tracking-tight text-success-mission">
                            +
                            {item.gemsReward &&
                              item.gemsReward.toLocaleString()}
                          </span>
                          <GemIcon className="h-[18px] w-[18px]" />
                        </div>
                      ) : (
                        <></>
                      )}
                      {/*Riddick's Hideout */}
                      {item.mission?.missionStats?.name ===
                        "Riddick's Hideout" && (
                        <div className="flex flex-row items-center justify-center gap-2 rounded-md border border-events-bg p-2 py-1 text-xs  font-black uppercase text-events-bg backdrop-blur-lg">
                          Riddick's Hideout
                        </div>
                      )}
                      {item.mission?.missionStats?.name === "SPDR'S BOUNTY" && (
                        <div className="flex flex-row items-center justify-center gap-2 rounded-md border border-events-bg p-2 py-1 text-xs  font-black uppercase text-events-bg backdrop-blur-lg">
                          SPDR'S BOUNTY
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ActivityFeed;
