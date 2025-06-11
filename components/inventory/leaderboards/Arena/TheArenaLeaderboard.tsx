import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  memo,
} from 'react';
import { Spin } from 'antd';
import { LayerContext } from '../../../../contexts/LayerContext';
import { useLeaderboardContext } from '../../../../contexts/LeaderboardContext';
import MessageIcon from '../../../../assets/message-icon';
import LevelIcon from '../../../../assets/level-icon';
import XPIcon from '../../../../assets/xp-icon';
import ArenaUserSection from './ArenaUserSection';
import { StatCardProps, ChampionCardProps, LeaderboardRowProps } from './types';
import { ArenaLeaderboardStat } from '../../../../lib/types';
import ArenaSendModal from './ArenaSendModal';

// Memoized StatCard component
const StatCard = memo<StatCardProps>(({ title, value, icon }) => (
  <div className="relative overflow-hidden rounded-lg border-2 border-[#ffa500]/30 bg-black/75 p-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-[#ffa500]/50 hover:bg-black/95">
    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#ffa500]/10 blur-2xl" />
    <div className="relative">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm tracking-wider text-[#ffa500]/80 md:text-base">
          {title}
        </p>
        <div className="text-[#ffa500]">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-[#ffd700] md:text-4xl">{value}</p>
    </div>
  </div>
));

StatCard.displayName = 'StatCard';

// Memoized ChampionCard component
const ChampionCard = memo<ChampionCardProps>(({ champion }) => {
  const cardItems = React.useMemo(
    () => [
      { label: 'Level', value: champion.level, icon: <LevelIcon /> },
      { label: 'XP', value: champion.xp.toLocaleString(), icon: <XPIcon /> },
      {
        label: 'Battles Won',
        value: champion.messageCount.toLocaleString(),
        icon: <MessageIcon />,
      },
    ],
    [champion],
  );

  return (
    <div className="mt-8 overflow-hidden rounded-xl border-2 border-[#ffa500]/30 bg-black/75 p-4 shadow-2xl backdrop-blur-lg md:p-6">
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#ffa500]/10 blur-3xl" />

      <div className="mb-6 flex items-center gap-4">
        <h3 className="text-2xl uppercase tracking-wider text-[#ffd700] md:text-3xl">
          Current Champion
        </h3>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center rounded-lg border-2 border-[#ffa500]/20 bg-black/70 p-3 backdrop-blur-sm transition-all duration-300 hover:border-[#ffa500]/30 hover:bg-black/80 md:p-4">
          <span className="text-xs uppercase tracking-wider text-[#ffa500]/80 md:text-sm">
            Username
          </span>
          <span className="mt-2 text-lg font-bold text-[#ffd700] md:text-xl">
            {champion.username}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {cardItems.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center rounded-lg border-2 border-[#ffa500]/20 bg-black/70 p-3 backdrop-blur-sm transition-all duration-300 hover:border-[#ffa500]/30 hover:bg-black/80 md:p-4">
              <div className="flex items-center gap-2">
                {item.icon && <div className="text-[#ffa500]">{item.icon}</div>}
                <span className="text-xs uppercase tracking-wider text-[#ffa500]/80 md:text-sm">
                  {item.label}
                </span>
              </div>
              <span className="mt-2 text-lg font-bold text-[#ffd700] md:text-xl">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

ChampionCard.displayName = 'LeaderboardRow';

// Memoized LeaderboardRow component with CSS containment
const LeaderboardRow = memo<LeaderboardRowProps>(({ user, rank }) => {
  const getRarityColor = useCallback((rank: number): string => {
    const colors: Record<number, string> = {
      1: 'from-[#ffa500]/80 to-[#ffa500]/60',
      2: 'from-[#c0c0c0]/80 to-[#c0c0c0]/60',
      3: 'from-[#cd7f32]/80 to-[#cd7f32]/60',
    };
    return colors[rank] || 'from-black/80 to-black/60';
  }, []);

  return (
    <div className="reltive group w-full transform transition-all duration-300 hover:scale-[1.02]">
      <div
        className={`absolute inset-0 rounded-lg bg-gradient-to-r ${getRarityColor(
          rank,
        )} opacity-70`}
      />
      <div className="relative grid w-full grid-cols-2 items-center gap-2 rounded-lg border-2 border-[#ffa500]/30 bg-black/70 p-3 backdrop-blur-sm md:grid-cols-5 md:gap-4 md:p-4">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="text-xl font-bold text-[#ffd700] md:text-2xl">
            #{rank}
          </span>
        </div>
        <div className="truncate text-center font-bold text-[#ffd700]">
          {user.username}
        </div>
        <div className="hidden items-center justify-center gap-2 md:flex">
          <LevelIcon className="text-[#ffa500]" height={20} width={20} />
          <span className="text-[#ffd700]">{user.level}</span>
        </div>
        <div className="hidden items-center justify-center gap-2 md:flex">
          <XPIcon className="text-[#ffa500]" height={20} width={20} />
          <span className="text-[#ffd700]">{user.xp.toLocaleString()}</span>
        </div>
        <div className="hidden items-center justify-center gap-2 md:flex">
          <MessageIcon className="text-[#ffa500]" height={20} width={20} />
          <span className="text-[#ffd700]">
            {user.messageCount.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
});

LeaderboardRow.displayName = 'LeaderboardRow';

const TheArenaLeaderboard: React.FC = () => {
  const PAGE_LIMIT = 10;
  const layerContext = useContext(LayerContext);
  const leaderboardContext = useLeaderboardContext();
  const [isReachingEnd, setReachingEnd] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('Loading...');

  const loadingTexts = React.useMemo(
    () => ['Loading...', 'Preparing Arena...', 'Almost there...'],
    [],
  );

  const allUsers = React.useMemo(
    () =>
      (leaderboardContext?.arenaLeaderboard?.data || []).reduce<
        ArenaLeaderboardStat[]
      >((prevVal, currVal) => [...prevVal, ...currVal], []),
    [leaderboardContext?.arenaLeaderboard?.data],
  );

  const champion = React.useMemo(
    () => allUsers.find((user: ArenaLeaderboardStat) => user.rank === 1),
    [allUsers],
  );

  const otherUsers = React.useMemo(
    () => allUsers.filter((user: ArenaLeaderboardStat) => user.rank !== 1),
    [allUsers],
  );

  useEffect(() => {
    if (!layerContext) {
      throw new Error('LayerMap must be used within a LayerProvider');
    }
  }, [layerContext]);

  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      index = (index + 1) % loadingTexts.length;
      setLoadingText(loadingTexts[index]);
    }, 3000);
    return () => clearInterval(intervalId);
  }, [loadingTexts]);

  useEffect(() => {
    if (leaderboardContext?.arenaLeaderboard) {
      setReachingEnd(
        !leaderboardContext.arenaLeaderboard.data ||
          (leaderboardContext.arenaLeaderboard.data &&
            leaderboardContext.arenaLeaderboard.data[
              leaderboardContext.arenaLeaderboard.data.length - 1
            ]?.length < PAGE_LIMIT),
      );
    }
  }, [leaderboardContext?.arenaLeaderboard]);

  if (!leaderboardContext) return null;

  const { arenaLeaderboard } = leaderboardContext;

  return (
    <>
      <div className="h-full w-full overflow-y-auto bg-[url('/images/bgbg.webp')] bg-cover bg-fixed p-4 md:p-8">
        <div className="container mx-auto">
          <div className="h-full w-full rounded-xl bg-black/80 ">
            <div className="flex w-full flex-col rounded-xl border-2 border-[#ffa500]/30 bg-[#ffa5001a] backdrop-blur-md">
              <ArenaUserSection />
              <div className="flex h-full flex-col p-4 md:p-8">
                <h2 className="mb-6 text-center text-2xl uppercase tracking-wider text-[#ffd700] md:mb-8 md:text-3xl">
                  Arena Statistics
                </h2>
                <div className="mb-6 grid grid-cols-1 gap-4 md:mb-8 md:gap-6">
                  <StatCard
                    title="Total Players"
                    value={arenaLeaderboard.totalPlayers || 0}
                    icon={<LevelIcon width={24} height={24} />}
                  />
                </div>

                {champion && <ChampionCard champion={champion} />}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border-2 border-[#ffa500]/30 bg-black/80 p-4 backdrop-blur-sm md:mt-8 md:p-8">
            <h2 className="mb-6 text-center text-2xl text-[#ffd700] md:mb-8 md:text-3xl">
              Leaderboard Rankings
            </h2>

            <div className="hidden grid-cols-5 gap-4 px-4 text-sm font-bold text-[#ffa500] md:grid">
              <div>RANK</div>
              <div className="text-center uppercase">USERNAME</div>
              <div className="text-center uppercase">LEVEL</div>
              <div className="text-center uppercase">XP</div>
              <div className="text-center uppercase">Battles Won</div>
            </div>

            <div className="mt-4 space-y-3 md:space-y-4">
              {otherUsers.map((user) => (
                <LeaderboardRow key={user.rank} user={user} rank={user.rank} />
              ))}
            </div>

            <div className="mt-6 flex justify-center md:mt-8">
              {arenaLeaderboard.isLoading || arenaLeaderboard.isValidating ? (
                <div className="flex flex-col items-center gap-4">
                  <Spin />
                  <span className="text-[#ffd700]">{loadingText}</span>
                </div>
              ) : (
                !isReachingEnd && (
                  <button
                    onClick={() =>
                      arenaLeaderboard.setCurrentPage((current) => current + 1)
                    }
                    className="rounded-lg border-2 border-[#ffa500]/50 bg-black/60 px-6 py-2 text-[#ffd700] transition-all duration-300 hover:border-[#ffa500]/60 hover:bg-black/70 md:px-8">
                    Load More
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
      <ArenaSendModal
        isModalOpen={leaderboardContext.arenaModalOpen}
        setIsModalOpen={leaderboardContext.setArenaModalOpen}
      />
    </>
  );
};

export default TheArenaLeaderboard;
