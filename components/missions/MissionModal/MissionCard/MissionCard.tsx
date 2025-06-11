import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import styled from 'styled-components';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CharacterNFT, CrewNFT, ShipNFT } from '../../../../types/NFT';
import {
  adjustColor,
  decideEntitiyToBeUpgraded,
  getItemsDataFromNFT,
  getLevelRarity,
  getRarityColorWithOpacity,
} from '../../../../utils/helpers';
import XMarkIcon from '../../../../assets/x-mark-icon';
import RarityBadge from '../../../inventory/RarityBadge';
import GoldBarDisplay from '../../GoldBarDisplay';
import StrengthDisplay from '../../StrengthDisplay';
import PlundersBackSide from './PlundersBackSide';
import EventsBackSide from './EventsBackSide';
import BurnersBackSide from './BurnersBackSide';
import { useNfts } from '../../../../contexts/NftContext';
import { Item } from '../../../../lib/types';
import { NFTMaxLevels, NFTType } from '../../../../types/BaseEntity';
import Loading from '../../../Loading';

interface MissionCardProps {
  id: string;
  captain: CharacterNFT;
  missionType:
    | 'Plunders'
    | 'Events'
    | 'Burners'
    | 'Specials'
    | 'Genesis'
    | undefined;
  selectedCharacters: { captain: CharacterNFT; levelUpCount: number }[];
  currentMission: string;
  isSelected: boolean;
  handleClick: (reaver: CharacterNFT) => void;
  handleLevelUpCountChange: (uid: string, levelUpCount: number) => void;
  unSelect: (reaver: CharacterNFT) => void;
  payMethod?: string;
  currentGoldPrice: number;
}

