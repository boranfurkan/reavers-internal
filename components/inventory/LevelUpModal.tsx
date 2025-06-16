import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus } from 'lucide-react';
import { Slider } from 'antd';
import Image from 'next/image';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'ship' | 'crew' | 'item';
  currentLevel: number;
  maxLevel: number;
  availableTokens: number;
  entityName: string;
  entityImage: string;
  onLevelUp: (tokensToUse: number) => void;
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
  onLevelUp,
}) => {
  const [tokensToUse, setTokensToUse] = useState(0);
  const [customInput, setCustomInput] = useState('');

  // Calculate maximum tokens that can be used
  const maxTokensUsable = useMemo(() => {
    const levelsUntilMax = maxLevel - currentLevel;
    return Math.min(availableTokens, levelsUntilMax);
  }, [availableTokens, currentLevel, maxLevel]);

  // Calculate new level after upgrade
  const newLevel = useMemo(() => {
    return Math.min(currentLevel + tokensToUse, maxLevel);
  }, [currentLevel, tokensToUse, maxLevel]);

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

      const numericValue = parseInt(value) || 0;
      const clampedValue = Math.max(0, Math.min(numericValue, maxTokensUsable));
      setTokensToUse(clampedValue);
    },
    [maxTokensUsable],
  );

  // Handle level up action
  const handleLevelUp = useCallback(() => {
    if (tokensToUse > 0) {
      onLevelUp(tokensToUse);
      onClose();
    }
  }, [tokensToUse, onLevelUp, onClose]);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setTokensToUse(0);
      setCustomInput('');
    }
  }, [isOpen]);

  // Get entity type styling
  const getEntityTypeStyle = () => {
    switch (entityType) {
      case 'ship':
        return {
          color: 'text-blue-400',
          bg: 'bg-blue-500/20',
          border: 'border-blue-400/30',
          button: 'bg-blue-600 hover:bg-blue-700',
        };
      case 'crew':
        return {
          color: 'text-green-400',
          bg: 'bg-green-500/20',
          border: 'border-green-400/30',
          button: 'bg-green-600 hover:bg-green-700',
        };
      case 'item':
        return {
          color: 'text-purple-400',
          bg: 'bg-purple-500/20',
          border: 'border-purple-400/30',
          button: 'bg-purple-600 hover:bg-purple-700',
        };
      default:
        return {
          color: 'text-gray-400',
          bg: 'bg-gray-500/20',
          border: 'border-gray-400/30',
          button: 'bg-gray-600 hover:bg-gray-700',
        };
    }
  };

  const styles = getEntityTypeStyle();

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
          className={`relative w-full max-w-md rounded-lg border ${styles.border} ${styles.bg} bg-black/90 p-6 text-white shadow-2xl backdrop-blur-md`}
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
            <div className="h-16 w-16 overflow-hidden rounded-lg border border-white/20">
              <Image
                src={entityImage}
                alt={entityName}
                width={64}
                height={64}
                className="h-full w-full object-cover"
                unoptimized
              />
            </div>
            <div>
              <h3 className="font-semibold text-white">{entityName}</h3>
              <p className="text-sm text-white/70">
                Level {currentLevel} → {newLevel}
              </p>
            </div>
          </div>

          {/* Token Info */}
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Available Tokens:</span>
              <span className={`font-bold ${styles.color}`}>
                {availableTokens}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Max Level:</span>
              <span className="font-bold text-white">{maxLevel}</span>
            </div>
          </div>

          {/* Slider Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Tokens to Use:</span>
              <span className={`font-bold ${styles.color}`}>{tokensToUse}</span>
            </div>

            {/* Slider */}
            <div className="space-y-3">
              <Slider
                value={tokensToUse}
                max={maxTokensUsable}
                min={0}
                step={1}
                onChange={handleSliderChange}
                className="level-up-slider"
                trackStyle={{
                  backgroundColor: styles.color
                    .replace('text-', '')
                    .replace('-400', ''),
                }}
                handleStyle={{
                  backgroundColor: styles.color
                    .replace('text-', '')
                    .replace('-400', ''),
                  borderColor: styles.color
                    .replace('text-', '')
                    .replace('-400', ''),
                }}
                railStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  height: '4px',
                }}
                disabled={maxTokensUsable === 0}
              />

              {/* Quick Select Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleSliderChange(0)}
                  className="rounded border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/70 transition-colors hover:bg-white/10">
                  0
                </button>
                <button
                  onClick={() =>
                    handleSliderChange(Math.floor(maxTokensUsable / 4))
                  }
                  className="rounded border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/70 transition-colors hover:bg-white/10"
                  disabled={maxTokensUsable < 4}>
                  25%
                </button>
                <button
                  onClick={() =>
                    handleSliderChange(Math.floor(maxTokensUsable / 2))
                  }
                  className="rounded border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/70 transition-colors hover:bg-white/10"
                  disabled={maxTokensUsable < 2}>
                  50%
                </button>
                <button
                  onClick={() => handleSliderChange(maxTokensUsable)}
                  className="rounded border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/70 transition-colors hover:bg-white/10"
                  disabled={maxTokensUsable === 0}>
                  MAX
                </button>
              </div>
            </div>

            {/* Custom Input */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSliderChange(Math.max(0, tokensToUse - 1))}
                className="rounded border border-white/20 bg-white/5 p-2 text-white/70 transition-colors hover:bg-white/10"
                disabled={tokensToUse === 0}>
                <Minus className="h-3 w-3" />
              </button>
              <input
                type="number"
                value={customInput}
                onChange={handleCustomInputChange}
                placeholder="Custom amount"
                min="0"
                max={maxTokensUsable}
                className="flex-1 rounded border border-white/20 bg-black/50 px-3 py-2 text-center text-white placeholder-white/50 focus:border-white/40 focus:outline-none"
              />
              <button
                onClick={() =>
                  handleSliderChange(Math.min(maxTokensUsable, tokensToUse + 1))
                }
                className="rounded border border-white/20 bg-white/5 p-2 text-white/70 transition-colors hover:bg-white/10"
                disabled={tokensToUse === maxTokensUsable}>
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Level Progress Preview */}
          {tokensToUse > 0 && (
            <div className="mb-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">Progress:</span>
                <span className={`font-bold ${styles.color}`}>
                  +{tokensToUse} levels
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full transition-all duration-300 ${styles.bg}`}
                  style={{
                    width: `${
                      ((newLevel - currentLevel) / (maxLevel - currentLevel)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded border border-white/20 bg-white/5 py-2 text-white transition-colors hover:bg-white/10">
              Cancel
            </button>
            <button
              onClick={handleLevelUp}
              disabled={tokensToUse === 0 || maxTokensUsable === 0}
              className={`flex-1 rounded py-2 text-white transition-colors ${styles.button} disabled:cursor-not-allowed disabled:bg-gray-600 disabled:opacity-50`}>
              Level Up
            </button>
          </div>

          {/* Info Messages */}
          {maxTokensUsable === 0 && (
            <div className="mt-4 rounded border border-yellow-400/30 bg-yellow-500/20 p-3 text-sm text-yellow-200">
              {availableTokens === 0
                ? `You don't have any ${entityType} tokens.`
                : 'This entity is already at maximum level.'}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LevelUpModal;
