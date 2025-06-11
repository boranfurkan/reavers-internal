import { AnimatePresence, motion } from 'framer-motion';
import {
  CSSProperties,
  createRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
import { Layer, LayerContext, Mission } from '../../../contexts/LayerContext';
import { useNfts } from '../../../contexts/NftContext';
import styled from 'styled-components';
import React from 'react';
import _backgroundStyles from '../../../data/bg-styles.json';
import { LuSword } from 'react-icons/lu';
import { GiRank2 } from 'react-icons/gi';
import { CharacterNFT } from '../../../types/NFT';

const StyledImage = styled(Image)<{ src: any; alt: any }>``;

const slideInOut = {
  hidden: { height: '0vh', opacity: 0 },
  show: { height: '500px', opacity: 1, transition: { delay: 0.2 } },
  exit: { width: '16%', transition: { delay: 0.5 } }, // Add this line
};

interface Stat {
  title: string;
  value: string | undefined;
}

const MissionStat = ({
  title,
  titleClassname,
  value,
  valueClassname,
  isMobile,
  isForMissionPage,
}: {
  title: string;
  titleClassname?: string;
  value: string;
  valueClassname?: string;
  isMobile?: boolean;
  isForMissionPage?: boolean;
}) => {
  const iconTitles = [
    {
      id: 1,
      title: 'Duration',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-4 w-4">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      ),
    },
    {
      id: 2,
      title: 'Yield',
      icon: <LuSword />,
    },
    {
      id: 5,
      title: 'Min. Yield (24h)',
      icon: <LuSword />,
    },
    {
      id: 3,
      title: 'Lvl',
      icon: <GiRank2 />,
    },
    {
      id: 4,
      title: 'Lvl',
      icon: <GiRank2 />,
    },
  ];

  return (
    <>
      {isMobile ? (
        isForMissionPage ? (
          <>
            {iconTitles.find((iconTitle) => iconTitle.title === title) ? (
              <div
                className={`flex h-full flex-row flex-wrap items-center justify-between gap-1 text-start ${
                  isMobile && 'flex-col'
                }`}>
                {
                  iconTitles.find((iconTitle) => iconTitle.title === title)
                    ?.icon
                }
                <span
                  className={
                    'whitespace-nowrap font-Body text-sm' + valueClassname
                  }>
                  {value}
                </span>
              </div>
            ) : null}
          </>
        ) : (
          <>
            {iconTitles.find((iconTitle) => iconTitle.title === title) ? (
              <div
                className={`flex h-full flex-row flex-wrap items-center justify-center gap-1 text-start ${
                  isMobile && 'flex-col'
                }`}>
                {
                  iconTitles.find((iconTitle) => iconTitle.title === title)
                    ?.icon
                }
                <span
                  className={
                    'whitespace-nowrap font-Body text-xs' + valueClassname
                  }>
                  {value.length > 5 ? value.slice(0, 5) + '..' : value}
                </span>
              </div>
            ) : null}
          </>
        )
      ) : (
        <>
          <div className="flex h-full flex-col flex-wrap justify-center gap-1 text-center">
            <span
              className={
                'whitespace-nowrap font-Body text-[10px] uppercase ' +
                titleClassname
              }>
              {title}
            </span>
            <span className={'whitespace-nowrap font-Body ' + valueClassname}>
              {value}
            </span>
          </div>
        </>
      )}
    </>
  );
};

const MissionDifficultyIndicator = ({ mission }: { mission: Mission }) => {
  return (
    <>
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          style={{
            backgroundColor:
              mission && index < (mission.missionStats?.riskLevel || 0)
                ? mission.missionStats?.color
                : 'gray',
          }}
          className="h-[3px] w-[3px]"></div>
      ))}
    </>
  );
};

