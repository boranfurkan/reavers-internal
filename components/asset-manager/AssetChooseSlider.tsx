import React from 'react';
import { Slider, Spin } from 'antd';
import { AssetCardProps, AssetLocation } from './AssetCard';
import {
  GameTabValue,
  MintStatusValue,
  SecondaryTabValue,
} from './AssetManagementFilterOptions';
import { NFTType } from '../../types/BaseEntity';

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
  selectedAssets,
  assetType,
}: AssetChooseSliderProps) => {
  // Check if any selected assets would be restricted from unstaking
  const hasRestrictedAssets =
    gameTab === AssetLocation.IN_GAME &&
    selectedAssets.some(
      (asset) =>
        asset.type === NFTType.CREW ||
        asset.type === NFTType.SHIP ||
        asset.type === NFTType.ITEM,
    );

  // Check if ALL selected assets are restricted from unstaking
  const allAssetsRestricted =
    gameTab === AssetLocation.IN_GAME &&
    selectedAssets.length > 0 &&
    selectedAssets.every(
      (asset) =>
        asset.type === NFTType.CREW ||
        asset.type === NFTType.SHIP ||
        asset.type === NFTType.ITEM,
    );

  // Determine button text and state
  const getActionButtonProps = () => {
    if (gameTab === AssetLocation.IN_GAME) {
      if (allAssetsRestricted) {
        return {
          text: 'Unstake Disabled',
          disabled: true,
          className: 'bg-gray-600 text-gray-400 cursor-not-allowed',
        };
      } else if (hasRestrictedAssets) {
        return {
          text: 'Send to Wallet (Mixed)',
          disabled: false,
          className: 'bg-orange-600 hover:bg-orange-700',
        };
      } else {
        return {
          text: 'Send to Wallet',
          disabled: false,
          className: 'bg-white text-black hover:bg-gray-200',
        };
      }
    } else {
      return {
        text: 'Deposit',
        disabled: false,
        className: 'bg-white text-black hover:bg-gray-200',
      };
    }
  };

  const actionButtonProps = getActionButtonProps();

  return (
    <div className="fixed bottom-0 left-1/2 z-[99] w-full max-w-3xl -translate-x-1/2 rounded-md border border-white border-opacity-[0.10] bg-black !bg-opacity-80 p-4 py-2 text-white !backdrop-blur-xl md:bottom-8">
      <div className="flex w-full flex-col items-center justify-between gap-4 py-2 md:flex-row">
        {/* Selection Count and Slider */}
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
              onChange={(value) => {
                if (value !== sliderValue) {
                  setSliderValue(value);
                }
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex h-full flex-row items-center justify-end gap-4 md:mt-0">
          {/* Select All / Deselect All Button */}
          <button
            onClick={() => {
              if (sliderValue === maxSliderValue) {
                deselectAll();
              } else {
                selectAll();
              }
            }}
            disabled={loading}
            className="h-[36px] whitespace-nowrap rounded-md border border-white border-opacity-[0.05] p-4 py-2 text-xs uppercase text-white hover:bg-white/10 disabled:opacity-50">
            {sliderValue === maxSliderValue ? 'Deselect All' : 'Select All'}
          </button>

          {/* Main Action Button */}
          <button
            onClick={onAction}
            className={`flex h-[36px] flex-row items-center justify-center gap-2 whitespace-nowrap rounded-md p-4 py-2 text-xs uppercase transition-colors disabled:opacity-50 ${actionButtonProps.className}`}
            disabled={
              sliderValue === 0 || loading || actionButtonProps.disabled
            }>
            {loading && <Spin size="small" />}
            {actionButtonProps.text}
          </button>
        </div>
      </div>

      {/* Warning message for mixed selections */}
      {hasRestrictedAssets &&
        !allAssetsRestricted &&
        gameTab === AssetLocation.IN_GAME && (
          <div className="mt-2 rounded-md border border-orange-500/30 bg-orange-500/20 p-2">
            <p className="text-xs text-orange-300">
              ⚠️ Some assets in your selection cannot be unstaked (Crews, Ships,
              Items). Only eligible assets will be processed.
            </p>
          </div>
        )}

      {/* Error message for all restricted selections */}
      {allAssetsRestricted && gameTab === AssetLocation.IN_GAME && (
        <div className="mt-2 rounded-md border border-red-500/30 bg-red-500/20 p-2">
          <p className="text-xs text-red-300">
            🚫 All selected assets are Crews, Ships, or Items which cannot be
            unstaked. Only Captains and Genesis Ships can be unstaked.
          </p>
        </div>
      )}
    </div>
  );
};

export default AssetChooseSlider;
