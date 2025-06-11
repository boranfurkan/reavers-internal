// External Packages
import { useContext, useEffect, useRef } from 'react';
import type { NextPage } from 'next';
import Pusher from 'pusher-js';
// Internal Modules
import { LayerContext } from '../contexts/LayerContext';

// UI Components
import BottomCenter from '../components/HUD/BottomCenter';
import ChatFeed from '../components/HUD/ChatFeed';
import LayerMap from '../components/HUD/LayerMap';
import LeftTop from '../components/HUD/LeftTop';
import RightTop from '../components/HUD/RightTop';
import HideoutModal from '../components/inventory/HideoutModal';
import ProfileModal from '../components/profile/ProfileModal';
import RightBottom from '../components/HUD/IslandSelector';
import AssetManagementModal from '../components/asset-manager/AssetManagementModal';
import LoginModal from '../components/HUD/LoginModal';
import { useNfts } from '../contexts/NftContext';
import Loading from '../components/Loading';
import ReaversLoader from '../components/ReaversLoader';
import MissionModal from '../components/missions/MissionModal/MissionModal';
import { useAuth } from '../contexts/AuthContext';
import MissionResultModal from '../components/missions/MissionResultModal/MissionResultModal';
import ScrollMissionModal from '../components/missions/ScrollMissionModal';
import MarketplaceModal from '../components/missions/MarketplaceModal/MarketplaceModal';

import LayerAndMissionSelectModal from '../components/HUD/LayerAndMissionSelectModal';
import FleetCommanderDashboardModal from '../components/fleet-commander-dashboard/FleetCommanderModal';
import { useDynamicContextWrapper } from '../hooks/UseDynamicContextWrapper';
import Script from 'next/script';
import IslandSelector from '../components/HUD/IslandSelector';
/* import ArenaLeaderboardModal from '../components/inventory/leaderboards/Arena/TheArenaModal'; */

export const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY ?? '', {
  cluster: 'eu',
  forceTLS: true,
});

const Home: NextPage = () => {
  const layerContext = useContext(LayerContext);

  if (!layerContext) {
    throw new Error('LayerMap must be used within a LayerProvider');
  }

  const {
    isProfileModalOpen,
    isNftManagementModalOpen,
    isMissionResultModalOpen,
    isHideoutModalOpen,
    isScrollMissionModalOpen,
    isMarketModalOpen,
    isLayerAndMissionSelectModalOpen,
  } = layerContext;

  const { activeMissionsLoaded } = useNfts();
  const auth = useAuth();
  const { primaryWallet } = useDynamicContextWrapper();

  const initialized = useRef(false);

  //Wait until window is placed
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
  }, []);

  // Only render slides when assets are loaded
  if (!initialized.current) {
    return <Loading />;
  }

  return (
    <>
      {/* Head */}

      {/* Body */}
      <div className="relative mx-auto h-screen max-w-[3840px]">
        {/* radial overlay */}
        <div
          style={{
            userSelect: 'none',
          }}
          className="overlay-screen pointer-events-none absolute inset-0 z-[1] h-full w-full opacity-[0.75] mix-blend-overlay "></div>

        {/* loader for session */}
        {(!activeMissionsLoaded || auth.loading) && <ReaversLoader />}

        {/* Login Modal if no session */}
        {auth.isLoggedIn ? <></> : <LoginModal />}

        {/* LayerMap */}
        <LayerMap />

        {/* Layer Select Modal */}
        <LayerAndMissionSelectModal />

        <FleetCommanderDashboardModal />

        {/*         <ArenaLeaderboardModal /> */}

        {/* HUD */}
        {primaryWallet && primaryWallet.publicKey && auth.isLoggedIn && (
          <>
            <LeftTop />
            <RightTop />
            <BottomCenter />
            <MissionModal />
            <IslandSelector />
          </>
        )}

        {/* Overlay for screens smaller than desktop size */}
        {/*         <div className="fixed inset-0 z-[999] flex h-full w-full flex-col items-center justify-center gap-8 bg-black bg-opacity-40 text-center text-xl font-bold text-white backdrop-blur-2xl md:hidden">
          <Logo />
          <p>For the full experience, please visit on your desktop</p>
        </div> */}

        {primaryWallet &&
          primaryWallet.publicKey &&
          auth.isLoggedIn &&
          isHideoutModalOpen && <HideoutModal />}
        {primaryWallet &&
          primaryWallet.publicKey &&
          auth.isLoggedIn &&
          isScrollMissionModalOpen && <ScrollMissionModal />}

        {primaryWallet &&
          primaryWallet.publicKey &&
          auth.isLoggedIn &&
          isProfileModalOpen && <ProfileModal />}
        {primaryWallet &&
          primaryWallet.publicKey &&
          auth.isLoggedIn &&
          isNftManagementModalOpen && <AssetManagementModal />}

        {primaryWallet &&
          primaryWallet.publicKey &&
          auth.isLoggedIn &&
          isMissionResultModalOpen && <MissionResultModal />}

        {primaryWallet &&
          primaryWallet.publicKey &&
          auth.isLoggedIn &&
          isMarketModalOpen && <MarketplaceModal />}
      </div>
    </>
  );
};

export default Home;
