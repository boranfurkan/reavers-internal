import React, { useState } from 'react';
import ProfileAssetManagement from './ProfileAssetManagement';
import StandaloneJupiterTerminal from './StandaloneJupiterTerminal';

// Custom tabs implementation that keeps content mounted
const FinancialTabs = () => {
  const [activeTab, setActiveTab] = useState('assets');

  return (
    <div className="my-8 w-full px-4">
      {/* Custom Tab Navigation */}
      <div className="mb-6 grid w-full grid-cols-2 rounded-lg border border-profile-stroke bg-black bg-opacity-30">
        <button
          onClick={() => setActiveTab('assets')}
          className={`rounded-lg rounded-r-none py-3 transition-all duration-200 ${
            activeTab === 'assets'
              ? 'bg-white/10 text-white'
              : 'text-white/70 hover:bg-white/5'
          }`}>
          <span className="flex items-center justify-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4">
              <path d="M2 9c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2H2Z"></path>
              <path d="M2 11v2c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2v-2"></path>
              <path d="M5 15v2c0 1.1.9 2 2 2h10a2 2 0 0 0 2-2v-2"></path>
              <path d="M2 7V5c0-1.1.9-2 2-2h16a2 2 0 0 1 2 2v2"></path>
            </svg>
            Asset Management
          </span>
        </button>
        <button
          onClick={() => setActiveTab('swap')}
          className={`rounded-lg rounded-l-none py-3 transition-all duration-200 ${
            activeTab === 'swap'
              ? 'bg-white/10 text-white'
              : 'text-white/70 hover:bg-white/5'
          }`}>
          <span className="flex items-center justify-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4">
              <path d="M16 3h5v5"></path>
              <path d="M4 20 20.2 3.8"></path>
              <path d="M21 16v5h-5"></path>
              <path d="m15 15 6 6"></path>
              <path d="M4 4 9 9"></path>
            </svg>
            Token Swap
          </span>
        </button>
      </div>

      {/* Tab Contents - Both always rendered but only one visible */}
      <div className="relative">
        {/* Assets Tab */}
        <div
          className={`rounded-lg border border-profile-stroke bg-black bg-opacity-30 transition-all duration-300 ${
            activeTab === 'assets'
              ? 'z-10 opacity-100'
              : 'pointer-events-none absolute inset-0 z-0 opacity-0'
          }`}>
          <ProfileAssetManagement />
        </div>

        {/* Swap Tab - Always mounted but hidden when inactive */}
        <div
          className={`rounded-lg border border-profile-stroke bg-black bg-opacity-30 p-0 transition-all duration-300 ${
            activeTab === 'swap'
              ? 'z-10 opacity-100'
              : 'pointer-events-none absolute inset-0 z-0 opacity-0'
          }`}>
          <div className="p-4 md:p-6">
            <h2 className="mb-4 text-lg font-semibold">
              Token Swap with Jupiter
            </h2>
            <p className="mb-6 text-xs text-white/70">
              Swap tokens instantly with the best rates across the Solana
              ecosystem.
            </p>

            <div className="overflow-hidden rounded-xl border border-profile-stroke bg-black bg-opacity-40">
              <StandaloneJupiterTerminal
                rpcUrl="https://margalit-5axa8t-fast-mainnet.helius-rpc.com"
                commitment="confirmed"
                containerClassName="rounded-xl"
                containerStyles={{
                  background: 'transparent',
                  height: '550px',
                }}
                formProps={{
                  initialInputMint:
                    'So11111111111111111111111111111111111111112', // SOL
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialTabs;
