import { CSSProperties, useContext, useEffect, useMemo, useState } from 'react';
import { LayerContext } from '../../../contexts/LayerContext';
import { Spin } from 'antd';
import { AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import MissionManager from './MissionManager';
import EligibleNfts from './EligibleNfts';
import ActiveMissions from './ActiveMissions';
import OutcomeIndicator from './OutcomeIndicator';
import ClaimSlider from '../../inventory/ClaimSlider';
import { useNfts } from '../../../contexts/NftContext';
import SelectNftsModal from './SelectNftsModal';
import MissionActivityFeed from './MissionActivityFeed';
import _backgroundStyles from '../../../data/bg-styles.json';
import { Timestamp } from 'firebase/firestore';

import { isSpecialMission } from '../../../utils/helpers';

import ModalCloseButton from '../../HUD/modals/ModalCloseButton';

const Modal = styled.div`
  position: fixed;
  z-index: 94;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: black;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
`;

const MissionModal: React.FC = () => {
  const layerContext = useContext(LayerContext);
  const nfts = useNfts();

  if (!layerContext) {
    throw new Error('LayerSelect must be used within a LayerProvider');
  }

  const {
    isMissionModalOpen,
    setMissionModalOpen,
    loading,
    error,
    currentMission,
    setCurrentMission,
    setSelectedMissions,
    setShopBuyModalOpen,
    isMobile,
    pricesData,
    isPriceLoading,
  } = layerContext;

  const { filteredActiveMissions } = nfts;

  const [isSelectModalOpen, setSelectModalOpen] = useState(false);
  const [bgStyle, setBgStyle] = useState<CSSProperties | undefined>(undefined);

  useEffect(() => {
    // Set mission background if specified in JSON
    const backgroundStyles = _backgroundStyles as {
      [missionName: string]: CSSProperties;
    };
    if (currentMission && backgroundStyles[currentMission.name]) {
      setBgStyle(backgroundStyles[currentMission.name]);
    } else {
      setBgStyle(backgroundStyles['default']);
    }
  }, [currentMission]);

  const handleClose = () => {
    setMissionModalOpen((prev) => !prev);
    setShopBuyModalOpen(false);
  };

  const boostStart = Timestamp.fromDate(new Date('2023-10-27T20:00:00Z'));
  const boostEnd = Timestamp.fromDate(new Date('2023-10-30T20:00:00Z'));

  const now = new Date();

  const isBoosted = now >= boostStart.toDate() && now <= boostEnd.toDate();

  const [isGovernorMansion, isTortugaBanking, isMarketplace] = useMemo(() => {
    const isGovernorMansion = currentMission?.name === "Governor's Mansion";
    const isSpecial = isSpecialMission(currentMission?.missionStats);
    const isTortugaBanking = currentMission?.name === 'Tortuga Banking';
    const isMarketplace = currentMission?.name === 'The Marketplace';

    return [isGovernorMansion, isTortugaBanking, isMarketplace];
  }, [currentMission]);

  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!isMissionModalOpen) {
      setSelectedMissions((prev) => []);
      setCurrentMission(null);
    }
  }, [isMissionModalOpen, setCurrentMission, setSelectedMissions]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +boostEnd.toDate() - +new Date();
      let timeLeft = '';

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);

        timeLeft = `${days}d ${hours}h ${minutes}m left`;
      }

      return timeLeft;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (loading)
    return (
      <div className="absolute inset-0 flex h-full w-full items-center justify-center">
        <Spin />
      </div>
    );

  if (error) return <div>Error</div>;

  return (
    <AnimatePresence mode="wait">
      {isMissionModalOpen && !isTortugaBanking && !isMarketplace && (
        <Modal className="h-screen w-screen" style={bgStyle}>
          {isSelectModalOpen ? (
            <SelectNftsModal
              onClose={() => {
                setSelectModalOpen(false);
              }}
              usdcGoldPrice={pricesData.usdc_gold_price}
            />
          ) : (
            <>
              <ModalCloseButton
                handleClose={handleClose}
                isWithBackground={true}
                className="absolute right-1 top-3 flex h-[70px] w-[70px] items-center justify-center rounded-[3px] border-none !p-0 md:right-4 md:top-5"
              />

              {/* BG Blur */}
              <div className="missionsModalNftsBgGradient absolute z-10 mt-[90px] h-full w-full flex-col">
                <div className="absolute bottom-[90%] h-[5%] w-full backdrop-blur-[2px]"></div>
                <div className="absolute bottom-[85%] h-[5%] w-full backdrop-blur-sm"></div>
                <div className="absolute bottom-[80%] h-[5%] w-full backdrop-blur"></div>
                <div className="absolute bottom-0 h-[80%] w-full backdrop-blur-md"></div>
              </div>
              <div className="flex h-full w-full justify-center">
                <div className=" z-10 mt-[120px] flex h-[calc(100vh_-_100px)] w-full max-w-[1800px]  max-xl:w-full md:w-[96%]">
                  <div className="relative flex h-full w-full max-w-full flex-col border-r border-r-[#979797] border-opacity-[0.15] px-[30px] pt-[100px] max-xl:px-[12px] md:w-3/4 md:max-w-[calc(100%_-_300px)]">
                    <MissionManager />
                    <div
                      className={
                        'mission-modal-item-gradient flex h-full !w-full gap-x-2 overflow-x-hidden overflow-y-scroll pb-[128px] pt-8 md:gap-x-6' +
                        (isMobile &&
                          ' !flex-row !flex-wrap !justify-center !pb-[160px]')
                      }
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '1rem',
                        justifyContent: 'center',
                        alignItems: 'start',
                      }}>
                      {/* Select Team*/}

                      <EligibleNfts
                        onClick={() => {
                          setSelectModalOpen(true);
                        }}
                        isLoading={
                          !currentMission?.missionStats?.name || nfts.loading
                        }
                      />
                      {filteredActiveMissions.length == 0 && (
                        <span
                          className={`col-span-2 flex h-[100px] items-center justify-center font-Header text-3xl uppercase leading-6`}>
                          No active missions found
                        </span>
                      )}
                      {/* Active Missions */}
                      <ActiveMissions />
                    </div>

                    {/* Claim Slider */}
                    {filteredActiveMissions.length > 0 && (
                      <div
                        className={`absolute bottom-4 right-0 z-[99] -ml-20 w-full scale-[0.8] max-xl:left-[50%] max-xl:translate-x-[-37%] md:bottom-[40px] md:ml-auto md:mr-auto md:w-[800px] md:scale-100 md:transform ${
                          isMobile &&
                          '!bottom-[11px] !left-[8em] !m-0 !scale-[0.764]'
                        }`}>
                        <ClaimSlider />
                      </div>
                    )}
                  </div>
                  <div className="hidden h-full w-1/4 min-w-[300px] flex-col gap-[20px] px-[30px] pb-8 max-xl:px-[24px] md:flex">
                    <OutcomeIndicator />
                    <MissionActivityFeed />
                  </div>
                  <div className="absolute bottom-[75px] flex w-full items-center justify-center gap-2 md:hidden">
                    <OutcomeIndicator />
                    <MissionActivityFeed />
                  </div>
                </div>
              </div>
            </>
          )}
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default MissionModal;
