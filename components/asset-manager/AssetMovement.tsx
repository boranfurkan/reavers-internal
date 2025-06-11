import React, { useContext, useEffect, useState } from 'react'; // Import useEffect
import { LayerContext } from '../../contexts/LayerContext';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import Image from 'next/image';
import { Progress } from 'antd';
import { AssetCardProps } from './AssetCard';

const StyledImage = styled(Image)`
  border-radius: 12px !important;
`;

const ClickWrap = styled.div`
  border-radius: 4px;
  &&:hover {
    background-color: #fff;
    svg {
      color: black; /* Change the stroke color to black on hover */
    }
  }
`;

function AssetMovement({
  selectedAssets,
}: {
  selectedAssets: AssetCardProps[];
}) {
  const layerContext = useContext(LayerContext);

  if (!layerContext) {
    throw new Error('LayerSelect must be used within a LayerProvider');
  }

  const { setNftMovementOpen } = layerContext;

  const displayedAssets = selectedAssets.slice(0, 5); // Get the first 5 NFTs
  const remainingCount = selectedAssets.length - 5;

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (progress < 99) {
        setProgress((prevProgress) => prevProgress + 1);
      } else {
        clearInterval(timer);
      }
    }, 200);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex w-full flex-col items-center justify-center overflow-y-scroll bg-black bg-opacity-[0.05] text-white  backdrop-blur-sm"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1, transition: { duration: 0.2 } }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 1 } }}>
      <div className="flex h-fit w-fit min-w-fit flex-col items-start justify-start rounded-lg bg-reavers-bg !bg-opacity-80 p-8 pt-4 text-white !backdrop-blur-md">
        <div className="flex w-full items-start justify-between">
          <div className="w-full text-start">MOVING...</div>
          <ClickWrap
            onClick={() => setNftMovementOpen(false)}
            className="relative z-[70]  cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6 text-white  hover:scale-105 ">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </ClickWrap>
        </div>

        <div className="my-4 flex w-full flex-row items-center justify-center -space-x-12 rounded-md border border-reavers-border bg-reavers-bg">
          {displayedAssets.map((asset) => (
            <StyledImage
              unoptimized
              key={asset.id} // Add a key for each item
              src={asset.imageUrl}
              alt={asset.name}
              width={400}
              height={200}
              className="h-28 w-28 !rounded-md bg-black object-contain p-1.5"
            />
          ))}
          {remainingCount > 0 && (
            <div className="relative !ml-0 flex h-28 w-28 items-center justify-center rounded-md p-2">
              <span className="text-2xl text-white">+{remainingCount}</span>
            </div>
          )}
        </div>

        <div className="flex w-full items-center justify-center !text-white ">
          <Progress percent={progress} size={[370, 20]} />
        </div>
      </div>
    </motion.div>
  );
}

export default AssetMovement;
