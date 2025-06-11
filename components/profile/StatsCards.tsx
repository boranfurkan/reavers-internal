import React, { useContext, useMemo } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useNfts } from '../../contexts/NftContext';
import Image from 'next/image';
import { LayerContext } from '../../contexts/LayerContext';

function StatsCards() {
  const user = useUser();
  const layerContext = useContext(LayerContext);
  if (!layerContext) {
    throw new Error('LayerSelect must be used within a LayerProvider');
  }

  const { isMobile } = layerContext;
  const { charactersInGame, restingNfts, nftsOnMission } = useNfts();

  const allNfts = restingNfts.length + nftsOnMission.length;

  const arLooted = () => {
    const count = user.user?.arEarned || 0;

    const conditionalUnits = [
      {
        gte: 1000000,
        unit: 'm',
        toFixed: 3,
      },
      {
        gte: 1000,
        unit: 'k',
        toFixed: 1,
      },
    ];

    for (const conditionalUnit of conditionalUnits) {
      if (count > conditionalUnit.gte) {
        return `${(count / conditionalUnit.gte).toFixed(
          conditionalUnit.toFixed,
        )}${conditionalUnit.unit}`;
      }
    }

    return count.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  return (
    <div className="flex w-full flex-col items-start justify-start gap-2 border-b border-b-profile-stroke px-8 pb-7 pt-6">
      <p className="myConnect mb-1 font-SemiBold font-semibold uppercase opacity-50">
        Stats
      </p>
      <div className="grid w-full grid-cols-2 gap-4">
        <div className={`flex w-full flex-col items-start justify-start gap-4`}>
          <div className="relative flex h-full w-full flex-row items-start justify-start gap-1 rounded-lg border border-profile-stroke  pb-2 text-xs">
            <div className="ml-1 flex h-full w-full flex-col items-start justify-center gap-4 px-4 py-3">
              <p className="profileInfoTag2 text-center font-Body uppercase opacity-50">
                Hours Played
              </p>
              <p className="profileInfoTag text-center font-SemiBold">
                {(user.user && (user.user.timePlayed / 3600).toFixed(2)) || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-start justify-start gap-4">
          <div className="relative flex h-full w-full flex-row items-start justify-start gap-1 rounded-lg border border-profile-stroke pb-2  text-xs">
            <div className="ml-1 flex h-full w-full flex-col items-start justify-center gap-4 px-4 py-3">
              <p className="profileInfoTag2 whitespace-nowrap text-left font-Body uppercase opacity-50">
                Missions Completed
              </p>
              <p className="profileInfoTag text-center font-SemiBold">
                {(user.user && user.user.missionsPlayed) || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex w-full flex-col items-start justify-start gap-4">
          <div className="relative flex h-full w-full flex-row items-center justify-start gap-1 rounded-lg border border-profile-stroke pb-2  text-xs">
            <div
              className={`ml-1 flex w-2/3  flex-col items-start justify-center gap-4 px-4 py-3 ${
                isMobile && '!w-full'
              }`}>
              <p className="profileInfoTag2 whitespace-nowrap text-start font-Body uppercase opacity-50 md:text-center">
                $BOOTY Looted
              </p>
              <p className="profileInfoTag text-start font-SemiBold">
                {arLooted()}
              </p>
            </div>
            <div
              className={`-mb-4 flex h-full w-1/3 items-end justify-end ${
                isMobile && '!absolute -right-1.5 bottom-0 !m-0 !block h-max'
              }`}>
              <Image
                width={160}
                height={64}
                src="/images/coins.webp"
                alt="map"
                className={`h-16 w-40 rounded-br-lg rounded-tr-lg object-contain ${
                  isMobile && 'h-4 w-4'
                }`}
                unoptimized
              />
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-start justify-start gap-4">
          <div className="relative flex h-full w-full flex-row items-start justify-start gap-1 rounded-lg border border-profile-stroke pb-2  text-xs">
            <div className="ml-1 flex h-full w-full flex-col items-start justify-center gap-4 px-4 py-3">
              <p className="profileInfoTag2 text-center font-Body uppercase opacity-50">
                Reavers owned
              </p>
              <p className="profileInfoTag text-center font-SemiBold ">
                {allNfts}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsCards;
