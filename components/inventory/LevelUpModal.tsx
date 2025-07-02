import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Loader2 } from 'lucide-react';
import { Slider } from 'antd';
import Image from 'next/image';
import { toast } from 'sonner';
import { mutate } from 'swr';

import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { levelUpEntities } from '../../lib/api/inventory/levelUpEntities';
import { UpgradeType } from '../../types/Upgrade';
import { CharacterNFT } from '../../types/NFT';
import { ShipRarity } from '../../types/Character';
import { useMythicShipUpgrade } from '../../hooks/api/inventory/useMythicShipUpgrade';
import LegendaryShipTokenIcon from '../../assets/legendary-ship-token-icon';
import { config } from '../../config';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'ship' | 'crew' | 'item' | 'captain';
  currentLevel: number;
  maxLevel: number;
  availableTokens: number;
  entityName: string;
  entityImage: string;
  captainId: string;
  onLevelUp?: (tokensToUse: number) => void;
  character?: CharacterNFT; // Added to get ship rarity info
}

// Modal animation variants
const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  entityType,
  currentLevel,
  maxLevel,
  availableTokens,
  entityName,
  entityImage,
  captainId,
  onLevelUp,
  character,
}) => {
  const [tokensToUse, setTokensToUse] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState('');

  const auth = useAuth();
  const { user } = useUser();
  const { notifications } = useNotifications();

  // Use the mythic ship upgrade hook for ship rarity functionality
  const { upgradeMythicShip, loading: mythicUpgradeLoading } =
    useMythicShipUpgrade();

  // Map entityType to UpgradeType
  const getUpgradeType = (
    entityType: 'ship' | 'crew' | 'item' | 'captain',
  ): UpgradeType => {
    switch (entityType) {
      case 'ship':
        return UpgradeType.SHIP;
      case 'crew':
        return UpgradeType.CREW;
      case 'item':
        return UpgradeType.ITEM;
      case 'captain':
        return UpgradeType.CHARACTER;
      default:
        return UpgradeType.SHIP;
    }
  };

  // Calculate maximum tokens that can be used
  const maxTokensUsable = useMemo(() => {
    const levelsUntilMax = maxLevel - currentLevel;
    return Math.min(availableTokens, levelsUntilMax);
  }, [availableTokens, currentLevel, maxLevel]);

  // Calculate new level after upgrade
  const newLevel = useMemo(() => {
    return Math.min(currentLevel + tokensToUse, maxLevel);
  }, [currentLevel, tokensToUse, maxLevel]);

  // Ship rarity upgrade logic
  const canUpgradeToMythic = () => {
    return (user?.legendaryShipToken || 0) >= 2;
  };

  const handleMythicShipUpgrade = async () => {
    if (!character?.uid && !character?.id) {
      console.error('Character ID is missing');
      return;
    }

    const characterId = character.uid || character.id || '';
    const characterName = character.metadata?.name || 'Captain';

    await upgradeMythicShip(characterId, characterName);
  };

  // Handle slider change
  const handleSliderChange = useCallback((value: number) => {
    setTokensToUse(value);
    setCustomInput(value.toString());
  }, []);

  // Handle custom input change
  const handleCustomInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setCustomInput(value);

      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue >= 0 && numValue <= maxTokensUsable) {
        setTokensToUse(numValue);
      }
    },
    [maxTokensUsable],
  );

  // Handle level up button click
  const handleLevelUpClick = useCallback(async () => {
    if (tokensToUse === 0) {
      toast.error('Please select the number of tokens to use');
      return;
    }

    if (!auth.isLoggedIn || !auth.jwtToken) {
      toast.error('Please log in to level up');
      return;
    }

    setLoading(true);
    try {
      const response = await levelUpEntities({
        captainId,
        levelUpCount: tokensToUse,
        type: getUpgradeType(entityType),
        jwtToken: auth.jwtToken,
      });

      setJobId(response.jobId);
      toast.success(
        `Level up initiated! Upgrading ${entityType} by ${tokensToUse} levels.`,
      );

      if (onLevelUp) {
        onLevelUp(tokensToUse);
      }
    } catch (error: any) {
      toast.error(error.message || 'Error during level up');
      setLoading(false);
    }
  }, [tokensToUse, auth, captainId, entityType, onLevelUp, getUpgradeType]);

  // Monitor job status
  useEffect(() => {
    if (user?.wallet && jobId !== '') {
      const notification = notifications.find(
        (n) => n.data.id === jobId && n.type === 'levelUpEntities',
      );

      if (notification) {
        if (notification.data.error) {
          toast.error(notification.data.message);
        } else {
          toast.success(`Successfully leveled up ${entityType}!`);
        }

        // Refresh data
        mutate(`${config.worker_server_url}/users/me`);
        mutate(`${config.worker_server_url}/nfts`);
        mutate(`${config.worker_server_url}/items/fetch-items`);

        setLoading(false);
        setJobId('');
        onClose();
      } else {
        // Handle timeout for long-running jobs
        const timeoutId = setTimeout(() => {
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
  }, [jobId, user?.wallet, notifications, entityType, onClose]);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setTokensToUse(0);
      setCustomInput('');
      setLoading(false);
      setJobId('');
    }
  }, [isOpen]);

  // Style based on entity type
  const styles = useMemo(() => {
    switch (entityType) {
      case 'ship':
        return {
          color: 'text-blue-400',
          bg: 'from-blue-500/20 to-cyan-500/20',
          border: 'border-blue-400/30',
          button:
            'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
        };
      case 'crew':
        return {
          color: 'text-green-400',
          bg: 'from-green-500/20 to-emerald-500/20',
          border: 'border-green-400/30',
          button:
            'from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
        };
      case 'item':
        return {
          color: 'text-purple-400',
          bg: 'from-purple-500/20 to-pink-500/20',
          border: 'border-purple-400/30',
          button:
            'from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
        };
      case 'captain':
        return {
          color: 'text-orange-400',
          bg: 'from-orange-500/20 to-red-500/20',
          border: 'border-orange-400/30',
          button:
            'from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600',
        };
      default:
        return {
          color: 'text-gray-400',
          bg: 'from-gray-500/20 to-gray-500/20',
          border: 'border-gray-400/30',
          button:
            'from-gray-500 to-gray-500 hover:from-gray-600 hover:to-gray-600',
        };
    }
  }, [entityType]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`relative w-full max-w-md rounded-lg border ${styles.border} ${styles.bg} bg-black/90 bg-gradient-to-br p-6 text-white shadow-2xl backdrop-blur-md`}
          onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className={`text-xl font-bold uppercase ${styles.color}`}>
              Level Up {entityType}
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Entity Info */}
          <div className="mb-6 flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-lg">
              <Image
                src={entityImage}
                alt={entityName}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold">{entityName}</h3>
              <p className="text-sm text-white/70">
                Level {currentLevel} → {newLevel}
              </p>
            </div>
          </div>

          {/* Ship Rarity Display - Only show for ships */}
          {entityType === 'ship' && character && (
            <div className="mb-6 space-y-3">
              <h4 className="text-sm font-medium text-white/80">Ship Rarity</h4>
              <div className="flex items-center justify-between rounded-md border border-white/20 bg-black/30 p-3">
                <span className="text-[12px] uppercase text-white/70">
                  Ship Rarity
                </span>
                {character.shipRarity === ShipRarity.Legendary ? (
                  <span className="text-sm font-semibold text-yellow-700">
                    Mythic
                  </span>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMythicShipUpgrade();
                    }}
                    disabled={!canUpgradeToMythic() || mythicUpgradeLoading}
                    className={`flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold transition-all duration-200 ${
                      canUpgradeToMythic() && !mythicUpgradeLoading
                        ? 'border-yellow-700 bg-yellow-700/60 text-white hover:bg-yellow-700'
                        : 'cursor-not-allowed border-gray-600 bg-gray-600/60 text-gray-400'
                    }`}
                    title={
                      !canUpgradeToMythic()
                        ? 'Need 2 Legendary Ship Tokens'
                        : 'Upgrade to Mythic Ship'
                    }>
                    <div className="flex items-center gap-1">
                      {mythicUpgradeLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <span>2X</span>
                          <LegendaryShipTokenIcon className="h-3 w-3" />
                        </>
                      )}
                      <span>
                        {mythicUpgradeLoading
                          ? 'Upgrading...'
                          : 'for Mythic Ship'}
                      </span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Available Tokens */}
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-white/70">Available Tokens:</span>
            <span className={`text-lg font-bold ${styles.color}`}>
              {availableTokens.toLocaleString()}
            </span>
          </div>

          {/* Level Up Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tokens to use:</span>
              <span className="text-sm text-white/70">
                {tokensToUse} token{tokensToUse !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Slider */}
            <div className="px-2">
              <Slider
                min={0}
                max={maxTokensUsable}
                value={tokensToUse}
                onChange={handleSliderChange}
                trackStyle={{ backgroundColor: styles.color.split('-')[1] }}
                handleStyle={{ borderColor: styles.color.split('-')[1] }}
                railStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              />
            </div>

            {/* Quick buttons and custom input */}
            <div className="grid grid-cols-4 items-center gap-2">
              <button
                onClick={() => handleSliderChange(1)}
                disabled={loading || maxTokensUsable < 1}
                className="rounded bg-white/10 px-3 py-1 text-sm transition-colors hover:bg-white/20 disabled:opacity-50">
                1
              </button>
              <button
                onClick={() =>
                  handleSliderChange(Math.floor(maxTokensUsable / 2))
                }
                disabled={loading || maxTokensUsable < 2}
                className="rounded bg-white/10 px-3 py-1 text-sm transition-colors hover:bg-white/20 disabled:opacity-50">
                Half
              </button>
              <button
                onClick={() => handleSliderChange(maxTokensUsable)}
                disabled={loading || maxTokensUsable === 0}
                className="rounded bg-white/10 px-3 py-1 text-sm transition-colors hover:bg-white/20 disabled:opacity-50">
                Max
              </button>

              <input
                type="number"
                value={customInput}
                onChange={handleCustomInputChange}
                disabled={loading}
                min={0}
                max={maxTokensUsable}
                placeholder="Custom"
                className="w-20 rounded border border-white/20 bg-black/50 px-2 py-1 text-sm text-white placeholder-white/50 focus:border-white/40 focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-md border border-white/20 bg-transparent py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-50">
              Cancel
            </button>
            <button
              onClick={handleLevelUpClick}
              disabled={loading || tokensToUse === 0}
              className={`flex-1 rounded-md bg-gradient-to-r py-2 text-sm font-medium text-white transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                loading || tokensToUse === 0
                  ? 'cursor-not-allowed bg-gray-600 text-gray-400'
                  : styles.button
              }`}>
              {loading ? 'Leveling Up...' : 'Level Up'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LevelUpModal;
