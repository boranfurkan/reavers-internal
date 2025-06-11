import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { LayerContext } from '../../contexts/LayerContext';
import Image from 'next/image';
import { useNfts } from '../../contexts/NftContext';
import { ArrowControls } from '../ui/ArrowControls';

const itemWidth = 200; // The width of each item, including the gap

function LayerProgress() {
  const layerContext = useContext(LayerContext);

  if (!layerContext) {
    throw new Error('LayerMap must be used within a LayerProvider');
  }

  const { levels, isMobile } = layerContext;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScrollPosition, setMaxScrollPosition] = useState(0);

  const handleScroll = (event: any) => {
    setScrollPosition(event.target.scrollLeft);
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      setMaxScrollPosition(
        scrollContainerRef.current.scrollWidth -
          scrollContainerRef.current.clientWidth,
      );
    }
  }, []);

  const handleLeftClick = () => {
    if (scrollPosition > 0) {
      scrollContainerRef.current?.scrollBy({
        left: -itemWidth,
        behavior: 'smooth',
      });
    }
  };

  const handleRightClick = () => {
    if (scrollPosition < maxScrollPosition) {
      scrollContainerRef.current?.scrollBy({
        left: itemWidth,
        behavior: 'smooth',
      });
    }
  };

  // If the scroll position is 0, set opacity to 50, else 100
  const leftArrowOpacity = scrollPosition === 0 ? 50 : 100;

  // If the scroll position is at the maximum, set opacity to 50, else 100
  const rightArrowOpacity = scrollPosition === maxScrollPosition ? 50 : 100;

  return (
    <div className="flex w-full flex-col items-start justify-start gap-2 border-b border-b-reavers-border px-8 py-6">
      <div className="flex w-full items-center justify-between">
        <p className=" myConnect font-SemiBold font-semibold uppercase opacity-50">
          Island Progress
        </p>
        <div className="flex flex-row items-center justify-center gap-4 text-[12px]">
          <ArrowControls
            leftArrowOpacity={leftArrowOpacity}
            rightArrowOpacity={rightArrowOpacity}
            scrollPosition={scrollPosition}
            itemWidth={itemWidth}
            maxScrollPosition={maxScrollPosition}
            scrollContainerRef={scrollContainerRef}
          />
        </div>
      </div>
      <div
        onScroll={handleScroll}
        ref={scrollContainerRef}
        className="flex w-full flex-row items-center justify-start gap-8 overflow-x-scroll">
        {levels.map((level, index) => (
          <div
            key={index}
            className="flex w-44 flex-col items-center justify-center gap-2 pb-4">
            <Image
              src={level.icon}
              alt={level.name}
              width={300}
              height={300}
              className="h-32 w-full  object-contain"
              unoptimized={true}
            />
            <div className="flex w-full flex-col items-start justify-start">
              <span className="myConnect mt-2 w-full break-keep text-center font-Body font-thin uppercase opacity-50">
                Island {level.layer}
              </span>
              <span className="myConnect w-full text-center font-Body font-thin uppercase">
                {!isMobile
                  ? level.name
                  : level.name.length > 10
                  ? level.name.substring(0, 12) + '..'
                  : level.name}
              </span>
            </div>
            <div
              className={`mx-auto mt-2 flex w-[110px] flex-row items-center justify-center gap-1 rounded-full border border-[#63e07e] bg-[#76ff6b33] px-2 py-1 text-xs text-[#3eff8a]`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="h-4 w-4">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
              <span className="layerProgressStatus uppercase">Unlocked</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LayerProgress;
