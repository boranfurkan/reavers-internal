import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
  useRef,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import ModalCloseButton from '../HUD/modals/ModalCloseButton';
import { LayerContext } from '../../contexts/LayerContext';
import { useNfts } from '../../contexts/NftContext';
import { calculateDurability, formatPercentage } from '../../utils/helpers';
import BgImage from '../../public/images/fleet-commander-bg.png';
import { Button } from '../../components/ui/button';
import { animations, styles, theme } from './theme';
import AddCaptainModal from './AddCaptainModal';
import CaptainLicenseModal from './CaptainLicenseModal';
import SendToMissionModal from './SendToMissionModal';

import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import {
  GenesisService,
  ClaimRewardsRequest,
} from '../../services/genesisService';
import { config } from '../../config';
import { useNotifications } from '../../contexts/NotificationContext';
import { useUser } from '../../contexts/UserContext';
import ShipsTable from './ShipsTable';
import { GenesisShip, GenesisShipRarity } from '../../types/Genesis';

const FleetCommanderDashboardModal: React.FC = () => {
  const layerContext = useContext(LayerContext);
  const { genesisShips = [], refreshGenesisShips } = useNfts();

  // Use useRef to track modal visibility state without causing re-renders
  const isLoadingRef = useRef(false);
  const isSendAllLoadingRef = useRef(false); // New ref for send all ships loading state
  const singleClaimLoadingRef = useRef<string | null>(null);
  const jobIdRef = useRef<string | null>(null);
  const stableAnimationKey = useRef('fleet-commander-dashboard-modal');

  // State that affects visual presentation only
  const [isLoading, setIsLoading] = useState(false);
  const [isSendAllLoading, setIsSendAllLoading] = useState(false); // New state for visual rendering
  const [singleClaimLoading, setSingleClaimLoading] = useState<string | null>(
    null,
  );

  // Modal states can remain as regular state
  const [selectedShip, setSelectedShip] = useState<GenesisShip | null>(null);
  const [isAddCaptainModalOpen, setIsAddCaptainModalOpen] = useState(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);

  const auth = useAuth();
  const { notifications } = useNotifications();
  const { user } = useUser();

  if (!layerContext) {
    throw new Error('LayerMap must be used within a LayerProvider');
  }

  const { isFleetCommanderModalOpen, setFleetCommanderModalOpen } =
    layerContext;

  // Calculate summary statistics - safely handling empty arrays
  const totalReward = useMemo(() => {
    if (!genesisShips || genesisShips.length === 0) return 0;
    return genesisShips.reduce((sum, ship) => sum + (ship.reward || 0), 0);
  }, [genesisShips]);

  const averageTierBonus = useMemo(() => {
    if (!genesisShips || genesisShips.length === 0) return 0;
    const total = genesisShips.reduce(
      (sum, ship) => sum + (ship.tierBonus || 0),
      0,
    );
    return total / genesisShips.length;
  }, [genesisShips]);

  const shipsByRarity = useMemo(() => {
    if (!genesisShips || genesisShips.length === 0)
      return {} as Record<GenesisShipRarity, number>;

    return genesisShips.reduce((acc, ship) => {
      if (ship.rarity) {
        acc[ship.rarity] = (acc[ship.rarity] || 0) + 1;
      } else {
        return acc;
      }
      return acc;
    }, {} as Record<GenesisShipRarity, number>);
  }, [genesisShips]);

  // Calculate ships with licenses
  const shipsWithLicenses = useMemo(() => {
    if (!genesisShips || genesisShips.length === 0)
      return { license1: 0, license2: 0, license3: 0, triple: 0 };

    return genesisShips.reduce(
      (acc, ship) => {
        if (ship.captainLicense1) acc.license1++;
        if (ship.captainLicense2) acc.license2++;
        if (ship.captainLicense3) acc.license3++;
        if (
          ship.captainLicense1 &&
          ship.captainLicense2 &&
          ship.captainLicense3
        )
          acc.triple++;
        return acc;
      },
      { license1: 0, license2: 0, license3: 0, triple: 0 },
    );
  }, [genesisShips]);

  // Determine mission-eligible ships
  const missionEligibleShips = useMemo(() => {
    if (!genesisShips || genesisShips.length === 0) return [];
    // Filter ships that are not currently on a mission
    return genesisShips.filter((ship) => !ship.isOnMission);
  }, [genesisShips]);

  const rewardStats = useMemo(() => {
    if (!genesisShips || genesisShips.length === 0)
      return { claimableShips: 0, allTimeRewardClaimed: 0, allTimeTaxPaid: 0 };

    return genesisShips.reduce(
      (acc, ship) => {
        if (ship.isClaimable) acc.claimableShips++;
        acc.allTimeRewardClaimed += ship.allTimeRewardClaimed || 0;
        acc.allTimeTaxPaid += ship.allTimeTaxPaid || 0;
        return acc;
      },
      { claimableShips: 0, allTimeRewardClaimed: 0, allTimeTaxPaid: 0 } as {
        claimableShips: number;
        allTimeRewardClaimed: number;
        allTimeTaxPaid: number;
      },
    );
  }, [genesisShips]);

  // Use a useEffect to synchronize refs to state
  // This allows us to update the visual state without re-rendering the entire component
  useEffect(() => {
    setIsLoading(isLoadingRef.current);
    setSingleClaimLoading(singleClaimLoadingRef.current);
    setIsSendAllLoading(isSendAllLoadingRef.current); // Sync the send all loading ref to state
  }, []);

  // Modified refreshData function to avoid complete re-renders
  const refreshData = useCallback(async () => {
    try {
      await refreshGenesisShips();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, [refreshGenesisShips]);

  const handleClaimAllTreasure = async () => {
    if (totalReward <= 0 || !auth.jwtToken) return;

    // Update both ref and state (state triggers visual update)
    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      const response = await GenesisService.claimRewards(auth.jwtToken);

      if (response.jobId) {
        jobIdRef.current = response.jobId;
        toast.success('Claiming all rewards. Please wait...');
      } else {
        toast.error('Failed to initiate reward claim');
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error claiming all treasure:', error);
      toast.error('Failed to claim rewards');
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  };

  // New handler for sending all ships to mission
  const handleSendAllToMission = async () => {
    // Check if there are any ships eligible for mission
    if (missionEligibleShips.length === 0 || !auth.jwtToken) return;

    // Update both ref and state for loading indicators
    isSendAllLoadingRef.current = true;
    setIsSendAllLoading(true);

    try {
      // Get IDs of all ships not currently on mission, filtering out any undefined IDs
      const shipIds = missionEligibleShips
        .map((ship) => ship.id)
        .filter((id): id is string => id !== undefined); // Type guard to ensure string[]

      // Call the API to send all ships to mission
      const response = await GenesisService.sendToMissionAll(
        { genesisShipIds: shipIds },
        auth.jwtToken,
      );

      if (response.jobIds) {
        response.jobIds.forEach((jobId) => {
          jobIdRef.current = jobId;
        });
        toast.success(
          `Sending ${shipIds.length} ships to mission. Please wait...`,
        );
      } else {
        toast.error('Failed to send ships to mission');
        isSendAllLoadingRef.current = false;
        setIsSendAllLoading(false);
      }
    } catch (error) {
      console.error('Error sending all ships to mission:', error);
      toast.error('Failed to send ships to mission');
      isSendAllLoadingRef.current = false;
      setIsSendAllLoading(false);
    }
  };

  const handleClaimSingleReward = async (ship: GenesisShip) => {
    if (!ship.isOnMission || ship.reward <= 0 || !auth.jwtToken) return;

    // Update both ref and state
    singleClaimLoadingRef.current = ship.id;
    setSingleClaimLoading(ship.id);
    jobIdRef.current = ship.id;

    try {
      const request: ClaimRewardsRequest = {
        genesisShipId: ship.id,
      };

      // Show loading toast
      toast.loading(`Claiming reward for ${ship.shipName}...`, {
        id: `claim-${ship.id}`,
      });

      const response = await GenesisService.claimSingleRewards(
        request,
        auth.jwtToken,
      );

      if (response.jobId) {
        // Store the job ID for notification tracking
        jobIdRef.current = response.jobId;

        toast.success(`Claiming reward for ${ship.shipName}. Please wait...`, {
          id: `claim-${ship.id}`,
        });
      } else {
        toast.error(`Failed to claim reward for ${ship.shipName}`, {
          id: `claim-${ship.id}`,
        });
        singleClaimLoadingRef.current = null;
        setSingleClaimLoading(null);
        jobIdRef.current = null;
      }
    } catch (error) {
      console.error(`Error claiming reward for ship ${ship.id}:`, error);
      toast.error(`Failed to claim reward for ${ship.shipName}`, {
        id: `claim-${ship.id}`,
      });
      singleClaimLoadingRef.current = null;
      setSingleClaimLoading(null);
      jobIdRef.current = null;
    }
  };

  // Modified notification handler to prevent full re-renders
  useEffect(() => {
    if (!user?.wallet || !jobIdRef.current) return;

    const notification = notifications.find(
      (n) =>
        n.data.id === jobIdRef.current &&
        (n.type === 'assignGenesisShip' ||
          n.type === 'captainLicense' ||
          n.type === 'genesisRewardClaimAll' ||
          n.type === 'genesisClaimReward' ||
          n.type === 'genesisSendMission'),
    );

    if (notification) {
      toast(notification.data.message);

      // Update both ref and state first (before data refresh)
      isLoadingRef.current = false;
      setIsLoading(false);
      singleClaimLoadingRef.current = null;
      setSingleClaimLoading(null);
      isSendAllLoadingRef.current = false; // Reset send all loading state
      setIsSendAllLoading(false); // Reset send all loading state

      // Then refresh data in the background
      refreshData();
      jobIdRef.current = null;
    } else {
      const timeoutId = setTimeout(() => {
        toast('Timeout, reloading...');

        // Update both ref and state first (before data refresh)
        isLoadingRef.current = false;
        setIsLoading(false);
        singleClaimLoadingRef.current = null;
        setSingleClaimLoading(null);
        isSendAllLoadingRef.current = false; // Reset send all loading state
        setIsSendAllLoading(false); // Reset send all loading state

        // Then refresh data in the background
        refreshData();
        jobIdRef.current = null;
      }, 150000);

      return () => clearTimeout(timeoutId);
    }
  }, [notifications, user?.wallet, refreshData]);

  const handleOpenAddCaptainModal = (ship: GenesisShip) => {
    setSelectedShip(ship);
    setIsAddCaptainModalOpen(true);
  };

  const handleOpenLicenseModal = (ship: GenesisShip) => {
    setSelectedShip(ship);
    setIsLicenseModalOpen(true);
  };

  const handleOpenMissionModal = (ship: GenesisShip) => {
    setSelectedShip(ship);
    setIsMissionModalOpen(true);
  };

  // Helper to create stat row
  const StatRow = ({
    label,
    value,
    highlight = false,
  }: {
    label: string;
    value: string | number;
    highlight?: boolean;
  }) => (
    <div className="flex justify-between">
      <span style={{ color: theme.text.secondary }}>{label}</span>
      <span
        className="font-medium"
        style={{ color: highlight ? theme.text.gold : theme.text.primary }}>
        {value}
      </span>
    </div>
  );

  // Card component for summary stats
  const SummaryCard = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <motion.div
      variants={animations.card}
      whileHover="hover"
      style={styles.cardContainer}>
      <div className="flex flex-col">
        <h3 style={styles.cardTitle}>{title}</h3>
        <div className="mt-2 space-y-2">{children}</div>
      </div>
    </motion.div>
  );

  // Empty state component
  const EmptyState = () => (
    <motion.div
      variants={animations.content}
      className="flex flex-col items-center justify-center space-y-4 rounded-lg p-12 text-center"
      style={{
        borderColor: theme.border.light,
        borderWidth: '1px',
        background: theme.background.card,
        backdropFilter: 'blur(4px)',
      }}>
      <div className="rounded-full bg-gray-800 p-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: theme.text.gold }}>
          <path d="M2 4h20v16H2z"></path>
          <path d="M2 4l10 8 10-8"></path>
        </svg>
      </div>
      <h3 className="text-xl font-semibold" style={{ color: theme.text.gold }}>
        No Genesis Ships Found
      </h3>
      <p className="max-w-md text-gray-400">
        You don't have any Genesis ships in your fleet yet. Acquire your first
        ship to start your adventure and see your fleet details here.
      </p>
      <Button
        className="mt-4 rounded px-6 py-2 font-bold transition-all duration-300"
        style={{
          backgroundColor: theme.accent.gold,
          color: '#000000',
        }}>
        Browse Marketplace
      </Button>
    </motion.div>
  );

  return (
    <AnimatePresence mode="wait">
      {isFleetCommanderModalOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[85] backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
            variants={animations.overlay}
            initial="hidden"
            animate="visible"
            exit="exit"
          />

          <motion.div
            className="fixed inset-0 z-[90] flex h-full w-full flex-col items-start justify-start pt-0"
            style={{ color: theme.text.secondary }}
            variants={animations.modal}
            key={stableAnimationKey.current}
            initial="hidden"
            animate="visible"
            exit="exit">
            <div className="relative h-full w-full overflow-hidden">
              <motion.div
                className="absolute inset-0"
                variants={animations.background}
                initial="hidden"
                animate="visible"
                exit="exit">
                <Image
                  layout="fill"
                  className="pointer-events-none h-full w-full object-cover object-center"
                  src={BgImage}
                  alt="Fleet Commander background"
                  priority
                />
                <div
                  className="absolute inset-0 backdrop-blur-[2px]"
                  style={{ backgroundColor: theme.background.overlay }}></div>
              </motion.div>

              <motion.div
                variants={animations.content}
                className="relative h-full w-full overflow-y-auto">
                {/* Header */}
                <motion.div
                  variants={animations.header}
                  className="flex min-h-[82px] w-full flex-row items-center justify-between"
                  style={{ borderBottom: `1px solid ${theme.border.light}` }}>
                  <h1
                    className="w-full p-4 font-Header text-[13px] max-md:px-2 md:text-[26px]"
                    style={{ color: theme.text.gold }}>
                    Fleet Commander Dashboard
                  </h1>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}>
                    <ModalCloseButton
                      handleClose={() => setFleetCommanderModalOpen(false)}
                      style={{ color: theme.text.gold }}
                    />
                  </motion.div>
                </motion.div>

                {/* Dashboard Content */}
                <div className="p-4 md:p-6">
                  {!genesisShips || genesisShips.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <>
                      {/* Summary Section */}
                      <motion.div
                        variants={animations.content}
                        className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {/* Fleet Stats Card */}
                        <SummaryCard title="Fleet Stats">
                          <StatRow
                            label="Total Ships:"
                            value={genesisShips.length}
                          />
                          <StatRow
                            label="Avg. Tier Bonus:"
                            value={`${formatPercentage(averageTierBonus)}%`}
                          />
                          <div style={styles.divider} />

                          {/* Ship Rarity Breakdown */}
                          <h4
                            className="text-sm font-medium"
                            style={{ color: theme.text.gold }}>
                            Ship Rarities:
                          </h4>
                          <StatRow
                            label="Fleet Commander:"
                            value={
                              shipsByRarity[
                                GenesisShipRarity.FLEET_COMMANDER
                              ] || 0
                            }
                          />
                          <StatRow
                            label="Gold:"
                            value={shipsByRarity[GenesisShipRarity.GOLD] || 0}
                          />
                          <StatRow
                            label="Silver:"
                            value={shipsByRarity[GenesisShipRarity.SILVER] || 0}
                          />
                          <StatRow
                            label="Bronze:"
                            value={shipsByRarity[GenesisShipRarity.BRONZE] || 0}
                          />
                        </SummaryCard>

                        {/* Ship Status Card */}
                        <SummaryCard title="Ship Status">
                          <StatRow
                            label="On Mission:"
                            value={`${
                              genesisShips.filter((ship) => ship.isOnMission)
                                .length
                            } / ${genesisShips.length}`}
                          />
                          <StatRow
                            label="Ready for Mission:"
                            value={`${missionEligibleShips.length} / ${genesisShips.length}`}
                            highlight={missionEligibleShips.length > 0}
                          />
                          <StatRow
                            label="Claimable Ships:"
                            value={`${rewardStats.claimableShips} / ${genesisShips.length}`}
                            highlight={rewardStats.claimableShips > 0}
                          />
                          <div style={styles.divider} />

                          {/* License Status */}
                          <h4
                            className="text-sm font-medium"
                            style={{ color: theme.text.gold }}>
                            Captain Licenses:
                          </h4>
                          <StatRow
                            label="License 1:"
                            value={`${shipsWithLicenses.license1} / ${genesisShips.length}`}
                          />
                          <StatRow
                            label="License 2:"
                            value={`${shipsWithLicenses.license2} / ${genesisShips.length}`}
                          />
                          <StatRow
                            label="License 3:"
                            value={`${shipsWithLicenses.license3} / ${genesisShips.length}`}
                          />
                          <StatRow
                            label="Fully Licensed:"
                            value={`${shipsWithLicenses.triple} / ${genesisShips.length}`}
                          />
                        </SummaryCard>

                        {/* Rewards Card */}
                        <SummaryCard title="Rewards">
                          <StatRow
                            label="Available:"
                            value={totalReward.toFixed(2)}
                            highlight={true}
                          />
                          <StatRow
                            label="All-time Claimed:"
                            value={rewardStats.allTimeRewardClaimed.toFixed(2)}
                          />
                          <StatRow
                            label="All-time Tax Paid:"
                            value={rewardStats.allTimeTaxPaid.toFixed(2)}
                          />
                          <div style={styles.divider} />
                        </SummaryCard>

                        {/* Fleet Actions Card (spans 1 column) */}
                        <motion.div
                          variants={animations.card}
                          whileHover="hover"
                          style={styles.cardContainer}>
                          <div className="flex h-full flex-col justify-start gap-2">
                            <h3 style={styles.cardTitle}>Command Actions</h3>

                            <div>
                              <p
                                className="mb-4"
                                style={{ color: theme.text.secondary }}>
                                Claim your rewards from all ships in your fleet.
                                Taxes will be automatically deducted.
                              </p>

                              <Button
                                onClick={handleClaimAllTreasure}
                                disabled={totalReward <= 0 || isLoading}
                                className="w-full rounded px-4 py-2 font-bold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                                style={{
                                  backgroundColor: theme.accent.gold,
                                  color: '#000000',
                                  marginBottom: '12px',
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
                                  `Claim All Treasure (${totalReward.toFixed(
                                    2,
                                  )})`
                                )}
                              </Button>

                              {/* New Send All to Mission Button */}
                              <p
                                className="mb-4"
                                style={{ color: theme.text.secondary }}>
                                Deploy all available ships on missions to earn
                                rewards.
                              </p>

                              <Button
                                onClick={handleSendAllToMission}
                                disabled={
                                  missionEligibleShips.length === 0 ||
                                  isSendAllLoading
                                }
                                className="w-full rounded px-4 py-2 font-bold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                                style={{
                                  backgroundColor:
                                    missionEligibleShips.length > 0
                                      ? theme.accent.gold
                                      : '#555',
                                  color: '#000000',
                                }}>
                                {isSendAllLoading ? (
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
                                    Deploying Fleet...
                                  </span>
                                ) : (
                                  `Send All Ships to Mission (${missionEligibleShips.length})`
                                )}
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>

                      {/* Ships Table - Modified to handle claim rewards */}
                      <ShipsTable
                        genesisShips={genesisShips as GenesisShip[]}
                        handleOpenAddCaptainModal={handleOpenAddCaptainModal}
                        handleOpenLicenseModal={handleOpenLicenseModal}
                        handleOpenMissionModal={handleOpenMissionModal}
                        handleClaimReward={handleClaimSingleReward}
                        claimingShipId={singleClaimLoading}
                      />
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Add Captain Modal */}
          <AddCaptainModal
            isOpen={isAddCaptainModalOpen}
            onClose={() => setIsAddCaptainModalOpen(false)}
            ship={selectedShip}
          />

          {/* License Modal */}
          <CaptainLicenseModal
            isOpen={isLicenseModalOpen}
            onClose={() => setIsLicenseModalOpen(false)}
            ship={selectedShip}
          />

          {/* Mission Modal */}
          <SendToMissionModal
            isOpen={isMissionModalOpen}
            onClose={() => setIsMissionModalOpen(false)}
            ship={selectedShip}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default FleetCommanderDashboardModal;
