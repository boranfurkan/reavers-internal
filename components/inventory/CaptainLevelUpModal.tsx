// components/inventory/CaptainLevelUpModal.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus } from 'lucide-react';
import { Slider } from 'antd';
import Image from 'next/image';
import { useUser } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { getCostForLevelUp } from '../../utils/helpers';
import { useContext } from 'react';
import { LayerContext } from '../../contexts/LayerContext';
import { NFTType } from '../../types/BaseEntity';

import { toast } from 'sonner';
import { mutate } from 'swr';
import { config } from '../../config';
import { levelUpCaptain } from '../../lib/api/inventory/levelUpCaptain';

interface CaptainLevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: number;
  maxLevel: number;
  captainName: string;
  captainImage: string;
  captainId: string;
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

const CaptainLevelUpModal: React.FC<CaptainLevelUpModalProps> = ({
  isOpen,
  onClose,
  currentLevel,
  maxLevel,
  captainName,
  captainImage,
  captainId,
}) => {
  const [levelUpCount, setLevelUpCount] = useState(1);
  const [customInput, setCustomInput] = useState('1');
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState('');

  const { user } = useUser();
  const auth = useAuth();
  const { notifications } = useNotifications();
  const layerContext = useContext(LayerContext);

  if (!layerContext) {
    throw new Error('CaptainLevelUpModal must be used within a LayerProvider');
  }

  const { pricesData } = layerContext;

  // Calculate maximum levels that can be upgraded
  const maxLevelsUpgradeable = useMemo(() => {
    return maxLevel - currentLevel;
  }, [currentLevel, maxLevel]);

  // Calculate total cost using the existing helper function
  const totalCost = useMemo(() => {
    if (!pricesData?.usdc_booty_price) return 0;

    // Use the same cost calculation as other entities, but for captains
    return getCostForLevelUp(
      NFTType.CAPTAIN, // Use QM as default captain type for cost calculation
      pricesData.usdc_booty_price,
      currentLevel,
      currentLevel + levelUpCount,
    );
  }, [levelUpCount, currentLevel, pricesData]);

  // Calculate new level after upgrade
  const newLevel = useMemo(() => {
    return Math.min(currentLevel + levelUpCount, maxLevel);
  }, [currentLevel, levelUpCount, maxLevel]);

  // Check if user has enough BOOTY
  const hasEnoughBooty = useMemo(() => {
    if (!user?.arAmount) return false;
    return user.arAmount >= totalCost;
  }, [user?.arAmount, totalCost]);

  // Handle slider change
  const handleSliderChange = useCallback((value: number) => {
    setLevelUpCount(value);
    setCustomInput(value.toString());
  }, []);

  // Handle custom input change
  const handleCustomInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setCustomInput(value);

      const numericValue = parseInt(value) || 0;
      const clampedValue = Math.max(
        1,
        Math.min(numericValue, maxLevelsUpgradeable),
      );
      setLevelUpCount(clampedValue);
    },
    [maxLevelsUpgradeable],
  );

  // Handle level up action
  const handleLevelUp = useCallback(async () => {
    if (levelUpCount <= 0 || !hasEnoughBooty) return;

    if (!auth.isLoggedIn || !auth.jwtToken) {
      toast.error('Please log in to level up your captain');
      return;
    }

    setLoading(true);
    try {
      const response = await levelUpCaptain({
        captainId,
        levelUpCount,
        jwtToken: auth.jwtToken,
      });

      setJobId(response.jobId);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Error during captain level-up');
      setLoading(false);
    }
  }, [levelUpCount, hasEnoughBooty, totalCost, auth, captainId, onClose]);

  // Monitor job status for notifications
  React.useEffect(() => {
    if (user?.wallet && jobId !== '') {
      const notification = notifications.find(
        (n) => n.data.id === jobId && n.type === 'captainLevelUp',
      );

      if (notification) {
        if (notification.data.error) {
          toast.error(notification.data.message);
        } else {
          toast.success(
            `Successfully Levelled Up ${captainName} to Level ${
              Number(notification.data.levelUpCount) + currentLevel
            }`,
          );
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
  }, [jobId, user?.wallet, notifications, captainName, currentLevel]);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setLevelUpCount(1);
      setCustomInput('1');
      setLoading(false);
      setJobId('');
    }
  }, [isOpen]);

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
          className="relative w-full max-w-md rounded-lg border border-yellow-400/30 bg-black/90 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-6 text-white shadow-2xl backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold uppercase text-yellow-400">
              Level Up Captain
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Captain Info */}
          <div className="mb-6 flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-lg">
              <Image
                src={captainImage}
                alt={captainName}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <h3 className="text-left text-lg font-semibold">{captainName}</h3>
              <p className="text-sm text-white/70">
                Level {currentLevel} → {newLevel}
              </p>
            </div>
          </div>

          {/* Level Up Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Levels to upgrade:</span>
              <span className="text-sm text-yellow-400">
                {levelUpCount} level{levelUpCount !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Slider */}

            <Slider
              min={1}
              max={maxLevelsUpgradeable}
              value={levelUpCount}
              onChange={handleSliderChange}
              trackStyle={{ backgroundColor: '#facc15' }}
              handleStyle={{
                borderColor: '#facc15',
                backgroundColor: '#facc15',
              }}
              railStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            />

            {/* Manual Input */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLevelUpCount(Math.max(1, levelUpCount - 1))}
                className="flex h-8 w-8 items-center justify-center rounded border border-white/20 text-white transition-colors hover:bg-white/10"
                disabled={levelUpCount <= 1}>
                <Minus className="h-4 w-4" />
              </button>

              <input
                type="number"
                value={customInput}
                onChange={handleCustomInputChange}
                min={1}
                max={maxLevelsUpgradeable}
                className="flex-1 rounded border border-white/20 bg-black/30 px-3 py-1 text-center text-white"
              />

              <button
                onClick={() =>
                  setLevelUpCount(
                    Math.min(maxLevelsUpgradeable, levelUpCount + 1),
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded border border-white/20 text-white transition-colors hover:bg-white/10"
                disabled={levelUpCount >= maxLevelsUpgradeable}>
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Cost Display */}
          <div className="mb-6 rounded-lg border border-white/20 bg-black/30 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Cost:</span>
              <span className="text-lg font-bold text-yellow-400">
                ${totalCost.toFixed(2)} BOOTY
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-white/70">Your Balance:</span>
              <span
                className={hasEnoughBooty ? 'text-green-400' : 'text-red-400'}>
                ${(user?.arAmount || 0).toFixed(2)} BOOTY
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg border border-white/20 bg-transparent px-4 py-2 text-white transition-colors hover:bg-white/10">
              Cancel
            </button>

            <button
              onClick={handleLevelUp}
              disabled={!hasEnoughBooty || levelUpCount <= 0 || loading}
              className={`flex-1 rounded-lg px-4 py-2 font-semibold transition-colors ${
                hasEnoughBooty && levelUpCount > 0 && !loading
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : 'cursor-not-allowed bg-gray-600 text-gray-400'
              }`}>
              {loading ? 'Leveling Up...' : 'Level Up'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CaptainLevelUpModal;
