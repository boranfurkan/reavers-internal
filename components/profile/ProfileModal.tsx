import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../../contexts/UserContext';
import ProgressStats from './ProgressStats';
import StatsCards from './StatsCards';
import TopPerforming from './TopPerforming';
import Socials from './Socials';
import LayerProgress from './LayerProgress';
import { Spin } from 'antd';
import ProfileName from './ProfileName';
import ProfileImage from './ProfileImage';
import { LayerContext } from '../../contexts/LayerContext';
import FinancialTabs from './FinancialTabs';

function ProfileModal() {
  const layerContext = useContext(LayerContext);

  if (!layerContext) {
    throw new Error('LayerMap must be used within a LayerProvider');
  }

  const { setProfileModalOpen } = layerContext;
  const user = useUser();

  if (user.loading) {
    return (
      <div className="absolute inset-0 flex h-full w-full items-center justify-center">
        <Spin />
      </div>
    );
  }

  if (user.error) {
    return <div>Error</div>;
  }

  return (
    <motion.div
      className="fixed inset-0 z-[99] flex w-full flex-col items-start justify-between overflow-y-scroll bg-black bg-opacity-[0.8] pb-10 pt-10 text-white backdrop-blur-xl"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1, transition: { duration: 0.2 } }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 1 } }}>
      <div className="container mx-auto flex w-full max-w-4xl flex-row items-center justify-between">
        <div className="w-full p-4 font-Header text-4xl md:p-8">Profile</div>
        <div
          onClick={() => setProfileModalOpen((prev) => !prev)}
          className="relative z-[70] p-4 pr-2 md:p-6 md:pr-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6 cursor-pointer text-white hover:scale-105">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
      </div>

      {user && user.user && (
        <div className="w-full">
          <div className="container relative mx-auto h-max w-full overflow-visible rounded-lg border border-profile-stroke !border-opacity-5">
            <ProfileImage />
            <div className="relative z-10 h-full w-full">
              <Socials />
              <div className="relative z-20 flex w-full flex-col items-start justify-between gap-8 overflow-visible">
                <ProfileName />
                <ProgressStats />
              </div>

              {/* Financial Tabs Section - Includes Asset Management and Jupiter Terminal */}
              <FinancialTabs />

              <div className="nftlist h-full w-full">
                <StatsCards />
                <TopPerforming />
                <LayerProgress />
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default ProfileModal;