let VERSION_NUMBER = 1.031;

type Config = {
  cluster: string;
  worker_server_url: string;
  code_version: string;
  solana_api_endpoint: string;
  notification_channel: string;
  reavers_collection_address: string;
  reavers_collection_verified_creator: string;
  reavers_firebase_collection: string;
  reavers_crew_collection_address: string;
  reavers_ship_collection_address: string;
  last_haven_collection_verified_creator: string;
  brohalla_collection_verified_creator: string;
  elementerra_collection_address: string;
  atoms_collection_address: string;
  asgardians_collection_address: string;
  genesis_ships_collection_address: string;
  items_firebase_collection: string;
  items_collection_address: string;
  saga_sirens_collection_address: string;
  steam_punks_collection_address: string;
  battle_boosters_collection_address: string;
  active_missions_firebase_collection: string;
  past_missions_firebase_collection: string;
  user_firebase_collection: string;
  arrr_mint: string;
  deposit_receiver: string;
  HMAC_SECRET_KEY: string;
};

const projectConfigs: {
  [key: string]: { baseUrl: string; projectId: string };
} = {
  'reavers-56900': {
    baseUrl: 'ew.r.appspot.com',
    projectId: 'reavers-56900',
  },
  'reavers-instance-2': {
    baseUrl: 'ew.r.appspot.com',
    projectId: 'reavers-instance-2',
  },
};

const projectName =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_NAME || 'reavers-56900';
const projectConfig =
  projectConfigs[projectName as keyof typeof projectConfigs];

let config: Partial<Config>;

