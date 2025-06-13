import { GenesisShipRarity } from '../types/Genesis';
import { NFTMaxLevels } from '../types/BaseEntity';
import { CharacterNFT } from '../types/NFT';

// Color mapping constants for reusability and consistency
export const RARITY_COLORS = {
  MYTHIC: {
    gradient: 'linear-gradient(45deg, #4c1d95, #a21caf, #4c1d95)',
    border: '#a855f7', // purple-500
  },
  LEGENDARY: {
    gradient: 'linear-gradient(45deg, #b45309, #eab308, #b45309)',
    border: '#eab308', // yellow-500
  },
  EPIC: {
    gradient: 'linear-gradient(to right, #6d28d9, #9333ea)',
    border: '#a855f7', // purple-500
  },
  RARE: {
    gradient: 'linear-gradient(to right, #1e40af, #2563eb)',
    border: '#3b82f6', // blue-500
  },
  UNCOMMON: {
    gradient: 'linear-gradient(to right, #047857, #16a34a)',
    border: '#22c55e', // green-500
  },
  COMMON: {
    gradient: 'linear-gradient(to right, #4b5563, #64748b)',
    border: '#9ca3af', // gray-400
  },
};

// Strength percentage brackets and corresponding colors
export const STRENGTH_COLORS = {
  MYTHIC: {
    threshold: 70, // 70% and above
    gradient: 'linear-gradient(to right, #0f172a, #a21caf)', // purple-950 to fuchsia-700
    border: '#a21caf', // fuchsia-700
    text: '#e879f9', // bright purple
  },
  LEGENDARY: {
    threshold: 40, // 40-70%
    gradient: 'linear-gradient(to right, #d97706, #eab308)', // amber-600 to yellow-500
    border: '#eab308', // yellow-500
    text: '#fde047', // bright yellow
  },
  EPIC: {
    threshold: 15, // 15-40%
    gradient: 'linear-gradient(to right, #5b21b6, #9333ea)', // violet-800 to purple-600
    border: '#a855f7', // purple-500
    text: '#c084fc', // bright purple
  },
  RARE: {
    threshold: 5, // 5-15%
    gradient: 'linear-gradient(to right, #1e40af, #2563eb)', // blue-800 to blue-600
    border: '#3b82f6', // blue-500
    text: '#60a5fa', // bright blue
  },
  UNCOMMON: {
    threshold: 1, // 1-5%
    gradient: 'linear-gradient(to right, #065f46, #16a34a)', // emerald-800 to green-600
    border: '#22c55e', // green-500
    text: '#4ade80', // bright green
  },
  COMMON: {
    threshold: 0, // 0-1%
    gradient: 'linear-gradient(to right, #374151, #4b5563)', // gray-700 to gray-600
    border: '#9ca3af', // gray-400
    text: '#e5e7eb', // bright gray
  },
};

/**
 * Animation variants for card elements - optimized and standardized
 */
export const animations = {
  // Container animations with staggered children
  containerVariants: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        duration: 0.6,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: 'easeIn',
      },
    },
  },

  // Individual card animations with improved hover effect
  cardVariants: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1], // Custom cubic bezier for a more natural feel
      },
    },
    hover: {
      y: -5,
      scale: 1.02,
      boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1,
      },
    },
  },

  // Loading spinner animation
  spinnerVariants: {
    animate: {
      rotate: 360,
      transition: {
        repeat: Infinity,
        duration: 1,
        ease: 'linear',
      },
    },
  },

  // Fade in animation for empty state
  emptyStateVariants: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.2,
        duration: 0.5,
      },
    },
  },
};

/**
 * Extract entity type and ID from equippedTo string
 * @param equippedTo The equippedTo path string
 * @returns Object containing entity type and ID
 */
const getEquippedEntityInfo = (equippedTo: string | undefined) => {
  if (!equippedTo) return { type: 'Unknown', id: 'Unknown' };

  const parts = equippedTo.split('/');
  if (parts.length !== 2) return { type: 'Unknown', id: 'Unknown' };

  // Map the path to an entity type
  const entityTypeMap: Record<string, string> = {
    reaver: 'Captain',
    ship: 'Ship',
    crew: 'Crew',
  };

  // Extract type from path using the mapping
  const pathLower = parts[0].toLowerCase();
  const entityType =
    Object.keys(entityTypeMap).find((key) => pathLower.includes(key)) ||
    'Unknown';

  return {
    type: entityTypeMap[entityType] || 'Unknown',
    id: parts[1],
  };
};

/**
 * Copy text to clipboard with feedback
 * @param text Text to copy
 * @param toast Toast function for feedback
 */
