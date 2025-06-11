import React, { useCallback, useMemo, memo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { CopyIcon } from 'lucide-react';
import { GenesisShip, MissionCostsInGold } from '../../types/Genesis';
import {
  calculateDurability,
  formatPercentage,
  getGenesisShipSpeed,
  shortenSolanaAddress,
} from '../../utils/helpers';
import { copyToClipboard } from '../../utils/inventory-helpers';
import { toast } from 'sonner';
import { getRarityStyle, theme, animations } from './theme';

interface ShipsTableProps {
  genesisShips: GenesisShip[];
  handleOpenAddCaptainModal: (ship: GenesisShip) => void;
  handleOpenLicenseModal: (ship: GenesisShip) => void;
  handleOpenMissionModal: (ship: GenesisShip) => void;
  handleClaimReward: (ship: GenesisShip) => void;
  claimingShipId?: string | null;
}

// Memoized ship row component to prevent unnecessary re-renders
const ShipRow = memo(
  ({
    ship,
    claimingShipId,
    handleOpenAddCaptainModal,
    handleOpenLicenseModal,
    handleOpenMissionModal,
    handleClaimReward,
  }: {
    ship: GenesisShip;
    claimingShipId?: string | null;
    handleOpenAddCaptainModal: (ship: GenesisShip) => void;
    handleOpenLicenseModal: (ship: GenesisShip) => void;
    handleOpenMissionModal: (ship: GenesisShip) => void;
    handleClaimReward: (ship: GenesisShip) => void;
  }) => {
    const rarityStyle = getRarityStyle(ship.rarity);
    const isClaimingReward = claimingShipId === ship.id;

    // Memoize license status rendering
    const licenseStatus = useMemo(
      () => (
        <div className="flex gap-1">
          <span
            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
              ship.captainLicense1
                ? 'border border-green-700 bg-green-900/50 text-green-400'
                : 'border border-gray-700 bg-gray-800/50 text-gray-400'
            }`}
            title={`License 1: ${
              ship.captainLicense1 ? 'Unlocked' : 'Locked'
            }`}>
            1
          </span>
          <span
            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
              ship.captainLicense2
                ? 'border border-green-700 bg-green-900/50 text-green-400'
                : 'border border-gray-700 bg-gray-800/50 text-gray-400'
            }`}
            title={`License 2: ${
              ship.captainLicense2 ? 'Unlocked' : 'Locked'
            }`}>
            2
          </span>
          <span
            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
              ship.captainLicense3
                ? 'border border-green-700 bg-green-900/50 text-green-400'
                : 'border border-gray-700 bg-gray-800/50 text-gray-400'
            }`}
            title={`License 3: ${
              ship.captainLicense3 ? 'Unlocked' : 'Locked'
            }`}>
            3
          </span>
        </div>
      ),
      [ship.captainLicense1, ship.captainLicense2],
    );

    // Memoize mission status rendering
    const missionStatus = useMemo(() => {
      const hasRewardToClaim = ship.reward > 0;

      if (ship.isOnMission) {
        return (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => handleClaimReward(ship)}
              disabled={isClaimingReward || !ship.isClaimable}
              className="rounded px-2 py-1 text-xs font-semibold transition-colors"
              style={{
                backgroundColor: ship.isClaimable ? theme.accent.gold : '#555',
                color: '#000000',
                opacity: isClaimingReward ? 0.7 : 1,
                cursor:
                  ship.isClaimable && !isClaimingReward
                    ? 'pointer'
                    : 'not-allowed',
              }}>
              {isClaimingReward ? (
                <span className="flex items-center">
                  <svg
                    className="-ml-1 mr-1 h-3 w-3 animate-spin text-black"
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
                  Claiming...
                </span>
              ) : ship.isClaimable ? (
                'Claim Reward'
              ) : (
                'On Mission'
              )}
            </button>
          </div>
        );
      } else if (hasRewardToClaim) {
        // Ship is not on mission but has a reward to claim
        return (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => handleClaimReward(ship)}
              disabled={isClaimingReward}
              className="rounded px-2 py-1 text-xs font-semibold transition-colors"
              style={{
                backgroundColor: theme.accent.gold,
                color: '#000000',
                opacity: isClaimingReward ? 0.7 : 1,
              }}>
              {isClaimingReward ? (
                <span className="flex items-center">
                  <svg
                    className="-ml-1 mr-1 h-3 w-3 animate-spin text-black"
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
                  Claiming...
                </span>
              ) : (
                'Claim Reward'
              )}
            </button>
          </div>
        );
      } else {
        return (
          <button
            onClick={() => handleOpenMissionModal(ship)}
            className="rounded px-2 py-1 text-xs font-semibold transition-colors"
            style={{
              backgroundColor: theme.accent.gold,
              color: '#000000',
            }}>
            Send to Mission
          </button>
        );
      }
    }, [
      ship.isOnMission,
      ship.isClaimable,
      ship.reward,
      isClaimingReward,
      handleClaimReward,
      handleOpenMissionModal,
    ]);

    // Use a stable ID for the row to maintain identity across renders
    return (
      <TableRow
        key={ship.id}
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        className="transition-colors hover:bg-black/20">
        {/* Ship ID Column */}
        <TableCell
          className="text-left font-medium"
          style={{ padding: '1rem' }}>
          <div className="flex items-center gap-1">
            <span
              className="font-medium text-white"
              style={{ color: theme.text.primary }}>
              {shortenSolanaAddress(ship.id)}
            </span>
            <button
              onClick={() => {
                copyToClipboard(ship.id, toast);
              }}>
              <CopyIcon
                height={12}
                width={12}
                color="white"
                className="transition-all duration-300 hover:text-white"
              />
            </button>
          </div>
        </TableCell>

        {/* Ship Column with Image */}
        <TableCell style={{ padding: '1rem' }}>
          <div className="flex items-center space-x-3">
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-white/20 bg-black/50">
              {ship.imageURL ? (
                <Image
                  src={ship.imageURL}
                  alt={ship.shipName}
                  layout="fill"
                  objectFit="cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-xs opacity-70">No image</span>
                </div>
              )}
            </div>
            <div className="font-medium text-white">{ship.shipName}</div>
          </div>
        </TableCell>

        {/* Rarity Column */}
        <TableCell style={{ padding: '1rem' }}>
          <div className="flex justify-center">
            <span
              className="inline-flex rounded-full px-2 py-1 text-xs font-semibold"
              style={{
                background: rarityStyle.bg,
                borderColor: rarityStyle.border,
                borderWidth: '1px',
                color: rarityStyle.text,
              }}>
              {ship.rarity.split('_').join(' ')}
            </span>
          </div>
        </TableCell>

        {/* Speed Column */}
        <TableCell className="text-right" style={{ padding: '1rem' }}>
          {getGenesisShipSpeed(ship.rarity)}
        </TableCell>

        {/* Captain Column */}
        {/*         <TableCell style={{ padding: '1rem' }}>
          {ship.assignedUserId ? (
            <div className="flex items-center justify-center">
              <div
                className="mr-2 h-2 w-2 rounded-full"
                style={{
                  backgroundColor: ship.assignedUserId
                    ? theme.accent.success
                    : theme.accent.danger,
                }}></div>
              <span className="max-w-[120px] truncate text-sm text-white">
                {ship.assignedUserId ? ship.assignedUserId : 'None'}
              </span>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => handleOpenAddCaptainModal(ship)}
                className="rounded px-2 py-1 text-xs font-semibold transition-colors"
                style={{
                  backgroundColor: theme.accent.gold,
                  color: '#000000',
                }}>
                Add Captain
              </button>
            </div>
          )}
        </TableCell> */}

        {/* Tier Bonus Column */}
        <TableCell
          className="text-right"
          style={{
            padding: '1rem',
            color: theme.text.primary,
          }}>
          {formatPercentage(ship.tierBonus)}
        </TableCell>

        {/* License Column */}
        <TableCell style={{ padding: '1rem' }}>
          <div className="flex flex-col items-center gap-2">
            {licenseStatus}

            <button
              onClick={() => handleOpenLicenseModal(ship)}
              className="mt-1 rounded px-2 py-1 text-xs font-semibold transition-colors"
              style={{
                backgroundColor: 'transparent',
                color: theme.text.gold,
                borderWidth: '1px',
                borderColor: theme.border.light,
              }}
              disabled={
                ship.captainLicense1 &&
                ship.captainLicense2 &&
                ship.captainLicense3
              }>
              {ship.captainLicense1 &&
              ship.captainLicense2 &&
              ship.captainLicense3
                ? 'All Unlocked'
                : 'Buy License'}
            </button>
          </div>
        </TableCell>

        {/* Mission Cost Column */}
        <TableCell className="text-right" style={{ padding: '1rem' }}>
          <span
            className="font-medium"
            style={{
              color: theme.text.primary,
            }}>
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
        </TableCell>

        {/* Reward Column */}
        <TableCell className="text-right" style={{ padding: '1rem' }}>
          <span
            className="font-medium"
            style={{
              color: ship.reward > 0 ? theme.text.gold : theme.text.primary,
            }}>
            {ship.reward.toFixed(2)}
          </span>
        </TableCell>

        {/* Mission Column */}
        <TableCell style={{ padding: '1rem' }}>
          <div className="flex flex-col items-center gap-2">
            {missionStatus}
          </div>
        </TableCell>
      </TableRow>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function to prevent unnecessary re-renders
    const ship = prevProps.ship;
    const nextShip = nextProps.ship;
    const claimingShipId = prevProps.claimingShipId;
    const nextClaimingShipId = nextProps.claimingShipId;

    // Only re-render if relevant props change
    return (
      ship.id === nextShip.id &&
      ship.reward === nextShip.reward &&
      ship.isClaimable === nextShip.isClaimable &&
      ship.isOnMission === nextShip.isOnMission &&
      ship.captainLicense1 === nextShip.captainLicense1 &&
      ship.captainLicense2 === nextShip.captainLicense2 &&
      ship.captainLicense3 === nextShip.captainLicense3 &&
      ship.assignedUserId === nextShip.assignedUserId &&
      ship.tierBonus === nextShip.tierBonus &&
      (claimingShipId === nextClaimingShipId ||
        (ship.id !== claimingShipId && ship.id !== nextClaimingShipId))
    );
  },
);

ShipRow.displayName = 'ShipRow';

// Main ShipsTable component
const ShipsTable: React.FC<ShipsTableProps> = ({
  genesisShips,
  handleOpenAddCaptainModal,
  handleOpenLicenseModal,
  handleOpenMissionModal,
  handleClaimReward,
  claimingShipId = null,
}) => {
  // Use a stable key for the table container to maintain animation identity
  const tableKey = 'genesis-ships-table';

  return (
    <motion.div
      key={tableKey}
      variants={animations.content}
      className="overflow-hidden rounded-lg"
      style={{
        borderColor: theme.border.light,
        borderWidth: '1px',
        background: theme.background.card,
        backdropFilter: 'blur(4px)',
      }}>
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader style={{ background: theme.background.header }}>
            <TableRow
              style={{
                borderBottom: `1px solid ${theme.border.light}`,
              }}>
              <TableHead
                className="text-left font-Header"
                style={{
                  padding: '1rem',
                  color: theme.text.gold,
                }}>
                Ship ID
              </TableHead>
              <TableHead
                className="text-left font-Header"
                style={{
                  padding: '1rem',
                  color: theme.text.gold,
                }}>
                Ship
              </TableHead>
              <TableHead
                className="text-center font-Header"
                style={{
                  padding: '1rem',
                  color: theme.text.gold,
                }}>
                Rarity
              </TableHead>
              <TableHead
                className="text-right font-Header"
                style={{
                  padding: '1rem',
                  color: theme.text.gold,
                }}>
                Speed
              </TableHead>
              {/*               <TableHead
                className="text-center font-Header"
                style={{
                  padding: '1rem',
                  color: theme.text.gold,
                }}>
                Captain
              </TableHead> */}
              <TableHead
                className="text-right font-Header"
                style={{
                  padding: '1rem',
                  color: theme.text.gold,
                }}>
                Durability
              </TableHead>

              <TableHead
                className="text-center font-Header"
                style={{
                  padding: '1rem',
                  color: theme.text.gold,
                }}>
                Licenses
              </TableHead>
              <TableHead
                className="text-right font-Header"
                style={{
                  padding: '1rem',
                  color: theme.text.gold,
                }}>
                Mission Cost
              </TableHead>
              <TableHead
                className="text-right font-Header"
                style={{
                  padding: '1rem',
                  color: theme.text.gold,
                }}>
                Reward
              </TableHead>
              <TableHead
                className="text-center font-Header"
                style={{
                  padding: '1rem',
                  color: theme.text.gold,
                }}>
                Mission
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {genesisShips.map((ship) => (
              <ShipRow
                key={ship.id}
                ship={ship}
                claimingShipId={claimingShipId}
                handleOpenAddCaptainModal={handleOpenAddCaptainModal}
                handleOpenLicenseModal={handleOpenLicenseModal}
                handleOpenMissionModal={handleOpenMissionModal}
                handleClaimReward={handleClaimReward}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};

// Export a memoized version of the component to prevent re-renders when props don't change
export default memo(ShipsTable, (prevProps, nextProps) => {
  // Only re-render if the ships array changes or the claiming state changes
  if (
    prevProps.genesisShips.length !== nextProps.genesisShips.length ||
    prevProps.claimingShipId !== nextProps.claimingShipId
  ) {
    return false; // Not equal, should re-render
  }

  // Check if any ship has changed in relevant ways
  for (let i = 0; i < prevProps.genesisShips.length; i++) {
    const prevShip = prevProps.genesisShips[i];
    const nextShip = nextProps.genesisShips[i];

    if (
      prevShip.id !== nextShip.id ||
      prevShip.reward !== nextShip.reward ||
      prevShip.isClaimable !== nextShip.isClaimable ||
      prevShip.isOnMission !== nextShip.isOnMission ||
      prevShip.captainLicense1 !== nextShip.captainLicense1 ||
      prevShip.captainLicense2 !== nextShip.captainLicense2 ||
      prevShip.captainLicense3 !== nextShip.captainLicense3 ||
      prevShip.assignedUserId !== nextShip.assignedUserId
    ) {
      return false; // Ship changed, should re-render
    }
  }

  return true; // No relevant changes, should not re-render
});
