import React, { useState, useCallback, useContext, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { Slider, Spin } from 'antd';
import { toast } from 'sonner';
import { mutate } from 'swr';

import { ExchangeItem, DynamicExchangeItem } from '../../../lib/types';
import { useAuth } from '../../../contexts/AuthContext';
import { useUser } from '../../../contexts/UserContext';
import { NotificationContext } from '../../../contexts/NotificationContext';
import { config } from '../../../config';

// Icons
import GemIcon from '../../../assets/gem-icon';
import TreasureIcon from '../../../assets/treasure-icon';
import SkullIcon from '../../../assets/skull-icon';
import GoldTokenIcon from '../../../assets/gold-token-icon';
import BattleTokenIcon from '../../../assets/battle-token-icon';

type Item = ExchangeItem | DynamicExchangeItem;

interface ExchangeItemCardProps {
  item: Item;
  variant?: 'button' | 'slider'; // Choose between button or slider version
  maxValue?: number; // Max value for slider version
}

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  hover: {
    y: -6,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

const ExchangeItemCard: React.FC<ExchangeItemCardProps> = ({
  item,
  variant = 'button',
  maxValue = 100,
}) => {
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState('');

  const auth = useAuth();
  const user = useUser();
  const { notifications } = useContext(NotificationContext);

  const isDynamicItem = (item: Item): item is DynamicExchangeItem =>
    'type' in item;

  const hideTaxShow =
    item.yieldType === 'battleTokens' ||
    item.yieldType === 'captainLevelToken' ||
    item.yieldType === 'crewLevelToken' ||
    item.yieldType === 'shipLevelToken' ||
    item.yieldType === 'itemLevelToken';

  const handleAmountChange = useCallback(
    (change: number) => {
      if (isDynamicItem(item)) return;
      const newAmount = amount + change;
      if (newAmount < 1) return;
      if (variant === 'slider' && newAmount > maxValue) return;
      setAmount(newAmount);
    },
    [amount, item, variant, maxValue],
  );

  const handleSliderChange = useCallback(
    (value: number) => {
      if (!isDynamicItem(item)) {
        setAmount(value);
      }
    },
    [item],
  );

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null) return '';
    return num.toLocaleString('en-US');
  };

  const handlePurchase = async (item: Item) => {
    setLoading(true);

    if (!user.user) {
      toast.error('User not found');
      setLoading(false);
      return;
    }

    const costAmount = isDynamicItem(item)
      ? item.costAmount
      : item.costAmount * amount;
    const costType = item.costType;

    if (user.user[costType] < costAmount) {
      toast.error(
        `You don't have enough ${costType} to purchase this item. Missing ${formatNumber(
          costAmount - user.user[costType],
        )} ${costType}`,
      );
      setLoading(false);
      return;
    }

    if (!auth.jwtToken) {
      toast.error('JWT Token is missing!');
      setLoading(false);
      return;
    }

    try {
      const url = isDynamicItem(item)
        ? `${config.worker_server_url}/exchange/dynamic-purchase`
        : `${config.worker_server_url}/exchange/purchase`;

      const body = isDynamicItem(item)
        ? JSON.stringify({
            name: item.name,
          })
        : JSON.stringify({
            name: item.name,
            multiplier: amount,
          });

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.jwtToken}`,
        },
        body: body,
      });
      const responseBody = await res.json();

      if (res.status !== 200) {
        throw new Error(
          responseBody.error || 'An error occurred, try again later',
        );
      }

      setJobId(responseBody.jobId);
    } catch (error) {
      console.error(error);
      toast.error('Error Purchasing');
    }
  };

  useEffect(() => {
    if (user.user?.wallet && jobId !== '') {
      const notification = notifications.find(
        (n) => n.data.id === jobId && n.type === 'exchange',
      );
      if (notification) {
        if (notification.data.error) {
          toast.error(notification.data.message);
          setLoading(false);
          setJobId('');
          return;
        } else {
          toast.success(
            `Purchased ${notification.data.result.name} successfully`,
          );
        }
        mutate(`${config.worker_server_url}/users/me`);
        mutate(`${config.worker_server_url}/nfts`);
        setTimeout(() => {
          mutate(`${config.worker_server_url}/exchange/fetch-exchange-items`);
          setLoading(false);
          setJobId('');
        }, 1000);
      } else {
        const timeoutId = setTimeout(() => {
          mutate(`${config.worker_server_url}/users/me`);
          mutate(`${config.worker_server_url}/exchange/fetch-exchange-items`);
          setLoading(false);
          toast('Timeout, reloading...');
          setJobId('');
        }, 20000);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [jobId, user.user?.wallet, notifications]);

  // Get icon for cost/yield type
  const getIcon = (type: string, size: number = 20) => {
    const iconProps = { width: size, height: size, className: 'h-5 w-5' };

    switch (type) {
      case 'gemsAmount':
        return <GemIcon {...iconProps} />;
      case 'treasureAmount':
        return <TreasureIcon {...iconProps} />;
      case 'goldAmount':
        return <GoldTokenIcon {...iconProps} />;
      case 'arAmount':
        return <SkullIcon {...iconProps} />;
      case 'battleTokens':
        return <BattleTokenIcon {...iconProps} />;
      case 'shipLevelToken':
        return (
          <Image
            src="/images/ship-level-up-token.webp"
            alt="Ship Level Token"
            width={size}
            height={size}
            className="h-5 w-5"
            unoptimized={true}
          />
        );
      case 'crewLevelToken':
        return (
          <Image
            src="/images/crew-level-up-token.webp"
            alt="Crew Level Token"
            width={size}
            height={size}
            className="h-5 w-5"
            unoptimized={true}
          />
        );
      case 'itemLevelToken':
        return (
          <Image
            src="/images/item-level-up-token.webp"
            alt="Item Level Token"
            width={size}
            height={size}
            className="h-5 w-5"
            unoptimized={true}
          />
        );
      case 'captainLevelToken':
        return (
          <Image
            src="/images/captain-level-up-token.webp"
            alt="Captain Level Token"
            width={size}
            height={size}
            className="h-5 w-5"
            unoptimized={true}
          />
        );
      default:
        return <SkullIcon {...iconProps} />;
    }
  };

  const calculatedCostAmount = isDynamicItem(item)
    ? item.costAmount
    : item.costAmount * amount;

  const calculatedYieldAmount = isDynamicItem(item)
    ? item.yieldAmount
    : item.yieldAmount * amount;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="relative flex min-h-[520px] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-white/20 bg-gradient-to-br from-black/90 to-gray-900/90 shadow-2xl backdrop-blur-md transition-all duration-300">
      {!hideTaxShow && (
        <div className="absolute left-4 top-2 z-10 text-center text-sm font-semibold text-yellow-400/90">
          (10% TAX)
        </div>
      )}

      {/* Inactive badge */}
      {!item.active && (
        <div className="absolute right-4 top-2 z-10 rounded-md bg-red-600/90 px-2 py-1 text-xs font-semibold text-white">
          Inactive
        </div>
      )}

      {/* Image Container */}
      <div className="flex h-[220px] w-full items-center justify-center border-b border-white/20 bg-black/30 p-4">
        <div className="relative h-full w-full overflow-hidden rounded-lg">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between gap-4 p-6">
        {/* Title */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-white transition-colors duration-300 hover:text-white/80">
            {item.name}
          </h3>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-3">
          {/* Cost */}
          <div className="flex items-center justify-between rounded-lg border border-white/20 bg-black/30 p-3">
            <span className="font-semibold text-white/70">Cost</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">
                {formatNumber(calculatedCostAmount)}
              </span>
              {getIcon(item.costType)}
            </div>
          </div>

          {/* Yield */}
          <div className="flex items-center justify-between rounded-lg border border-white/20 bg-black/30 p-3">
            <span className="font-semibold text-white/70">Yield</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">
                {formatNumber(calculatedYieldAmount)}
              </span>
              {getIcon(item.yieldType)}
            </div>
          </div>

          {/* Amount Available (for dynamic items) */}
          {isDynamicItem(item) && (
            <div className="flex items-center justify-between rounded-lg border border-white/20 bg-black/30 p-3">
              <span className="font-semibold text-white/70">Available</span>
              <span className="font-bold text-white">
                {formatNumber(item.amountAvailable)}
              </span>
            </div>
          )}
        </div>

        {/* Amount Controls (only for non-dynamic items) */}
        {!isDynamicItem(item) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/70">Amount:</span>
              <span className="text-sm font-bold text-white">{amount}</span>
            </div>

            {variant === 'button' ? (
              /* Button Version */
              <div className="flex items-center overflow-hidden rounded-lg border border-white/20 bg-black/30">
                <button
                  onClick={() => handleAmountChange(-1)}
                  disabled={amount <= 1 || loading}
                  className="flex h-12 w-12 items-center justify-center text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50">
                  <Minus className="h-4 w-4" />
                </button>

                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    const clampedValue = Math.max(1, value);
                    setAmount(clampedValue);
                  }}
                  min={1}
                  disabled={loading}
                  className="flex-1 border border-b-0 border-t-0 border-white/20 bg-transparent py-3 text-center text-lg font-bold text-white outline-none disabled:opacity-50"
                />

                <button
                  onClick={() => handleAmountChange(1)}
                  disabled={loading}
                  className="flex h-12 w-12 items-center justify-center text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            ) : (
              /* Slider Version */
              <div className="space-y-3">
                <div className="px-2">
                  <Slider
                    min={1}
                    max={maxValue}
                    value={amount}
                    onChange={handleSliderChange}
                    trackStyle={{ backgroundColor: '#ffffff' }}
                    handleStyle={{
                      borderColor: '#ffffff',
                      backgroundColor: '#ffffff',
                    }}
                    railStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                    disabled={loading}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Purchase Button */}
        <button
          onClick={() => handlePurchase(item)}
          disabled={!item.active || loading}
          className={`w-full rounded-lg py-3 font-bold transition-all duration-300 ${
            !item.active || loading
              ? 'cursor-not-allowed bg-gray-600/50 text-gray-400'
              : 'bg-white text-black hover:bg-white/90 hover:shadow-lg hover:shadow-white/25 active:scale-95'
          }`}>
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Spin size="small" />
              <span>Processing...</span>
            </div>
          ) : (
            'Purchase'
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default ExchangeItemCard;
