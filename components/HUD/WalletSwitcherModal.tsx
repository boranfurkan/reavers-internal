import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  useSwitchWallet,
  useUserWallets,
  useDynamicContext,
} from '@dynamic-labs/sdk-react-core';
import { useAuth } from '../../contexts/AuthContext';
import { shortenSolanaAddress } from '../../utils/helpers';

interface WalletSwitcherModalProps {
  onClose: () => void;
}

export const WalletSwitcherModal: React.FC<WalletSwitcherModalProps> = ({
  onClose,
}) => {
  const switchWallet = useSwitchWallet();
  const userWallets = useUserWallets();
  const { primaryWallet, handleLogOut } = useDynamicContext();
  const { resetAuth } = useAuth();
  const [connecting, setConnecting] = useState(false);

  // Handler for switching wallets
  const handleSwitchWallet = async (walletId: string) => {
    try {
      setConnecting(true);

      // Find the wallet we're switching to
      const targetWallet = userWallets.find((w) => w.id === walletId);

      // Check if it's an embedded wallet
      const isEmbeddedWallet = targetWallet?.connector?.isEmbeddedWallet;

      // Reset auth context BEFORE switching wallet
      // This ensures we don't carry over auth state from the previous wallet
      resetAuth();

      // FIX: Close the modal before switching to embedded wallet
      // This prevents interference with Dynamic's email verification flow
      if (isEmbeddedWallet) {
        onClose();
        console.log('Closing modal before embedded wallet switch');
      }

      // Mark this wallet switch in session storage
      // This helps AuthContext determine if we're in a wallet-switching flow
      sessionStorage.setItem(
        'switching_to_embedded',
        isEmbeddedWallet ? 'true' : 'false',
      );

      // Switch wallet
      await switchWallet(walletId);

      setTimeout(() => {
        sessionStorage.removeItem('switching_to_embedded');
      }, 500);

      if (!isEmbeddedWallet) {
        onClose();
      }

      console.log(
        `Switched to wallet: ${isEmbeddedWallet ? 'embedded' : 'regular'}`,
      );
    } catch (error) {
      console.error('Error switching wallet:', error);
      // Clear flags on error
      sessionStorage.removeItem('switching_to_embedded');
    } finally {
      setConnecting(false);
    }
  };

  // Handler for connecting a new wallet
  const handleConnectNewWallet = () => {
    // Close the current modal to open Dynamic's connect flow
    onClose();

    // Need to trigger Dynamic's connect wallet flow here
    // This will depend on how you've implemented Dynamic in your app
    const dynamicConnectButton = document.querySelector(
      '.dynamic-connect-button',
    );
    if (dynamicConnectButton && dynamicConnectButton instanceof HTMLElement) {
      dynamicConnectButton.click();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-profile-stroke bg-reavers-bg p-6 text-white"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Change Wallet</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 transition-all hover:bg-white hover:bg-opacity-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Wallets List */}
        <div className="flex flex-col gap-3">
          {connecting ? (
            <div className="py-8 text-center">
              <svg
                className="mx-auto h-8 w-8 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 text-sm opacity-70">Switching wallet...</p>
            </div>
          ) : userWallets.length === 0 ? (
            <div className="py-4 text-center text-white text-opacity-70">
              No connected wallets found
            </div>
          ) : (
            userWallets.map((wallet) => {
              // Check if this wallet is the primary wallet
              const isActive = primaryWallet?.id === wallet.id;
              // Check if this is an embedded wallet
              const isEmbedded = wallet.connector?.isEmbeddedWallet;

              return (
                <button
                  key={wallet.id}
                  onClick={() => {
                    if (!isActive) {
                      handleSwitchWallet(wallet.id);
                    }
                  }}
                  disabled={isActive || connecting}
                  className={`flex w-full items-center justify-between rounded-md border p-4 text-left transition-all
                            ${
                              isActive
                                ? 'border-green-500 bg-green-500 bg-opacity-10'
                                : 'border-profile-stroke bg-black bg-opacity-30 hover:border-white hover:border-opacity-40'
                            }`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-profile-stroke bg-black bg-opacity-50">
                      {/* Show different icon for embedded wallets */}
                      {isEmbedded ? (
                        <span className="text-xs font-bold">📧</span>
                      ) : (
                        <span className="text-sm font-bold">
                          {wallet.connector?.name?.charAt(0) || 'W'}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {wallet.connector?.name || 'Wallet'}
                        {isEmbedded && (
                          <span className="ml-2 text-xs text-blue-400">
                            (Email Verification)
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-white text-opacity-70">
                        {shortenSolanaAddress(wallet.address)}
                      </div>
                    </div>
                  </div>

                  {isActive && (
                    <div className="rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-black">
                      Active
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Connect New Wallet Button */}
        <div className="mt-6">
          <button
            onClick={handleConnectNewWallet}
            disabled={connecting}
            className="w-full rounded-md border border-reavers-border bg-reavers-bg py-3 text-center font-medium transition-all hover:border-white hover:border-opacity-40">
            + Connect New Wallet
          </button>
        </div>

        {/* Log Out Button */}
        <div className="mt-3">
          <button
            onClick={async () => {
              try {
                await handleLogOut();
                onClose();
              } catch (err) {
                console.error('Error on logout:', err);
              }
            }}
            disabled={connecting}
            className="w-full rounded-md border border-red-500 bg-black bg-opacity-20 py-3 text-center font-medium text-red-400 transition-all hover:bg-red-500 hover:bg-opacity-10">
            Log Out
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
