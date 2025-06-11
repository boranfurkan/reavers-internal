import React, { useContext, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useNfts } from '../../contexts/NftContext';
import styled from 'styled-components';
import {
  decideEntitiyToBeUpgraded,
  getBuildingStyle,
} from '../../utils/helpers';
import { LayerContext } from '../../contexts/LayerContext';

const StyledImage = styled(Image)<{ src: any; alt: any }>``;
let isDragging = false;
let isMouseDown = false;
let istouchStarted = false;
let isDraggingTouch = false;

interface BuildingProps {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  image: string;
  scale: number;
  gemYield: string;
  type: string;
  display: boolean;
  onClick: (building: { id: number; name: string }) => void;
}

const Building: React.FC<BuildingProps> = ({
  id,
  name,
  x,
  y,
  width,
  height,
  type,
  image,
  gemYield,
  scale,
  display,
  onClick,
}) => {
  const layerContext = useContext(LayerContext);

  if (!layerContext) {
    throw new Error('LayerSelect must be used within a LayerProvider');
  }

  const { currentLevel } = layerContext;

  const [isHovered, setIsHovered] = useState(false);

  const { nftsOnMission } = useNfts();
  const isEmeraldYield = type == 'Plunders' && gemYield == 'Gems';

  // Filter out nfts on the current mission
  const nftsOnCurrentMission = useMemo(() => {
    return nftsOnMission.filter(
      (nft) => nft.currentMissionLoaded?.missionName === name,
    );
  }, [nftsOnMission, name]);

  // handle mouse events
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleMouseDown = () => {
    isDragging = false;
    setTimeout(() => {
      isMouseDown = true;
    }, 100);
  };

  const handleMouseMove = () => {
    if (isMouseDown) {
      isDragging = true;
    }
  };

  const handleMouseUp = () => {
    if (isMouseDown) {
      isMouseDown = false;
      setTimeout(() => {
        isDragging = false;
      }, 100);
    }
  };

  const handleTouchStart = (e: any) => {
    isDraggingTouch = false;
    istouchStarted = true;
  };

  const handleTouchMove = (e: any) => {
    if (istouchStarted) {
      setTimeout(() => {
        isDraggingTouch = true;
      }, 100);
    }
  };

  const handleTouchEnd = (e: any) => {
    e.preventDefault();
    if (istouchStarted) {
      istouchStarted = false;
      if (isDraggingTouch) {
        isDraggingTouch = false;
      } else {
        isDraggingTouch = false;
        onClick({ id, name });
      }
    }
  };

  // delay the animation of the building name
  useEffect(() => {
    const elements = document.querySelectorAll('.building-name');
    elements.forEach((element: Element) => {
      const duration = Math.random() * 2.5;
      (element as HTMLElement).style.animationDelay = `${duration}s`;
    });
  }, []);

  // Array of names that should not be rendered
  const excludedNames = ['Silent Mary', 'Battle of Tortuga', 'Cortez Curse'];

  // Check if the name is in the excludedNames array
  const shouldRender = !excludedNames.includes(name);

  if (!shouldRender) {
    return null; // Don't render the building
  }

  // console.log(currentLevel.missions, "currentLevel.missions");

  const getBuildingIcon = ({
    type,
    name,
    gemYield = false,
  }: {
    type: string;
    name?: string;
    gemYield?: boolean;
  }) => {
    if (name == 'Tortuga Banking' || name == 'The Marketplace') {
      return '/images/coins.webp';
    }

    switch (type) {
      case 'Raids':
        return '/images/raids-icon.svg';
      case 'Events':
        switch (decideEntitiyToBeUpgraded(name as string)) {
          case 'Crew':
            return '/images/icons/crewmate.svg';
          case 'Item':
            return '/images/icons/items.svg';
          case 'Ship':
            return '/images/icons/ship.svg';
          case 'Character':
            return '/images/icons/captain.svg';
          default:
            return '/images/arrr-icon.svg';
        }
      case 'Burners':
        return '/images/gold-bar.svg';
      case 'Plunders':
        return gemYield ? '/images/gems.svg' : '/images/treasure-icon.svg';
      case 'Specials':
        return '/images/arrr-icon.svg';
    }

    return '/images/arrr-icon.svg';
  };

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: y + 'px',
        left: x + 'px',
        width: '100%',
        height: '100%',
        maxWidth: width,
        maxHeight: height,
        boxSizing: 'border-box',
        cursor: 'pointer',
        display: `${display ? 'block' : 'none'}`,
      }}
      onClick={(e) => {
        if (isDragging) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        onClick({ id, name });
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      transition={{ type: 'easeInOut', stiffness: 300 }}
      key={id}
      className="">
      <Image
        src={`${image}`}
        alt="building"
        height={height}
        width={width}
        draggable={false}
        className={`w-[${width}px] h-[${height}px] select-none object-cover object-center opacity-0 transition-opacity duration-200 ease-in hover:opacity-100`}
        unoptimized={true}
      />
      <div
        className={`building-name flex min-w-[200px] flex-row items-center justify-center gap-4 rounded-md border border-opacity-0 ${
          isEmeraldYield
            ? 'emerald !border-2 !border-[#19D362]'
            : 'border-white'
        } bg-reavers-bg bg-opacity-80 p-2 px-4 py-1 text-start backdrop-blur-xl hover:border-opacity-40 hover:bg-gray-900`}
        style={getBuildingStyle(name)}>
        {' '}
        <div
          className={`absolute  -left-0 -top-8 !bg-[rgba(14,16,14,0.70)] ${
            isEmeraldYield && 'emerald rounded-md !border-2 !border-[#19D362]'
          }  rounded-sm p-1 text-black `}>
          <Image
            src={getBuildingIcon({
              type,
              name,
              gemYield: gemYield === 'Gems',
            })}
            alt="Raid Icon"
            width={16}
            height={16}
            className={
              'h-4 w-4 object-cover ' +
              (type === 'Plunders' && gemYield === 'Gems'
                ? ' grayscale-1 '
                : ' ')
            }
            unoptimized={true}
          />
        </div>
        <span className="test-start text-left">
          {name == "Riddick's Hideout" ? "Riddick's Hideout" : name}
        </span>
        <>
          {nftsOnCurrentMission.length < 2 ? (
            <div>
              {nftsOnCurrentMission.slice(0, 1).map((nft, index) => (
                // eslint-disable-next-line react/jsx-key
                <div
                  key={index}
                  className="nfts-on-mission-widget relative z-20 flex min-w-[30px] flex-row items-center justify-center -space-x-2.5 rounded-md border border-[#33984FD] bg-[#045AD8] p-1">
                  <div
                    key={index}
                    className="relative flex h-[24px] w-[24px] rounded-md">
                    <StyledImage
                      src={nft.metadata?.image}
                      alt={nft.metadata?.name}
                      width={400}
                      height={200}
                      className="h-[24px] w-[24px] rounded-md object-cover  "
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {nftsOnCurrentMission.length > 1 ? (
            <div className="nfts-on-mission-widget relative z-20 flex min-w-[65px] flex-row-reverse items-center justify-center -space-x-2.5 rounded-md border border-[#33984FD] bg-[#045AD8] p-1">
              {nftsOnCurrentMission.slice(0, 1).map((nft, index) => (
                <div
                  key={index}
                  className="relative flex h-[24px] w-[24px] rounded-md">
                  <StyledImage
                    src={nft.metadata?.image}
                    alt={nft.metadata?.name}
                    width={400}
                    height={200}
                    className="h-[24px] w-[24px] rounded-md object-cover  "
                  />
                </div>
              ))}
              <div className="relative pl-4">
                <span className="text-white">
                  {nftsOnCurrentMission.length}
                </span>
              </div>
            </div>
          ) : null}
        </>
      </div>
    </motion.div>
  );
};

export default Building;