const MissionCard: React.FC<MissionCardProps> = React.memo(
  ({
    id,
    captain,
    missionType,
    currentMission,
    selectedCharacters,
    isSelected,
    handleClick,
    handleLevelUpCountChange,
    unSelect,
    payMethod,
    currentGoldPrice,
  }) => {
    const [flipped, setFlipped] = useState(isSelected);
    const nfts = useNfts();

    const [itemSlot1, itemSlot2] = useMemo(
      () => getItemsDataFromNFT(captain),
      [captain],
    );
    const crewNft = useMemo(
      () =>
        nfts.crewsInGame.find(
          (nft) => nft.uid === captain.equippedCrew,
        ) as CrewNFT,
      [nfts.crewsInGame, captain],
    );
    const shipNft = useMemo(
      () =>
        nfts.shipsInGame.find(
          (nft) => nft.uid === captain.equippedShip,
        ) as ShipNFT,
      [nfts.shipsInGame, captain],
    );

    const entityToBeUpgraded = useMemo(() => {
      const selectedCaptain = selectedCharacters.find(
        (char) => char.captain.uid === captain.uid,
      );
      const selectedCaptainLevelUpCount = selectedCaptain?.levelUpCount || 1;
      const selectedCaptainUid = selectedCaptain?.captain.uid!;

      const entityType = decideEntitiyToBeUpgraded(currentMission);

      if (entityType === 'Ship' && shipNft) {
        // Ship type check
        const maxLevel =
          shipNft.rarity === 'COMMON'
            ? NFTMaxLevels.COMMON_SHIP
            : NFTMaxLevels.MYTHIC_SHIP;

        return {
          uid: selectedCaptainUid,
          level: shipNft.level || 1,
          levelUpCount: selectedCaptainLevelUpCount,
          maxLevel: maxLevel,
          metadata: shipNft.metadata!,
          type: NFTType.SHIP,
        };
      } else if (entityType === 'Crew' && crewNft) {
        return {
          uid: selectedCaptainUid,
          level: crewNft.level || 1,
          levelUpCount: selectedCaptainLevelUpCount,
          maxLevel: NFTMaxLevels.CREW,
          metadata: crewNft.metadata!,
          type: NFTType.CREW,
        };
      } else if (entityType === 'Character') {
        // Character type check
        const maxLevel =
          captain.type === NFTType.FM
            ? NFTMaxLevels.FM
            : captain.type === NFTType.QM
            ? NFTMaxLevels.QM
            : NFTMaxLevels.UNIQUE;

        return {
          uid: selectedCaptainUid,
          level: captain.level || 1,
          levelUpCount: selectedCaptainLevelUpCount,
          maxLevel: maxLevel,
          metadata: captain.metadata!,
          type: captain.type!,
        };
      } else {
        // Item type logic
        if (itemSlot1 && itemSlot2) {
          const lowerLevelItem =
            itemSlot1.level > itemSlot2.level ? itemSlot2 : itemSlot1;
          return {
            uid: selectedCaptainUid,
            level: lowerLevelItem.level,
            levelUpCount: selectedCaptainLevelUpCount,
            maxLevel: NFTMaxLevels.ITEM,
            metadata: lowerLevelItem.metadata!,
            type: NFTType.ITEM,
          };
        } else if (itemSlot1) {
          return {
            uid: selectedCaptainUid,
            level: itemSlot1.level,
            levelUpCount: selectedCaptainLevelUpCount,
            maxLevel: NFTMaxLevels.ITEM,
            metadata: itemSlot1.metadata!,
            type: NFTType.ITEM,
          };
        } else if (itemSlot2) {
          return {
            uid: selectedCaptainUid,
            level: itemSlot2.level,
            levelUpCount: selectedCaptainLevelUpCount,
            maxLevel: NFTMaxLevels.ITEM,
            metadata: itemSlot2.metadata!,
            type: NFTType.ITEM,
          };
        }
      }
    }, [
      currentMission,
      captain,
      shipNft,
      crewNft,
      itemSlot1,
      itemSlot2,
      selectedCharacters,
    ]);

    useEffect(() => {
      setFlipped(isSelected);
    }, [isSelected]);

    const handleCardClick = useCallback(() => {
      if (!isSelected) handleClick(captain);
    }, [isSelected, handleClick, captain]);

    const handleDeselectClick = useCallback(
      (event: React.MouseEvent) => {
        event.stopPropagation();
        unSelect(captain);
        setFlipped(false);
      },
      [unSelect, captain],
    );

    const renderEntity = useCallback(
      (
        entity: CrewNFT | ShipNFT | Item | undefined,
        type: NFTType.CREW | NFTType.SHIP | NFTType.ITEM,
        placeholder: string,
        altText: string,
      ) =>
        entity ? (
          <StyledEntityCard
            rarity={getLevelRarity(type, entity.level || 1)}
            className="flex h-full w-full items-center justify-center">
            <RarityBadge
              bgColor={getRarityColorWithOpacity(
                getLevelRarity(type, entity.level || 1),
                80,
              )}
              rarityText={getLevelRarity(type, entity.level || 1)}
              secondayText={`(${entity.level})`}
              size="extraSmall"
              className="absolute left-1 top-1 z-10"
            />
            {type === NFTType.SHIP || type === NFTType.CREW ? (
              <Image
                src={entity.metadata?.image || placeholder}
                alt={entity.metadata?.name || altText}
                className="w-full rounded-[6px]"
                objectFit="cover"
                quality={100}
                fill
                unoptimized={true}
              />
            ) : (
              <Image
                src={entity.metadata?.image || placeholder}
                alt={entity.metadata?.name || altText}
                className="mt-1 h-max rounded-[6px]"
                width={60}
                height={60}
                unoptimized
              />
            )}
          </StyledEntityCard>
        ) : (
          <NotSelectedDiv className="col-span-1">
            <div className="flex h-full w-full items-center justify-center text-xs">
              {`No ${altText} Selected`}
            </div>
          </NotSelectedDiv>
        ),
      [],
    );

    const FrontSide = useMemo(
      () => (
        <CardFace className="front flex flex-col gap-2">
          <div className="flex w-full items-start justify-start gap-3">
            <div className="relative min-h-[162px] min-w-[150px]">
              <Image
                priority
                unoptimized
                src={captain.metadata?.image || '/images/reavers.webp'}
                alt="reaver"
                width={150}
                height={150}
                className="h-[162px] rounded-md object-cover"
                style={{ pointerEvents: 'none' }}
              />
              <div className="absolute left-0 top-0 rounded-tl-md bg-[#000000bb] p-2">
                {captain.level ? `Level ${captain.level}` : ''}
              </div>
            </div>
            <div className="grid w-full grid-cols-2 gap-3">
              {renderEntity(
                itemSlot1,
                NFTType.ITEM,
                '/images/weapon-axe.webp',
                'Item',
              )}
              {renderEntity(
                itemSlot2,
                NFTType.ITEM,
                '/images/weapon-axe.webp',
                'Item',
              )}
              {renderEntity(
                shipNft,
                NFTType.SHIP,
                '/images/reavers.webp',
                'Ship',
              )}
              {renderEntity(
                crewNft,
                NFTType.CREW,
                '/images/mission-modal/crew-nft.webp',
                'Crew',
              )}
            </div>
          </div>
          <div className="flex w-full flex-col gap-2">
            <div className="flex w-full flex-row items-start justify-between gap-2 text-start">
              <GoldBarDisplay goldBurned={captain.goldBurned} />
              <div className="flex flex-row items-center justify-start gap-4 text-start">
                <span className="opacity-50">STRENGTH</span>
                <StrengthDisplay
                  character={captain}
                  size="small"
                  strength={captain.strength || 0}
                />
              </div>
            </div>
          </div>
        </CardFace>
      ),
      [captain, renderEntity, itemSlot1, itemSlot2, shipNft, crewNft],
    );

    const BackSide = useMemo(() => {
      switch (missionType) {
        case 'Plunders':
          return <PlundersBackSide />;
        case 'Events':
          return (
            <CardFace className="back">
              {entityToBeUpgraded ? (
                <EventsBackSide
                  missionName={currentMission}
                  currentGoldPrice={currentGoldPrice}
                  entityToBeUpgraded={entityToBeUpgraded}
                  handleLevelUpCountChange={handleLevelUpCountChange}
                />
              ) : (
                <div className="flex flex-col gap-2">
                  <p>Loading...</p>
                  <Loading />
                </div>
              )}
            </CardFace>
          );
        case 'Burners':
          return (
            <BurnersBackSide
              missionName={currentMission}
              entityToBeUpgraded={entityToBeUpgraded}
              handleLevelUpCountChange={handleLevelUpCountChange}
            />
          );
        default:
          return <PlundersBackSide />;
      }
    }, [
      missionType,
      entityToBeUpgraded,
      handleLevelUpCountChange,
      currentGoldPrice,
      currentMission,
    ]);

    return (
      <NftCard
        onClick={handleCardClick}
        selected={isSelected}
        selectable={true}
        className="relative z-20 flex flex-col items-center justify-start gap-2 rounded-md text-[10px] max-md:scale-[0.85]">
        <CardInner flipped={flipped}>
          {FrontSide}
          {BackSide}
        </CardInner>
        <AnimatePresence>
          {flipped && (
            <CloseButton
              as={motion.button}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3 }}
              onClick={handleDeselectClick}>
              <XMarkIcon className="h-4 w-4 fill-current text-white" />
            </CloseButton>
          )}
        </AnimatePresence>
      </NftCard>
    );
  },
);

