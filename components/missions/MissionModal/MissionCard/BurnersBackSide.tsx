'use client';

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useContext,
} from 'react';
import Image from 'next/image';
import { CardFace, StyledEntityCard } from './MissionCard';
import PlusIcon from '../../../../assets/plus-icon';
import MinusIcon from '../../../../assets/minus-icon';
import { formatHoursToHMS, cn } from '../../../../utils/helpers';
import { LayerContext } from '../../../../contexts/LayerContext';
import GetIconForEntitiy from '../../../GetIconForEntitiy';
import { NFTType } from '../../../../types/BaseEntity';

interface BurnersBackSideProps {
  missionName: string;
  entityToBeUpgraded?: {
    uid: string;
    level: number;
    levelUpCount: number;
  };
  handleLevelUpCountChange: (uid: string, levelUpCount: number) => void;
}

const BurnersBackSide: React.FC<BurnersBackSideProps> = ({
  missionName,
  entityToBeUpgraded,
  handleLevelUpCountChange,
}) => {
  const layerContext = useContext(LayerContext);

  if (!layerContext) {
    throw new Error('LayerSelect must be used within a LayerProvider');
  }

  const { currentMission } = layerContext;

  currentMission?.missionStats?.name;
  // Only enable day counting UI for "The Gilded Press" mission
  const isGildedPress = missionName === 'The Gilded Press';

  // Default to 1 day if not provided or not Gilded Press
  const [dayCount, setDayCount] = useState(
    entityToBeUpgraded?.levelUpCount || 1,
  );

  // Cost constants
  const COST_PER_EXTRA_DAY = 25; // BOOTY cost per extra day
  const GOLD_COST_PER_DAY = 1500; // Gold cost per day (including day 1)

  useEffect(() => {
    // Update local state when props change
    setDayCount(entityToBeUpgraded?.levelUpCount || 1);
  }, [entityToBeUpgraded?.levelUpCount]);

  // Calculate total costs
  const { totalBootyCost, totalGoldCost } = useMemo(() => {
    if (!isGildedPress || !dayCount)
      return { totalBootyCost: 0, totalGoldCost: 0 };

    // BOOTY cost - only charge for days beyond the first
    const bootyCost = (dayCount - 1) * COST_PER_EXTRA_DAY;

    // Gold cost - charge for ALL days including day 1
    const goldCost = dayCount * GOLD_COST_PER_DAY;

    return { totalBootyCost: bootyCost, totalGoldCost: goldCost };
  }, [dayCount, isGildedPress]);

  // Calculate total duration in hours
  const totalDuration = useMemo(() => {
    return dayCount * 24; // 24 hours per day
  }, [dayCount]);

  const handleDayChange = useCallback(
    (value: number) => {
      if (!isGildedPress || !handleLevelUpCountChange || !entityToBeUpgraded)
        return;

      const newDayCount = dayCount + value;

      setDayCount(newDayCount);
      handleLevelUpCountChange(entityToBeUpgraded.uid, newDayCount);
    },
    [dayCount, handleLevelUpCountChange, entityToBeUpgraded, isGildedPress],
  );

  // If not Gilded Press or no entity data, show basic info
  if (!isGildedPress || !entityToBeUpgraded) {
    return (
      <CardFace className="back">
        <div className="flex h-full flex-col items-center justify-center gap-2">
          <p className="text-sm text-gray-300">
            {missionName || 'Burner Mission'}
          </p>
          <p className="text-xs text-gray-400">Duration: 24 hours</p>
          <p className="text-xs text-gray-400">
            Cost:{' '}
            {(currentMission?.missionStats?.cost || 0) *
              (entityToBeUpgraded?.levelUpCount || 1)}
          </p>
          <p className="text-xs text-gray-400">
            Yield: {currentMission?.missionStats?.yield || 0}
          </p>
        </div>
      </CardFace>
    );
  }

  // Use the purple theme colors for consistency with the app's design
  const backgroundColor = 'rgba(74, 35, 154, 0.2)'; // Purple with low opacity
  const borderColor = '#9b6afd'; // Matching the selected card border color
  const buttonBackground = 'rgba(155, 106, 253, 0.4)'; // Purple with medium opacity
  const buttonBorder = '#9b6afd';

  return (
    <CardFace className="back">
      <div className="flex h-full w-full items-center justify-center">
        <div
          className="flex h-full w-full flex-col items-center justify-start rounded-md shadow-lg transition-colors duration-300 ease-in-out"
          style={{ background: backgroundColor, borderColor: borderColor }}>
          {/* Entity display section */}
          <StyledEntityCard
            className="flex min-h-[70px] items-center justify-center !rounded-b-none"
            rarity="COMMON"
            style={{
              background: 'rgba(155, 106, 253, 0.2)',
              borderColor: '#9b6afd',
              borderTopLeftRadius: '6px',
              borderTopRightRadius: '6px',
              borderBottomLeftRadius: '0',
              borderBottomRightRadius: '0',
              height: '80px',
            }}>
            {/* Level Badge */}
            <div className="absolute left-1 top-1 z-10 flex items-center rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium uppercase text-white">
              Level {entityToBeUpgraded.level}
            </div>

            {/* Entity image */}
            <GetIconForEntitiy
              entityType={NFTType.CAPTAIN}
              width={60}
              height={60}
            />
          </StyledEntityCard>

          {/* Controls and information section */}
          <div className="flex h-full w-full flex-row items-center justify-between">
            {/* Minus button */}
            <button
              onClick={() => handleDayChange(-1)}
              className={cn(
                'flex h-full w-10 min-w-10 items-center justify-center rounded-bl-md border border-t-0 text-lg font-bold text-white transition-colors duration-300 ease-in-out hover:bg-opacity-50 disabled:cursor-not-allowed disabled:opacity-50',
              )}
              disabled={dayCount <= 1}
              style={{
                background: buttonBackground,
                borderColor: buttonBorder,
              }}>
              <MinusIcon className="h-5 w-5" fill="white" />
            </button>

            {/* Mission information */}
            <div className="flex h-full w-full flex-col justify-between p-1 text-center">
              <p className="text-sm font-semibold uppercase">
                {missionName || 'Burner Mission'}
              </p>

              <div className="mt-1 flex w-full flex-col">
                <div className="mb-2 flex items-center justify-center gap-1">
                  <p className="text-xs font-semibold text-white">
                    {dayCount} {dayCount === 1 ? 'Day' : 'Days'}
                  </p>
                  <span className="text-xs text-gray-400">
                    ({formatHoursToHMS(totalDuration)})
                  </span>
                </div>

                <div className="grid w-full grid-cols-2 gap-1">
                  {/* Cost Column */}
                  <div className="flex flex-col">
                    <h5 className="mb-1 text-center text-xs font-bold uppercase text-gray-300">
                      Cost
                    </h5>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-xs font-semibold text-yellow-300">
                        {totalGoldCost.toLocaleString()} $GOLD
                      </span>

                      <span className="text-xs font-semibold text-gray-300">
                        {totalBootyCost} $BOOTY
                      </span>
                    </div>
                  </div>

                  {/* Yield Column */}
                  <div className="flex flex-col">
                    <h5 className="mb-1 text-center text-xs font-bold uppercase text-gray-300">
                      Yield
                    </h5>
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-semibold text-yellow-300">
                        {totalGoldCost.toLocaleString()} Gold Bars
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Plus button */}
            <button
              onClick={() => handleDayChange(1)}
              className={cn(
                'flex h-full w-10 min-w-10 items-center justify-center rounded-br-md border border-t-0 text-lg font-bold text-white transition-colors duration-300 ease-in-out hover:bg-opacity-50 disabled:cursor-not-allowed disabled:opacity-50',
              )}
              style={{
                background: buttonBackground,
                borderColor: buttonBorder,
              }}>
              <PlusIcon className="h-5 w-5" fill="white" />
            </button>
          </div>
        </div>
      </div>
    </CardFace>
  );
};

export default BurnersBackSide;
