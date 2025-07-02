import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import { Sheet } from 'react-modal-sheet';
import { useNfts } from '../../../contexts/NftContext';
import { useUser } from '../../../contexts/UserContext';
import { LayerContext } from '../../../contexts/LayerContext';
import { formatPercentage } from '../../../utils/helpers';
import { CharacterNFT } from '../../../types/NFT';
import { Button } from '../../../components/ui/button';
import GoldBarIcon from '../../../assets/gold-bar-icon';

// Animation variants
const animations = {
  header: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
  },
  container: {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: 'auto',
      transition: {
        duration: 0.4,
        ease: 'easeInOut',
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  },
  card: {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  },
};

// Updated theme to match existing UI better
const theme = {
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.6)',
    gold: '#D4AF37',
    muted: 'rgba(255, 255, 255, 0.4)',
  },
  background: {
    card: 'rgba(0, 0, 0, 0.6)',
    header: 'rgba(0, 0, 0, 0.3)',
  },
  border: {
    primary: 'rgba(255, 255, 255, 0.1)',
    hover: 'rgba(255, 255, 255, 0.2)',
  },
};

const styles = {
  headerButton: {
    background: theme.background.header,
    border: `1px solid ${theme.border.primary}`,
    borderRadius: '0.375rem',
    padding: '0.75rem 1rem',
    color: theme.text.primary,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  cardContainer: {
    background: theme.background.card,
    borderRadius: '0.5rem',
    border: `1px solid ${theme.border.primary}`,
    padding: '1rem',
    color: theme.text.primary,
    position: 'relative' as const,
    zIndex: 1,
  },
  cardTitle: {
    marginBottom: '0.75rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: theme.text.gold,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  divider: {
    height: '1px',
    width: '100%',
    margin: '0.5rem 0',
    backgroundColor: theme.border.primary,
  },
};

// StatRow component to match Fleet Commander pattern
interface StatRowProps {
  label: string;
  value: string | number;
  highlight?: boolean;
  icon?: React.ReactNode;
}

const StatRow: React.FC<StatRowProps> = ({
  label,
  value,
  highlight = false,
  icon,
}) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-sm" style={{ color: theme.text.secondary }}>
      {label}
    </span>
    <span
      className="text-sm font-medium"
      style={{ color: highlight ? theme.text.gold : theme.text.primary }}>
      <span className="flex items-center gap-1">
        {value}
        {icon && <span>{icon}</span>}
      </span>
    </span>
  </div>
);

// SummaryCard component to match Fleet Commander pattern
interface SummaryCardProps {
  title: string;
  children: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, children }) => (
  <div style={styles.cardContainer} className="mb-3">
    <h3 style={styles.cardTitle}>{title}</h3>
    <div className="space-y-1">{children}</div>
  </div>
);

