import React, { useContext, useRef, useEffect } from 'react';
import { LayerContext } from '../../contexts/LayerContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Dots from '../../public/images/dots.svg';
import styled from 'styled-components';
import DotsIcon from '../../assets/dots-icon';

const Container = styled.div<{ disabled: boolean }>``;

const BottomCenter = () => {
  const layerContext = useContext(LayerContext);

  if (!layerContext) {
    throw new Error('LayerSelect must be used within a LayerProvider');
  }

  const {
    currentLevel,
    setHideoutModalOpen,
    tabs,
    setActiveTab,
    menuRef,
    isBottomCenterOpen,
    setBottomCenterOpen,
  } = layerContext;

  const rotateInOut = {
    hidden: { rotate: 0 },
    show: { rotate: 90 },
    exit: { rotate: 0 },
  };

  const expandInOut = {
    hidden: { width: '16%' },
    show: { width: '40%', transition: { delay: 0.1 } },
    exit: { width: '16%' },
  };

  const slideInOut = {
    hidden: { height: '0vh', opacity: 0 },
    show: { height: '60vh', opacity: 1, transition: { delay: 0.2 } },
    exit: { width: '16%', transition: { delay: 0.5 } }, // Add this line
  };
  const slideInOut2 = {
    hidden: { height: '0vh', opacity: 0 },
    show: { height: '50vh', opacity: 1, transition: { delay: 0.2 } },
    exit: { height: '0vh', opacity: 0 },
  };

  const node = useRef<HTMLDivElement>(null); // Set the type to HTMLDivElement

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (node.current?.contains(e.target as Node)) {
        // Inside click
        return;
      }
      // Ignore clicks on layer items
      if ((e.target as Element).classList.contains('layer-item')) {
        return;
      }
      // Outside click
      setBottomCenterOpen(false);
    };

    if (isBottomCenterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isBottomCenterOpen]);

  return (
    <motion.div
      className={`fixed bottom-4 left-1/2 z-50  min-w-[80%] -translate-x-1/2 scale-75  transform rounded-[3px]  border border-reavers-border bg-reavers-bg bg-opacity-80
       !backdrop-blur-md md:w-60 md:min-w-[240px] md:max-w-[574px]  md:scale-100 ${
         isBottomCenterOpen
           ? 'border-t-opacity-40 min-w-[90%] border-t border-t-white'
           : 'outline outline-4 outline-reavers-outline transition-all duration-300 ease-in-out hover:border-white hover:border-opacity-90'
       } flex cursor-pointer flex-row items-center justify-between p-4`}
      animate={isBottomCenterOpen ? 'show' : 'hidden'}
      variants={expandInOut}
      onClick={() => setBottomCenterOpen(!isBottomCenterOpen)}
      ref={node}>
      <div className="absolute left-0 top-0 h-full w-full " ref={menuRef}></div>

      <div
        className={`flex flex-row items-center justify-center gap-1 ${
          isBottomCenterOpen ? '' : ''
        }`}>
        <p className="text-white opacity-40">{currentLevel.layer}.</p>
        <p className="uppercase text-white">{currentLevel.name}</p>
      </div>
      <motion.div variants={rotateInOut}>
        {isBottomCenterOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6 text-white">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6 text-white">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        )}
      </motion.div>

      <AnimatePresence>
        {isBottomCenterOpen && (
          <motion.div
            variants={slideInOut}
            initial="hidden"
            animate="show"
            exit="hidden"
            className={`outline absolute bottom-0 left-0 -z-10 flex min-h-[536px] w-[calc(100%_+_1px)] flex-row items-start justify-between gap-2 overflow-hidden rounded-[4px] border border-[#707C88] border-opacity-40 bg-reavers-bg-secondary bg-opacity-90 p-2 pt-5 text-white  outline-4 outline-reavers-outline !backdrop-blur-xl  md:p-4  `}>
            <div className="ml-2 flex h-[90%] w-full flex-col items-start justify-start pb-2 pl-2 pr-0 pt-0 uppercase text-gray-400 md:pl-5 md:pr-4">
              <DotsIcon className="absolute ml-[-20px] h-[80%] w-[1px] opacity-50" />
              <span className="text-xs text-white opacity-50">Navigate</span>
              <div className="-ml-2 w-full overflow-x-hidden overflow-y-scroll px-2">
                <motion.div
                  className="mt-4 flex h-full w-full flex-col items-start justify-start gap-3 "
                  variants={slideInOut2}
                  initial="hidden"
                  animate="show"
                  exit="hidden">
                  {tabs.map((tab, index: any) => (
                    <Container
                      key={index}
                      disabled={tab.disabled}
                      className={`flex h-14 w-full flex-row items-center justify-between gap-2  rounded-[3px] border  p-2
                    ${
                      tab.disabled
                        ? 'cursor-not-allowed opacity-60 grayscale'
                        : 'hover:border-[#96E7FF]  hover:border-opacity-70 hover:bg-reavers-stroke hover:bg-opacity-[0.07]'
                    }
                       border-reavers-border  bg-white bg-opacity-[0.05] backdrop-blur-xl `}
                      onClick={() => {
                        if (tab.onClick) {
                          tab.onClick();
                          return;
                        }
                        if (!tab.disabled) {
                          setActiveTab(tab);
                          setHideoutModalOpen((prev) => !prev);
                        }
                      }}>
                      <Image
                        src={tab.image}
                        alt={tab.name}
                        width={35}
                        height={35}
                        className={`main-nav-img relative z-50 h-[40px] w-[40px] object-cover`}
                        unoptimized
                      />
                      <div className="flex w-full flex-col items-start justify-start gap-0.5 text-start">
                        <p className="truncate text-sm uppercase text-white sm:text-base md:text-lg ">
                          {tab.name}
                        </p>
                      </div>
                    </Container>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BottomCenter;
