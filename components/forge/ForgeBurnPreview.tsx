import React from 'react';
import { motion } from 'framer-motion';
import { Coins } from 'lucide-react';
import Image from 'next/image';

import CaptainIcon from '../../assets/captain-icon';
import { ForgeAsset, ForgeReward, ForgeTabValue } from '../../types/forge';
import ShipIcon from '../../assets/ship-icon';
import CrewIcon from '../../assets/crew-icon';
import ItemsIcon from '../../assets/items-icon';
import GoldTokenIcon from '../../assets/gold-token-icon';

interface ForgeBurnPreviewProps {
  selectedAsset: ForgeAsset | null;
  currentRewards: ForgeReward | null;
  isLoading: boolean;
  onBurn: () => void;
  isMobile?: boolean;
}

export const ForgeBurnPreview: React.FC<ForgeBurnPreviewProps> = ({
  selectedAsset,
  currentRewards,
  isLoading,
  onBurn,
  isMobile = false,
}) => {
  if (!selectedAsset) {
    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center space-y-6 font-Body">
        <div className="space-y-2 text-center">
          <h3 className="text-lg font-bold text-white">
            Join the Captain's Club
          </h3>
          <p className="max-w-xs text-sm text-white/60">
            Select an asset to burn and unlock exclusive rewards
          </p>
        </div>

        <div className="relative h-48 w-32 sm:h-60 sm:w-40">
          <Image
            src="/images/captains-club-sample.png"
            alt="Captain's Club Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      key={selectedAsset.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-4">
      {/* Captain NFT Replacement Message */}
      {selectedAsset.type === ForgeTabValue.CAPTAIN && (
        <CaptainReplacementMessage asset={selectedAsset} isMobile={isMobile} />
      )}

      {/* Rewards */}
      {currentRewards && (
        <RewardsList rewards={currentRewards} isMobile={isMobile} />
      )}

      {/* Burn Button */}
      <BurnButton isLoading={isLoading} onBurn={onBurn} isMobile={isMobile} />
    </motion.div>
  );
};

