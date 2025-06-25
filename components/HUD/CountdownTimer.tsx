import { useContext, useEffect, useState } from 'react';
import { LayerContext } from '../../contexts/LayerContext';
import { Timestamp } from 'firebase/firestore';
import { ActiveMission } from '../../lib/types';
import GemIcon from '../../assets/gem-icon';
import TreasureIcon from '../../assets/treasure-icon';

type TimerProps = {
  mission: ActiveMission;
  className?: string;
};

function CombinedCountdownTimer({ mission, className = '' }: TimerProps) {
  const [time, setTime] = useState('');
  const [hasEnded, setHasEnded] = useState(false);
  const layerContext = useContext(LayerContext);

  if (!layerContext) {
    throw new Error('LayerSelect must be used within a LayerProvider');
  }

  const yieldImage =
    mission.mission?.missionStats?.yield === 'Gems' ? (
      <GemIcon className="h-[15px] w-[20px]" />
    ) : (
      <TreasureIcon className="h-[15px] w-[20px]" />
    );

  useEffect(() => {
    const updateTimer = () => {
      const now = Timestamp.now().toMillis();

      if (mission.type === 'Plunders') {
        const elapsed = now - mission.startTime;
        const hours = Math.floor(elapsed / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
        setTime(`${hours}H ${minutes}M ${seconds}S`);
      } else if (mission.type === 'Events') {
        const remaining = Math.max(0, (mission.missionEndTime || 0) - now);
        if (remaining === 0) setHasEnded(true);
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor(
          (remaining % (1000 * 60 * 60)) / (1000 * 60),
        );
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        setTime(`${hours}H ${minutes}M ${seconds}S`);
      } else if (mission.type === 'Burners') {
        const remaining = Math.max(0, (mission.missionEndTime || 0) - now);
        if (remaining === 0) setHasEnded(true);
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor(
          (remaining % (1000 * 60 * 60)) / (1000 * 60),
        );
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        setTime(`${hours}H ${minutes}M ${seconds}S`);
      } else if (mission.type === 'Specials') {
        const endTime = mission.mission?.missionStats?.missionEndDate;
        if (
          !endTime ||
          typeof endTime !== 'object' ||
          !('_seconds' in endTime) ||
          !('_nanoseconds' in endTime)
        ) {
          setTime('Invalid end time');
          setHasEnded(true);
        } else {
          const convertedTime = new Date(
            (endTime._seconds || 0) * 1000 +
              (endTime._nanoseconds || 0) / 1000000,
          );

          const now = new Date();
          const remaining = Math.max(
            0,
            convertedTime.getTime() - now.getTime(),
          );

          if (remaining === 0) {
            setHasEnded(true);
            setTime('Ready To Claim');
          } else {
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor(
              (remaining % (1000 * 60 * 60)) / (1000 * 60),
            );
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
            setTime(`${hours}H ${minutes}M ${seconds}S`);
          }
        }
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [mission]);

  return (
    <div className={`flex w-full items-center justify-around ${className}`}>
      <p className="min-w-[85px]">
        {hasEnded && mission.type !== 'Plunders' ? 'Ready To Claim' : time}
      </p>
      <div className="flex flex-row items-center justify-center gap-2">
        {yieldImage}
        <span>{mission.reward?.toFixed(2) || 0}</span>
      </div>
    </div>
  );
}

export default CombinedCountdownTimer;
