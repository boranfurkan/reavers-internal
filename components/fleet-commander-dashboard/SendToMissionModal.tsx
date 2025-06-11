import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GenesisShip,
  GenesisShipRarity,
  MissionCostsInGold,
  MissionRewardsInTreasure,
} from '../../types/Genesis';
import { ModalPortal } from '../PortalModal';
import { useAuth } from '../../contexts/AuthContext';
import { GenesisService } from '../../services/genesisService';
import { toast } from 'sonner';
import { mutate } from 'swr';
import { config } from '../../config';
import { useUser } from '../../contexts/UserContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { animations, theme } from './theme';

interface SendToMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ship: GenesisShip | null;
}

const SendToMissionModal: React.FC<SendToMissionModalProps> = ({
  isOpen,
  onClose,
  ship,
}) => {
  const { user } = useUser();
  const auth = useAuth();
  const { notifications } = useNotifications();

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

  const handleSendToMission = useCallback(
    async (shipId: string) => {
      if (!shipId || !auth.jwtToken) return;

      try {
        setIsLoading(true);
        const response = await GenesisService.sendToMission(
          {
            genesisShipId: shipId,
          },
          auth.jwtToken,
        );

        setJobId(response.jobId);
        toast.success('Sending ship to mission. Please wait...');
      } catch (error) {
        toast.error((error as Error).message);
        setJobId(undefined);
        setIsLoading(false);
      }
    },
    [auth.jwtToken],
  );

  useEffect(() => {
    if (!user?.wallet || !jobId) return;

    const notification = notifications.find(
      (n) => n.data.id === jobId && n.type === 'genesisSendMission',
    );

    if (notification) {
      toast(notification.data.message);
      mutateAllData();
      setJobId(undefined);
      setIsLoading(false);
      onClose();
    } else {
      const timeoutId = setTimeout(() => {
        toast('Timeout, reloading...');
        mutateAllData();
        setJobId(undefined);
        setIsLoading(false);
      }, 150000); // 2.5 minutes timeout

      return () => clearTimeout(timeoutId);
    }
  }, [jobId, user?.wallet, notifications, mutateAllData, onClose]);

  if (!ship) return null;

  // Check if the ship has at least one license
  const hasLicense = ship.captainLicense1 || ship.captainLicense2;

  // Count the number of licenses for reward multiplier
  const licenseCount =
    (ship.captainLicense1 ? 1 : 0) +
    (ship.captainLicense2 ? 1 : 0) +
    (ship.captainLicense3 ? 1 : 0);

  // Calculate base reward based on ship rarity
  const baseReward = MissionRewardsInTreasure[ship.rarity];

  // Apply license multiplier (1x for one license, 2x for two licenses)
  const totalReward = baseReward * (licenseCount > 0 ? licenseCount : 1);

  const missionCost = MissionCostsInGold[ship.rarity];

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
                  Send Ship to Mission
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
                    Sending to mission:{' '}
                    <span style={{ color: theme.text.gold }}>
                      {ship.shipName}
                    </span>
                  </p>
                </div>

                <div className="space-y-4">
                  <div
                    className="rounded-lg border border-gray-700 p-4"
                    style={{ background: theme.background.header }}>
                    {/* Mission Cost */}
                    <div className="flex justify-between">
                      <span
                        className="text-sm"
                        style={{ color: theme.text.secondary }}>
                        Mission Cost:
                      </span>
                      <span
                        className="font-medium"
                        style={{ color: theme.text.gold }}>
                        {MissionCostsInGold[ship.rarity] *
                          (ship.captainLicense1 &&
                          ship.captainLicense2 &&
                          ship.captainLicense3
                            ? 3
                            : ship.captainLicense1 && ship.captainLicense2
                            ? 2
                            : 1)}{' '}
                        Gold
                      </span>
                    </div>

                    {/* Mission Reward */}
                    <div className="mt-2 flex justify-between">
                      <span
                        className="text-sm"
                        style={{ color: theme.text.secondary }}>
                        Potential Reward:
                      </span>
                      <span
                        className="font-medium"
                        style={{ color: theme.text.gold }}>
                        {totalReward.toLocaleString()} Treasure
                      </span>
                    </div>

                    {/* License Multiplier Info */}
                    <div className="mt-2 flex justify-between">
                      <span
                        className="text-sm"
                        style={{ color: theme.text.secondary }}>
                        License Multiplier:
                      </span>
                      <span
                        className="font-medium"
                        style={{ color: theme.text.primary }}>
                        {licenseCount}x {licenseCount === 0 && '(No licenses)'}
                      </span>
                    </div>

                    <p
                      className="mt-3 text-sm"
                      style={{ color: theme.text.secondary }}>
                      Sending your ship on a mission will cost {missionCost}{' '}
                      Booty. Your ship will be unavailable for other actions
                      until it returns from the mission.
                    </p>

                    {licenseCount === 3 && (
                      <div
                        className="mt-3 rounded-md border border-green-800 bg-green-900/30 p-2 text-xs"
                        style={{ color: theme.accent.success }}>
                        <span className="font-bold">Maximum Reward:</span> With
                        all licenses, your ship will earn triple rewards!
                      </div>
                    )}

                    {licenseCount === 1 && (
                      <div
                        className="mt-3 rounded-md border border-yellow-800 bg-yellow-900/30 p-2 text-xs"
                        style={{ color: '#FFD700' }}>
                        <span className="font-bold">License Bonus:</span>{' '}
                        Purchase a second license to double your mission
                        rewards!
                      </div>
                    )}

                    {!hasLicense && (
                      <div
                        className="mt-3 rounded-md border border-red-800 bg-red-900/30 p-2 text-xs"
                        style={{ color: theme.accent.danger }}>
                        <span className="font-bold">Mission Blocked:</span> This
                        ship requires at least one captain license to be sent on
                        a mission. Please purchase a license before proceeding.
                      </div>
                    )}
                  </div>

                  <motion.button
                    type="button"
                    disabled={isLoading || !hasLicense}
                    className="w-full rounded px-4 py-2 font-bold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      backgroundColor: theme.accent.gold,
                      color: '#000000',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (ship && hasLicense) {
                        handleSendToMission(ship.id);
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
                    ) : !hasLicense ? (
                      'License Required'
                    ) : (
                      'Confirm Mission'
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
};

export default SendToMissionModal;