if (process.env.NEXT_PUBLIC_NODE_ENV !== 'dev') {
  // prod/staging config
  config = <Partial<Config>>{
    code_version: VERSION_NUMBER.toString(),
    cluster: 'mainnet-beta', // "mainnet-beta", "devnet",
    solana_api_endpoint: 'https://api.mainnet-beta.solana.com/',

    // NFTs
    reavers_collection_address: '6P9DSB6ifwTfSjAY6CpEvnHYfk6Sc2iYWSoM2qM4u31f',
    reavers_collection_verified_creator:
      '9jHiwF1p59tPzRqyubn2vvpkX4p1UpXjMUgcZGXuqWiW',
    reavers_firebase_collection: 'reaverNftsProd',
    reavers_crew_collection_address:
      '6qonyhCdRw81hTitpGLN3GpDXVKtitkhKYJLNTdRcPzD',
    reavers_ship_collection_address:
      '33VUGjVn5A8ED3JBuKxvDauHhRX1aaghiBXKx1q85P7U',
    last_haven_collection_verified_creator:
      'DzNM61ZkHj3ABSZuGQnuRGekPJvzK79msKmpcWjuR2WG',
    brohalla_collection_verified_creator:
      '93rdYLiemLiyGwPqVSpjWmtqk3Uy3s7Eexn79jZLycPP',
    elementerra_collection_address:
      '4n4zLe1BcREy9XQyHwSMJJHR4YHn7AgP2dx4jL6X8GGR',
    atoms_collection_address: '9BJetx61aWQa8HEgmEAQBUwiVHa6LBZnT2zEgsN8JnHX',
    asgardians_collection_address:
      '7rQVtfBe78Es2PMaZP7WYRas8vkLNx31zF6mKXDSKbTv',
    genesis_ships_collection_address:
      'GNSSjxPB6QMDPVG8c9p5QGFiEJgZQ3UVsLedoqqn9Tuk',

    // Items
    items_firebase_collection: 'itemNftsProd',
    items_collection_address: 'GiZn32VjwFTUDT1YDYa6j7CTNADF3jiLtM1wEhG4Mag8',
    battle_boosters_collection_address:
      '98Qx86gLXgzNyoMFQQSbRahwAHrPA1FhKFLnyVoJidz9',

    saga_sirens_collection_address:
      'SirKf8Hgo5zX8zHD3RtAJNM2bXR6k5QtPSyzszyhg3r',
    steam_punks_collection_address:
      '73EkNHBQ6U5sBuu7CtNEhokXC2nyrZvSFWbkpNPdhjhv',

    // DB
    active_missions_firebase_collection: 'activeMissionsProd',
    past_missions_firebase_collection: 'pastMissionsProd',
    user_firebase_collection: 'usersProd',

    // ARRR
    arrr_mint: 'bootyAfCh1eSQeKhFaDjN9Pu6zwPmAoQPoJWVuPasjJ',

    // HMAC SECRET
    HMAC_SECRET_KEY:
      '9f8c7e2b3d4a5f6781a0920c3b4e5d6a7f8b9c0d1e2f3456789a0b1c2d3e4f56',
  };

  if (process.env.NEXT_PUBLIC_NODE_ENV === 'staging') {
    config.worker_server_url =
      process.env.NEXT_PUBLIC_LOCAL === 'true'
        ? 'http://localhost:8080/api'
        : `https://staging-dot-default-dot-${projectConfig.projectId}.${projectConfig.baseUrl}/api`;
    config.notification_channel = 'staging';
  } else if (process.env.NEXT_PUBLIC_NODE_ENV === 'prod') {
    config.worker_server_url =
      process.env.NEXT_PUBLIC_LOCAL === 'true'
        ? 'http://localhost:8080/api'
        : `https://prod-dot-default-dot-${projectConfig.projectId}.${projectConfig.baseUrl}/api`;
    config.notification_channel = 'production';
  } else if (process.env.NEXT_PUBLIC_NODE_ENV === 'experimental') {
    config.worker_server_url =
      process.env.NEXT_PUBLIC_LOCAL === 'true'
        ? 'http://localhost:8080/api'
        : `https://experimental-dot-default-dot-${projectConfig.projectId}.${projectConfig.baseUrl}/api`;
    config.notification_channel = 'staging';
  }
} else {
  // dev config
  config = {
    code_version: VERSION_NUMBER.toString(),
    cluster: 'devnet', // "mainnet-beta",
    solana_api_endpoint: 'https://api.devnet.solana.com/',
    // cloud_function_url:
    // 	process.env.NEXT_PUBLIC_CF_LOCAL === 'true'
    // 		? 'http://127.0.0.1:5001/reavers-dev/us-central1/api'
    // 		: 'https://us-central1-reavers-dev.cloudfunctions.net/api',
    worker_server_url:
      process.env.NEXT_PUBLIC_LOCAL === 'true'
        ? 'http://localhost:8080/api'
        : `https://dev-dot-default-dot-${projectConfig.projectId}.${projectConfig.baseUrl}/api`,
    notification_channel: 'development',

    // NFTs
    reavers_collection_address: 'HcJ8Af3BqJHJmhqUheKCSmzqd7p3fGhDr9FXW8fi39F9',
    reavers_collection_verified_creator:
      '81okL1LNrQWx85QhEUmBTYTxb1y5KBqguGdjoqMdWWSZ',
    reavers_firebase_collection: 'reaverNftsDev2',
    reavers_crew_collection_address:
      'AoegLQXfYhqC8NvEMU7yo9y4CoUycCdAbgNqUxXWrgsA',
    reavers_ship_collection_address:
      'J43Vdi9iQzv3JEzdmCsqDQGnvgMcAtfQdcTdFxRjyEAN',
    last_haven_collection_verified_creator:
      'bXQV7dyRJk4oTNXTJzKrAt3iDQutGAusTXzUWHZG1m1',
    brohalla_collection_verified_creator:
      'bXQV7dyRJk4oTNXTJzKrAt3iDQutGAusTXzUWHZG1m1',
    elementerra_collection_address:
      '4n4zLe1BcREy9XQyHwSMJJHR4YHn7AgP2dx4jL6X8GGR',
    atoms_collection_address: '4eabv4F23difr2pPWWPxRNd2td5KAGz9kugbSZaLSLkR',

    saga_sirens_collection_address:
      'SirKf8Hgo5zX8zHD3RtAJNM2bXR6k5QtPSyzszyhg3r',
    steam_punks_collection_address:
      '5heGXTT4unPiFMxVAxEsTL6dZ8UJLc7qiiCYvMuuHFrT',
    asgardians_collection_address:
      '7rQVtfBe78Es2PMaZP7WYRas8vkLNx31zF6mKXDSKbTv',
    genesis_ships_collection_address:
      'GNSSjxPB6QMDPVG8c9p5QGFiEJgZQ3UVsLedoqqn9Tuk',

    // Items
    items_firebase_collection: 'itemNftsDev',
    items_collection_address: 'GRST4KqNANYrcWbgvwQp2ZQj8EWD1Zx99skeExcgr3qR',
    battle_boosters_collection_address:
      '5aYGdPenAASjfRNwwa2Swkoc1qEfYfvrVN6T5qkNjbfc',

    // DB
    active_missions_firebase_collection: 'activeMissionsDev',
    past_missions_firebase_collection: 'pastMissionsDev',
    user_firebase_collection: 'usersDev',

    // ARRR
    arrr_mint: 'CPqXWarLK5C6De3ag9ECprYyhLwALNUYrTMDveyd8R7x',

    // HMAC SECRET
    HMAC_SECRET_KEY:
      '9f8c7e2b3d4a5f6781a0920c3b4e5d6a7f8b9c0d1e2f3456789a0b1c2d3e4f56',
  };
}

export { config };
