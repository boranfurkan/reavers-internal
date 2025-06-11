import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GenesisShip, LicenseCostInBooty } from '../../types/Genesis';
import { ModalPortal } from '../PortalModal';
import { useAuth } from '../../contexts/AuthContext';
import { GenesisService } from '../../services/genesisService';
import { toast } from 'sonner';
import { mutate } from 'swr';
import { config } from '../../config';
import { useUser } from '../../contexts/UserContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { animations, theme } from './theme';

interface CaptainLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  ship: GenesisShip | null;
}

const CaptainLicenseModal: React.FC<CaptainLicenseModalProps> = ({
  isOpen,
  onClose,
  ship,
}) => {
  const { user } = useUser();
  const auth = useAuth();
  const { notifications } = useNotifications();

  const [selectedLicense, setSelectedLicense] = useState<1 | 2 | 3 | null>(
    null,
  );
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

  const handlePurchaseLicense = useCallback(
    async (shipId: string, license: 1 | 2 | 3) => {
      if (!shipId || !license || !auth.jwtToken) return;

      try {
        setIsLoading(true);
        const response = await GenesisService.captainLicense(
          {
            genesisShipId: shipId,
            license: license,
          },
          auth.jwtToken,
        );

        setJobId(response.jobId);
        toast.success(`Purchasing license ${license}. Please wait...`);
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
      (n) => n.data.id === jobId && n.type === 'captainLicense',
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
      }, 150000);

      return () => clearTimeout(timeoutId);
    }
  }, [jobId, user?.wallet, notifications, mutateAllData, onClose]);

  if (!ship) return null;

  const licenseOneCost = LicenseCostInBooty[ship.rarity][1];
  const licenseTwoCost = LicenseCostInBooty[ship.rarity][2];
  const licenseThreeCost = LicenseCostInBooty[ship.rarity][3];

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
                  Purchase Captain License
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
                    Purchasing license for ship:{' '}
                    <span style={{ color: theme.text.gold }}>
                      {ship.shipName}
                    </span>
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4
                      className="mb-2 text-sm font-semibold"
                      style={{ color: theme.text.gold }}>
                      Available Licenses
                    </h4>

                    <div className="space-y-3">
                      <div
                        className={`rounded-lg border p-3 transition-all ${
                          selectedLicense === 1
                            ? 'border-yellow-400'
                            : 'border-gray-700'
                        } ${
                          ship.captainLicense1
                            ? 'cursor-not-allowed opacity-50'
                            : 'cursor-pointer'
                        }`}
                        style={{ background: theme.background.header }}
                        onClick={() =>
                          !ship.captainLicense1 && setSelectedLicense(1)
                        }>
                        <div className="flex items-start justify-between">
                          <div className="text-left">
                            <span
                              className="text-sm font-medium"
                              style={{ color: theme.text.primary }}>
                              License 1: Rising Tides
                            </span>
                            <p
                              className="mt-1 text-xs"
                              style={{ color: theme.text.secondary }}>
                              Unlock basic captain abilities
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className="font-semibold"
                              style={{ color: theme.text.gold }}>
                              {licenseOneCost} Booty
                            </span>
                            {ship.captainLicense1 && (
                              <div
                                className="mt-1 text-xs font-medium"
                                style={{ color: theme.accent.success }}>
                                Unlocked
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`rounded-lg border p-3 transition-all ${
                          selectedLicense === 2
                            ? 'border-yellow-400'
                            : 'border-gray-700'
                        } ${
                          ship.captainLicense2
                            ? 'cursor-not-allowed opacity-50'
                            : 'cursor-pointer'
                        }`}
                        style={{ background: theme.background.header }}
                        onClick={() =>
                          !ship.captainLicense2 && setSelectedLicense(2)
                        }>
                        <div className="flex items-start justify-between">
                          <div className="text-left">
                            <span
                              className="text-sm font-medium"
                              style={{ color: theme.text.primary }}>
                              License 2: Trails of Gold
                            </span>
                            <p
                              className="mt-1 text-xs"
                              style={{ color: theme.text.secondary }}>
                              Unlock advanced captain abilities
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className="font-semibold"
                              style={{ color: theme.text.gold }}>
                              {licenseTwoCost} Booty
                            </span>
                            {ship.captainLicense2 && (
                              <div
                                className="mt-1 text-xs font-medium"
                                style={{ color: theme.accent.success }}>
                                Unlocked
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`rounded-lg border p-3 transition-all ${
                          selectedLicense === 3
                            ? 'border-yellow-400'
                            : 'border-gray-700'
                        } ${
                          ship.captainLicense3
                            ? 'cursor-not-allowed opacity-50'
                            : 'cursor-pointer'
                        }`}
                        style={{ background: theme.background.header }}
                        onClick={() =>
                          !ship.captainLicense3 && setSelectedLicense(3)
                        }>
                        <div className="flex items-start justify-between">
                          <div className="text-left">
                            <span
                              className="text-sm font-medium"
                              style={{ color: theme.text.primary }}>
                              License 3: Sails of Fortune
                            </span>
                            <p
                              className="mt-1 text-xs"
                              style={{ color: theme.text.secondary }}>
                              Unlock legendary captain abilities
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className="font-semibold"
                              style={{ color: theme.text.gold }}>
                              {licenseThreeCost} Booty
                            </span>
                            {ship.captainLicense3 && (
                              <div
                                className="mt-1 text-xs font-medium"
                                style={{ color: theme.accent.success }}>
                                Unlocked
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    disabled={
                      isLoading ||
                      selectedLicense === null ||
                      (selectedLicense === 1 && ship.captainLicense1) ||
                      (selectedLicense === 2 && ship.captainLicense2) ||
                      (selectedLicense === 3 && ship.captainLicense3)
                    }
                    className="w-full rounded px-4 py-2 font-bold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      backgroundColor: theme.accent.gold,
                      color: '#000000',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (ship && selectedLicense) {
                        handlePurchaseLicense(ship.id, selectedLicense);
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
                      `Purchase License`
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

export default CaptainLicenseModal;
