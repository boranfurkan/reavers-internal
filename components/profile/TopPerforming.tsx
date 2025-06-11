import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useNfts } from '../../contexts/NftContext';
import { ArrowControls } from '../ui/ArrowControls';
import { CharacterNFT } from '../../types/NFT';
import SkullIcon from '../../assets/skull-icon';

const itemWidth = 200; // The width of each item, including the gap

function TopPerforming() {
  // toLocaleString triggers hydration error, this is a workaround.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScrollPosition, setMaxScrollPosition] = useState(0);

  const handleScroll = (event: any) => {
    setScrollPosition(event.target.scrollLeft);
  };

  const nfts = useNfts();

  useEffect(() => {
    if (scrollContainerRef.current) {
      setMaxScrollPosition(
        scrollContainerRef.current.scrollWidth -
          scrollContainerRef.current.clientWidth,
      );
    }
  }, []);

  const secondPart = (reaver: CharacterNFT) => {
    // Split metadata.name based on the "#" character
    return reaver.metadata?.name || reaver.content?.metadata.name;
  };

  // If the scroll position is 0, set opacity to 50, else 100
  const leftArrowOpacity = scrollPosition === 0 ? 50 : 100;

  // If the scroll position is at the maximum, set opacity to 50, else 100
  const rightArrowOpacity = scrollPosition === maxScrollPosition ? 50 : 100;

  return (
    <div className="flex w-full flex-col items-start justify-start gap-2 border-b border-b-reavers-border px-8 pb-7 pt-6">
      <div className="flex w-full flex-row items-center justify-between">
        <p className="myConnect font-SemiBold font-semibold uppercase opacity-50">
          Top Performing Reavers
        </p>
        <ArrowControls
          leftArrowOpacity={leftArrowOpacity}
          rightArrowOpacity={rightArrowOpacity}
          scrollPosition={scrollPosition}
          itemWidth={itemWidth}
          maxScrollPosition={maxScrollPosition}
          scrollContainerRef={scrollContainerRef}
        />
      </div>
      <div
        onScroll={handleScroll}
        ref={scrollContainerRef}
        className="mr-10 flex w-full flex-row items-start justify-start gap-[20px] overflow-x-scroll">
        {/*SORT BY LEVEL*/}
        {nfts.charactersInGame
          .sort((nftA, nftB) => (nftB?.arEarned || 0) - (nftA?.arEarned || 0))
          .map((reaver, index) => (
            <div
              key={index}
              className="flex min-w-[240px] flex-col items-start justify-start gap-2 rounded-md border border-white border-opacity-20 bg-[#212121] p-2 text-[12px] ">
              <div className="flex w-full flex-row items-center justify-between gap-4 ">
                <span>#{secondPart(reaver)}</span>
                {/* TODO add field missions done*/}
                <span>{reaver.missionsPlayed || 0} missions</span>
              </div>
              <Image
                unoptimized
                src={reaver.metadata?.image || '/images/reavers.webp'}
                alt="reaver"
                width={100}
                height={100}
                className="w-full rounded-md object-cover"
              />
              <div className="flex w-full flex-col items-center justify-between gap-2">
                <div className="flex h-full w-full flex-row items-center justify-center gap-2 rounded-md border border-white border-opacity-40 px-2 py-1">
                  <SkullIcon className="ml-1 h-3 w-3 " />
                  <span className="mr-1">
                    {/* TODO: From where to get skullCount */}
                    {hydrated && reaver
                      ? reaver.arEarned?.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })
                      : 0}
                  </span>
                </div>
                <div className="flex h-full w-full flex-row items-center justify-center gap-2 rounded-md border border-white border-opacity-40 px-2 py-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-3 w-3 object-cover">
                    <path
                      fillRule="evenodd"
                      d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 00-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 00.75-.75 2.25 2.25 0 00-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.22 49.22 0 00-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.343v.256zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {/* TODO: ranking */}
                  <span>#{secondPart(reaver)}</span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default TopPerforming;
