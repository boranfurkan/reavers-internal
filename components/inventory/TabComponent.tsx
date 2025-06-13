import { motion } from 'framer-motion';
import Image from 'next/image';
import React, { useContext, useState } from 'react';
import InventoryComponent from './InventoryComponent';
import HideoutComponent from './Hideout/HideoutComponent';
import ExchangeComponent from './exchange/ExchangeComponent';
import { LayerContext } from '../../contexts/LayerContext';
import { Select } from 'antd';
import UpgradeComponent from './upgrade/UpgradeComponent';
import TreasureLeaderboard from './leaderboards/TreasureLeaderboard';
import TheArenaLeaderboard from './leaderboards/Arena/TheArenaLeaderboard';

function CloseButton({ handleClose }: any) {
  return (
    <div
      onClick={handleClose}
      className="cursor-pointer border-l border-l-reavers-border p-6">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-6 w-6 cursor-pointer font-thin text-white transition-all duration-300 ease-in-out hover:scale-125">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </div>
  );
}

function TabComponent({ handleClose }: any) {
  const { Option } = Select;

  const layerContext = useContext(LayerContext);

  if (!layerContext) {
    throw new Error('LayerMap must be used within a LayerProvider');
  }

  const { isMobile } = layerContext;

  const { tabs, activeTab, toggleTab } = layerContext;

  function getTabContent(tabName: any) {
    switch (tabName) {
      case 'treasure chest':
        return <HideoutComponent />;
      case 'inventory':
        return <InventoryComponent />;
      case 'leaderboard':
        return <TreasureLeaderboard />;
      case 'the arena':
        return <TheArenaLeaderboard />;
      case 'the exchange':
        return <ExchangeComponent />;
      default:
        return null;
    }
  }

  const variants = {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0, transition: { delay: 0.2 } },
    exit: { opacity: 0, x: -100 },
  };

  const handleDropdownChange = (selectedValue: any) => {
    const selectedTab = tabs.find((tab) => tab.name === selectedValue);
    if (selectedTab && !selectedTab.disabled) {
      toggleTab(selectedValue);
    }
  };

  return (
    <div className="w-full">
      {isMobile ? (
        <>
          <div className="flex h-[80px] w-full flex-row flex-nowrap items-center justify-between gap-2 overflow-x-scroll border-b border-b-reavers-border ">
            <div className="w-full"></div>
            <CloseButton handleClose={handleClose} />
          </div>
          <div className="flex w-full items-center justify-center border-b border-b-reavers-border">
            <Select
              className="h-14 w-full !bg-transparent "
              onChange={handleDropdownChange}
              value={activeTab.name}>
              {tabs.map((tab, index) => (
                <Option key={index} value={tab.name} disabled={tab.disabled}>
                  <div className="flex w-full items-center gap-2 bg-white bg-opacity-[0.03] p-0.5">
                    <Image
                      src={tab.image}
                      alt={tab.name}
                      width="64"
                      height="64"
                      className="h-10 w-10"
                      unoptimized={true}
                    />
                    <span
                      className={`!font-Header text-[22px] uppercase ${
                        activeTab.name !== tab.name && 'text-white/50'
                      }`}>
                      {tab.name}
                    </span>
                  </div>
                </Option>
              ))}
            </Select>
          </div>
        </>
      ) : (
        <>
          <div className="flex h-[80px] w-full flex-row flex-nowrap items-center justify-between gap-2 overflow-x-scroll border-b border-b-reavers-border ">
            <div></div>
            <CloseButton handleClose={handleClose} />
          </div>
          <div className="flex w-full flex-row items-center justify-between gap-2 overflow-x-scroll">
            {tabs
              .filter((item) => !item.hideInModal)
              .map((tab, index) => (
                <div
                  key={index}
                  onClick={() => !tab.disabled && toggleTab(tab.name)}
                  className={`flex h-full w-full min-w-[240px] flex-grow cursor-pointer flex-row flex-nowrap items-center justify-center gap-6 rounded-md bg-white !p-4 font-Body !font-semibold ${
                    activeTab.name === tab.name
                      ? 'active-tab-class bg-opacity-10 '
                      : 'inactive-tab-class  bg-opacity-[0.05]  hover:bg-opacity-10'
                  } ${tab.disabled ? 'cursor-not-allowed opacity-50 ' : ''}`}>
                  <Image
                    src={tab.image}
                    alt={tab.name}
                    width="64"
                    height="64"
                    className="h-10 w-10"
                    unoptimized={true}
                  />
                  <span className="text-[16px] font-thin uppercase">
                    {' '}
                    {tab.name}
                  </span>
                </div>
              ))}
          </div>
        </>
      )}

      <motion.div
        className="tab-content h-[calc(100vh_-_144px)]"
        initial="hidden"
        animate="visible"
        variants={variants}>
        {getTabContent(activeTab.name)}
      </motion.div>
    </div>
  );
}

export default TabComponent;
