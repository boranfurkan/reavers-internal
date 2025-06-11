'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { StyledEntityCard } from './MissionCard';
import RarityBadge from '../../../inventory/RarityBadge';
import {
  BootyCostMultiplier,
  calculateEndtimeForEvents,
  DurationMultiplier,
  formatHoursToHMS,
  getCostForLevelUp,
  getLevelRarity,
  getRarityColorWithOpacity,
} from '../../../../utils/helpers';
import { NFTType, NFTMaxLevels } from '../../../../types/BaseEntity';
import ArrowRightIcon from '../../../../assets/arrow-right-icon';
import PlusIcon from '../../../../assets/plus-icon';
import MinusIcon from '../../../../assets/minus-icon';

interface EventsBackSideProps {
  missionName: string;
  currentGoldPrice: number;
  entityToBeUpgraded: {
    uid: string;
    level: number;
    maxLevel: number;
    levelUpCount: number;
    metadata: {
      image: string;
      name: string;
    };
    type: NFTType;
  };
  handleLevelUpCountChange: (uid: string, levelUpCount: number) => void;
}

const EventsBackSide = ({
  missionName,
  currentGoldPrice,
  entityToBeUpgraded,
  handleLevelUpCountChange,
}: EventsBackSideProps) => {
  const [amount, setAmount] = useState(entityToBeUpgraded.levelUpCount);

  useEffect(() => {
    setAmount(entityToBeUpgraded.levelUpCount);
  }, [entityToBeUpgraded.levelUpCount]);

  const rarityLevel = useMemo(
    () =>
      getLevelRarity(
        entityToBeUpgraded.type as NFTType.CREW | NFTType.SHIP | NFTType.ITEM,
        entityToBeUpgraded.level + amount || 1,
      ),
    [entityToBeUpgraded.type, entityToBeUpgraded.level, amount],
  );

  const getColor = useCallback(
    (opacity: number) => {
      if (
        entityToBeUpgraded.type === NFTType.QM ||
        entityToBeUpgraded.type === NFTType.FM ||
        entityToBeUpgraded.type === NFTType.UNIQUE
      ) {
        // Convert opacity to hex
        const alphaHex = Math.round((opacity / 100) * 255)
          .toString(16)
          .padStart(2, '0');
        return `#9b6afd${alphaHex}`;
      }
      return getRarityColorWithOpacity(rarityLevel, opacity);
    },
    [entityToBeUpgraded.type, rarityLevel],
  );

  const backgroundColor = useMemo(() => getColor(20), [getColor]);

  const buttonBackground = useMemo(() => getColor(40), [getColor]);

  const buttonBorder = useMemo(() => getColor(40), [getColor]);

  const maxPossibleLevelUp = useMemo(() => {
    return entityToBeUpgraded.maxLevel - entityToBeUpgraded.level;
  }, [entityToBeUpgraded.level, entityToBeUpgraded.maxLevel]);

  const handleAmountChange = useCallback(
    (value: number) => {
      const newAmount = amount + value;
      // Only limit is the maximum possible level, which could be much more than 5
      if (newAmount < 1 || newAmount > maxPossibleLevelUp) return;
      setAmount(newAmount);
      handleLevelUpCountChange(entityToBeUpgraded.uid, newAmount);
    },
    [amount, handleLevelUpCountChange, entityToBeUpgraded.uid],
  );

  const handleMaxLevel = useCallback(() => {
    if (maxPossibleLevelUp > 0) {
      setAmount(maxPossibleLevelUp);
      handleLevelUpCountChange(entityToBeUpgraded.uid, maxPossibleLevelUp);
    }
  }, [maxPossibleLevelUp, handleLevelUpCountChange, entityToBeUpgraded.uid]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div
        className="flex h-full w-full flex-col items-center justify-start rounded-md shadow-lg transition-colors duration-300 ease-in-out"
        style={{ background: backgroundColor }}>
        <StyledEntityCard
          className="!rounded-b-none"
          rarity={rarityLevel}
          isCaptain={
            entityToBeUpgraded.type === NFTType.FM ||
            entityToBeUpgraded.type === NFTType.QM ||
            entityToBeUpgraded.type === NFTType.UNIQUE
          }>
          {(entityToBeUpgraded.type === NFTType.CREW ||
            entityToBeUpgraded.type === NFTType.SHIP ||
            entityToBeUpgraded.type === NFTType.ITEM) && (
            <RarityBadge
              bgColor={getRarityColorWithOpacity(rarityLevel, 70)}
              rarityText={rarityLevel}
              secondayText={`(${entityToBeUpgraded.level + amount})`}
              size="extraSmall"
              className="absolute left-1 top-1 z-10 transition-colors duration-300 ease-in-out"
            />
          )}

          {/* MAX button in top right corner */}
          <button
            onClick={handleMaxLevel}
            disabled={amount >= maxPossibleLevelUp}
            className="absolute right-1 top-1 z-10 rounded bg-opacity-80 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white transition-all duration-200 hover:bg-opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: getColor(70) }}>
            MAX
          </button>

          <Image
            src={entityToBeUpgraded.metadata?.image || '/images/reaver.webp'}
            alt={entityToBeUpgraded.metadata?.name || 'Reaver'}
            className="rounded-[6px] py-1"
            width={70}
            height={70}
            unoptimized
          />
        </StyledEntityCard>

        <div className="flex h-full w-full flex-row items-center justify-between">
          <button
            onClick={() => handleAmountChange(-1)}
            className="flex h-full w-10 min-w-10 items-center justify-center rounded-bl-md border border-t-0 text-lg font-bold text-white transition-colors duration-300 ease-in-out hover:bg-opacity-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={amount <= 1}
            style={{
              background: buttonBackground,
              borderColor: buttonBorder,
            }}>
            <MinusIcon className="h-5 w-5" fill="white" />
          </button>

          <div className="flex h-full w-full flex-col justify-between p-1 text-center">
            <p className="text-sm font-semibold uppercase">
              {entityToBeUpgraded.metadata?.name}
            </p>
            <div className="mt-2 flex flex-row items-center justify-center gap-1 uppercase">
              <p className="text-xs font-semibold text-gray-300">
                Level {entityToBeUpgraded.level}
              </p>

              <div className="flex flex-row items-center justify-center -space-x-2">
                <ArrowRightIcon className="h-4 w-4 text-white opacity-30" />
                <ArrowRightIcon className="h-4 w-4 text-white opacity-50" />
                <ArrowRightIcon className="h-4 w-4 text-white" />
              </div>

              <p className="text-xs font-semibold text-gray-300">
                Level {entityToBeUpgraded.level + amount}
              </p>
            </div>

            <div className="flex w-full items-center justify-around">
              <div className="flex flex-col items-center justify-center gap-1">
                <h5 className="text-xs font-bold uppercase text-gray-300">
                  Cost
                </h5>
                <span className="text-xs font-semibold text-gray-300">
                  <span className="inline-block min-w-[4ch] text-right">
                    {(
                      BootyCostMultiplier[missionName] *
                      getCostForLevelUp(
                        entityToBeUpgraded.type,
                        currentGoldPrice,
                        entityToBeUpgraded.level,
                        entityToBeUpgraded.level + amount,
                      )
                    ).toFixed(2)}
                  </span>{' '}
                  $GOLD
                </span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1">
                <h5 className="text-xs font-bold uppercase text-gray-300">
                  Duration
                </h5>
                <span className="text-xs font-semibold text-gray-300">
                  {formatHoursToHMS(
                    DurationMultiplier[missionName] *
                      calculateEndtimeForEvents(
                        entityToBeUpgraded.type,
                        entityToBeUpgraded.level,
                        entityToBeUpgraded.level + amount,
                      ),
                  )}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleAmountChange(1)}
            className="flex h-full w-10 min-w-10 items-center justify-center rounded-br-md border border-t-0 text-lg font-bold text-white transition-colors duration-300 ease-in-out hover:bg-opacity-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={amount >= maxPossibleLevelUp}
            style={{ background: buttonBackground, borderColor: buttonBorder }}>
            <PlusIcon className="h-5 w-5" fill="white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventsBackSide;
