import React, {
  useState,
  useEffect,
  useMemo,
  useContext,
  useCallback,
} from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Spin } from 'antd';
import { toast } from 'sonner';
import { useAuth } from '../../../contexts/AuthContext';
import { useUser } from '../../../contexts/UserContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import { mutate } from 'swr';
import { config } from '../../../config';
import { NFTType } from '../../../types/BaseEntity';
import { CharacterType } from '../../../types/Character';
import { levelUpEntities } from '../../../lib/api/inventory/levelUpEntities';
import {
  findMaxLevelForEntity,
  getCostForLevelUp,
  getLevelRarity,
  cn,
} from '../../../utils/helpers';
import {
  RARITY_COLORS,
  getRarityBorderColor,
  getRarityGradient,
  animations,
} from '../../../utils/inventory-helpers';
import MinusIcon from '../../../assets/minus-icon';
import PlusIcon from '../../../assets/plus-icon';
import ArrowRightIcon from '../../../assets/arrow-right-icon';
import ArrowUpIcon from '../../../assets/arrow-up';
import { LayerContext } from '../../../contexts/LayerContext';

interface UpgradeCardProps {
  uid: string;
  name: string;
  imageURL: string;
  type: NFTType | CharacterType;
  level: number;
  className?: string;
  isOnMission: boolean;
  isLegendarySpecial?: boolean;
}

// Define rarity style interface for type safety
interface RarityStyle {
  background: string;
  borderColor: string;
  gradient?: string;
  border?: string;
}

