import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModalPortal } from '../PortalModal';
import { useAuth } from '../../contexts/AuthContext';
import { GenesisService } from '../../services/genesisService';
import { toast } from 'sonner';
import { mutate } from 'swr';
import { config } from '../../config';
import { useUser } from '../../contexts/UserContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { animations, theme } from './theme';
import { GenesisShip } from '../../types/Genesis';

interface AddCaptainModalProps {
  isOpen: boolean;
  onClose: () => void;
  ship: GenesisShip | null;
}

const AddCaptainModal: React.FC<AddCaptainModalProps> = ({
  isOpen,
  onClose,
  ship,
}) => {
  const { user } = useUser();
  const auth = useAuth();
  const { notifications } = useNotifications();

  const [captainAddress, setCaptainAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [jobId, setJobId] = useState<string | undefined>(undefined);

  const mutateAllData = useCallback(() => {
    const endpoints = [
      `${config.worker_server_url}/genesis/genesis-ships`,
      `${config.worker_server_url}/users/me`,
      `${config.worker_server_url}/nfts`,
    ];

    endpoints.forEach((endpoint) => mutate(endpoint));
  }, []);

  const handleCaptainAssign = useCallback(
    async (shipId: string, userId: string) => {
      if (!shipId || !userId || !auth.jwtToken) return;

      try {
        setIsLoading(true);
        const response = await GenesisService.assignUser(
          {
            genesisShipId: shipId,
            assignedUserId: userId,
            action: true,
          },
          auth.jwtToken,
        );

        setJobId(response.jobId);
      } catch (error) {
        toast.error((error as Error).message);
        setJobId(undefined);
        setIsLoading(false);
      }

      mutate(`${config.worker_server_url}/genesis/genesis-ships`);
    },
    [auth.jwtToken],
  );

  const handleCaptainUnassign = useCallback(
    async (shipToRemove: string, assignedUserId: string) => {
      if (!shipToRemove || !assignedUserId || !auth.jwtToken) return;

      try {
        setIsLoading(true);
        const response = await GenesisService.assignUser(
          {
            genesisShipId: shipToRemove,
            assignedUserId: assignedUserId,
            action: false,
          },
          auth.jwtToken,
        );

        setJobId(response.jobId);
      } catch (error) {
        toast.error((error as Error).message);
        setJobId(undefined);
        setIsLoading(false);
      }

      mutate(`${config.worker_server_url}/genesis/dashboard`);
    },
    [auth.jwtToken],
  );

  useEffect(() => {
    if (!user?.wallet || !jobId) return;

    const notification = notifications.find(
      (n) =>
        n.data.id === jobId &&
        (n.type === 'assignGenesisShip' ||
          n.type === 'attachNFTGenesis' ||
          n.type === 'genesisClaimReward' ||
          n.type === 'fleetCommanderLevel'),
    );

    if (notification) {
      toast(notification.data.message);
      mutateAllData();
      setJobId(undefined);
      setIsLoading(false);
    } else {
      const timeoutId = setTimeout(() => {
        toast('Timeout, reloading...');
        mutateAllData();
        setJobId(undefined);
        setIsLoading(false);
      }, 150000);

      return () => clearTimeout(timeoutId);
    }
  }, [jobId, user?.wallet, notifications, mutateAllData]);

  return (
    <ModalPortal>
      <AnimatePresence>
        {isOpen && ship && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 backdrop-blur-sm"
              style={{ backgroundColor: theme.background.overlay }}
              onClick={onClose}
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="z-[10000] w-full max-w-md overflow-hidden rounded-lg shadow-xl max-md:w-[94%]"
              style={{
                borderColor: theme.border.light,
                borderWidth: '1px',
                background: theme.background.card,
                backdropFilter: 'blur(8px)',
              }}
              onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{
                  borderBottom: `1px solid ${theme.border.light}`,
                  background: theme.background.header,
                }}>
                <h3
                  className="font-Header text-xl"
                  style={{ color: theme.text.gold }}>
                  Add Fleet Captain
                </h3>
                <button
                  onClick={onClose}
                  className="rounded-full p-1 transition-colors"
                  style={{
                    color: theme.text.secondary,
                  }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-4">
                <div
                  className="mb-4 rounded-lg p-3"
                  style={{ background: theme.background.header }}>
                  <p style={{ color: theme.text.secondary }}>
                    Adding captain to ship:{' '}
                    <span style={{ color: theme.text.gold }}>
                      {ship.shipName}
                    </span>
                  </p>
                </div>

                <form className="space-y-4">
                  <div>
                    <label
                      htmlFor="captainAddress"
                      className="mb-2 block text-sm"
                      style={{ color: theme.text.secondary }}>
                      Enter Captain's Wallet Address or Username
                    </label>
                    <input
                      id="captainAddress"
                      type="text"
                      value={captainAddress}
                      onChange={(e) => setCaptainAddress(e.target.value)}
                      className="w-full rounded-lg px-3 py-2 outline-none"
                      style={{
                        backgroundColor: theme.background.header,
                        color: theme.text.primary,
                        borderColor: theme.border.light,
                        borderWidth: '1px',
                      }}
                      placeholder="e.g., @username or wallet address"
                      required
                    />
                  </div>

                  <motion.button
                    type="button"
                    disabled={isLoading || !captainAddress}
                    className="w-full rounded px-4 py-2 font-bold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      backgroundColor: theme.accent.gold,
                      color: '#000000',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (ship && captainAddress) {
                        handleCaptainAssign(ship.id, captainAddress);
                      }
                    }}>
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="-ml-1 mr-2 h-4 w-4 animate-spin text-black"
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
                        Processing...
                      </span>
                    ) : (
                      'Confirm'
                    )}
                  </motion.button>

                  {ship?.assignedUserId && (
                    <motion.button
                      type="button"
                      onClick={() => {
                        if (ship && ship.assignedUserId) {
                          handleCaptainUnassign(ship.id, ship.assignedUserId);
                        }
                      }}
                      className="w-full rounded px-4 py-2 font-bold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        backgroundColor: 'transparent',
                        color: theme.accent.danger,
                        borderWidth: '1px',
                        borderColor: theme.accent.danger,
                      }}
                      whileHover={{
                        scale: 1.02,
                        backgroundColor: 'rgba(255, 64, 64, 0.1)',
                      }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isLoading}>
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="-ml-1 mr-2 h-4 w-4 animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
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
                          Processing...
                        </span>
                      ) : (
                        'Remove Current Captain'
                      )}
                    </motion.button>
                  )}
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
};

export default AddCaptainModal;
