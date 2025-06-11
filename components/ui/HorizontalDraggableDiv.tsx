import { useRef, useState, MouseEvent, FC, ReactNode, useEffect } from 'react';

interface HorizontalDraggableDivProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
}

export const HorizontalDraggableDiv: React.FC<HorizontalDraggableDivProps> = ({
  children,
  ...divProps
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [prevX, setPrevX] = useState<number | null>(null);
  const [isOverflowed, setIsOverflowed] = useState(false);

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setPrevX(event.clientX);
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (isDragging && containerRef.current && prevX !== null) {
      const currentX = event.clientX;
      const scrollAmount = 1; // Adjust this value for the scroll speed

      containerRef.current.scrollLeft +=
        (prevX - currentX) * scrollAmount;
      setPrevX(currentX);
    }
  };

  const flickerTo = (direction: 'left' | 'right') => {
    const scrollAmount = 268;

    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false);
    setPrevX(null);
  };

  useEffect(() => {
    const checkOverflow = () => {
      const div = containerRef.current;
      if (div) {
        const hasOverflow = div.scrollWidth > div.clientWidth;
        setIsOverflowed(hasOverflow);
      }
    };

    window.addEventListener('resize', checkOverflow);
    checkOverflow();

    // Clean up listener
    return () => window.removeEventListener('resize', checkOverflow);
  }, [children]);

  useEffect(() => {
    const handleMouseUpOutside = () => {
      if (isDragging) {
        setIsDragging(false);
        setPrevX(null);
      }
    };

    document.addEventListener('mouseup', handleMouseUpOutside);

    return () => {
      document.removeEventListener('mouseup', handleMouseUpOutside);
    };
  }, [isDragging]);

  useEffect(() => {
    const scrollContainer = containerRef.current;
    if (scrollContainer) {
      const scrollWidth = scrollContainer.scrollWidth;
      const initialScrollPosition = (scrollWidth - scrollContainer.clientWidth) / 2;
      containerRef.current.scrollLeft = initialScrollPosition;
    }
  }, [children]);

  return (
    <div
      {...divProps}
      className={`${divProps.className || ''}`}
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        justifyContent: isOverflowed ? "start" : "center"
      }}
    >
      {children}
      {isOverflowed &&
        <>
          <div className='absolute top-0 left-[10%] flex h-[calc(100%_-_85px)] w-fit min-w-654px items-center z-[99]' onClick={() => { flickerTo('left') }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 opacity-50 hover:opacity-100 cursor-pointer">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>

          </div>
          <div className='absolute top-0 right-[10%] flex h-[calc(100%_-_85px)] w-fit min-w-654px items-center z-[99]' onClick={() => { flickerTo('right') }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 opacity-50 hover:opacity-100 cursor-pointer">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>

          </div>
        </>
      }
    </div >
  );
};