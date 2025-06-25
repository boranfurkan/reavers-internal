import React, { useContext, useEffect, useState } from 'react';
import { useUser } from '../../../../contexts/UserContext';
import { useLeaderboardContext } from '../../../../contexts/LeaderboardContext';
import { LayerContext } from '../../../../contexts/LayerContext';
import StatsSection from './StatsSection';
import TreasureLeaderboardNftsTable from './TreasureLeaderboardNftsTable';
import TreasureLeaderboardUsersTable from './TreasureLeaderboardUsersTable';

type TableTab = 'nfts' | 'users';

function TreasureLeaderboard() {
  const layerContext = useContext(LayerContext);
  if (!layerContext)
    throw new Error('LayerMap must be used within a LayerProvider');

  const PAGE_LIMIT = 10;
  const user = useUser();
  const leaderboardContext = useLeaderboardContext();
  const [isReachingEnd, setReachingEnd] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading...');
  const loadingTexts = ['Loading...', 'Almost there...', 'Arrrrr!'];
  const [currentTab, setCurrentTab] = useState<TableTab>('nfts');

  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      index = (index + 1) % loadingTexts.length;
      setLoadingText(loadingTexts[index]);
    }, 3000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (leaderboardContext?.treasureLeaderboardNfts) {
      const { treasureLeaderboardNfts } = leaderboardContext;
      setReachingEnd(
        !treasureLeaderboardNfts ||
          !treasureLeaderboardNfts.data ||
          (treasureLeaderboardNfts.data &&
            treasureLeaderboardNfts.data[
              treasureLeaderboardNfts.data.length - 1
            ]?.length < PAGE_LIMIT),
      );
    }
  }, [leaderboardContext?.treasureLeaderboardNfts]);

  if (
    !leaderboardContext ||
    !user ||
    !leaderboardContext.treasureLeaderboardNfts
  )
    return null;

  const {
    treasureLeaderboardNfts,
    treasureLeaderboardUsers,

    searchTerm,
    setSearchTerm,
    showUserRank,
    setShowUserRank,
    leaderboardMe,
  } = leaderboardContext;

  const nftTableData = (treasureLeaderboardNfts.data || []).reduce(
    (prevVal, currVal) => [...prevVal, ...currVal],
    [],
  );

  const userTableData = (treasureLeaderboardUsers.data || []).reduce(
    (prevVal, currVal) => [...prevVal, ...currVal],
    [],
  );

  return (
    <div className="mt-1 h-full w-full overflow-scroll p-4">
      {/* Important Message */}
      <section className="container relative mx-auto mb-6 w-full ">
        <div className="mx-auto rounded-lg border-l-4 border-yellow-500 bg-yellow-900/20 p-4 backdrop-blur-sm">
          <div className="flex w-full items-start justify-center">
            <div className="ml-3">
              <div className="flex w-full items-center justify-center gap-2">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-medium uppercase text-yellow-300">
                  Important Note:
                </h4>
              </div>
              <div className="mt-2 text-yellow-100">
                <p className="font-medium">
                  ONLY minted Captains with GOLD Bars will be included in the
                  Treasure Chest Snapshot.
                </p>
                <p className="mt-1 text-yellow-200">
                  Non-minted Captains WILL not count towards your allocation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mb-4 w-full">
        <div className="container relative mx-auto flex h-[150px] flex-col items-center justify-center gap-2 rounded-lg bg-leaderboard-header bg-cover bg-center">
          <span className="text-Header text-[18px] uppercase">
            The Seven Seas
          </span>
          <h3 className="text-Header text-3xl font-normal uppercase md:text-5xl">
            Treasure Chest Leaderboard
          </h3>
        </div>
      </section>

      {leaderboardMe?.data && <StatsSection stats={leaderboardMe.data} />}

      {/* Tab System */}
      <div className="mb-6 flex w-full justify-center">
        <div className="inline-flex rounded-lg border border-yellow-600/30 bg-yellow-800/20 p-1">
          <button
            className={`px-6 py-2 text-sm font-medium transition-all duration-200 ${
              currentTab === 'nfts'
                ? 'rounded-md bg-yellow-600/30 text-yellow-300'
                : 'text-white hover:text-yellow-300'
            }`}
            onClick={() => setCurrentTab('nfts')}>
            NFT Leaderboard
          </button>
          <button
            className={`px-6 py-2 text-sm font-medium transition-all duration-200 ${
              currentTab === 'users'
                ? 'rounded-md bg-yellow-600/30 text-yellow-300'
                : 'text-white hover:text-yellow-300'
            }`}
            onClick={() => setCurrentTab('users')}>
            User Leaderboard
          </button>
        </div>
      </div>

      {currentTab === 'nfts' && (
        <TreasureLeaderboardNftsTable
          data={nftTableData}
          isLoading={
            treasureLeaderboardNfts.isLoading ||
            treasureLeaderboardNfts.isValidating
          }
          loadingText={loadingText}
          isReachingEnd={isReachingEnd}
          onLoadMore={() =>
            treasureLeaderboardNfts.setCurrentPage(
              (currentPage) => currentPage + 1,
            )
          }
        />
      )}

      {currentTab === 'users' && (
        <TreasureLeaderboardUsersTable
          data={userTableData}
          isLoading={
            treasureLeaderboardUsers.isLoading ||
            treasureLeaderboardUsers.isValidating
          }
          loadingText={loadingText}
          isReachingEnd={isReachingEnd}
          onLoadMore={() =>
            treasureLeaderboardUsers.setCurrentPage(
              (currentPage) => currentPage + 1,
            )
          }
        />
      )}
    </div>
  );
}

export default TreasureLeaderboard;