const EnhancedUpgradeCard: React.FC<UpgradeCardProps> = ({
  uid,
  name,
  imageURL,
  type,
  level,
  className,
  isOnMission,
  isLegendarySpecial = false,
}) => {
  // Get maximum level for this entity
  const maxLevel = useMemo(
    () => findMaxLevelForEntity(type, isLegendarySpecial),
    [type, isLegendarySpecial],
  );

  // Local state
  const [jobId, setJobId] = useState('');
  const [amount, setAmount] = useState(level === maxLevel ? 0 : 1);
  const [loading, setLoading] = useState(false);

  // Contexts
  const auth = useAuth();
  const user = useUser();
  const { notifications } = useNotifications();
  const layerContext = useContext(LayerContext);

  if (!layerContext) {
    throw new Error('UpgradeCard must be used within a LayerProvider');
  }

  const { pricesData, isPriceLoading } = layerContext;

  // Calculate the rarity for the current level and the target level
  const currentRarity = useMemo(() => {
    // For standard entities, rarity is determined by level
    if (
      type === NFTType.CREW ||
      type === NFTType.ITEM ||
      type === NFTType.SHIP
    ) {
      return getLevelRarity(type, level, isLegendarySpecial);
    } else {
      return 'MYTHIC'; // Default for captains
    }
  }, [type, level, isLegendarySpecial]);

  const targetRarity = useMemo(() => {
    // For standard entities, rarity is determined by level
    if (
      type === NFTType.CREW ||
      type === NFTType.ITEM ||
      type === NFTType.SHIP
    ) {
      return getLevelRarity(type, level + amount, isLegendarySpecial);
    } else {
      return 'MYTHIC'; // Default for captains
    }
  }, [type, level, amount, isLegendarySpecial]);

  // Calculate total cost for level upgrade
  const totalCost = useMemo(() => {
    return pricesData?.usdc_booty_price && level + amount <= maxLevel
      ? getCostForLevelUp(
          type,
          pricesData.usdc_booty_price,
          level,
          level + amount,
        ).toFixed(2)
      : '0';
  }, [type, level, amount, pricesData, maxLevel]);

  // Check if upgrade button should be disabled
  const isDisabled = useMemo(
    () => isOnMission || loading || isPriceLoading || level >= maxLevel,
    [isOnMission, loading, isPriceLoading, level, maxLevel],
  );

  // Handle amount change with boundary checks
  const handleAmountChange = useCallback(
    (value: number) => {
      const newAmount = amount + value;
      if (newAmount < 1 || level + newAmount > maxLevel) return;
      setAmount(newAmount);
    },
    [amount, level, maxLevel],
  );

  // Handle level up action
  const handleLevelUpEntities = async () => {
    if (
      isOnMission ||
      loading ||
      !pricesData ||
      !auth.isLoggedIn ||
      !user.user?.wallet
    )
      return;

    // Check if user has enough funds
    if (Number(totalCost) > user.user.arAmount) {
      toast.error('Not enough funds to level up');
      return;
    }

    setLoading(true);
    try {
      const response = await levelUpEntities({
        type: type.toUpperCase(),
        levelUpUid: uid,
        levelUpCount: amount,
        jwtToken: auth.jwtToken!,
      });
      setJobId(response.jobId);
      setAmount(0);
    } catch (error: any) {
      toast.error(error.message || 'Error during level-up');
      setLoading(false);
    }
  };

  // Monitor job status for notifications
  useEffect(() => {
    if (user.user?.wallet && jobId !== '') {
      const notification = notifications.find(
        (n) => n.data.id === jobId && n.type === 'levelUpEntities',
      );

      if (notification) {
        if (notification.data.error) {
          toast.error(notification.data.message);
        } else {
          toast.success(
            `Successfully Levelled Up ${name} to Level ${
              Number(notification.data.levelUpCount) + level
            }`,
          );
        }

        // Refresh data
        mutate(`${config.worker_server_url}/users/me`);
        mutate(`${config.worker_server_url}/nfts`);
        mutate(`${config.worker_server_url}/items/fetch-items`);

        setLoading(false);
        setJobId('');
      } else {
        // Handle timeout for long-running jobs
        const timeoutId = setTimeout(() => {
          // Force refresh after timeout
          mutate(`${config.worker_server_url}/users/me`);
          mutate(`${config.worker_server_url}/nfts`);
          mutate(`${config.worker_server_url}/items/fetch-items`);
          setLoading(false);
          toast('Timeout, reloading...');
          setJobId('');
        }, 20000);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [jobId, user.user?.wallet, notifications, name, level]);

  // Get styling based on rarity with type safety
  const getCurrentRarityStyle = (): RarityStyle => {
    // Handle standard rarities
    const rarityKey = currentRarity as keyof typeof RARITY_COLORS;
    return {
      background:
        RARITY_COLORS[rarityKey]?.gradient || RARITY_COLORS.COMMON.gradient,
      borderColor:
        RARITY_COLORS[rarityKey]?.border || RARITY_COLORS.COMMON.border,
      gradient:
        RARITY_COLORS[rarityKey]?.gradient || RARITY_COLORS.COMMON.gradient,
      border: RARITY_COLORS[rarityKey]?.border || RARITY_COLORS.COMMON.border,
    };
  };

  const getTargetRarityStyle = (): RarityStyle => {
    // Handle standard rarities
    const rarityKey = targetRarity as keyof typeof RARITY_COLORS;
    return {
      background:
        RARITY_COLORS[rarityKey]?.gradient || RARITY_COLORS.COMMON.gradient,
      borderColor:
        RARITY_COLORS[rarityKey]?.border || RARITY_COLORS.COMMON.border,
      gradient:
        RARITY_COLORS[rarityKey]?.gradient || RARITY_COLORS.COMMON.gradient,
      border: RARITY_COLORS[rarityKey]?.border || RARITY_COLORS.COMMON.border,
    };
  };

  const currentStyle = getCurrentRarityStyle();
  const targetStyle = getTargetRarityStyle();

  // Get the right text for level up button
  const getLevelUpButtonText = () => {
    if (loading) {
      return <Spin size="small" />;
    }

    if (level >= maxLevel) {
      return 'Max Level';
    }

    return `Level Up x${amount}`;
  };

  return (
    <motion.div
      variants={animations.cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={isOnMission ? undefined : 'hover'}
      whileTap={isOnMission ? undefined : 'tap'}
      className="flex h-full max-h-[218px] w-full items-center justify-center">
      <div
        className={cn(
          'relative flex h-full w-full flex-col overflow-hidden rounded-lg border border-white/20 shadow-lg',
          isOnMission ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
          className,
        )}
        style={
          isOnMission
            ? { background: 'rgba(0, 0, 0, 0.4)' }
            : {
                background: currentStyle.gradient || currentStyle.background,
                borderColor: currentStyle.border || currentStyle.borderColor,
              }
        }>
        {/* Glass overlay with subtle animation */}
        <motion.div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          animate={{
            backgroundImage: [
              'linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0.3))',
              'linear-gradient(to right, rgba(0,0,0,0.3), rgba(0,0,0,0.4))',
              'linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0.3))',
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Card content */}
        <div className="relative z-10 flex h-full w-full flex-col items-center p-4 text-center">
          <div className="relative h-16 w-16 overflow-hidden">
            <Image
              src={imageURL}
              alt={name}
              width={64}
              height={64}
              className="object-contain"
              unoptimized
            />
          </div>

          <p className="mt-2 truncate text-sm font-semibold uppercase text-white">
            {name}
          </p>

          <div className="mt-2 flex flex-row items-center justify-center gap-1 uppercase">
            <motion.div
              className="flex items-center rounded-md bg-black/30 px-2 py-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}>
              <p className="text-xs font-semibold text-white">Level {level}</p>
              <div
                className="ml-1 h-2 w-2 rounded-full"
                style={{
                  backgroundColor:
                    currentStyle.border || currentStyle.borderColor,
                }}
              />
            </motion.div>

            <div className="flex flex-row items-center justify-center -space-x-1">
              <ArrowRightIcon className="h-3 w-3 text-white opacity-30" />
              <ArrowRightIcon className="h-3 w-3 text-white opacity-60" />
              <ArrowRightIcon className="h-3 w-3 text-white" />
            </div>

            <motion.div
              className="flex items-center rounded-md px-2 py-1"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              style={{
                background: targetStyle.gradient || targetStyle.background,
              }}>
              <p className="text-xs font-semibold text-white">
                Level {level + amount}
              </p>
              <div
                className="ml-1 h-2 w-2 rounded-full"
                style={{
                  backgroundColor:
                    targetStyle.border || targetStyle.borderColor,
                }}
              />
            </motion.div>
          </div>

          <div className="mt-3 flex flex-row items-center justify-center gap-1">
            <h5 className="text-xs font-bold uppercase text-gray-300">Cost</h5>
            <span className="rounded-md bg-black/30 px-2 py-0.5 text-xs font-semibold text-white">
              {totalCost} $BOOTY
            </span>
          </div>
        </div>

        {/* Footer controls */}
        <div className="relative z-10 mt-auto flex h-12 w-full flex-row items-center justify-between">
          <button
            onClick={() => handleAmountChange(-1)}
            className={cn(
              'flex h-full w-10 min-w-10 items-center justify-center rounded-bl-md border-t border-white/20 text-white transition-colors',
              isDisabled || amount <= 1
                ? 'cursor-not-allowed opacity-50'
                : 'hover:bg-white/10',
            )}
            disabled={amount <= 1 || isDisabled}
            style={{ borderRight: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <MinusIcon className="h-4 w-4" fill="white" />
          </button>

          <button
            onClick={handleLevelUpEntities}
            className={cn(
              'flex h-full w-full items-center justify-center border-t border-white/20 font-medium text-white transition-colors',
              isDisabled
                ? 'cursor-not-allowed opacity-50'
                : 'hover:bg-white/10',
            )}
            disabled={isDisabled}>
            {getLevelUpButtonText()}
          </button>

          <button
            onClick={() => handleAmountChange(1)}
            className={cn(
              'flex h-full w-10 min-w-10 items-center justify-center rounded-br-md border-t border-white/20 text-white transition-colors',
              isDisabled
                ? 'cursor-not-allowed opacity-50'
                : 'hover:bg-white/10',
            )}
            disabled={isDisabled}
            style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <PlusIcon className="h-4 w-4" fill="white" />
          </button>
        </div>

        {/* Type indicator */}
        <span className="absolute left-3 top-3 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-medium uppercase text-white">
          {type}
        </span>

        {/* MAX button - Fixed z-index issue */}
        <div className="absolute right-3 top-3 z-20 flex items-center">
          <button
            onClick={() => {
              if (level === maxLevel || isDisabled) return;
              setAmount(maxLevel - level);
            }}
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold transition-all',
              level === maxLevel || isDisabled
                ? 'cursor-not-allowed bg-gray-600/50 text-gray-400'
                : 'bg-white/20 text-white hover:bg-white/30',
            )}
            title={
              level === maxLevel
                ? 'Already at maximum level'
                : 'Set to maximum level'
            }
            disabled={level === maxLevel || isDisabled}>
            <ArrowUpIcon
              fill={level === maxLevel || isDisabled ? '#9CA3AF' : 'white'}
              width={10}
              height={10}
            />
            <span>MAX</span>
          </button>
        </div>

        {/* Mission overlay */}
        {isOnMission && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
            <div className="rounded-md bg-black/70 px-3 py-1.5 text-sm font-medium text-white">
              On Mission
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EnhancedUpgradeCard;
