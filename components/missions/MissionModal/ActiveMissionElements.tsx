import styled from 'styled-components';
import { ActiveMission } from '../../../lib/types';
import React, { useContext, useCallback } from 'react';
import { LayerContext } from '../../../contexts/LayerContext';
import Image from 'next/image';

import {
  getLevelRarity,
  getRarityColorWithOpacity,
} from '../../../utils/helpers';
import RarityBadge from '../../inventory/RarityBadge';
import StrengthDisplay from '../StrengthDisplay';
import { useNfts } from '../../../contexts/NftContext';
import { NFTType } from '../../../types/BaseEntity';
import GoldBarDisplay from '../GoldBarDisplay';
import CombinedCountdownTimer from '../../HUD/CountdownTimer';
import GetIconForEntitiy from '../../GetIconForEntitiy';

const NftCard = styled.div<{
  selected: boolean;
  selectable: boolean;
}>`
  width: 400px;
  height: max-content;
  padding: 10px;
  border-radius: 8px;
  background-color: ${({ selected }) =>
    selected ? 'rgba(74, 35, 154, 0.2)' : 'rgba(216, 216, 216, 0.1)'};
  border: ${({ selected }) =>
    selected ? '1px solid #9b6afd' : '1px solid rgba(255, 255, 255, 0.3)'};
  cursor: ${({ selectable }) => (selectable ? 'pointer' : 'not-allowed')};
  transition: background-color 0.3s ease, border-color 0.3s ease;
  &:hover {
    cursor: pointer;
    border: ${({ selected }) =>
      selected ? '1px solid #C3A5FD' : '1px solid #ffffff80'};
  }
`;

const StyledEntityCard = styled.div<{
  rarity: string;
}>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 80px;
  cursor: pointer;
  border-radius: 6px;
  border: ${({ rarity }) =>
    `1px solid ${getRarityColorWithOpacity(rarity || 'COMMON', 40)}`};
  background-color: ${({ rarity }) =>
    getRarityColorWithOpacity(rarity || 'COMMON', 20)};
  border-opacity: 0.2;

  &:hover {
    border-opacity: 0.8;
    border-color: ${({ rarity }) =>
      getRarityColorWithOpacity(rarity || 'COMMON', 40)};
    background-color: ${({ rarity }) =>
      getRarityColorWithOpacity(rarity || 'COMMON', 30)};
  }
`;

const NotSelectedDiv = styled.div`
  position: relative;
  display: flex;
  height: 80px;
  width: 100%;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  background-color: rgba(0, 0, 0, 0.05);
  border-opacity: 0.2;
  transition: all 0.3s ease-in-out;

  &:hover {
    border-color: rgba(255, 255, 255, 0.8);
    border-opacity: 0.4;
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const ActiveMissionElement = React.memo(function ActiveMissionElement({
  mission,
}: {
  mission: ActiveMission;
}) {
  const layerContext = useContext(LayerContext);
  const nfts = useNfts();

  if (!layerContext) {
    console.error('LayerSelect must be used within a LayerProvider');
    throw new Error('LayerSelect must be used within a LayerProvider');
  }

  const { selectedMissions, handleMissionClick, isMobile } = layerContext;

  const isSelected = selectedMissions.some(
    (selectedMission) => selectedMission.id === mission.id,
  );

  const reaver = mission.nftsLoaded && mission.nftsLoaded[0];

  const levelPart = (reaver: any) => {
    if (!reaver || !reaver.level) return '';
    return `Level ${reaver.level}`;
  };

  const renderEntity = useCallback(
    (
      character: any,
      type: NFTType.CREW | NFTType.SHIP | NFTType.ITEM,
      altText: string,
    ) => {
      // Check if character has the required level for this entity type
      const hasEntity =
        (type === NFTType.CREW && character?.crewLevel) ||
        (type === NFTType.SHIP && character?.shipLevel) ||
        (type === NFTType.ITEM && character?.itemLevel);

      if (hasEntity) {
        const level =
          type === NFTType.CREW
            ? character.crewLevel || 1
            : type === NFTType.ITEM
            ? character.itemLevel || 1
            : character.shipLevel || 1;

        const rarity = getLevelRarity(type, level);

        return (
          <StyledEntityCard className="relative" rarity={rarity || 'COMMON'}>
            <RarityBadge
              bgColor={getRarityColorWithOpacity(rarity, 70)}
              rarityText={rarity}
              secondayText={`(${level})`}
              size="extraSmall"
              className="absolute left-1 top-1 z-50"
            />
            <GetIconForEntitiy
              entityType={type}
              className="h-[40px] w-[40px] object-contain transition-all duration-300 ease-in-out hover:scale-110"
              style={{ pointerEvents: 'none' }}
            />
          </StyledEntityCard>
        );
      } else {
        return (
          <NotSelectedDiv>
            <div className="flex h-full w-full items-center justify-center text-xs">
              No {altText}
            </div>
          </NotSelectedDiv>
        );
      }
    },
    [],
  );

  return (
    <div
      key={mission.id}
      className={`flex w-full flex-row items-center justify-start gap-8 rounded ${
        isMobile && '!justify-center'
      }`}>
      {reaver && (
        <NftCard
          id={reaver.uid}
          selected={isSelected}
          selectable={true}
          onClick={() => handleMissionClick(mission)}
          className="relative z-20 flex !w-full flex-col items-center justify-start gap-2 rounded-md text-[10px] [&>*]:pointer-events-none">
          {isSelected && (
            <>
              <span className="absolute -right-2.5 -top-2.5 z-50  rounded-full text-xs uppercase">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6 text-[#9b6afd]">
                  <path
                    fillRule="evenodd"
                    d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <div className="absolute inset-0 z-40 h-full w-full rounded-[8px] bg-[#4a239a] bg-opacity-15"></div>
            </>
          )}

          <div className="flex w-full flex-row flex-nowrap items-start justify-start gap-3">
            <div className="relative min-h-[162px] min-w-[150px]">
              <Image
                unoptimized
                src={reaver.metadata?.image || '/images/reavers.webp'}
                alt="reaver"
                width={150}
                height={150}
                className="h-[170px] rounded-md object-cover"
                style={{ pointerEvents: 'none' }}
              />
              <div className="absolute left-0 top-0 rounded-tl-md bg-[#000000bb] p-2">
                {levelPart(reaver)}
              </div>
            </div>

            <div className="grid h-full w-full grid-cols-2 gap-3">
              {renderEntity(reaver, NFTType.ITEM, 'Item')}
              {renderEntity(reaver, NFTType.SHIP, 'Ship')}
              <div className="col-span-2 w-full">
                {renderEntity(reaver, NFTType.CREW, 'Crew')}
              </div>
            </div>
          </div>

          {/* Displaying the Level, Base and Type Information */}
          <div className="flex w-full flex-row items-start justify-between gap-2 text-start">
            <GoldBarDisplay goldBurned={reaver.goldBurned} />
            <div className="flex flex-row items-center justify-start gap-4 text-start">
              <span className="opacity-50">STRENGTH</span>
              <StrengthDisplay
                character={reaver}
                strength={reaver.strength || 0}
                size="small"
              />
            </div>
          </div>
          <div className="w-full">
            <CombinedCountdownTimer mission={mission} />
          </div>
        </NftCard>
      )}
    </div>
  );
});

export default ActiveMissionElement;
