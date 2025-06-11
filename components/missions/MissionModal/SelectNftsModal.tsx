import { Spin } from 'antd';
import React, { useContext, useState, useCallback, useMemo } from 'react';
import { LayerContext } from '../../../contexts/LayerContext';
import { useNfts } from '../../../contexts/NftContext';
import NftSlider from '../NftSlider';
import ModalCloseButton from '../../HUD/modals/ModalCloseButton';
import MissionCard from './MissionCard/MissionCard';
import { CharacterNFT } from '../../../types/NFT';

interface SelectNftsModalProps {
  onClose: () => void;
  eligibleCaptains: { eligibleUids: string[] };
  usdcGoldPrice: number;
  isLoading: boolean;
}

type SelectedNftType = {
  captain: CharacterNFT;
  levelUpCount: number;
};

const SelectNftsModal = ({
  onClose,
  eligibleCaptains,
  usdcGoldPrice,
  isLoading,
}: SelectNftsModalProps) => {
  const layerContext = useContext(LayerContext);
  const nfts = useNfts();

  if (!layerContext) {
    throw new Error('LayerSelect must be used within a LayerProvider');
  }

  const { currentMission, isMobile } = layerContext;

  // Get eligible captains for the mission
  const nftsEligibleForMission = useMemo(() => {
    if (nfts.loading || isLoading) return null;
    return nfts.restingNfts.filter((nft): nft is CharacterNFT =>
      eligibleCaptains.eligibleUids.includes(nft.uid!),
    );
  }, [
    nfts.loading,
    isLoading,
    eligibleCaptains.eligibleUids,
    nfts.restingNfts,
  ]);

  const [selectedNfts, setSelectedNfts] = useState<SelectedNftType[]>([]);

  // Handle selection for captains
  const handleSelectCaptain = useCallback((captain: CharacterNFT) => {
    setSelectedNfts((prev) =>
      prev.some((item) => item.captain.uid === captain.uid)
        ? prev.filter((item) => item.captain.uid !== captain.uid)
        : [...prev, { captain, levelUpCount: 1 }],
    );
  }, []);

  const handleLevelUpCountChange = useCallback(
    (id: string, levelUpCount: number) => {
      setSelectedNfts((prev) =>
        prev.map((item) =>
          item.captain.uid === id ? { ...item, levelUpCount } : item,
        ),
      );
    },
    [],
  );

  // Check if a captain is selected
  const checkIfCaptainSelected = useCallback(
    (captain: CharacterNFT) =>
      selectedNfts.some((item) => item.captain.uid === captain.uid),
    [selectedNfts],
  );

  // Render mission cards for captains
  const renderCaptainMissionCards = useMemo(
    () =>
      nftsEligibleForMission?.map((reaver, index) => (
        <MissionCard
          id={`mission-card-${reaver.uid}`}
          key={`mission-modal-${reaver.uid}-${index}`}
          missionType={currentMission?.missionStats?.kind}
          currentMission={currentMission?.missionStats?.name || ''}
          selectedCharacters={selectedNfts}
          isSelected={checkIfCaptainSelected(reaver)}
          unSelect={() => handleSelectCaptain(reaver)}
          handleLevelUpCountChange={handleLevelUpCountChange}
          captain={reaver}
          handleClick={handleSelectCaptain}
          payMethod={currentMission?.missionStats?.currency?.toString()}
          currentGoldPrice={usdcGoldPrice}
        />
      )),
    [
      nftsEligibleForMission,
      usdcGoldPrice,
      currentMission,
      selectedNfts,
      checkIfCaptainSelected,
      handleSelectCaptain,
      handleLevelUpCountChange,
    ],
  );

  return (
    <div className="relative z-20 flex h-full w-full flex-col bg-black bg-opacity-40 p-4 backdrop-blur-md max-md:pt-20 md:bg-opacity-70">
      <div
        className={`flex h-[92px] w-full items-center justify-between px-3 ${
          isMobile && '!h-max !pl-1'
        }`}>
        <div
          className={`px-5 py-3 font-mono text-[12px] uppercase ${
            isMobile && '!px-0'
          }`}>
          {currentMission && (
            <>
              {currentMission.missionStats?.kind} &gt;{' '}
              {currentMission.missionStats?.name} &gt; SELECT NFTS
            </>
          )}
        </div>
        <ModalCloseButton
          handleClose={onClose}
          isWithBackground={false}
          className="absolute right-1 top-3 h-[70px] w-[70px] rounded-[3px]"
        />
      </div>

      <div
        className={`flex h-[calc(100%_-_92px)] w-full rounded-lg border border-white border-opacity-[0.20] ${
          isMobile && '!h-[calc(100%_-_50px)] !border-b-2'
        }`}>
        {isLoading || nfts.loading || !nftsEligibleForMission ? (
          <div className="flex h-full w-full items-center justify-center">
            <Spin />
          </div>
        ) : (
          <div className="relative flex h-full w-full flex-col">
            <div
              className={`relative h-full w-full overflow-y-auto overflow-x-hidden border-r border-[#979797] border-opacity-20 px-4 py-4 ${
                isMobile && '!border-none'
              }`}
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile
                  ? 'repeat(auto-fill, minmax(340px, 1fr))'
                  : 'repeat(auto-fill, minmax(400px, 1fr))',
                gridAutoRows: 'max-content',
                gap: '0.75rem',
                justifyContent: 'center',
                alignItems: 'start',
                justifyItems: 'center',
              }}>
              {renderCaptainMissionCards}
            </div>

            {(nfts.restingNfts.length || nfts.restingSpecialNfts.length) && (
              <NftSlider
                minTeamLength={1}
                setSelectedNfts={setSelectedNfts}
                selectedNfts={selectedNfts}
                nftsEligibleForMission={nftsEligibleForMission}
                onSelect={onClose}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectNftsModal;
