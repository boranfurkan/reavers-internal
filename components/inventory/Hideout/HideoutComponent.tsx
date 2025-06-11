'use client';
import React from 'react';
import { Dropdown, DropdownHeader, DropdownContent } from '../../Dropdown';
import Image from 'next/image';
import CustomProgressBar from '../../ui/CustomProgressBar';
import { useUser } from '../../../contexts/UserContext';
import { shortenBigNumber } from '../../../utils/helpers';
import { Spin } from 'antd';

const HideoutComponent: React.FC = () => {
  const { hideoutStats, hideoutStatsLoading, hideoutStatsError } = useUser();

  if (hideoutStatsLoading) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-4">
        <Spin />
        <span className="fade">Loading Hideout Stats..</span>
      </div>
    );
  }
  if (hideoutStatsError) {
    return <div>Error...</div>;
  }

  const formattedPrice = (price: number) => {
    let options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: 'USD',
    };
    if (price < 0.01) {
      options.minimumFractionDigits = 4;
      options.maximumFractionDigits = 4;
    }
    let formattedPrice = new Intl.NumberFormat('en-US', options).format(price);
    return formattedPrice;
  };

  return (
    <div className="relative flex h-full w-full flex-col px-4 pt-4 md:px-12">
      <h4 className="text-left font-Header text-3xl font-bold uppercase">
        Treasury -- <span className="text-yellow-500">Treasure Chest</span>
      </h4>

      <div className="flex flex-1 flex-col gap-4 overflow-hidden">
        <div className="flex flex-col gap-2">
          <h5 className="text-lg">Account Balance</h5>
          <span className="text-4xl text-success-mission">
            ${hideoutStats?.totalWorth.toFixed(2)}
          </span>
        </div>

        <div className="mt-4 grid w-full grid-cols-4 pl-4 pr-10">
          <h3 className="text-left text-lg">TICKER</h3>
          <h3 className="text-lg">BALANCE</h3>
          <h3 className="text-lg">VALUE</h3>
          <h3 className="text-lg">WEIGHT</h3>
        </div>

        <div className="mb-16 w-full flex-1 overflow-y-auto">
          {hideoutStats?.coins.map((item, index) => (
            <Dropdown key={item.symbol} isDefaultOpen={index === 0}>
              <DropdownHeader>
                <div className="grid w-full grid-cols-4">
                  <div className="flex items-center justify-start gap-2">
                    <Image
                      src={item.logoURL}
                      alt={`${item.symbol} logo`}
                      width={24}
                      height={24}
                      unoptimized={true}
                    />
                    <span>{item.symbol}</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span>
                      {shortenBigNumber(item.amount)} {item.symbol}
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span>${shortenBigNumber(item.worthUSD)}</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <CustomProgressBar
                      progress={item.weightPercentage}
                      className="!w-1/3"
                      showText
                      borderless
                    />
                  </div>
                </div>
              </DropdownHeader>
              <DropdownContent>
                <div className="flex flex-col gap-2 border-t border-[rgba(255,255,255,0.3)] p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Name:</span>
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Current Price:</span>
                    <span>{formattedPrice(item.currentPrice)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Amount Held:</span>
                    <span>
                      {item.amount.toFixed(2)} {item.symbol}
                    </span>
                  </div>
                </div>
              </DropdownContent>
            </Dropdown>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HideoutComponent;
