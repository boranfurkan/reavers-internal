import { motion } from 'framer-motion';
import React, { useContext } from 'react';
import { LayerContext } from '../../contexts/LayerContext';
import Image from 'next/image';

function ScrollMissionModal() {
  const layerContext = useContext(LayerContext);

  if (!layerContext) {
    throw new Error('LayerSelect must be used within a LayerProvider');
  }

  const { setScrollMissionModalOpen } = layerContext;

  const handleClose = () => {
    setScrollMissionModalOpen(false);
  };

  const rewards = [
    {
      id: 1,
      name: 'Jar of Dirt',
      image: '/images/jar.png',
      type: 'luck item',
      chance: 0.35,
    },
    {
      id: 2,
      name: 'Scimitar',
      image: '/images/sword.webp',
      type: 'yield item',
      chance: 0.2,
    },
    {
      id: 3,
      name: 'Reaver',
      image: '/images/reaver.webp',
      type: 'yield item',
      chance: 0.005,
    },
  ];

  const rewards2 = [
    {
      id: 1,
      name: 1,
      chance: 0.18,
      image: '/images/1x.webp',
    },
    {
      id: 2,
      name: 7,
      chance: 0.038,
      image: '/images/7x.webp',
    },
    {
      id: 3,
      name: 15,
      chance: 0.018,
      image: '/images/15x.webp',
    },
  ];

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[999] flex w-full flex-col items-center justify-start overflow-y-scroll bg-reavers-bg bg-opacity-[0.5] text-white backdrop-blur-sm"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1, transition: { duration: 0.2 } }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 1 } }}>
        <div className="relative flex w-full flex-row items-center justify-end  border-b border-b-reavers-border">
          <div className="absolute left-0 top-0 w-full p-6 font-Header text-4xl uppercase ">
            Rewards Table
          </div>
          <div
            onClick={handleClose}
            className="relative z-30 ml-2 cursor-pointer border-l border-l-reavers-border p-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6 hover:scale-110">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        <div className="mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center gap-12">
          <div className="flex w-full flex-row items-center justify-between gap-4">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="flex h-[280px] w-[280px] flex-col items-center justify-between gap-4 rounded-[8px] border border-reavers-border border-opacity-10 bg-[#0a0a0a] py-4">
                <div className="text-center text-sm uppercase text-white text-opacity-50">
                  1x {reward.name}
                </div>
                <div className="-mt-4 flex h-full w-full items-center justify-center">
                  <Image
                    src={reward.image}
                    alt={reward.name}
                    width={800}
                    height={800}
                    objectFit="contain"
                    className="h-[150px] w-[150px]"
                    unoptimized
                  />
                </div>
                <div className="flex w-full flex-row items-center justify-center gap-4">
                  {reward.id !== 3 && (
                    <span
                      className={`${
                        reward.id === 1
                          ? 'bg-item-luck'
                          : reward.id === 2
                          ? 'bg-item-yield'
                          : ''
                      } rounded-[3px] px-[4px] py-[1px] text-[10px] uppercase text-black`}>
                      {reward.type}
                    </span>
                  )}
                  <span className="text-xs">
                    {(reward.chance * 100).toFixed(2)}% Chance
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex w-full flex-row items-center justify-between gap-4">
            {rewards2.map((reward) => (
              <div
                key={reward.id}
                className={`relative flex h-[280px] w-[280px] flex-col  items-center justify-between gap-4 border ${
                  reward.id === 1
                    ? 'border-[#19d362] bg-one-x-gradient'
                    : reward.id === 2
                    ? 'border-[#6bd0ff] bg-seven-x-gradient'
                    : 'border-[#8d56ff] bg-fifteen-x-gradient'
                } rounded-[8px] py-4`}>
                <div className="text-center text-sm uppercase text-white text-opacity-50">
                  Booty Reward
                </div>
                <div className="relative z-20 -mt-6 flex h-full w-full items-center justify-center">
                  <span
                    className={`text-6xl ${
                      reward.name === 7
                        ? 'shadow-7'
                        : reward.name === 15
                        ? 'shadow-15 shadow-xl'
                        : 'text-[#18FF70]'
                    }`}>
                    {reward.name}X
                  </span>
                </div>
                <Image
                  src="/images/coins2.webp"
                  alt="coins"
                  width={800}
                  height={800}
                  className={`absolute -right-6 bottom-0 h-1/2 w-full object-contain ${
                    reward.id === 1
                      ? '-mb-4 scale-75'
                      : reward.id === 2
                      ? '-mb-1 scale-90'
                      : 'mb-1 scale-100'
                  } z-0`}
                  unoptimized
                />
                <div className="relative z-20 flex w-full flex-row items-center justify-center gap-4">
                  <span className="text-xs">
                    {(reward.chance * 100).toFixed(2)}% Chance
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default ScrollMissionModal;
