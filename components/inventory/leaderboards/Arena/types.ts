import { ArenaLeaderboardStat } from '../../../../lib/types';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

export interface ChampionCardProps {
  champion: ArenaLeaderboardStat;
}

export interface LeaderboardRowProps {
  user: ArenaLeaderboardStat;
  rank: number;
}