export const copyToClipboard = (
  text: string,
  toast: (message: string) => void,
) => {
  navigator.clipboard.writeText(text);
  toast('Copied to clipboard');
};

/**
 * Calculate strength percentage relative to potential maximum
 * @param strength Current strength value
 * @param character Character NFT object
 * @returns Percentage of maximum possible strength (0-100)
 */
export const getStrengthPercentage = (
  strength: number,
  character: CharacterNFT,
) => {
  // Calculate theoretical maximum based on character type
  let maxCharLevel = NFTMaxLevels.QM;

  if (character.type === 'FM') {
    maxCharLevel = NFTMaxLevels.FM;
  } else if (character.type === '1/1') {
    maxCharLevel = NFTMaxLevels.UNIQUE;
  }

  // Theoretical maximum: Character (level) * (Crew (level) + 2*Items (level)) * Ship (level)
  const maxCrewLevel = NFTMaxLevels.CREW;
  const maxItemLevel = NFTMaxLevels.ITEM * 2; // Two item slots
  const maxShipLevel = NFTMaxLevels.MYTHIC_SHIP;

  const theoreticalMax =
    maxCharLevel * (maxCrewLevel + maxItemLevel) * maxShipLevel;

  // Return percentage (capped at 100%)
  return Math.min((strength / theoreticalMax) * 100, 100);
};

/**
 * Get background color gradient based on strength percentage
 * @param strengthPercentage Percentage of theoretical maximum strength
 * @returns CSS properties for background gradient
 */
export const getStrengthColor = (
  strengthPercentage: number,
): React.CSSProperties => {
  // Find the highest threshold that the strength percentage exceeds
  for (const [key, data] of Object.entries(STRENGTH_COLORS)) {
    if (strengthPercentage >= data.threshold) {
      return { background: data.gradient };
    }
  }

  // Fallback to COMMON if no matches
  return { background: STRENGTH_COLORS.COMMON.gradient };
};

/**
 * Get border color based on strength percentage
 * @param strengthPercentage Percentage of theoretical maximum strength
 * @returns CSS properties for border color
 */
export const getStrengthBorderColor = (
  strengthPercentage: number,
): React.CSSProperties => {
  // Find the highest threshold that the strength percentage exceeds
  for (const [key, data] of Object.entries(STRENGTH_COLORS)) {
    if (strengthPercentage >= data.threshold) {
      return { borderColor: data.border };
    }
  }

  // Fallback to COMMON if no matches
  return { borderColor: STRENGTH_COLORS.COMMON.border };
};

/**
 * Get gradient background style for rarity display
 * @param rarity Rarity string (e.g., "MYTHIC", "LEGENDARY")
 * @returns CSS properties for gradient background
 */
export const getRarityGradient = (rarity: string): React.CSSProperties => {
  const rarityKey = rarity.toUpperCase() as keyof typeof RARITY_COLORS;
  return {
    background:
      RARITY_COLORS[rarityKey]?.gradient || RARITY_COLORS.COMMON.gradient,
  };
};

/**
 * Get border color style for rarity display
 * @param rarity Rarity string (e.g., "MYTHIC", "LEGENDARY")
 * @returns CSS properties for border color
 */
export const getRarityBorderColor = (rarity: string): React.CSSProperties => {
  const rarityKey = rarity.toUpperCase() as keyof typeof RARITY_COLORS;
  return {
    borderColor:
      RARITY_COLORS[rarityKey]?.border || RARITY_COLORS.COMMON.border,
  };
};

const getGenesisRarityStyle = (
  rarity: GenesisShipRarity,
): React.CSSProperties => {
  switch (rarity) {
    case GenesisShipRarity.FLEET_COMMANDER:
      return {
        background: 'linear-gradient(to bottom, #4c1d95, #6b21a8)', // purple-950 to purple-800
        borderColor: '#a855f7', // purple-500
      };
    case GenesisShipRarity.GOLD:
      return {
        background: 'linear-gradient(to bottom, #713f12, #a16207)', // yellow-900 to yellow-700
        borderColor: '#eab308', // yellow-500
      };
    case GenesisShipRarity.SILVER:
      return {
        background: 'linear-gradient(to bottom, #374151, #4b5563)', // gray-700 to gray-600
        borderColor: '#9ca3af', // gray-400
      };
    case GenesisShipRarity.BRONZE:
      return {
        background: 'linear-gradient(to bottom, #7c2d12, #92400e)', // amber-900 to amber-800
        borderColor: '#d97706', // amber-600
      };
    default:
      return {
        background: 'linear-gradient(to bottom, #111827, #1f2937)', // gray-900 to gray-800
        borderColor: '#6b7280', // gray-500
      };
  }
};
