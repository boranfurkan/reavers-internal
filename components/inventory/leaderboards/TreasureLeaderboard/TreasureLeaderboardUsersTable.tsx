import React from 'react';
import { Spin } from 'antd';
import GoldBarIcon from '../../../../assets/gold-bar-icon';
import {
  formatNumberWithSuffix,
  getRarityColorWithOpacity,
} from '../../../../utils/helpers';
import { LeaderboardTreasureUserResponse } from '../../../../lib/types';
import Image from 'next/image';

interface UserLeaderboardTableProps {
  data: LeaderboardTreasureUserResponse[];
  isLoading: boolean;
  loadingText: string;
  isReachingEnd: boolean;
  onLoadMore: () => void;
}

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

const GoldBarBurned: React.FC<{
  goldBurned: number;
  isShorten?: boolean;
}> = ({ goldBurned, isShorten }) => (
  <div className="flex flex-row items-center justify-center gap-2">
    <GoldBarIcon height={28} />
    <span className="text-[12px] font-semibold">
      {isShorten
        ? formatNumberWithSuffix(goldBurned)
        : goldBurned.toLocaleString()}
    </span>
  </div>
);

const AllocationValue: React.FC<{ allocation: number }> = ({ allocation }) => (
  <div className="flex flex-row items-center justify-center gap-2">
    <Image
      src="/images/shop/treasure-chest.png"
      alt="Treasure Chest Icon"
      width={28}
      height={28}
      unoptimized
    />
    <span className="text-[12px] font-semibold">
      {(allocation * 100).toFixed(4)}%
    </span>
  </div>
);

const TreasureLeaderboardUsersTable: React.FC<UserLeaderboardTableProps> = ({
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
        style={{ gridTemplateColumns: '80px repeat(4, 1fr)' }}>
        <span className="flex items-center justify-start">RANK</span>
        <span className="flex items-center justify-center">WALLET</span>
        <span className="flex items-center justify-center">GOLD BURNED</span>
        <span className="flex items-center justify-center">ALLOCATION</span>
        <span className="flex items-center justify-center">VALUE</span>
      </div>

      <div className="my-2 flex w-full flex-col items-start justify-start gap-4">
        {data.map((user) => {
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
                style={{ gridTemplateColumns: '80px repeat(4, 1fr)' }}>
                <div className="flex h-full items-center justify-start">
                  <div className="text-left text-xl font-semibold">
                    {'#' + user.rank}
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <span className="truncate text-[12px] font-semibold">
                    {user.owner}
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <GoldBarBurned
                    goldBurned={user.goldBurned}
                    isShorten={true}
                  />
                </div>
                <div className="flex items-center justify-center">
                  <AllocationValue allocation={user.allocation} />
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center text-[12px] font-semibold">
                    {'$' + user.value.toLocaleString()}
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

export default TreasureLeaderboardUsersTable;
