import { useContext, useState, useEffect, useRef } from 'react';
import { LayerContext } from '../../../contexts/LayerContext';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import Image from 'next/image';
import { useMediaQuery } from 'react-responsive';
import { convertFirestoreDateToTimestamp } from '../../../utils/helpers';

const Container = styled.div`
  border-radius: 6px;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border: solid 1px rgba(255, 255, 255, 0.25);
  background-color: rgba(0, 0, 0, 0.6);
`;

const OutcomeIndicator = () => {
  const layerContext = useContext(LayerContext);
  const isMobile = useMediaQuery({ query: '(max-width: 767px)' });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current?.contains(event.target)
      ) {
        dropdownRef.current.classList.add('hidden');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!layerContext) {
    throw new Error('LayerSelect must be used within a LayerProvider');
  }

  const { currentMission } = layerContext;

  const [isProfilesVisible, setIsProfilesVisible] = useState(false);
  const [isMobileMissionInfoVisible, setMobileMissionInfoVisible] =
    useState(false);

  const outcomeDivRef = useRef<HTMLDivElement>(null);
  const outcomeExpandedRef = useRef<boolean>();

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (
        outcomeDivRef.current &&
        !outcomeDivRef.current.contains(event.target) &&
        outcomeExpandedRef.current
      ) {
        setIsProfilesVisible(false);
      }

      if (
        missionInfoDivRef.current &&
        !missionInfoDivRef.current.contains(event.target) &&
        missionInfoExpandedRef.current
      ) {
        setMobileMissionInfoVisible(false);
      }
    }

    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    outcomeExpandedRef.current = isProfilesVisible;
  }, [isProfilesVisible]);

  const missionInfoDivRef = useRef<HTMLDivElement>(null);
  const missionInfoExpandedRef = useRef<boolean>();

  useEffect(() => {
    missionInfoExpandedRef.current = isMobileMissionInfoVisible;
  }, [isMobileMissionInfoVisible]);

  if (currentMission?.missionStats?.kind === undefined) {
    return null;
  }

  const getSuccessRate = () => {
    if (currentMission.missionStats?.kind === 'Plunders') {
      const successPercentage =
        (
          currentMission?.missionStats?.outcomes
            ?.filter((outcome) => outcome.type === 'success')
            .reduce((a, b) => a + b.rate, 0)! * 100
        ).toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }) || 0;

      return (
        <span
          style={{ color: currentMission?.missionStats?.color }}
          className="font-SemiBold text-[11px] uppercase leading-[12px]">
          {/* Level {currentMission?.missionStats?.riskLevel} */}
          {currentMission?.missionStats?.riskLevel === 1 && 'Very Low'}
          {currentMission?.missionStats?.riskLevel === 2 && 'Low'}
          {currentMission?.missionStats?.riskLevel === 3 && 'Medium'}
          {currentMission?.missionStats?.riskLevel === 4 && 'High'}
          {currentMission?.missionStats?.riskLevel === 5 && 'Very High'}
          {' > ' + successPercentage + '%'}
        </span>
      );
    } else if (
      currentMission.missionStats?.kind === 'Events' ||
      currentMission.missionStats?.kind === 'Burners' ||
      currentMission.missionStats?.kind === 'Specials' ||
      currentMission.missionStats?.kind === 'Genesis'
    ) {
      return (
        <span
          style={{ color: currentMission?.missionStats?.color }}
          className="font-SemiBold text-[11px] uppercase leading-[12px]">
          {currentMission?.missionStats?.success_rate
            ? 'SUCCESS RATE: ' +
              (currentMission?.missionStats.success_rate * 100).toFixed(2) +
              '%'
            : 'SUCCESS RATE: 100%'}
        </span>
      );
    } else if (
      currentMission.missionStats?.kind === 'Events' &&
      (currentMission.name === "Riddick's Hideout" ||
        currentMission.name === "SPDR'S BOUNTY" ||
        currentMission.name === 'The Docks' ||
        currentMission.name === 'The Blacksmith' ||
        currentMission.name === 'Shipwright and Co')
    ) {
      return (
        <span
          style={{ color: currentMission?.missionStats?.color }}
          className="font-SemiBold text-[11px] uppercase leading-[12px]">
          High {'>'} 100%
        </span>
      );
    }
  };

  const CombinedMission = () => {
    return (
      <div className="flex w-full flex-col gap-1">
        {!isMobile && (
          <h5 className="white text-left text-[10px] font-bold uppercase">
            MISSION INFO
          </h5>
        )}

        <Container
          className="relative grid h-max w-full gap-5 px-4 py-3"
          style={{
            gridTemplateColumns:
              currentMission.missionStats?.kind === 'Specials'
                ? 'repeat(1, minmax(0, 1fr))'
                : 'repeat(2, minmax(0, 1fr)',
          }}>
          <div className="flex h-full flex-col items-center justify-between gap-1 text-center">
            <div className="relative h-full w-full">
              <Image
                src={
                  currentMission.missionStats?.yieldImage || '/images/gems.svg'
                }
                alt={'Mission Icon'}
                layout="fill"
                objectFit="contain"
                quality={100}
                className="aspect-square"
                unoptimized
              />
            </div>
            <span>
              {currentMission.missionStats?.outcomes &&
              currentMission.missionStats.outcomes[0]
                ? currentMission.missionStats.outcomes[0].effect
                : 'Earn Gems'}
            </span>
          </div>
          {currentMission.missionStats?.kind !== 'Specials' && (
            <div className="flex h-full flex-col items-center justify-between gap-1 text-center">
              <Image
                src={'/images/mission-modal/time-icon.svg'}
                alt={'Time Icon'}
                width={80}
                height={80}
                className="h-[80px] w-[80px]"
                unoptimized
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] font-semibold">TIME</span>
                <h5 className="white text-[12px] font-bold">
                  Min. {currentMission.missionStats?.deployment}h
                </h5>
              </div>
            </div>
          )}
        </Container>
      </div>
    );
  };

  return (
    <div
      className={`flex w-full flex-wrap gap-4 ${
        isMobile && '!flex-nowrap items-center justify-center gap-8'
      }`}>
      {isMobile ? (
        <Container
          className={
            'dropdown dropdown-top left-[2vw] z-[100] flex w-[45vw]  cursor-pointer flex-col items-start justify-start gap-2 md:dropdown-bottom md:relative md:bottom-0 md:w-full'
          }
          ref={missionInfoDivRef}>
          <div
            className="flex h-[52px] w-full flex-row items-center justify-between p-1.5 "
            onClick={() => {
              setMobileMissionInfoVisible((prev) => !prev);
            }}>
            <div className="mb-[1px] flex w-fit items-center justify-between gap-2 px-1 text-[10px] leading-[10px]">
              <div className="flex h-3 w-3 items-center justify-center bg-white text-black">
                i
              </div>
              <span className="uppercase">MISSION INFO</span>
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="flex h-full w-fit cursor-pointer items-center justify-center rounded border border-[rgba(255,255,255,0.1)] bg-[#141515]">
                <div className="flex h-[38px] w-[38px] items-center justify-center transition-all duration-300 ease-in-out hover:scale-110">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={`h-6 w-6 rotate-90`}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <motion.div
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
            }}
            animate={isMobileMissionInfoVisible ? 'visible' : 'hidden'}
            variants={{
              visible: { opacity: 1, height: 'auto', overflow: 'hidden' },
              hidden: { opacity: 0, height: 0, overflow: 'hidden' },
            }}
            transition={{ duration: 0.22 }}
            className={
              'dropdown-content menu !visible relative z-[99] flex max-h-[42vh] w-full !scale-x-[1]  !scale-y-[0.95] cursor-default flex-row items-start justify-start gap-4  !overflow-y-scroll rounded-[6px]  bg-black text-white shadow focus:!scale-[0.95] focus:!scale-x-[1] ' +
              (isMobile && ' !bottom-16 left-0 !w-[96vw]')
            }>
            <CombinedMission />
          </motion.div>
        </Container>
      ) : (
        <div className="relative bottom-20 left-0 flex w-full md:bottom-0">
          <CombinedMission />
        </div>
      )}

      <Container
        className={
          'dropdown dropdown-top right-0 z-[100] flex w-1/2  flex-col items-center justify-between md:dropdown-bottom md:relative md:bottom-0 md:w-full ' +
          (isMobile && ' right-[2vw] !w-[47vw] ')
        }
        ref={outcomeDivRef}>
        <div className="flex w-full flex-row items-center justify-between p-1.5">
          <div className="mb-[1px] flex h-[35px] w-full flex-col items-center justify-center px-1">
            <span className="font-Body text-[10px] uppercase">
              {currentMission?.missionStats?.kind === 'Plunders'
                ? 'Risk Profile'
                : currentMission?.missionStats?.kind === 'Specials'
                ? `Staking Release Date ${convertFirestoreDateToTimestamp(
                    currentMission?.missionStats?.missionEndDate._seconds,
                  )}`
                : currentMission?.missionStats.yield}
            </span>
            {getSuccessRate()}
          </div>
        </div>
        <motion.div
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
          }}
          animate={isProfilesVisible ? 'visible' : 'hidden'}
          variants={{
            visible: { opacity: 1, height: 'auto', overflow: 'hidden' },
            hidden: { opacity: 0, height: 0, overflow: 'hidden' },
          }}
          transition={{ duration: 0.22 }}
          className={
            'dropdown-content menu !visible relative z-[99] max-h-[30vh] w-full !scale-x-[1] !scale-y-[0.95] cursor-default flex-row space-y-2 !overflow-y-scroll rounded-[6px] border border-white border-opacity-20 bg-black px-4 py-2 text-white shadow focus:!scale-[0.95] focus:!scale-x-[1] ' +
            (isMobile && ' !bottom-16 right-0 !w-[96vw]')
          }>
          <>
            {currentMission?.missionStats?.outcomes?.map((outcome, index) => {
              return (
                <div
                  key={index}
                  className="flex w-full flex-col items-start justify-start gap-2">
                  <span className="text-xs uppercase opacity-60">
                    Level {outcome.level}
                  </span>
                  <div className="flex w-full flex-row items-start justify-between gap-0">
                    <div
                      style={{
                        backgroundImage: `linear-gradient(270deg, #9C9A42 0%, #615522 100%)`,
                        width: `${outcome.rate * 100}%`,
                      }}
                      className={`flex min-w-[92px] max-w-[calc(100%_-_92px)] flex-row items-center justify-between gap-2 rounded-l-md p-2 pr-3`}>
                      <span className="relative z-50">ITEM</span>
                      <span
                        style={{
                          border: `1px solid #FBE85C`,
                          backgroundColor: `#9F9832`,
                        }}
                        className={`rounded px-1 py-0.5 text-xs`}>
                        {(outcome.rate * 100).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                          minimumFractionDigits: 0,
                        })}
                        %
                      </span>
                    </div>
                    <div
                      style={{
                        backgroundImage: `linear-gradient(270deg, #204326 0%, #3F774D 100%)`,
                        width: `${100 - outcome.rate * 100}%`,
                      }}
                      className={`flex min-w-[92px] max-w-[calc(100%_-_92px)] flex-row items-center justify-between gap-2 rounded-r-md p-2 pl-3`}>
                      <span
                        style={{
                          border: `1px solid #63CF6F`,
                          backgroundColor: `#489E50`,
                        }}
                        className={`rounded px-1 py-0.5 text-xs`}>
                        {(100 - outcome.rate * 100).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                          minimumFractionDigits: 0,
                        })}
                        %
                      </span>
                      <span className="relative z-50">GEM</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        </motion.div>
      </Container>
    </div>
  );
};

export default OutcomeIndicator;