const CaptainReplacementMessage: React.FC<{
  asset: ForgeAsset;
  isMobile: boolean;
}> = ({ asset, isMobile }) => (
  <div className="rounded-lg border border-purple-400/50 bg-gradient-to-br from-purple-900/30 to-purple-700/20 p-4 backdrop-blur-md">
    <div className="flex flex-col items-center gap-3">
      <CaptainIcon
        width={24}
        height={24}
        className="mt-1 flex-shrink-0 text-purple-400"
      />
      <div className="flex-1">
        <h4 className="mb-3 font-Body text-sm font-bold text-purple-300">
          🎁 NFT REPLACEMENT
        </h4>
        <p className="mb-4 font-Body text-sm leading-relaxed text-white/80">
          You will receive a new NFT from{' '}
          <strong className="text-purple-300">The Captain's Club</strong> with
          the same image and attributes.
        </p>
        <div className="flex items-center gap-3 rounded-lg border border-purple-400/30 bg-purple-500/20 p-3">
          <div className="h-16 w-16 overflow-hidden rounded border border-purple-400/50">
            <img
              src="/images/captains-club-logo.png"
              alt="Captain's Club Logo"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col items-start">
            <div className="font-Body text-sm font-medium text-purple-200">
              Captain's Club
            </div>
            <div className="font-Body text-xs text-purple-300/80">
              New Collection NFT
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const RewardsList: React.FC<{ rewards: ForgeReward; isMobile: boolean }> = ({
  rewards,
  isMobile,
}) => {
  const rewardItems = [
    {
      condition: rewards.shipTokens > 0,
      icon: (
        <Image
          src="/images/ship-level-up-token.webp"
          alt="Ship Token"
          width={400}
          height={400}
          quality={100}
        />
      ),
      label: 'Ship Tokens',
      description:
        "Upgrade your captain's metadata ship level with using these tokens.",
      amount: rewards.shipTokens,
      color: 'blue' as const,
    },
    {
      condition: rewards.crewTokens > 0,
      icon: (
        <Image
          src="/images/crew-level-up-token.webp"
          alt="Crew Token"
          width={400}
          height={400}
          quality={100}
        />
      ),
      label: 'Crew Tokens',
      description:
        "Upgrade your captain's metadata crew level with using these tokens.",
      amount: rewards.crewTokens,
      color: 'green' as const,
    },
    {
      condition: rewards.itemTokens > 0,
      icon: (
        <Image
          src="/images/item-level-up-token.webp"
          alt="Item Token"
          width={400}
          height={400}
          quality={100}
        />
      ),
      label: 'Item Tokens',
      description:
        "Upgrade your captain's metadata item level with using these tokens.",
      amount: rewards.itemTokens,
      color: 'purple' as const,
    },
    {
      condition: rewards.goldTokens > 0,
      icon: <GoldTokenIcon className="h-5 w-5" />,
      label: '$GOLD Tokens',
      description:
        'You will receive $GOLD tokens for burning this asset. $GOLD is the in-game currency used for various activities.',
      amount: rewards.goldTokens,
      color: 'yellow' as const,
    },
  ].filter((item) => item.condition);

  if (rewardItems.length === 0) {
    return (
      <div className="rounded-lg border border-reavers-border bg-reavers-bg-secondary/50 p-4 text-center">
        <div className="font-Body text-sm text-white/60">
          No token rewards for this asset
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Coins className="h-5 w-5 text-yellow-400" />
        <h4 className="font-Body text-sm font-bold uppercase text-white">
          Token Rewards
        </h4>
      </div>

      <div className={`grid grid-cols-1 gap-3`}>
        {rewardItems.map((item, index) => (
          <RewardItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            description={item.description}
            amount={item.amount}
            color={item.color}
            isMobile={isMobile}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

interface RewardItemProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  amount: number;
  color: 'blue' | 'green' | 'purple' | 'yellow';
  isMobile: boolean;
  index: number;
}

const RewardItem: React.FC<RewardItemProps> = ({
  icon,
  label,
  amount,
  description,
  color,
  index,
}) => {
  const colorClasses = {
    blue: 'border-blue-400/30 bg-blue-500/10 text-blue-400',
    green: 'border-green-400/30 bg-green-500/10 text-green-400',
    purple: 'border-purple-400/30 bg-purple-500/10 text-purple-400',
    yellow: 'border-yellow-400/30 bg-yellow-500/10 text-yellow-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15, delay: index * 0.05 }}
      className={`flex items-center justify-between rounded-lg border p-3 backdrop-blur-sm ${colorClasses[color]}`}>
      <div className="flex w-full flex-col items-center justify-center gap-3">
        <div className="aspect-square max-h-[80px] max-w-[80px]">{icon}</div>
        <span className="font-Body text-sm text-white">{label}</span>
        <span className="font-Body text-xs text-white/80">{description}</span>
        <span
          className={`font-Body text-lg font-bold ${
            colorClasses[color].split(' ')[2]
          }`}>
          {amount.toLocaleString()}X
        </span>
      </div>
    </motion.div>
  );
};

const BurnButton: React.FC<{
  isLoading: boolean;
  onBurn: () => void;
  isMobile: boolean;
}> = ({ isLoading, onBurn, isMobile }) => (
  <motion.button
    whileHover={!isMobile ? { scale: 1.02 } : undefined}
    whileTap={{ scale: 0.98 }}
    onClick={onBurn}
    disabled={isLoading}
    className="w-full rounded-lg border border-orange-500/50 bg-gradient-to-r from-orange-600 to-red-600 py-4 font-Body text-lg font-bold uppercase text-white shadow-lg transition-all hover:from-orange-700 hover:to-red-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50">
    <div className="flex items-center justify-center gap-2">
      {isLoading ? (
        <>
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Burning...
        </>
      ) : (
        <>🔥 Burn Asset</>
      )}
    </div>
  </motion.button>
);
