import { CSSProperties, useContext } from 'react';
import _backgroundStyles from '../../../data/bg-styles.json';
import Image from 'next/image';
import { LayerContext } from '../../../contexts/LayerContext';

type MissionResultInfo = any;

const OutcomeColors = {
  gems: {
    textColor: '#19d362',
    glow: '#19d362',
    buttonColor: '#02451c',
  },
  treasure: {
    textColor: '#f3b657f9',
    glow: '#f3b657f9',
    buttonColor: '#f3b657f9',
  },
  booster: {
    textColor: '#19d362',
    glow: '#19d362',
    buttonColor: '#02451c',
  },
};

export const MissionResultCard = ({ item }: { item: MissionResultInfo }) => {
  const MAX_ROW = 3;
  const MAX_COL = 4;

  const isRaid = item.missionType == 'Raids';

  const layerContext = useContext(LayerContext);

  if (!layerContext) {
    throw new Error('LayerSelect must be used within a LayerProvider');
  }

  const { isMobile } = layerContext;

  const backgroundStyles = _backgroundStyles as {
    [missionName: string]: CSSProperties;
  };

  const outcomeColor =
    item.missionName === 'Gem Emporium'
      ? OutcomeColors.gems
      : OutcomeColors.treasure;

  const getResultTitle = () => {
    return item.outcomeEffect;
  };

  const getBackgroundStyle = () => {
    return backgroundStyles[item.missionName];
  };

  const MissionName = ({ missionName }: { missionName: string }) => {
    if (missionName.length <= 12) return <>{missionName}</>;

    return <>{missionName.slice(0, 12) + '...'}</>;
  };

  return (
    <div
      className={`relative mb-4 flex min-h-[610px] min-w-[300px] flex-col justify-between gap-3 rounded-lg bg-opacity-30 px-[23px] py-4 max-xl:min-h-[436px] ${
        isMobile && 'scale-90'
      }`}
      key={item.id}>
      {/* BACKGROUND */}
      <div
        className="absolute left-0 top-0 z-[0] h-full  w-full rounded-lg"
        style={{
          background: `linear-gradient(to top, ${outcomeColor.glow}, #000)`,
        }}></div>

      {
        <div
          style={{
            ...getBackgroundStyle(),
          }}
          className="absolute left-0 top-0 z-[0] mx-[1px]  mb-[1px] h-[calc(100%_-_1px)] w-[calc(100%_-_2px)] rounded-lg"></div>
      }
      <div className="absolute left-0 top-0 z-[0] mx-[1px]  mb-[1px] h-[calc(100%_-_1px)] w-[calc(100%_-_2px)] rounded-lg bg-gradient-to-b from-[#000000C0] from-0% via-[#00000030] via-30% to-[#000000FB] to-70%"></div>
      <div
        className="absolute left-0 top-0 z-[0] h-full w-full rounded-lg "
        style={{
          backgroundImage: `linear-gradient(to bottom, #00000000 0%, ${outcomeColor.glow}20)`,
        }}></div>

      <div
        className={
          'absolute left-0 top-0 z-[1] mx-[1px]  mb-[1px] h-[calc(100%_-_1px)] w-[calc(100%_-_2px)] overflow-hidden rounded-lg '
        }
        style={{
          ['--border-gradient-start' as any]: outcomeColor.glow,
          ['--background-gradient-start' as any]: outcomeColor.glow,
        }}>
        <div
          className="absolute -bottom-[32px] left-0 right-0 z-[3] mx-auto h-[64px] w-2/3 blur-[64px]"
          style={{ backgroundColor: outcomeColor.glow }}></div>
      </div>

      <div className="z-[2] mx-[1px] mb-[1px]  flex h-[calc(100%_-_1px)] w-[calc(100%_-_2px)] flex-col">
        {/* HEAD SECTION */}
        <div className="mb-[220px] flex w-full justify-between gap-2 overflow-hidden text-center text-[12px] uppercase max-xl:mb-[100px]">
          <span className="whitespace-nowrap">Island {item.layer}</span>
          <span className="whitespace-nowrap text-end">
            {item.outcomeType == 'success' || isRaid ? (
              <MissionName missionName={item.missionName} />
            ) : (
              'mission failed'
            )}
          </span>
        </div>

        {/* MIDDLE SECTION */}
        <div className="flex w-full flex-col gap-2.5">
          <div
            className={
              getResultTitle().length <= 7
                ? 'text-center text-[40px] uppercase leading-[28px]'
                : 'text-center text-[30px] uppercase leading-[28px]'
            }
            style={{
              color: outcomeColor.textColor,
              textShadow:
                item.outcomeMultiplier && item.outcomeMultiplier >= 6
                  ? `0 1px 8px ${outcomeColor.glow}, 0 2px 14px ${outcomeColor.glow}90`
                  : '',
            }}>
            {getResultTitle()}
          </div>
          <div className="text-center text-[12px] uppercase">
            {item.nftIds.length} CAPTAINS
          </div>
        </div>

        {/* MID-BOTTOM SECTION */}
        <div className="mb-5 mt-2.5 min-h-[140px] w-full">
          <div className="grid h-fit grid-cols-4 items-start justify-start gap-2.5">
            {item.nftsLoaded
              .slice(0, MAX_COL * MAX_ROW - 1)
              .map((loadedNft: any, index: number) => (
                <Image
                  unoptimized
                  key={/*loadedNft.id ||*/ index}
                  src={loadedNft.metadata?.image}
                  alt={loadedNft.metadata?.name}
                  width={400}
                  height={200}
                  className="h-[40px] min-h-[40px] w-[40px] min-w-[40px] !rounded-md object-contain"
                />
              ))}
            {item.nftIds.length > MAX_COL * MAX_ROW - 1 ? (
              <div
                className={
                  'flex h-[40px] min-h-[40px] w-[40px] min-w-[40px] items-center justify-center !rounded-md leading-[10px]'
                }
                style={{
                  backgroundColor: outcomeColor.buttonColor,
                }}>
                +
                {item.nftIds.length -
                  (MAX_COL * MAX_ROW - 1) +
                  (item.nftsLoaded.length < MAX_COL * MAX_ROW - 1
                    ? item.nftIds.length - item.nftsLoaded.length - 1
                    : 0)}
              </div>
            ) : (
              <>
                {item.nftsLoaded.length < item.nftIds.length && (
                  <div
                    className={
                      'flex h-[40px] min-h-[40px] w-[40px] min-w-[40px] items-center justify-center !rounded-md leading-[10px]'
                    }
                    style={{
                      backgroundColor: outcomeColor.buttonColor,
                    }}>
                    +{item.nftIds.length - item.nftsLoaded.length}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="flex h-[120px] w-full flex-col items-center justify-center">
          {item.missionType === 'Plunders' ? (
            <div className="flex h-[120px] w-full flex-col items-center justify-center gap-3">
              <Image
                src={item.missionYieldImage}
                width={64}
                height={64}
                alt="mission yield"
              />
              <div
                className="text-center text-[30px] font-medium leading-[30px]"
                style={{ color: outcomeColor.textColor }}>
                <span> {item.reward ? item.reward.toFixed(2) : 0}</span>
              </div>
            </div>
          ) : (
            <div className="flex h-max w-full flex-col items-center justify-between">
              <div
                className="flex w-full items-center justify-center gap-5"
                style={{ color: outcomeColor.textColor }}>
                <div className="flex h-full flex-col items-center justify-between gap-1">
                  <Image
                    src={item.missionYieldImage}
                    width={50}
                    height={50}
                    alt="mission yield"
                  />
                  <span>{item.missionYield}</span>
                </div>
                <div className="flex h-full flex-col items-center justify-between gap-1">
                  <Image
                    src="/images/treasure-icon.svg"
                    width={50}
                    height={50}
                    alt="mission reward"
                    className="mt-4"
                  />
                  <span>
                    {item.reward ? item.reward.toFixed(2) : 0} Treasure
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
