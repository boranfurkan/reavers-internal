import React from 'react';
import Image from 'next/image';
import { Spin } from 'antd';
import GoldBarIcon from '../../../../assets/gold-bar-icon';
import {
  formatNumberWithSuffix,
  getRarityColorWithOpacity,
} from '../../../../utils/helpers';
import { LeaderboardTreasueNFTResponse } from '../../../../lib/types';

interface LeaderboardTableProps {
  data: LeaderboardTreasueNFTResponse[];
  isLoading: boolean;
  loadingText: string;
  isReachingEnd: boolean;
  onLoadMore: () => void;
}

const TopPerformingNFT: React.FC<{ user: LeaderboardTreasueNFTResponse }> = ({
  user,
}) => (
  <div className="flex flex-row items-center justify-center gap-1">
    <Image
      src={user.imageURL || '/images/reavers.webp'}
      alt="User Image"
      width={48}
      height={48}
      className="h-[36px] w-[36px] rounded object-cover"
      unoptimized
    />
    <span className="truncate text-[12px] font-semibold">
      {'#' + user.uid.slice(0, 4) || 'N/A'}
    </span>
  </div>
);

const GoldBarEarned: React.FC<{
  user: LeaderboardTreasueNFTResponse;
  isShorten?: boolean;
}> = ({ user, isShorten }) => (
  <div className="flex flex-row items-center justify-center gap-2">
    <GoldBarIcon height={28} />
    <span className="text-[12px] font-semibold">
      {isShorten
        ? formatNumberWithSuffix(user.goldBar)
        : user.goldBar.toLocaleString()}
    </span>
  </div>
);

const AllocationValue: React.FC<{ user: LeaderboardTreasueNFTResponse }> = ({
  user,
}) => (
  <div className="flex flex-row items-center justify-center gap-2">
    <Image
      src="/images/shop/treasure-chest.png"
      alt="Treasure Chest Icon"
      width={28}
      height={28}
      unoptimized
    />
    <span className="text-[12px] font-semibold">
      {(user.allocation * 100).toFixed(4)}%
    </span>
  </div>
);

const getRarityByRank = (rank: number) => {
  switch (rank) {
    case 1:
      return 'MYTHIC';
    case 2:
      return 'LEGENDARY';
    case 3:
      return 'EPIC';
    case 4:
      return 'RARE';
    case 5:
      return 'UNCOMMON';
    case 6:
      return 'COMMON';
    default:
      return '';
  }
};

const TreasureLeaderboardNftsTable: React.FC<LeaderboardTableProps> = ({
  data,
  isLoading,
  loadingText,
  isReachingEnd,
  onLoadMore,
}) => {
  return (
    <div className="container mx-auto w-full overflow-x-auto pb-10">
      <div
        className="my-4 grid w-full min-w-[700px] items-start justify-start text-start text-xs font-bold md:min-w-[900px]"
        style={{ gridTemplateColumns: '80px repeat(5, 1fr)' }}>
        <span className="flex items-center justify-start">RANK</span>
        <span className="flex items-center justify-center">NFT</span>
        <span className="flex items-center justify-center">GOLD BARS</span>
        <div className="flex items-center justify-center">
          <span>ALLOCATION</span>
        </div>
        <span className="flex items-center justify-center">VALUE</span>
        <span className="flex items-center justify-end">WALLET HOLDER</span>
      </div>

      <div className="my-2 flex w-full flex-col items-start justify-start gap-4">
        {data.map((user: LeaderboardTreasueNFTResponse) => {
          const rarityColor = getRarityColorWithOpacity(
            getRarityByRank(user.rank),
            15,
          );

          return (
            <div
              key={user.rank}
              className="my-0 flex w-full min-w-[700px] flex-row items-center justify-between text-start md:min-w-[900px]"
              style={{ backgroundColor: rarityColor }}>
              <div
                className="grid w-full rounded-[6px] border border-reavers-border p-3 py-2.5"
                style={{ gridTemplateColumns: '80px repeat(5, 1fr)' }}>
                <div className="flex h-full items-center justify-start">
                  <div className="text-left text-xl font-semibold">
                    {'#' + user.rank}
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <TopPerformingNFT user={user} />
                </div>
                <div className="flex items-center justify-center">
                  <GoldBarEarned user={user} isShorten={true} />
                </div>
                <div className="flex items-center justify-center">
                  <AllocationValue user={user} />
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center text-[12px] font-semibold">
                    {'◎' + user.value.toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <div className="text-right text-[12px] font-semibold">
                    {user.walletAddress}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <Spin />
          <span className="fade">{loadingText}</span>
        </div>
      ) : (
        !isReachingEnd && (
          <button
            className="mt-5 rounded-md border border-white border-opacity-50 bg-transparent !py-2 px-10"
            onClick={onLoadMore}>
            Load More
          </button>
        )
      )}
    </div>
  );
};

export default TreasureLeaderboardNftsTable;
