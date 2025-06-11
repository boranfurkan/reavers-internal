const projectName =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_NAME || 'reavers-56900';
const isDev = process.env.NEXT_PUBLIC_NODE_ENV === 'dev';

// Define project-specific URLs
const projectUrls = {
  'reavers-56900': {
    appEngine: 'https://reavers-56900.ew.r.appspot.com/',
    cloudFunctions: 'https://us-central1-reavers-56900.cloudfunctions.net/',
    workers: [
      'https://staging-dot-default-dot-reavers-56900.ew.r.appspot.com/',
      'https://dev-dot-default-dot-reavers-56900.ew.r.appspot.com/',
      // 'https://dev-dot-reavers-56900.ew.r.appspot.com',
      'https://prod-dot-default-dot-reavers-56900.ew.r.appspot.com/',
      'https://experimental-dot-default-dot-reavers-56900.ew.r.appspot.com/',
    ],
  },
  'reavers-instance-2': {
    appEngine: 'https://reavers-instance-2.ew.r.appspot.com/',
    cloudFunctions:
      'https://us-central1-reavers-instance-2.cloudfunctions.net/',
    workers: [
      'https://staging-dot-default-dot-reavers-instance-2.ew.r.appspot.com/',
      'https://dev-dot-default-dot-reavers-instance-2.ew.r.appspot.com/',
      'https://prod-dot-default-dot-reavers-instance-2.ew.r.appspot.com/',
      'https://experimental-dot-default-dot-reavers-instance-2.ew.r.appspot.com/',
    ],
  },
};

module.exports = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.output.filename = `static/chunks/[name].${Date.now()}.${Math.random()
        .toString(36)
        .substr(2, 9)}.js`;
    }
    return config;
  },
  poweredByHeader: false,
  async headers() {
    const urls = projectUrls[projectName];

    // Build connect-src value
    // Build connect-src value with wildcard to allow all origins
    const connectSrc = [
      "'self'",
      'wss://ws-eu.pusher.com/',
      'https://o4504773506564096.ingest.sentry.io/',
      'https://sockjs-eu.pusher.com/pusher/',
      // Local
      'http://127.0.0.1:5001/',
      'http://localhost:8080/',
      // Google
      'https://identitytoolkit.googleapis.com/',
      'https://securetoken.googleapis.com/',
      // RPC
      'https://api.devnet.solana.com/',
      'https://api.mainnet-beta.solana.com/',
      // Firebase
      'https://firebase.googleapis.com/',
      'https://firebaseinstallations.googleapis.com/',
      // Project specific URLs
      urls.appEngine,
      urls.cloudFunctions,
      ...urls.workers,
      // Cloud function servers
      'https://us-central1-reavers-dev.cloudfunctions.net/',
      'https://us-central1-reavers-staging.cloudfunctions.net/',
      // Google Analytics
      'https://www.google-analytics.com/',
      'https://region1.google-analytics.com/g/collect',
      // XNFT
      'https://swr.xnftdata.com/rpc-proxy/',
      // Dynamic Domains
      'https://dynamic-static-assets.com/',
      'https://app.dynamicauth.com/',
      'https://logs.dynamicauth.com/',
      'wss://relay.walletconnect.com/',
      'wss://relay.walletconnect.org/',
      'wss://ws-eu.pusher.com/',
      'https://api.turnkey.com/',
      'https://rpc.sepolia.org/',
      'https://rpc.ankr.com/',
      // Allow all origins
      '*',
    ].join(' ');

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: `connect-src ${connectSrc}`,
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
          { key: 'X-Download-Options', value: 'noopen' },
          {
            key: 'Access-Control-Allow-Origin',
            value: isDev ? '*' : 'https://reavers.xyz',
          },
        ],
      },
    ];
  },
};
