import React from 'react';
import GoldBarIcon from '../../../../assets/gold-bar-icon';
import CaptainIcon from '../../../../assets/captain-icon';
import LeaderboardIcon from '../../../../assets/leaderboard-icon';
import DollarIcon from '../../../../assets/dollar-icon';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <div className="rounded-lg border border-yellow-600/30 bg-yellow-800/40 p-4 transition-all duration-300 hover:bg-yellow-700/50 hover:shadow-lg">
    <div className="mb-2 flex items-center justify-between">
      <p className="text-sm">{title}</p>
      {icon}
    </div>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

interface StatsSectionProps {
  stats: {
    totalGoldBurned: number;
    totalCaptainsOwned: number;
    userTotalGoldBar: number;
    userAllocation: number;
    userValue: number;
    walletAddress: string;
  };
}

const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
  return (
    <section className="my-8 w-full">
      <div className="container mx-auto space-y-6 rounded-lg border border-yellow-600/50 bg-yellow-800/30 p-8 shadow-xl backdrop-blur-md">
        <h2 className="mb-6 text-center text-3xl font-bold text-yellow-300">
          General Stats
        </h2>
        <div className="grid grid-cols-1 gap-6">
          <StatCard
            title="Total Gold Bars Burned"
            value={stats.totalGoldBurned.toFixed(0)}
            icon={<GoldBarIcon height={20} className="text-yellow-400" />}
          />
        </div>

        <h2 className="mb-6 text-center text-3xl font-bold text-yellow-300">
          Your Treasure Chest Stats
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          <StatCard
            title="Total Captains"
            value={stats.totalCaptainsOwned}
            icon={<CaptainIcon height={20} className="text-yellow-400" />}
          />
          <StatCard
            title="Total Gold Bars"
            value={stats.userTotalGoldBar.toFixed(0)}
            icon={<GoldBarIcon height={20} className="text-yellow-400" />}
          />
          <StatCard
            title="Allocation"
            value={`${(stats.userAllocation * 100).toFixed(2)}%`}
            icon={<LeaderboardIcon height={20} className="text-yellow-400" />}
          />
          <StatCard
            title="Value"
            value={`$${stats.userValue.toLocaleString()}`}
            icon={<DollarIcon height={20} className="text-yellow-400" />}
          />
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm">
            Wallet:{' '}
            <span className="rounded bg-yellow-700/50 px-2 py-1 font-mono">
              {stats.walletAddress}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
