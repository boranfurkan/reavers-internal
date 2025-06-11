import React from 'react';

interface ArrowControlsProps {
  leftArrowOpacity: number;
  rightArrowOpacity: number;
  scrollPosition: number;
  itemWidth: number;
  maxScrollPosition: number;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}

export const ArrowControls: React.FC<ArrowControlsProps> = ({ leftArrowOpacity, rightArrowOpacity,scrollPosition,itemWidth,scrollContainerRef,maxScrollPosition}) => {
  const handleLeftClick = () => {
    if (scrollPosition > 0) {
      scrollContainerRef.current?.scrollBy({
        left: -itemWidth,
        behavior: "smooth"
      });
    }
  };
  const handleRightClick = () => {
    if (scrollPosition < maxScrollPosition) {
      scrollContainerRef.current?.scrollBy({
        left: itemWidth,
        behavior: "smooth"
      });
    }
  };
  return (
    <div className="flex flex-row items-center justify-center gap-0">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={`h-6 w-6 rotate-90 cursor-pointer opacity-${leftArrowOpacity}`}
        onClick={handleLeftClick}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
        />
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={`h-6 w-6 -rotate-90 cursor-pointer opacity-${rightArrowOpacity}`}
        onClick={handleRightClick}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
        />
      </svg>
    </div>
  );
};


