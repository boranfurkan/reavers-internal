import React from 'react';
import { Slider, Spin } from 'antd';
import { AssetCardProps, AssetLocation } from './AssetCard';
import {
  GameTabValue,
  MintStatusValue,
  SecondaryTabValue,
} from './AssetManagementFilterOptions';

interface AssetChooseSliderProps {
  gameTab: AssetLocation;
  maxSliderValue: number;
  sliderValue: number;
  setSliderValue: React.Dispatch<React.SetStateAction<number>>;
  selectAll: () => void;
  onAction: () => void;
  loading: boolean;
  deselectAll: () => void;
  selectedAssets: AssetCardProps[];
  assetType: SecondaryTabValue;
  currentLocation: GameTabValue;
  currentMintStatus: MintStatusValue;
}

const AssetChooseSlider = ({
  gameTab,
  maxSliderValue,
  sliderValue,
  setSliderValue,
  selectAll,
  deselectAll,
  loading,
  onAction,
}: AssetChooseSliderProps) => {
  return (
    <div className="fixed bottom-0 left-1/2 z-[99] w-full max-w-3xl -translate-x-1/2 rounded-md border border-white border-opacity-[0.10] bg-black !bg-opacity-80 p-4 py-2 text-white !backdrop-blur-xl md:bottom-8">
      <div className="flex w-full flex-col items-center justify-between gap-4 py-2 md:flex-row">
        <div className="flex h-[36px] w-full flex-row items-center justify-center gap-2 rounded-md border border-white border-opacity-[0.10]">
          <div className="flex h-[36px] items-center border-r border-r-white border-opacity-[0.10] px-4 pt-0.5 text-sm">
            {sliderValue}
          </div>
          <div className="flex-grow p-1 pl-3 pr-9">
            <Slider
              value={sliderValue}
              max={maxSliderValue}
              className="nft-management-slider w-full text-white"
              trackStyle={{ backgroundColor: '#fff' }}
              handleStyle={{ backgroundColor: '#fff' }}
              railStyle={{ backgroundColor: '#ffffff1a', height: '3px' }}
              /**
               * Only call setSliderValue if the new value is different.
               * This helps avoid an onChange→setState→re-render→onChange loop.
               */
              onChange={(value) => {
                if (value !== sliderValue) {
                  setSliderValue(value);
                }
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex h-full flex-row items-center justify-end gap-4 md:mt-0">
          <button
            onClick={() => {
              if (sliderValue === maxSliderValue) {
                deselectAll();
              } else {
                selectAll();
              }
            }}
            disabled={loading}
            className="h-[36px] whitespace-nowrap rounded-md border border-white border-opacity-[0.05] p-4 py-2 text-xs uppercase text-white">
            {sliderValue === maxSliderValue ? 'Deselect All' : 'Select All'}
          </button>
          <button
            onClick={onAction}
            className="flex h-[36px] flex-row items-center justify-center gap-2 whitespace-nowrap rounded-md bg-white p-4 py-2 text-xs uppercase text-black disabled:bg-gray-800"
            disabled={sliderValue === 0 || loading}>
            {loading && <Spin size="small" />}
            {gameTab === 'in-game' ? 'Send to Wallet' : 'Deposit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetChooseSlider;
