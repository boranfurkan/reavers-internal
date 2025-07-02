import { NFTMaxLevels, NFTType } from '../types/BaseEntity';

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

// FIXED: Restored original strength percentage brackets
export const STRENGTH_COLORS = {
  MYTHIC: {
    threshold: 100, // 70% and above - RESTORED
    gradient: 'linear-gradient(to right, #0f172a, #a21caf)', // purple-950 to fuchsia-700
    border: '#a21caf', // fuchsia-700
    text: '#e879f9', // bright purple
  },
  LEGENDARY: {
    threshold: 75, // 40-70% - RESTORED
    gradient: 'linear-gradient(to right, #d97706, #eab308)', // amber-600 to yellow-500
    border: '#eab308', // yellow-500
    text: '#fde047', // bright yellow
  },
  EPIC: {
    threshold: 50, // 15-40% - RESTORED
    gradient: 'linear-gradient(to right, #5b21b6, #9333ea)', // violet-800 to purple-600
    border: '#a855f7', // purple-500
    text: '#c084fc', // bright purple
  },
  RARE: {
    threshold: 25, // 5-15% - RESTORED
    gradient: 'linear-gradient(to right, #1e40af, #2563eb)', // blue-800 to blue-600
    border: '#3b82f6', // blue-500
    text: '#60a5fa', // bright blue
  },
  UNCOMMON: {
    threshold: 10, // 1-5% - RESTORED
    gradient: 'linear-gradient(to right, #065f46, #16a34a)', // emerald-800 to green-600
    border: '#22c55e', // green-500
    text: '#4ade80', // bright green
  },
  COMMON: {
    threshold: 5, // 0-1% - RESTORED
    gradient: 'linear-gradient(to right, #374151, #4b5563)', // gray-700 to gray-600
    border: '#9ca3af', // gray-400
    text: '#e5e7eb', // bright gray
  },
};

/**
 * Animation variants for card elements - optimized and standardized
 */
const animations = {
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
 * FIXED: Restored original getStrengthPercentage function
 * Calculate strength percentage relative to potential maximum
 * @param strength Current strength value
 * @param character Character NFT object
 * @returns Percentage of maximum possible strength (0-100)
 */
export const getStrengthPercentage = (strength: number) => {
  const maxCharLevel = NFTMaxLevels.UNIQUE_CAPTAIN;
  const maxCrewLevel = NFTMaxLevels.CREW;
  const maxItemLevel = NFTMaxLevels.ITEM;
  const maxShipLevel = NFTMaxLevels.MYTHIC_SHIP;

  const theoreticalMax =
    maxCharLevel * (maxCrewLevel + maxItemLevel) * maxShipLevel;

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

export const ITEM_LEVEL_UP_COST_GOLD = 1800;
export const CREW_LEVEL_UP_COST_GOLD = 1800;
export const SHIP_LEVEL_UP_COST_GOLD = 3000;
export const CAPTAIN_LEVEL_UP_COST_GOLD = 3000;

export const ITEM_LEVEL_UP_DURATION = 12;
export const CREW_LEVEL_UP_DURATION = 12;
export const SHIP_LEVEL_UP_DURATION = 24;
export const CAPTAIN_LEVEL_UP_DURATION = 24;

export enum GOLD_LEVEL_UP_COST {
  ITEM = ITEM_LEVEL_UP_COST_GOLD,
  CREW = CREW_LEVEL_UP_COST_GOLD,
  SHIP = SHIP_LEVEL_UP_COST_GOLD,
  CAPTAIN = CAPTAIN_LEVEL_UP_COST_GOLD,
}

export enum LEVEL_UP_DURATION {
  ITEM = ITEM_LEVEL_UP_DURATION,
  CREW = CREW_LEVEL_UP_DURATION,
  SHIP = SHIP_LEVEL_UP_DURATION,
  CAPTAIN = CAPTAIN_LEVEL_UP_DURATION,
}

export const getGoldCostForLevelUpNewVersion = (
  type: NFTType,
  prevLevel: number,
  newLevel: number,
) => {
  const typeCost: number =
    GOLD_LEVEL_UP_COST[type as keyof typeof GOLD_LEVEL_UP_COST];

  if (typeCost !== undefined && typeCost !== null) {
    let totalGoldCost = 0;

    for (let level = prevLevel + 1; level <= newLevel; level++) {
      totalGoldCost += typeCost;
    }

    return totalGoldCost;
  } else {
    throw new Error(`Couldn't fetch costs for ${type}`);
  }
};

export const calculateEndtimeForEventsNewVersion = (
  type: NFTType,
  prevLevel: number,
  newLevel: number,
) => {
  const typeDuration: number =
    LEVEL_UP_DURATION[type as keyof typeof LEVEL_UP_DURATION];

  if (typeDuration) {
    let totalHours = 0;

    for (let level = prevLevel + 1; level <= newLevel; level++) {
      totalHours += typeDuration;
    }

    return totalHours;
  } else {
    throw new Error(`Couldn't fetch durations for ${type}`);
  }
};
