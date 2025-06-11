// Sorted imports alphabetically and commented
import Image from 'next/image';
import React, { useContext, useMemo } from 'react';
import { useUser } from '../../contexts/UserContext'; // Custom hook to fetch user data
import { LayerContext } from '../../contexts/LayerContext';
import { useNfts } from '../../contexts/NftContext';

function ProgressStats() {
  const layerContext = useContext(LayerContext);

  if (!layerContext) {
    throw new Error('LayerMap must be used within a LayerProvider');
  }

  const { currentLevel } = layerContext;

  const user = useUser();

  // Sort the rankedNfts array by arEarned in descending order
  const sortedNfts = useMemo(() => {
    if (!user?.user?.rankedNfts) {
      return undefined;
    }
    return user.user.rankedNfts.sort(
      (nftA, nftB) => (nftB?.arEarned || 0) - (nftA?.arEarned || 0),
    );
  }, [user?.user?.rankedNfts]);

  // Select the top performing NFT
  const topPerformingNft = useMemo(() => {
    return sortedNfts ? sortedNfts[0] : null;
  }, [sortedNfts]);

  const { completedMissions, totalMissions, percentageCompleted } =
    useMemo(() => {
      const completedMissions = user.user?.missionsPlayed || 0;
      const totalMissions = currentLevel?.missions?.length || 0;
      const percentageCompleted = totalMissions
        ? (completedMissions / totalMissions) * 100
        : 0;

      return { completedMissions, totalMissions, percentageCompleted };
    }, [user, currentLevel]);

  return (
    <div className="items-between flex h-full w-full flex-col justify-between gap-4 border-b border-t border-b-profile-stroke border-t-profile-stroke p-8">
      <div className="grid w-full grid-cols-1 gap-4 ">
        <div className="flex w-full flex-col items-start justify-start gap-4 ">
          <p className="myConnect text-start font-normal uppercase opacity-50 md:text-center">
            Island Progress 7/7
          </p>
          <div className="relative flex w-full flex-row items-center justify-center overflow-hidden rounded-lg border border-profile-stroke text-xs">
            <div className="ml-4 flex w-1/3 flex-col items-start justify-center gap-3 p-4">
              <p className="profileInfoTag text-start font-Header md:text-center">
                {currentLevel.name}
              </p>
            </div>
            <div className="myClipPath h-full w-2/3 ">
              <Image
                src={'/images/maps/island-1-icon.webp'}
                width={800}
                height={800}
                alt="map"
                className="h-full max-h-[100px] w-full rounded-br-lg rounded-tr-lg object-cover"
              />
            </div>
            <div
              className="absolute bottom-0 left-0 h-0.5 rounded-bl-lg bg-green-500"
              style={{ width: `${percentageCompleted}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgressStats;
