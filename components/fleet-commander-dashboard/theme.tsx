import { GenesisShipRarity } from '../../types/Genesis';

export const theme = {
  background: {
    overlay: 'rgba(20, 24, 33, 0.85)',
    card: 'rgba(28, 34, 46, 0.85)',
    header: 'rgba(16, 20, 28, 0.9)',
    highlight: 'rgba(255, 255, 255, 0.03)',
  },
  border: {
    light: 'rgba(255, 215, 0, 0.3)',
    medium: 'rgba(255, 215, 0, 0.5)',
    dark: 'rgba(255, 215, 0, 0.8)',
  },
  text: {
    primary: '#ffffff',
    secondary: '#b3b3b3',
    gold: '#ffd700',
    muted: '#8a8a8a',
  },
  accent: {
    gold: '#ffd700',
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    danger: '#ff4040',
    success: '#4ade80',
  },
  rarity: {
    fleetCommander: {
      bg: 'rgba(76, 29, 149, 0.7)',
      border: '#a855f7',
      text: '#e9d5ff',
    },
    gold: {
      bg: 'rgba(133, 77, 14, 0.7)',
      border: '#fcd34d',
      text: '#ffd700',
    },
    silver: {
      bg: 'rgba(55, 65, 81, 0.7)',
      border: '#c0c0c0',
      text: '#e5e7eb',
    },
    bronze: {
      bg: 'rgba(124, 45, 18, 0.7)',
      border: '#cd7f32',
      text: '#fcd34d',
    },
  },
};

// Animation variants
export const animations = {
  overlay: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
    },
  },
  background: {
    hidden: { opacity: 0, scale: 1.1 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
      opacity: 0,
      scale: 1.1,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  },
  modal: {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
    },
  },
  content: {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.08,
      },
    },
    exit: {
      opacity: 0,
      y: 20,
      transition: { duration: 0.3 },
    },
  },
  header: {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.2,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.3 },
    },
  },
  card: {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  },
};

// Styles for reusable components
export const styles = {
  cardContainer: {
    borderRadius: '0.5rem',
    padding: '1rem',
    backdropFilter: 'blur(8px)',
    background: theme.background.card,
    borderWidth: '1px',
    borderColor: theme.border.light,
  },
  cardTitle: {
    marginBottom: '0.5rem',
    fontSize: '1.125rem',
    color: theme.text.gold,
  },
  divider: {
    height: '1px',
    width: '100%',
    margin: '0.5rem 0',
    background: `linear-gradient(to right, transparent, ${theme.text.secondary}, transparent)`,
  },
  button: {
    backgroundColor: theme.accent.gold,
    color: '#000000',
    fontWeight: 'bold',
    transition: 'all 0.3s',
    '&:hover': {
      backgroundColor: 'rgba(255, 215, 0, 0.8)',
    },
    '&:disabled': {
      opacity: '0.5',
      cursor: 'not-allowed',
    },
  },
  tableHeader: {
    background: theme.background.header,
    borderBottom: `1px solid ${theme.border.light}`,
  },
  tableHeaderCell: {
    padding: '1rem',
    color: theme.text.gold,
    fontFamily: 'Header',
    fontWeight: 'normal',
  },
  tableRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: theme.background.highlight,
    },
  },
  tableCell: {
    padding: '1rem',
  },
};

// Helper function to get rarity styling
export const getRarityStyle = (rarity: GenesisShipRarity) => {
  switch (rarity) {
    case GenesisShipRarity.FLEET_COMMANDER:
      return theme.rarity.fleetCommander;
    case GenesisShipRarity.GOLD:
      return theme.rarity.gold;
    case GenesisShipRarity.SILVER:
      return theme.rarity.silver;
    case GenesisShipRarity.BRONZE:
      return theme.rarity.bronze;
    default:
      return theme.rarity.bronze;
  }
};