MissionCard.displayName = 'MissionCard';
export default MissionCard;

const NftCard = styled(motion.div)<{ selected: boolean; selectable: boolean }>`
  width: 400px;
  height: 210px;
  padding: 10px;
  border-radius: 8px;
  background-color: ${({ selected }) =>
    selected ? 'rgba(74, 35, 154, 0.2)' : 'rgba(216, 216, 216, 0.1)'};
  border: ${({ selected }) =>
    selected ? '1px solid #9b6afd' : '1px solid rgba(255, 255, 255, 0.3)'};
  cursor: ${({ selectable }) => (selectable ? 'pointer' : 'not-allowed')};
  transition: background-color 0.3s ease, border-color 0.3s ease;
  &:hover {
    border: ${({ selected }) =>
      selected ? '1px solid #C3A5FD' : '1px solid #ffffff80'};
  }
  perspective: 1000px;
`;

const CardInner = styled.div<{ flipped: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.7s;
  transform: ${({ flipped }) =>
    flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'};
`;

export const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  &.back {
    transform: rotateY(180deg);
  }
`;

const CloseButton = styled(motion.button)`
  position: absolute;
  top: -12px;
  right: -12px;
  background: #9b6afd;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 9999;
`;

export const StyledEntityCard = styled.div<{
  rarity: string;
  isCaptain?: boolean;
}>`
  position: relative;
  display: flex;
  justify-content: center;
  width: 100%;
  height: 75px;
  cursor: pointer;
  border-radius: 6px;
  border: ${({ rarity, isCaptain }) =>
    isCaptain
      ? `1px solid ${adjustColor('#9b6afd', 40)}`
      : `1px solid ${getRarityColorWithOpacity(rarity || 'COMMON', 40)}`};
  background-color: ${({ rarity, isCaptain }) =>
    isCaptain
      ? adjustColor('#9b6afd', 20)
      : getRarityColorWithOpacity(rarity || 'COMMON', 20)};
`;

const NotSelectedDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 75px;
  width: 100%;
  border-radius: 6px;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  background-color: rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease-in-out;
`;