// Main component
const InventoryStatistics: React.FC = () => {
  const { charactersInGame, nftsOnMission } = useNfts();
  const { user } = useUser();
  const layerContext = React.useContext(LayerContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  if (!layerContext) {
    throw new Error('InventoryStatistics must be used within a LayerProvider');
  }

  const { isMobile } = layerContext;

  // Calculate comprehensive statistics
  const stats = useMemo(() => {
    const totalCaptains = charactersInGame?.length || 0;
    const captainsOnMission =
      charactersInGame?.filter(
        (captain: CharacterNFT) =>
          captain.currentMission && captain.currentMission !== '',
      ).length || 0;
    const captainsAvailable = totalCaptains - captainsOnMission;

    // Calculate total strength
    const totalStrength =
      charactersInGame?.reduce(
        (sum: number, captain: CharacterNFT) => sum + (captain.strength || 0),
        0,
      ) || 0;

    // Calculate average strength
    const averageStrength =
      totalCaptains > 0 ? totalStrength / totalCaptains : 0;

    // Calculate level statistics
    const totalLevels = {
      captainLevel:
        charactersInGame?.reduce(
          (sum: number, captain: CharacterNFT) => sum + (captain.level || 0),
          0,
        ) || 0,
      shipLevel:
        charactersInGame?.reduce(
          (sum: number, captain: CharacterNFT) =>
            sum + (captain.shipLevel || 0),
          0,
        ) || 0,
      crewLevel:
        charactersInGame?.reduce(
          (sum: number, captain: CharacterNFT) =>
            sum + (captain.crewLevel || 0),
          0,
        ) || 0,
      itemLevel:
        charactersInGame?.reduce(
          (sum: number, captain: CharacterNFT) =>
            sum + (captain.itemLevel || 0),
          0,
        ) || 0,
    };

    // Calculate average levels
    const averageLevels = {
      captain: totalCaptains > 0 ? totalLevels.captainLevel / totalCaptains : 0,
      ship: totalCaptains > 0 ? totalLevels.shipLevel / totalCaptains : 0,
      crew: totalCaptains > 0 ? totalLevels.crewLevel / totalCaptains : 0,
      item: totalCaptains > 0 ? totalLevels.itemLevel / totalCaptains : 0,
    };

    // Calculate captain type distribution
    const captainTypes =
      charactersInGame?.reduce((acc: any, captain: CharacterNFT) => {
        const type = captain.type || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {}) || {};

    // Calculate gold statistics
    const totalGoldBurned =
      charactersInGame?.reduce(
        (sum: number, captain: CharacterNFT) => sum + (captain.goldBurned || 0),
        0,
      ) || 0;

    return {
      totalCaptains,
      captainsOnMission,
      captainsAvailable,
      totalStrength,
      averageStrength,
      totalLevels,
      averageLevels,
      captainTypes,
      totalGoldBurned,
      missionSuccessRate:
        totalCaptains > 0 ? (captainsOnMission / totalCaptains) * 100 : 0,
    };
  }, [charactersInGame]);

  // Quick summary for collapsed state
  const quickSummary = useMemo(() => {
    const totalTokens =
      (user?.captainLevelToken || 0) +
      (user?.shipLevelToken || 0) +
      (user?.crewLevelToken || 0) +
      (user?.itemLevelToken || 0);
    return {
      totalCaptains: stats.totalCaptains,
      totalTokens,
      totalStrength: stats.totalStrength,
      captainsOnMission: stats.captainsOnMission,
    };
  }, [stats, user]);

  // Sheet styling to match inventory filters
  const sheetStyle = {
    background: 'rgba(0, 0, 0, 0.95)',
    color: 'white',
    borderRadius: '12px 12px 0 0',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    maxHeight: '90vh',
    zIndex: 9999,
  };

  // Render statistics cards content (shared between mobile and desktop)
  const renderStatisticsContent = useCallback(
    () => (
      <div
        className={`grid gap-3 ${
          isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-4'
        }`}>
        {/* Token Statistics Card */}
        <SummaryCard title="Level Up Tokens">
          <StatRow
            label="Captain Tokens"
            value={user?.captainLevelToken || 0}
            highlight={true}
            icon={
              <img
                src="/images/captain-level-up-token.webp"
                alt="Ship Token"
                width={24}
                height={24}
              />
            }
          />
          <StatRow
            label="Ship Tokens"
            value={user?.shipLevelToken || 0}
            highlight={true}
            icon={
              <img
                src="/images/ship-level-up-token.webp"
                alt="Ship Token"
                width={24}
                height={24}
              />
            }
          />
          <StatRow
            label="Crew Tokens"
            value={user?.crewLevelToken || 0}
            highlight={true}
            icon={
              <img
                src="/images/crew-level-up-token.webp"
                alt="Crew Token"
                width={24}
                height={24}
              />
            }
          />
          <StatRow
            label="Item Tokens"
            value={user?.itemLevelToken || 0}
            highlight={true}
            icon={
              <img
                src="/images/item-level-up-token.webp"
                alt="Item Token"
                width={24}
                height={24}
              />
            }
          />
          <div style={styles.divider} />
          <StatRow
            label="Total Tokens"
            value={quickSummary.totalTokens}
            highlight={true}
          />
        </SummaryCard>

        {/* Fleet Overview Card */}
        <SummaryCard title="Captain's Overview">
          <StatRow label="Total Captains" value={stats.totalCaptains} />
          <StatRow
            label="On Mission"
            value={`${stats.captainsOnMission} / ${stats.totalCaptains}`}
            highlight={stats.captainsOnMission > 0}
          />
          <StatRow
            label="Available"
            value={`${stats.captainsAvailable} / ${stats.totalCaptains}`}
          />
          <div style={styles.divider} />

          {/* Captain Type Breakdown */}
          {Object.entries(stats.captainTypes).map(([type, count]) => (
            <StatRow key={type} label={`${type}`} value={count as number} />
          ))}
        </SummaryCard>

        {/* Strength & Combat Card */}
        <SummaryCard title="Strength & Combat">
          <StatRow
            label="Total Strength"
            value={stats.totalStrength.toLocaleString()}
            highlight={true}
          />
          <StatRow
            label="Average Strength"
            value={Math.round(stats.averageStrength).toLocaleString()}
          />
          <StatRow
            label="Mission Rate"
            value={`${formatPercentage(stats.missionSuccessRate)}`}
          />
          <div style={styles.divider} />
          <StatRow
            label="Gold Burned"
            value={`${stats.totalGoldBurned.toFixed(0)}`}
            icon={<GoldBarIcon className="h-4 w-4" width={16} height={16} />}
            highlight={true}
          />
        </SummaryCard>

        {/* Level Statistics Card */}
        <SummaryCard title="Average Levels">
          <StatRow
            label="Captain Level"
            value={stats.averageLevels.captain.toFixed(1)}
          />
          <StatRow
            label="Ship Level"
            value={stats.averageLevels.ship.toFixed(1)}
          />
          <StatRow
            label="Crew Level"
            value={stats.averageLevels.crew.toFixed(1)}
          />
          <StatRow
            label="Item Level"
            value={stats.averageLevels.item.toFixed(1)}
          />
          <div style={styles.divider} />
          <StatRow
            label="Combined Total"
            value={Math.round(
              stats.averageLevels.captain +
                stats.averageLevels.ship +
                stats.averageLevels.crew +
                stats.averageLevels.item,
            )}
            highlight={true}
          />
        </SummaryCard>
      </div>
    ),
    [user, stats, quickSummary, isMobile],
  );

  // Mobile sheet content
  const renderMobileSheet = useCallback(
    () => (
      <Sheet
        isOpen={isSheetOpen && isMobile}
        onClose={() => setIsSheetOpen(false)}
        detent="content-height">
        <Sheet.Container style={sheetStyle}>
          <Sheet.Header>
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <h3 className="text-lg font-semibold text-white">
                Captain Statistics
              </h3>
              <button
                onClick={() => setIsSheetOpen(false)}
                className="text-white/70 hover:text-white">
                ✕
              </button>
            </div>
          </Sheet.Header>
          <Sheet.Content>
            <div
              className="overflow-y-auto px-4 pb-8 pt-4"
              style={{ minHeight: '200px' }}>
              {renderStatisticsContent()}
            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop onTap={() => setIsSheetOpen(false)} />
      </Sheet>
    ),
    [isSheetOpen, isMobile, sheetStyle, renderStatisticsContent],
  );

  return (
    <div className="w-full">
      {/* Mobile: Show button that opens sheet */}
      {isMobile ? (
        <>
          <Button
            size="sm"
            onClick={() => setIsSheetOpen(true)}
            className="w-full bg-[#6535c9] hover:bg-[#5425b9]">
            <BarChart3 className="mr-2 h-4 w-4" />
            Captain Statistics
          </Button>
          {renderMobileSheet()}
        </>
      ) : (
        /* Desktop: Show expandable header */
        <>
          <motion.button
            variants={animations.header}
            initial="hidden"
            animate="visible"
            style={styles.headerButton}
            onClick={() => setIsExpanded(!isExpanded)}
            whileHover={{
              borderColor: theme.border.hover,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}>
            <div className="flex items-center gap-3">
              <BarChart3
                className="h-5 w-5"
                style={{ color: theme.text.gold }}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: theme.text.primary }}>
                Captain Statistics
              </span>

              {/* Quick Summary when collapsed */}
              {!isExpanded && (
                <div
                  className="ml-4 flex items-center gap-4 text-xs"
                  style={{ color: theme.text.secondary }}>
                  <span>{quickSummary.totalCaptains} Captains</span>
                  <span>{quickSummary.totalTokens} Tokens</span>
                  <span>{quickSummary.captainsOnMission} On Mission</span>
                  <span>
                    {quickSummary.totalStrength.toLocaleString()} Strength
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center">
              {isExpanded ? (
                <ChevronUp
                  className="h-4 w-4"
                  style={{ color: theme.text.secondary }}
                />
              ) : (
                <ChevronDown
                  className="h-4 w-4"
                  style={{ color: theme.text.secondary }}
                />
              )}
            </div>
          </motion.button>

          {/* Desktop Expandable Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                variants={animations.container}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mt-3 overflow-hidden">
                {renderStatisticsContent()}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default InventoryStatistics;
