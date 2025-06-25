import React, { useContext, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Import from Dynamic
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

import { useUser } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';
import { LayerContext } from '../../contexts/LayerContext';
import { config } from '../../config';
import noPfp from '../../public/images/no_pfp.webp';
import { WalletSwitcherModal } from './WalletSwitcherModal';

import { formatNumberWithSuffix } from '../../utils/helpers';

// Icons
import SkullIcon from '../../assets/skull-icon';
import GemIcon from '../../assets/gem-icon';
import GoldTokenIcon from '../../assets/gold-token-icon';
import TreasureIcon from '../../assets/treasure-icon';
import LegendaryShipTokenIcon from '../../assets/legendary-ship-token-icon';
import BattleTokenIcon from '../../assets/battle-token-icon';
import InventoryChestIcon from '../../assets/inventory-chest-icon';
import LeaderboardIcon from '../../assets/leaderboard-icon';
import NftManagementIcon from '../../assets/nft-management-icon';
import ConnectSocialsIcon from '../../assets/connect-socials-icon';
import WalletIcon from '../../assets/wallet-icon';
import LogoutIcon from '../../assets/logout-icon';
import { Flame, FlameIcon } from 'lucide-react';

function RightTop({ isSelectTeam }: any) {
  const layerContext = useContext(LayerContext);
  if (!layerContext) {
    throw new Error('LayerMap must be used within a LayerProvider');
  }

  const {
    setNftManagementModalOpen,
    setProfileModalOpen,
    toggleTab,
    setHideoutModalOpen,
    setForgeModalOpen,
    walletRef,
    profileRef,
    inventoryRef,
    assetManagerRef,
    isMissionModalOpen,
    isMobile,
    isHideoutModalOpen,
    isEquipItemsModalOpen,
    isNftManagementModalOpen,
    isFleetCommanderModalOpen,
    isMarketModalOpen,
    isEquipModalOpen,
  } = layerContext;

  // from Dynamic
  const { primaryWallet, handleLogOut } = useDynamicContext();

  const user = useUser();
  const auth = useAuth();

  const node = useRef<HTMLDivElement>(null);
  const menuDropdownNode = useRef<HTMLButtonElement>(null);

  const [isMenuDropdownOpen, setMenuDropdownOpen] = useState(false);
  const [isWalletSwitcherOpen, setWalletSwitcherOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuDropdownNode.current && isMenuDropdownOpen) {
        const buttonRect = menuDropdownNode.current.getBoundingClientRect();
        const { clientX, clientY } = event;
        if (
          clientX < buttonRect.left ||
          clientX > buttonRect.right ||
          clientY < buttonRect.top ||
          clientY > buttonRect.bottom
        ) {
          setMenuDropdownOpen((prev) => !prev);
        }
      }
    };

    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [menuDropdownNode, isMenuDropdownOpen]);

  const openProfileModal = () => {
    setProfileModalOpen((prev) => !prev);
  };

  return (
    <>
      {auth.isLoggedIn ? (
        <div
          ref={node}
          className={`fixed right-6 top-4 z-[99] flex h-auto scale-[0.7] flex-row 
                      items-center justify-end gap-2 py-1 text-white 
                      max-md:!-top-0.5 max-md:!right-1 max-md:flex-row-reverse 
                      md:scale-100 ${
                        isMissionModalOpen &&
                        '!right-24 z-[98] max-md:!right-1 max-md:!top-[0.5rem]'
                      } ${
            (isHideoutModalOpen ||
              isNftManagementModalOpen ||
              isMarketModalOpen ||
              isFleetCommanderModalOpen) &&
            '!right-24 !top-0 max-md:!-top-0.5 max-md:!right-1'
          }`}>
          {/* Balances Display */}
          <motion.div
            className={`col-span-1 !m-0 flex cursor-pointer items-center 
                        justify-center rounded-md border border-reavers-border 
                        bg-reavers-bg bg-opacity-80 !p-0 backdrop-blur-md 
                        transition-all duration-300 ease-in-out 
                        hover:border-white hover:border-opacity-40`}>
            <div className="flex h-full flex-col items-start justify-end rounded-md bg-white bg-opacity-[0.05] p-4 py-2">
              <div className="flex w-full flex-col gap-1">
                {/* Show user balances */}
                <div className="flex w-full flex-row items-center justify-between gap-4 md:gap-8">
                  <div className="mt-1 flex flex-row items-center gap-1">
                    <SkullIcon className="h-[18px] w-[18px]" />
                    <p className="text-xs">
                      {formatNumberWithSuffix(user.user?.arAmount)}
                    </p>
                  </div>
                  <div className="mt-1 flex flex-row items-center gap-1">
                    <GemIcon className="h-[18px] w-[18px]" />
                    <p className="text-xs">
                      {formatNumberWithSuffix(user.user?.gemsAmount)}
                    </p>
                  </div>
                  <div className="-pr-4 mt-1 flex flex-row items-center gap-1 md:pr-0">
                    <GoldTokenIcon className="h-[18px] w-[18px]" />
                    <p className="text-xs">
                      {formatNumberWithSuffix(user.user?.goldAmount)}
                    </p>
                  </div>
                  <div className="-pr-4 mt-1 flex flex-row items-center gap-1 md:pr-0">
                    <TreasureIcon className="h-[18px] w-[18px]" />
                    <p className="text-xs">
                      {formatNumberWithSuffix(user.user?.treasureAmount)}
                    </p>
                  </div>
                </div>
                <div className="h-[1px] w-full bg-white bg-opacity-20"></div>
                <div className="flex w-full flex-row items-center justify-center gap-4 md:gap-8">
                  <div className="-pr-4 mt-1 flex flex-row items-center gap-1 md:pr-0">
                    <LegendaryShipTokenIcon className="h-[18px] w-[18px]" />
                    <p className="text-xs">
                      {formatNumberWithSuffix(user.user?.legendaryShipToken, 0)}
                    </p>
                  </div>
                  <div className="-pr-4 mt-1 flex flex-row items-center gap-1 md:pr-0">
                    <BattleTokenIcon className="h-[18px] w-[18px]" />
                    <p className="text-xs">{user.user?.battleTokens || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Button */}
          <motion.button
            onClick={() => setMenuDropdownOpen((prev) => !prev)}
            ref={menuDropdownNode}
            className={`col-span-2 !m-0 flex cursor-pointer items-center justify-center 
                        rounded-md border border-reavers-border bg-reavers-bg bg-opacity-80 !p-0 
                        backdrop-blur-md transition-all duration-300 ease-in-out 
                        hover:border-white hover:border-opacity-40`}>
            <div
              ref={profileRef}
              className={
                'dropdown dropdown-end !m-0 flex items-center justify-center !p-0 ' +
                (isMenuDropdownOpen ? ' dropdown-open mt-2' : '')
              }>
              <motion.label
                tabIndex={0}
                className="h-full w-full cursor-pointer overflow-hidden"
                whileTap={{ scale: 0.98 }}>
                <Image
                  src={
                    user.user?.profilePicture ? user.user.profilePicture : noPfp
                  }
                  key={user.user?.profilePicture}
                  alt="Profile Pic"
                  className={`!m-0 ${
                    isSelectTeam
                      ? 'h-10 w-10'
                      : 'h-[70px] min-h-[70px] w-[70px] min-w-[70px] rounded-md'
                  } rounded-[3px] bg-center object-contain !p-0`}
                  width={240}
                  height={240}
                  unoptimized
                />
              </motion.label>
              {isMenuDropdownOpen && (
                <ul
                  tabIndex={0}
                  className="dropdown-content menu outline relative z-[999] mt-3 
                             !flex min-w-[420px] flex-col items-start justify-start gap-2.5 rounded 
                             border border-reavers-border bg-reavers-bg-secondary !bg-opacity-90 p-3 
                             text-xs shadow outline-2 outline-reavers-outline backdrop-blur-md 
                             max-md:left-0 max-md:w-max">
                  {/* Profile */}
                  <li
                    className="hover:border-opacity-1 flex h-[38px] w-full cursor-pointer 
                               flex-row items-center justify-start rounded bg-[#222a2e] 
                               bg-opacity-[0.5] text-start transition-all duration-150 
                               ease-in-out hover:border-white hover:bg-opacity-100 
                               hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2)_inset]"
                    onClick={() => setProfileModalOpen((prev) => !prev)}>
                    <div className="m-0 ml-1 h-full w-[50px] rounded-[3px] object-contain !p-0 hover:bg-opacity-0">
                      <Image
                        src={
                          user.user?.profilePicture
                            ? user.user.profilePicture
                            : noPfp
                        }
                        key={user.user?.profilePicture}
                        alt="Profile Pic"
                        className="m-0 -mr-[2px] rounded-[3px] border border-reavers-border !p-0"
                        width={30}
                        height={30}
                        unoptimized
                      />
                    </div>
                    Profile
                  </li>

                  {/* Change Wallet - NEW OPTION */}
                  <li
                    className="flex h-[38px] w-full cursor-pointer flex-row flex-nowrap items-center 
                               justify-start rounded bg-[#222a2e] bg-opacity-[0.5] text-start 
                               transition-all duration-150 ease-in-out hover:border-white 
                               hover:border-opacity-40 hover:bg-opacity-100 
                               hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2)_inset]"
                    onClick={() => setWalletSwitcherOpen(true)}>
                    <div className="-ml-[2px] h-full w-[50px] justify-center hover:bg-opacity-0">
                      <WalletIcon className="w-[16px]" />
                    </div>
                    Change Wallet
                  </li>

                  <div className="my-1 h-[1px] w-full bg-white bg-opacity-10 "></div>

                  {/* Inventory */}
                  <li
                    ref={inventoryRef}
                    className="flex h-[38px] w-full cursor-pointer flex-row flex-nowrap items-center 
                               justify-start  rounded bg-[#222a2e] bg-opacity-[0.5] text-start 
                               transition-all duration-300 ease-in-out hover:border-white 
                               hover:border-opacity-40 hover:bg-opacity-100 
                               hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2)_inset]"
                    onClick={() => {
                      toggleTab('inventory');
                      setHideoutModalOpen((prev) => !prev);
                    }}>
                    <div className="h-full w-[50px] justify-center hover:bg-opacity-0">
                      <InventoryChestIcon className="w-[16px]" />
                    </div>
                    Inventory
                  </li>

                  <li
                    className="flex h-[38px] w-full cursor-pointer flex-row flex-nowrap items-center 
                               justify-start gap-1 rounded bg-[#222a2e] bg-opacity-[0.5] text-start 
                               transition-all duration-150 ease-in-out hover:border-white 
                               hover:border-opacity-40 hover:bg-opacity-100 
                               hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2)_inset]"
                    onClick={() => {
                      setForgeModalOpen(true);
                      setMenuDropdownOpen(false);
                    }}
                    ref={assetManagerRef}>
                    <div className="-ml-[2px] h-full w-[50px] justify-center hover:bg-opacity-0">
                      <FlameIcon className="w-[16px]" />
                    </div>
                    The Graveyard
                  </li>

                  {/* NFT Management */}
                  <li
                    className="flex h-[38px] w-full cursor-pointer flex-row flex-nowrap items-center 
                               justify-start gap-1 rounded bg-[#222a2e] bg-opacity-[0.5] text-start 
                               transition-all duration-150 ease-in-out hover:border-white 
                               hover:border-opacity-40 hover:bg-opacity-100 
                               hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2)_inset]"
                    onClick={() => setNftManagementModalOpen((prev) => !prev)}
                    ref={assetManagerRef}>
                    <div className="-ml-[2px] h-full w-[50px] justify-center hover:bg-opacity-0">
                      <NftManagementIcon className="w-[16px]" />
                    </div>
                    Asset Manager
                  </li>
                  <div className="my-1 h-[1px] w-full bg-white bg-opacity-10 "></div>
                  {/* Connect Socials */}
                  <li
                    className="flex h-[38px] w-full cursor-pointer flex-row flex-nowrap items-center 
                               justify-start gap-1 rounded bg-[#222a2e] bg-opacity-[0.5] text-start 
                               transition-all duration-150 ease-in-out hover:border-white 
                               hover:border-opacity-40 hover:bg-opacity-100 
                               hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2)_inset]"
                    onClick={() => setProfileModalOpen((prev) => !prev)}>
                    <div className="-ml-[2px] h-full w-[50px] justify-center hover:bg-opacity-0">
                      <ConnectSocialsIcon className="w-[16px]" />
                    </div>
                    Connect Socials
                  </li>
                  <div className="my-1 h-[1px] w-full bg-white bg-opacity-10"></div>

                  {/* Logout */}
                  <li
                    className="flex h-[38px] w-full min-w-[200px] cursor-pointer 
                               flex-row flex-nowrap items-center justify-start gap-1 rounded 
                               bg-[#222a2e] bg-opacity-[0.5] text-start transition-all 
                               duration-150 ease-in-out hover:border-white hover:border-opacity-40 
                               hover:bg-opacity-100 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2)_inset]"
                    onClick={async () => {
                      try {
                        await handleLogOut();
                      } catch (err) {
                        console.error('Error on logout:', err);
                      }
                    }}>
                    <div className="-ml-[2px] h-full w-[50px] justify-center hover:bg-opacity-0">
                      <LogoutIcon className="w-[16px]" />
                    </div>
                    Log Out
                  </li>
                </ul>
              )}
            </div>
          </motion.button>
        </div>
      ) : (
        <div className="absolute right-4 top-4 z-20 text-white">
          <motion.div
            className="from-rebeccapurple to-blue-violet flex h-10 w-10 rounded-full bg-gradient-to-r p-1 text-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 1 }}>
            Connect Wallet
          </motion.div>
        </div>
      )}

      {/* Wallet Switcher Modal */}
      {isWalletSwitcherOpen && (
        <WalletSwitcherModal onClose={() => setWalletSwitcherOpen(false)} />
      )}
    </>
  );
}

export default RightTop;