const NftsOnCurrentMission = ({
  nftsOnCurrentMission,
  isMobile,
}: {
  nftsOnCurrentMission: CharacterNFT[];
  isMobile?: boolean;
}) => {
  return (
    <>
      {isMobile ? (
        nftsOnCurrentMission.length > 1 && (
          <span className="absolute left-[11px] top-[11px] flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
          </span>
        )
      ) : (
        <div className="absolute left-1/2 flex flex-row items-center -space-x-4 rounded-md bg-black p-px">
          {nftsOnCurrentMission.slice(0, 3).map((nft, index) => (
            <div
              key={index}
              className="flex rounded border border-[2px] border-x-[3px] border-black bg-black">
              <StyledImage
                unoptimized
                src={nft.metadata?.image}
                alt={nft.metadata?.name}
                width={400}
                height={200}
                className="h-[32px] w-[32px] rounded object-cover  "
              />
            </div>
          ))}
          {nftsOnCurrentMission.length > 3 && (
            <div
              className={`h-[36px] w-[36px] rounded border border-[2px] border-l-[3px] border-black bg-black ${
                isMobile && 'hidden'
              }`}>
              <div
                className={`flex h-full w-full items-center justify-center rounded bg-[#1A1A1A]`}>
                <span className="text-[13px] font-bold leading-[13px] text-white ">
                  +{nftsOnCurrentMission.length - 3}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

const MissionListItem = ({
  currentLevel,
  isLast,
  missionType,
  nfts,
  currentMission,
  getStats,
  onSelect,
  isMobile,
}: {
  currentLevel: Layer;
  isLast: boolean;
  missionType: {
    type: string[];
    title: string;
    icon: string;
  };
  nfts: any;
  currentMission: Mission | null;
  getStats: (mission: Mission) => Stat[];
  onSelect: (mission: Mission) => any;
  isMobile: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const backgroundStyles = _backgroundStyles as {
    [missionName: string]: CSSProperties;
  };

  const kindMissions = currentLevel.missions.filter((mission) =>
    missionType.type.includes(mission.missionStats?.kind || ''),
  );

  const divRef = useRef<HTMLDivElement>(null);
  const expandedRef = useRef<boolean>();

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (
        divRef.current &&
        !divRef.current.contains(event.target) &&
        expandedRef.current
      ) {
        setIsExpanded(false);
      }
    }

    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsExpanded(
      currentMission
        ? missionType.type.includes(currentMission.missionStats?.kind || '')
        : false,
    );
  }, [currentMission]);

  useEffect(() => {
    expandedRef.current = isExpanded;
  }, [isExpanded]);

  if (kindMissions.length == 0) {
    return <></>;
  }

  return (
    <>
      {isMobile ? (
        <>
          <div
            className={
              'flex w-full flex-col p-4 ' +
              (!isLast ? 'border-b border-b-[rgba(255,255,255,0.1)]' : ' ') +
              (isExpanded ? ' gap-2.5' : '')
            }
            ref={divRef}>
            <div
              className="flex w-full cursor-pointer justify-between"
              onClick={() => {
                setIsExpanded((prev) => !prev);
              }}>
              <span className="text-start text-[12px] uppercase leading-[18px] text-white opacity-50">
                {missionType.title}
              </span>
              <motion.div
                initial={isExpanded ? 'open' : 'collapsed'}
                animate={isExpanded ? 'open' : 'collapsed'}
                variants={{
                  open: { rotate: 0 },
                  collapsed: { rotate: 90 },
                }}
                transition={{
                  duration: 0.2,
                  ease: [0.04, 0.62, 0.23, 0.98],
                }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={
                    'h-5 w-5 opacity-50 transition-all duration-300 ease-in-out hover:scale-125 hover:opacity-100'
                  }>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </motion.div>
            </div>
            <motion.div
              className="flex flex-col gap-2.5"
              initial={isExpanded ? 'open' : 'collapsed'}
              animate={isExpanded ? 'open' : 'collapsed'}
              variants={{
                open: { opacity: 1, height: 'auto' },
                collapsed: { opacity: 0, height: 0, overflow: 'hidden' },
              }}
              transition={{
                duration: 0.2,
                ease: [0.04, 0.62, 0.23, 0.98],
              }}>
              {kindMissions.map((mission, index) => {
                // Filter out nfts on the current mission
                const nftsOnCurrentMission = nfts.nftsOnMission.filter(
                  (nft: CharacterNFT) => {
                    const currentMission = nft.currentMissionLoaded;
                    return (
                      currentMission &&
                      currentMission.mission?.name === mission.name
                    );
                  },
                );

                const isCurrentMission = currentMission?.id === mission.id;

                const stats = getStats(mission);
                const isEmeraldYield =
                  mission?.missionStats?.kind == 'Plunders' &&
                  mission?.missionStats?.yield == 'Gems';

                return (
                  <div
                    key={mission.id}
                    onClick={() => {
                      if (!isCurrentMission) {
                        onSelect(mission);
                      }
                    }}
                    className={`relative flex w-full cursor-pointer items-center justify-between gap-2 rounded-md bg-[#121211] p-3 ${
                      isCurrentMission
                        ? 'overflow-hidden border border-white border-opacity-60 shadow-mission'
                        : ''
                    }`}>
                    {/* Left */}
                    <div
                      className={`z-10 flex items-center gap-4 ${
                        isMobile && 'min-w-[120px] max-w-[120px]'
                      }`}>
                      <div
                        className={`flex h-[36px] w-[36px] items-center justify-center rounded border border-[rgba(255,255,255,0.1)] bg-[#141515] bg-opacity-50 p-2  backdrop-blur-md ${
                          isMobile && '!p-0.5'
                        }`}>
                        <Image
                          src={
                            mission.missionStats?.yieldImage ||
                            '/images/gems.svg'
                          }
                          width={24}
                          height={24}
                          alt="Mission Icon"
                          className={`h-auto w-full ${isMobile && '!h-4 !w-4'}`}
                          unoptimized
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-left text-[10px] uppercase leading-[14px] text-white">
                          {isMobile
                            ? mission.name.length > 7
                              ? mission.name.slice(0, 7) + '..'
                              : mission.name
                            : mission.name}
                        </span>
                        <div className="flex flex-row items-center justify-start gap-[3px] pt-1.5">
                          <MissionDifficultyIndicator mission={mission} />
                        </div>
                      </div>
                    </div>
                    {/* Right */}
                    <div
                      className={`z-10 flex items-center gap-6 ${
                        isMobile && 'w-full justify-between !gap-2'
                      }`}>
                      <NftsOnCurrentMission
                        nftsOnCurrentMission={nftsOnCurrentMission}
                        isMobile={isMobile}
                      />
                      <div
                        className={`grid h-full w-full grid-cols-3 items-center gap-5 rounded ${
                          isMobile && '!gap-2'
                        }`}>
                        {stats.map((stat) => {
                          return (
                            <MissionStat
                              key={stat.title}
                              title={stat.title}
                              titleClassname={
                                isCurrentMission ? 'opacity-100' : 'opacity-50'
                              }
                              isMobile={isMobile}
                              value={stat.value || ''}
                              valueClassname={`text-[12px] ${
                                isMobile && 'text-[10px]'
                              }`}
                            />
                          );
                        })}
                      </div>
                      <div className="flex h-full w-fit cursor-pointer items-center justify-center rounded border border-[rgba(255,255,255,0.1)] bg-[#20201f]">
                        <div className="flex h-full w-full items-center justify-center p-2 transition-all duration-300 ease-in-out hover:scale-110">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className={`h-4 w-4`}>
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
                );
              })}
            </motion.div>
          </div>
        </>
      ) : (
        <>
          <div
            className={
              'flex w-full flex-col p-4 ' +
              (!isLast ? 'border-b border-b-[rgba(255,255,255,0.1)]' : ' ') +
              (isExpanded ? ' gap-2.5' : '')
            }
            ref={divRef}>
            <div
              className="flex w-full cursor-pointer justify-between"
              onClick={() => {
                setIsExpanded((prev) => !prev);
              }}>
              <span className="text-start text-[12px] uppercase leading-[18px] text-white opacity-50">
                {missionType.title}
              </span>
              <motion.div
                initial={isExpanded ? 'open' : 'collapsed'}
                animate={isExpanded ? 'open' : 'collapsed'}
                variants={{
                  open: { rotate: 0 },
                  collapsed: { rotate: 90 },
                }}
                transition={{
                  duration: 0.2,
                  ease: [0.04, 0.62, 0.23, 0.98],
                }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={
                    'h-5 w-5 opacity-50 transition-all duration-300 ease-in-out hover:scale-125 hover:opacity-100'
                  }>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </motion.div>
            </div>
            <motion.div
              className="flex flex-col gap-2.5"
              initial={isExpanded ? 'open' : 'collapsed'}
              animate={isExpanded ? 'open' : 'collapsed'}
              variants={{
                open: { opacity: 1, height: 'auto' },
                collapsed: { opacity: 0, height: 0, overflow: 'hidden' },
              }}
              transition={{
                duration: 0.2,
                ease: [0.04, 0.62, 0.23, 0.98],
              }}>
              {kindMissions.map((mission, index) => {
                // Filter out nfts on the current mission
                const nftsOnCurrentMission = nfts.nftsOnMission.filter(
                  (nft: CharacterNFT) => {
                    const currentMission = nft.currentMissionLoaded;
                    return (
                      currentMission &&
                      currentMission.mission?.name === mission.name
                    );
                  },
                );

                const isCurrentMission = currentMission?.id === mission.id;

                const stats = getStats(mission);
                const isEmeraldYield =
                  mission?.missionStats?.kind == 'Plunders' &&
                  mission?.missionStats?.yield == 'Gems';

                return (
                  <div
                    key={mission.id}
                    onClick={() => {
                      if (!isCurrentMission) {
                        onSelect(mission);
                      }
                    }}
                    className={`relative flex w-full cursor-pointer items-center justify-between gap-2 rounded-md bg-[#121211] p-3 ${
                      isCurrentMission
                        ? 'overflow-hidden border border-white border-opacity-60 shadow-mission'
                        : ''
                    }`}>
                    {/* Left */}
                    <div className="z-10 flex items-center gap-4 ">
                      <div
                        className={`flex h-[36px] w-[36px] items-center justify-center rounded border border-[rgba(255,255,255,0.1)] bg-[#141515] bg-opacity-50 p-2  backdrop-blur-md ${
                          isMobile && '!p-0.5'
                        }`}>
                        <Image
                          src={
                            mission.missionStats?.yieldImage ||
                            '/images/gems.svg'
                          }
                          width={24}
                          height={24}
                          alt="Mission Icon"
                          className={`h-auto w-full ${isMobile && '!h-4 !w-4'}`}
                          unoptimized
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] uppercase leading-[14px] text-white">
                          {mission.name}
                        </span>
                        <div className="flex flex-row items-center justify-start gap-[3px] pt-1.5">
                          <MissionDifficultyIndicator mission={mission} />
                        </div>
                      </div>
                    </div>
                    {/* Right */}
                    <div className="z-10 flex w-[35%] items-center justify-between gap-6 ">
                      <NftsOnCurrentMission
                        nftsOnCurrentMission={nftsOnCurrentMission}
                      />
                      <div className="grid h-full w-full grid-cols-3 items-center gap-2 rounded">
                        {stats.map((stat) => {
                          if (stat.title !== 'Yield') {
                            // Check if the title is naot 'Yield'
                            return (
                              <MissionStat
                                key={stat.title}
                                title={stat.title}
                                titleClassname={
                                  isCurrentMission
                                    ? 'opacity-100'
                                    : 'opacity-50'
                                }
                                value={stat.value || ''}
                                valueClassname={`text-[12px] ${
                                  isMobile && 'text-[10px]'
                                }`}
                              />
                            );
                          }
                        })}
                      </div>
                      <div className="flex h-full w-fit cursor-pointer items-center justify-center rounded border border-[rgba(255,255,255,0.1)] bg-[#20201f]">
                        <div className="flex h-full w-full items-center justify-center p-2 transition-all duration-300 ease-in-out hover:scale-110">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className={`h-4 w-4`}>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8.25 4.5l7.5 7.5-7.5 7.5"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Background */}
                    <div
                      className="absolute left-0 top-0 h-full w-full"
                      style={backgroundStyles[mission.name || 'default']}></div>
                    {isCurrentMission ? (
                      <div className="newActiveMissionSmallGradient absolute -right-0 top-0 z-0 h-[100%] w-[100%]"></div>
                    ) : (
                      <div className="absolute -right-0 top-0 z-0 h-[100%] w-[100%] bg-black bg-opacity-80"></div>
                    )}
                  </div>
                );
              })}
            </motion.div>
          </div>
        </>
      )}
    </>
  );
};

const MissionManager = () => {
  const layerContext = useContext(LayerContext);

  if (!layerContext) {
    throw new Error('LayerSelect must be used within a LayerProvider');
  }

  const {
    levels: islands,
    currentLevel,
    setCurrentLevel,
    currentMission,
    setCurrentMission,
    isMobile,
  } = layerContext;

  const [isExpanded, setIsExpanded] = useState(false);

  const nfts = useNfts();

  const divRef = useRef<HTMLDivElement>(null);
  const expandedRef = useRef<boolean>();

  const backgroundStyles = _backgroundStyles as {
    [missionName: string]: CSSProperties;
  };

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (
        divRef.current &&
        !divRef.current.contains(event.target) &&
        expandedRef.current
      ) {
        setIsExpanded(false);
      }
    }

    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    expandedRef.current = isExpanded;
  }, [isExpanded]);

  if (!currentMission) {
    if (islands.length > 0 && islands[0].missions.length > 0) {
      setCurrentMission(islands[0].missions[0]);
    } else {
      return null;
    }
  }

  const switchLayer = (layer: Layer) => {
    if (currentLevel.layer != layer.layer) {
      setCurrentLevel(layer);
    }
  };

  const missionTypes = [
    { type: ['Plunders'], title: 'Plunders', icon: '/images/coins.webp' },
    { type: ['Raids'], title: 'Raids', icon: '/images/raids-icon-orange.svg' },
    {
      type: ['RescueCrew', 'Events'],
      title: 'Objectives',
      icon: '/images/objective-icon.svg',
    },
  ];

  const getStats = (mission: Mission) => {
    const stats: Array<Stat> = [];

    if (mission.missionStats?.kind === 'Plunders') {
      stats.push(
        {
          title: 'Duration',
          value:
            (mission.missionStats.deployment
              ? mission.missionStats.deployment.toString() + 'h'
              : '\u00A0') + ' min.',
        },
        {
          title: 'Yield',
          value: mission.missionStats?.yield || '\u00A0',
        },
        {
          title: 'Lvl',
          value: mission.missionStats?.minLevel
            ? mission.missionStats?.minLevel + '+'
            : '\u00A0',
        },
      );

      if (
        mission.missionStats.name !== 'Supply Store' &&
        mission.missionStats.name !== 'Safe Haven'
      ) {
        stats.push({
          title: 'Battle Token',
          value: 'Required',
        });
      }
      if (mission.missionStats.strengthCap) {
        stats.push({
          title: 'Strength Cap',
          value: mission.missionStats.strengthCap.toString(),
        });
      }
    } else if (
      mission.missionStats?.kind === 'Events' ||
      mission.missionStats?.kind === 'Burners'
    ) {
      if (mission.missionStats?.kind === 'Burners') {
        stats.push({
          title: 'Duration',
          value: mission.missionStats.deployment
            ? mission.missionStats.deployment.toString() + 'h'
            : '\u00A0',
        });
        stats.push({
          title: 'Cost',
          value: mission.missionStats?.cost
            ? mission.missionStats?.cost.toString() +
              ` $${mission.missionStats.currency?.toUpperCase()}`
            : '\u00A0',
        });
      }
      if (mission.missionStats.strengthCap) {
        stats.push({
          title: 'Strength Cap',
          value: mission.missionStats.strengthCap.toString(),
        });
      }
      stats.push(
        {
          title: 'Yield',
          value: mission.missionStats?.yield || '\u00A0',
        },
        {
          title: 'Lvl',
          value: mission.missionStats?.minLevel
            ? mission.missionStats?.minLevel + '+'
            : '\u00A0',
        },
      );
    } else if (mission.missionStats?.kind === 'Specials') {
      stats.push({
        title: 'Lvl',
        value: mission.missionStats?.minLevel
          ? mission.missionStats?.minLevel + '+'
          : '\u00A0',
      });

      if (mission.missionStats.name === 'Genesis Cove Condominium') {
        stats.push({
          title: 'Cost',
          value: '25000 $BOOTY',
        });
      } else if (mission.missionStats.name === 'The General Store') {
        stats.push({
          title: 'Cost',
          value: '5000 $BOOTY',
        });
      }
    }

    stats.push({
      title: 'Total Captains',
      value: mission.missionStats?.totalActiveMissions
        ? mission.missionStats?.totalActiveMissions.toString()
        : '0',
    });

    return stats;
  };

  return (
    <>
      {isMobile ? (
        <>
          <motion.div
            className="absolute -top-6 left-2 right-2 z-[999] ml-auto mr-auto w-auto select-none rounded-md border border-[rgba(255,255,255,0.3)]  "
            ref={divRef}>
            {/* Top section */}
            <div
              className={
                'relative flex h-auto cursor-pointer flex-col justify-start gap-0 rounded-md border-b border-b-[rgba(255,255,255,0.1)] bg-black p-0.5 pl-2 md:h-[80px] md:flex-row md:justify-between md:gap-2 md:p-[14px] md:pl-[14px]'
              }
              onClick={() => {
                setIsExpanded((prev) => !prev);
              }}>
              {/* Top-left */}
              <div className="relative z-10 flex h-auto w-full items-center justify-start md:h-[50px] md:w-1/2">
                <div className="flex h-[35px] w-[35px] items-center justify-center p-2 md:h-[50px] md:w-[50px]">
                  <Image
                    src={
                      missionTypes.find((mType) =>
                        mType.type.includes(
                          currentMission?.missionStats?.kind || '',
                        ),
                      )?.icon || '/images/coins.webp'
                    }
                    width={32}
                    height={32}
                    alt="Island icon"
                    className="h-auto w-full"
                    unoptimized
                  />
                </div>
                <div className="flex h-full flex-col flex-wrap justify-between rounded px-1 py-0.5 text-start md:px-2 md:py-[0.187rem]">
                  <span className="text-md font-Header uppercase leading-6 md:text-2xl">
                    {currentMission?.name === "Riddick's Hideout"
                      ? "Riddick's Hideout"
                      : currentMission?.name}
                  </span>
                </div>
              </div>
              {/* Top-right */}
              <div
                className={`z-10 flex h-auto w-full justify-start pb-2 md:h-[50px] md:w-1/2 md:justify-end ${
                  isMobile && '!pb-0'
                }`}>
                <div
                  className={`flex h-full w-fit items-center justify-start gap-2 rounded px-1 ${
                    isMobile &&
                    '!w-full !justify-center !gap-5 py-2 !pr-14 pl-2'
                  }`}>
                  {currentMission &&
                    getStats(currentMission).map((stat) => {
                      return (
                        <MissionStat
                          key={stat.title}
                          title={stat.title}
                          titleClassname="opacity-50 text-[4px] md:text-[10px]"
                          value={stat.value || ''}
                          isMobile={isMobile}
                          isForMissionPage={true}
                        />
                      );
                    })}
                </div>
                <div
                  className={`absolute right-4 top-1/2 flex h-fit w-fit -translate-y-1/2 cursor-pointer items-center justify-center rounded border border-[rgba(255,255,255,0.1)] bg-[#141515] bg-opacity-50 backdrop-blur-md ${
                    isMobile && 'top-[4.3em] !h-10 !w-10'
                  }`}>
                  <div className="flex h-full w-8 items-center justify-center p-2 transition-all duration-300 ease-in-out hover:scale-110 md:w-[50px]">
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

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  variants={slideInOut}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  className="w-full rounded-b-md bg-black">
                  {/* Island selection */}
                  {/* <div className="flex h-[36px] w-full justify-between gap-1.5 border-b border-b-[rgba(255,255,255,0.1)] bg-black px-3 py-1.5">
                    {islands.map((island) => {
                      return (
                        <div
                          key={island.id}
                          className={`flex h-full flex-1 items-center justify-center rounded bg-common-fill px-4 cursor-pointer ${currentLevel.layer == island.layer
                            ? 'bg-opacity-10'
                            : 'bg-opacity-[0.06] text-white/50'
                            }
                    `}
                          onClick={() => {
                            switchLayer(island);
                          }}>
                          <span className="text-[10px] uppercase leading-[10px]">
                            Island {island.layer}
                          </span>
                        </div>
                      );
                    })}
                  </div> */}
                  {/* Mission list */}
                  <div className="flex max-h-[90%] w-full flex-col items-start overflow-scroll bg-black">
                    {missionTypes.map((missionType, index) => {
                      return (
                        <MissionListItem
                          key={missionType.title}
                          currentLevel={currentLevel}
                          isLast={false}
                          missionType={missionType}
                          nfts={nfts}
                          currentMission={currentMission}
                          getStats={getStats}
                          onSelect={(mission) => {
                            setCurrentMission(mission);
                            setIsExpanded(false);
                          }}
                          isMobile={isMobile}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      ) : (
        <>
          <motion.div
            className="absolute left-0 right-0 top-0 z-30 ml-auto mr-auto w-full select-none rounded-md border border-[rgba(255,255,255,0.3)] max-lg:ml-0  max-lg:mr-0 max-lg:w-full md:w-[calc(100%_-_58px)]"
            ref={divRef}>
            {/* Top section */}
            <div
              className={
                'relative flex h-[80px] cursor-pointer flex-col justify-start gap-0 rounded-md border-b border-b-[rgba(255,255,255,0.1)] bg-black p-[14px] pl-2 md:flex-row md:justify-between md:gap-2 md:pl-[14px]'
              }
              onClick={() => {
                setIsExpanded((prev) => !prev);
              }}>
              {/* Background */}
              <motion.div
                className={
                  'absolute left-0 top-0 z-0 hidden h-full w-full md:block'
                }
                animate={{ opacity: isExpanded ? 0.35 : 0.75 }}
                transition={{ duration: 0.5 }}
                style={
                  backgroundStyles[
                    currentMission ? currentMission.name : 'default'
                  ]
                }></motion.div>
              {/* Top-left */}
              <div className="relative z-10 -ml-8 -mt-10 flex h-[50px] w-full scale-75 gap-3 md:ml-0 md:mt-0 md:w-1/2 md:scale-100">
                <div className="flex h-[50px] w-[50px] items-center justify-center rounded border border-[rgba(255,255,255,0.1)] bg-[#141515] p-2 backdrop-blur-md  md:bg-opacity-50">
                  <Image
                    src={
                      currentMission?.missionStats?.yieldImage ||
                      '/images/gems.svg'
                    }
                    width={32}
                    height={32}
                    alt="Island icon"
                    className="h-auto w-full"
                    unoptimized
                  />
                </div>
                <div className="flex h-full flex-col flex-wrap justify-between rounded border border-[rgba(255,255,255,0.1)] bg-[#141515] px-2 py-[0.187rem]  text-start backdrop-blur-md md:bg-opacity-50">
                  <span className="font-Body text-[10px] uppercase opacity-50">
                    Island {currentMission?.missionStats?.layer}
                  </span>
                  <span className="font-Header text-2xl uppercase leading-6">
                    {currentMission?.name === "Riddick's Hideout"
                      ? "Riddick's Hideout"
                      : currentMission?.name}
                  </span>
                </div>
              </div>
              {/* Top-right */}
              <div className="z-10 -ml-8 flex h-[50px] w-full scale-75 justify-start gap-2 md:ml-0 md:w-1/2 md:scale-100 md:justify-end">
                <div className="flex h-full w-fit items-center gap-8 rounded border border-[rgba(255,255,255,0.1)] bg-[#141515] bg-opacity-50 px-3  pt-1 backdrop-blur-md">
                  {currentMission &&
                    getStats(currentMission).map((stat) => {
                      return (
                        <MissionStat
                          key={stat.title}
                          title={stat.title}
                          titleClassname="opacity-50"
                          value={stat.value || ''}
                          isMobile={isMobile}
                        />
                      );
                    })}
                </div>
                <div className="flex h-full w-fit cursor-pointer items-center justify-center rounded border border-[rgba(255,255,255,0.1)] bg-[#141515] bg-opacity-50 backdrop-blur-md ">
                  <div className="flex h-full w-[50px] items-center justify-center p-2 transition-all duration-300 ease-in-out hover:scale-110">
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

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  variants={slideInOut}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  className="w-full rounded-b-md bg-black">
                  {/* Island selection */}
                  {/* <div className="flex h-[36px] w-full justify-between gap-1.5 border-b border-b-[rgba(255,255,255,0.1)] bg-black px-3 py-1.5">
                    {islands.map((island) => {
                      return (
                        <div
                          key={island.id}
                          className={`flex h-full flex-1 items-center justify-center rounded bg-common-fill px-4 cursor-pointer ${currentLevel.layer == island.layer
                            ? 'bg-opacity-10'
                            : 'bg-opacity-[0.06] text-white/50'
                            }
                    `}
                          onClick={() => {
                            switchLayer(island);
                          }}>
                          <span className="text-[10px] uppercase leading-[10px]">
                            Island {island.layer}
                          </span>
                        </div>
                      );
                    })}
                  </div> */}
                  {/* Mission list */}
                  <div className="flex max-h-[90%] w-full flex-col items-start overflow-scroll bg-black">
                    {missionTypes.map((missionType, index) => {
                      return (
                        <MissionListItem
                          key={missionType.title}
                          currentLevel={currentLevel}
                          isLast={false}
                          missionType={missionType}
                          nfts={nfts}
                          currentMission={currentMission}
                          getStats={getStats}
                          onSelect={(mission) => {
                            setCurrentMission(mission);
                            setIsExpanded(false);
                          }}
                          isMobile={isMobile}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </>
  );
};

export default MissionManager;
