import React, { useContext, useEffect, useState, useMemo } from 'react';
import { LayerContext } from '../../contexts/LayerContext';
import { Logo } from '../layout/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import ArrowDownIcon from '../../assets/arrow-down-icon';

const variants = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -50 },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
    },
  }),
  exit: { opacity: 0, x: 20 },
};

interface BattleTime {
  type: 'gems' | 'treasure' | 'arena' | 'genesis';
  hours: number[];
}

const battleTimes: BattleTime[] = [
  { type: 'treasure', hours: [3, 7, 11, 15, 19, 23] },
  { type: 'arena', hours: [1, 5, 9, 13, 17, 21] },
];

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  targetHour: number;
  type: string;
}

const getTimeDifference = (targetHour: number, type: string): TimeLeft => {
  const now = new Date();
  const targetTime = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      targetHour,
      0,
      0,
      0,
    ),
  );

  if (now.getUTCHours() >= targetHour) {
    targetTime.setUTCDate(targetTime.getUTCDate() + 1);
  }

  const diffInMs = targetTime.getTime() - now.getTime();
  const hours = Math.floor(diffInMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffInMs % (1000 * 60)) / 1000);

  return { hours, minutes, seconds, targetHour, type };
};

const MainBattleCountdown = ({ timeLeft }: { timeLeft: TimeLeft }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center rounded-lg bg-reavers-bg/80 p-1 shadow-md transition-colors hover:bg-reavers-bg/90"
      style={{
        color: 'rgba(255, 185, 0, 1)',
      }}>
      <span className="text-[10px] font-bold">
        Next {timeLeft.type} Battle In
      </span>
      <span className="ml-2 text-[10px] font-bold">
        {`${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`}
      </span>
    </motion.div>
  );
};

const DetailedBattleCountdown = ({
  timeLeft,
  index,
}: {
  timeLeft: TimeLeft;
  index: number;
}) => {
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      custom={index}
      className="flex w-full items-center justify-between border-b border-white/10 p-2 transition-colors last:border-b-0 hover:bg-white/5">
      <span className="text-xs font-bold capitalize text-white/90">
        {`${timeLeft.type} Battle`}
      </span>
      <span className="ml-2 text-xs font-bold text-yellow-400">
        {`${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`}
      </span>
    </motion.div>
  );
};

const DetailedCountdowns = ({ allTimeLeft }: { allTimeLeft: TimeLeft[] }) => {
  const nextBattlesByType = useMemo(() => {
    const battles = new Map<string, TimeLeft>();

    allTimeLeft.forEach((timeLeft) => {
      if (
        !battles.has(timeLeft.type) ||
        battles.get(timeLeft.type)!.hours * 3600 +
          battles.get(timeLeft.type)!.minutes * 60 +
          battles.get(timeLeft.type)!.seconds >
          timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds
      ) {
        battles.set(timeLeft.type, timeLeft);
      }
    });

    return Array.from(battles.values());
  }, [allTimeLeft]);

  return (
    <motion.div initial="hidden" animate="visible" className="flex flex-col">
      <AnimatePresence mode="wait">
        {nextBattlesByType.map((timeLeft, index) => (
          <DetailedBattleCountdown
            key={index}
            timeLeft={timeLeft}
            index={index}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

const ServerTime = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utcTime = now.toLocaleTimeString('en-US', {
        timeZone: 'UTC',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setTime(utcTime);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-1 text-[10px] font-medium text-white/70">
      <span>Server Time:</span>
      <span>{time}</span>
    </div>
  );
};

function LeftTop() {
  const layerContext = useContext(LayerContext);
  const [allTimeLeft, setAllTimeLeft] = useState<TimeLeft[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const updateTimes = () => {
      const times: TimeLeft[] = [];
      battleTimes.forEach((battle) => {
        battle.hours.forEach((hour) => {
          times.push(getTimeDifference(hour, battle.type));
        });
      });
      setAllTimeLeft(times);
    };

    updateTimes();
    const timer = setInterval(updateTimes, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const updateUtcTime = () => {
      const now = new Date();
      const utcTimeString = now.toLocaleTimeString('en-US', {
        timeZone: 'UTC',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setUtcTime(utcTimeString);
    };

    updateUtcTime();
    const timer = setInterval(updateUtcTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const sortedTimeLeft = useMemo(() => {
    return [...allTimeLeft].sort((a, b) => {
      const aTotalSeconds = a.hours * 3600 + a.minutes * 60 + a.seconds;
      const bTotalSeconds = b.hours * 3600 + b.minutes * 60 + b.seconds;
      return aTotalSeconds - bTotalSeconds;
    });
  }, [allTimeLeft]);

  if (!layerContext) {
    throw new Error('LayerMap must be used within a LayerProvider');
  }

  const { isLayerAndMissionSelectModalOpen, isMobile } = layerContext;

  return (
    <div
      className={`absolute left-0 top-1.5 z-20 scale-75 md:left-4 md:top-4 md:scale-100 ${
        isMobile && '!left-[-10px] !top-[70.5px]'
      }`}>
      <Logo />
      {!isLayerAndMissionSelectModalOpen && (
        <motion.div
          className="mt-4 flex w-full flex-col items-start justify-start gap-1 text-start uppercase text-white"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
          transition={{ duration: 0.5 }}>
          {/* UTC Time Display */}
          <div className="flex items-center rounded-md bg-reavers-bg/80 p-1 pl-2 pr-2 shadow-md">
            <div className="flex items-center gap-1 text-[10px] font-medium text-white/90">
              <span className="font-bold">UTC:</span>
              <span>{utcTime}</span>
            </div>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex w-max cursor-pointer flex-col gap-0.5">
                <div className="flex w-max items-center gap-2 rounded-md bg-reavers-bg/80 p-[6px] pt-[8px] transition-colors hover:bg-reavers-bg/90">
                  <h3 className="!font-Header text-[1.125rem] font-black leading-[1rem] tracking-tight">
                    Battle Timers
                  </h3>
                  <ArrowDownIcon height={16} />
                </div>

                <div className="flex w-max cursor-pointer flex-col gap-0.5">
                  {sortedTimeLeft.length > 0 && (
                    <MainBattleCountdown timeLeft={sortedTimeLeft[0]} />
                  )}
                </div>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="border border-white/20 bg-reavers-bg/95 backdrop-blur-sm">
              <DialogHeader className="mt-2 flex flex-row items-center justify-between">
                <DialogTitle className="text-white/90">
                  Next Battles
                </DialogTitle>
                <ServerTime />
              </DialogHeader>
              <div className="mt-4">
                <DetailedCountdowns allTimeLeft={sortedTimeLeft} />
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      )}
    </div>
  );
}

export default LeftTop;
