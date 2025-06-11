module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: [
    'border-common-outside',
    'border-common-inside',
    'border-uncommon-outside',
    'border-uncommon-inside',
    'border-rare-outside',
    'border-rare-inside',
    'border-epic-outside',
    'border-epic-inside',
    'border-legendary-outside',
    'border-legendary-inside',
    'border-mythic-outside',
    'border-mythic-inside',

    'shadow-uncommon-inside',
    'shadow-rare-outside',
    'shadow-rare-inside',
    'shadow-epic-outside',
    'shadow-epic-inside',
    'shadow-legendary-outside',
    'shadow-legendary-inside',
    'shadow-mythic-outside',
    'shadow-mythic-inside',

    'bg-common',
    'bg-uncommon',
    'bg-rare',
    'bg-epic',
    'bg-legendary',
    'bg-mythic',

    'text-common',
    'text-uncommon',
    'text-rare',
    'text-epic',
    'text-legendary',
    'text-mythic',

    'border-burnTop1',
    'border-burnTop2',
    'border-burnTop3',
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        Header: 'adorn_condensed_sansregular',
        Body: 'proto_monoregular',
        SemiBold: 'proto_monosemibold',
      },
      colors: {
        black: '#000407',
        'reavers-main': '',
        'reavers-bg': '#000407',
        'reavers-bg-secondary': '#0E0F10',
        'reavers-fill': '#06B8FF',
        'reavers-stroke': '#96E7FF',
        'reavers-border': '#FFFFFF30', // #979797
        profile: '#979797',
        'reavers-rare': '#FFC648',
        'reavers-chat': '#90EBB6',
        'common-fill': '#D8D8D8',
        'common-stroke': '',
        'uncommon-fill': '#1683EA',
        'uncommon-stroke': '#6BD0FF',
        'rare-fill': '#FF9E0B',
        'rare-stroke': '#FFC648',
        'epic-fill': '#8A0BFF',
        'epic-stroke': '#B360FF',
        'legendary-fill': '#fb8c42',
        'legendary-stroke': '',
        'grail-fill': '',
        'card-dark-bg': '#33363D',
        'grail-stroke': '',
        'reavers-outline': 'rgba(255, 255, 255, 0.1)',
        'profile-stroke': '#ffffff1a',
        'failed-mission': '#f9496b',
        'success-mission': '#19d362',
        'treasure-primary': '#f3b657f9',
        'claim-green': '#259451',
        'activity-success': '#1ca451',
        'activity-fail': '#b8334d',
        'luck-fill': '#ea9c162b',
        'luck-stroke': '#ffbd35',
        'mutiny-status': '#b87333',
        'teams-main': '#906ffb',
        'item-yield': '#6BD0FF',
        'item-luck': '#ffbd35',
        'item-strength': '#FF4136',
        'item-battle': '#03FFFA',
        'first-rank': '#FFD322',
        'second-rank': '#D4D4D4',
        'third-rank': '#B79077',
        'buy-btn': '#6535c9',
        'gems-green': '#19D362',
        'token-yellow': '#FFBD35',
        'plunders-orange': '#ffbd35',
        'raids-red': '#ff5400',
        'events-bg': '#01FFF9',
        'coin-flip-primary': '#f0c502',
        gold: '#e09509',
        card: {
          'selected-bg': '#4a239a33',
          'not-selected-bg': '#d8d8d81a',

          'selected-border': '#9b6afd',
          'selected-border-hover': '#C3A5FD',

          'not-selected-border': '#ffffff4d',
          'not-selected-border-hover': '#ffffff33',
        },
        'dark-purple': '#25124D',
        dashboard: {
          // Dark/Black shades
          black: '#0A101A',

          // Navy Blue shades
          navy: {
            DEFAULT: '#0C1F34',
            dark: '#102945',
            light: '#203656',
          },

          // Grey shades
          grey: {
            light: '#CFCED0',
            DEFAULT: '#B3B3B3',
            dark: '#838383',
          },

          // Gold/Accent colors
          gold: {
            DEFAULT: '#C18D21',
            light: '#FFD700',
            dark: '#8B6914',
          },

          bronze: {
            DEFAULT: '#6A3805',
          },
          // Background gradients/overlays
          overlay: {
            light: 'rgba(12, 31, 52, 0.8)',
            dark: 'rgba(10, 16, 26, 0.9)',
          },
        },
        arena: {
          // Deep, rich colors for a pirate theme
          dark: '#1A0F0F', // Deep burgundy black
          navy: '#1C2833', // Dark navy blue
          copper: '#B87333', // Antique copper
          bronze: '#CD7F32', // Bronze
          gold: '#FFD700', // Treasure gold
          cream: '#F5DEB3', // Weathered parchment
          wood: '#8B4513', // Ship's wood
          text: '#D4AF37', // Aged gold text
          accent: '#C17817', // Rum barrel brown
        },
      },
      backgroundImage: {
        'layer-1': "url('/images/maps/island-1-icon.webp')",
        'logged-out': "url('/images/logged-out2x.webp')",
        'leaderboard-header': "url('/images/leaderboard-header.webp')",
        'first-rank-gradient':
          'linear-gradient(270deg, rgba(255, 221, 129, 0.00) 0%, rgba(255, 221, 129, 0.30) 100%)',
        'scrollable-gradient':
          'linear-gradient(0deg, rgba(0,0,0, 0.7) 20%, rgba(0,0,0, 0) 100%)',
        'second-rank-gradient':
          'linear-gradient(90deg, rgba(202, 202, 202, 0.30) 0%, rgba(202, 202, 202, 0.00) 100%)',
        'third-rank-gradient':
          'linear-gradient(270deg, rgba(215, 173, 157, 0.00) 0.07%, rgba(215, 173, 157, 0.30) 100%)',
        loginGradient:
          'linear-gradient(90deg, #000 0%, #000 14%, rgba(0, 0, 0, 0.00) 100%)',
        activityFeedGradient:
          'linear-gradient(90deg, #000 0%, #000 14%, rgba(0, 0, 0, 0.55) 100%)',
        'activity-gradient': "url('/images/activity-bg.png')",
        'risk-image-bg': "url('/images/risk-bg-image.webp')",
        'risk-image-mission-failed': "url('/images/mission-failed-risk.webp')",
        'boss-locked-bg': "url('/images/locked-boss.webp')",
        'one-x-gradient': 'linear-gradient(to bottom, #1b1d1c, #10411a)',
        'seven-x-gradient': 'linear-gradient(to bottom, #1b1b1d, #102241)',
        'fifteen-x-gradient': 'linear-gradient(to bottom, #1b1b1d, #291041)',
      },
      animation: {},
      scale: {
        50: '0.5',
        100: '1.0',
      },
      screens: {},
      boxShadow: {
        reavers: '0px 0px 4px 0px #96E7FF',
        'reavers-shadow2': '0px 0px 4px 0px #28323C',
        'boss-battle':
          '-10px 0 14px 0 rgba(0, 0, 0, 0.5), -6px 0 14px 0 rgba(0, 0, 0, 0.5)',
        'boss-battle2':
          '-9px 0 10px 0 rgba(0, 0, 0, 0.5), -6px 0 6px 0 rgba(0, 0, 0, 0.5)',
        'layer-change':
          '0 0 0 1px rgba(255, 255, 255, 0.7), 0 0 0 3px rgba(255, 255, 255, 0.1)',
        mission: '0 0 0 3px rgba(255, 255, 255, 0.16)',
        'uncommon-inside': '0 2px 13px 0px rgba(141, 86, 255, 0.34)',
        'rare-outside': '0 2px 200px 0px rgba(70, 126, 255, 0.5)',
        'rare-inside': '0 2px 13px 0px rgba(141, 86, 255, 0.34)',
        'epic-outside': '0 2px 200px 0px rgba(130, 70, 255, 0.5)',
        'epic-inside': '0 2px 13px 0px rgba(141, 86, 255, 0.34)',
        'legendary-outside': '0 2px 200px 0px rgba(255, 151, 70, 0.5)',
        'legendary-inside': '0 2px 13px 0px rgba(255, 197, 86, 0.34)',
        'mythic-outside': '0 2px 200px 0px rgba(255, 86, 105, 0.5)',
        'mythic-inside': '0 2px 13px 0px rgba(255, 86, 105, 0.34)',
      },
      gridTemplateColumns: {
        reavers: 'repeat(auto-fill, minmax(470px, 470px));',
        crews: 'repeat(auto-fill, minmax(212px, 212px));',
        ships: 'repeat(auto-fill, minmax(212px, 212px));',
      },
      borderColor: {
        'common-outside': '#4c4c4c',
        'common-inside': 'rgba(255, 255, 255, 0.22)',
        'uncommon-outside': '#19d362',
        'uncommon-inside': '#19d362',
        'rare-outside': '#6bd0ff',
        'rare-inside': '#6bd0ff',
        'epic-outside': '#8d56ff',
        'epic-inside': '#8d56ff',
        'legendary-outside': '#ffbd35',
        'legendary-inside': '#ffbd35',
        'mythic-outside': '#ff5669',
        'mythic-inside': '#ff5669',
        'item-yieldLuck': '#A1C9B6',
        burnTop1: '#ffb344',
        burnTop2: '#a5a5a5',
        burnTop3: '#9b5b37',
      },
      backgroundColor: {
        common: 'rgba(255, 255, 255, 0.17)',
        uncommon: '#15271e',
        rare: '#151c27',
        epic: '#161527',
        legendary: 'rgba(78, 57, 36, 0.35)',
        mythic: 'rgba(255, 86, 105, 0.2)',
        'item-yieldLuck': '#A1C9B6',
      },
      textColor: {
        'item-yield': '#6bd0ff',
        'luck-yield': '#ffbd35',
        common: '#a1a1a1',
        uncommon: '#19d362',
        rare: '#6bd0ff',
        epic: '#9b6aff',
        'item-yieldLuck': '#A1C9B6',
        legendary: '#ffbd35',
        mythic: '#ff5469',
      },
    },
  },
  plugins: [require('daisyui'), require('@tailwindcss/forms')],
};
