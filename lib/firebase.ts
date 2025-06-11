import { initializeApp, getApp } from 'firebase/app';
import { getApps } from 'firebase/app';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { Analytics, getAnalytics, logEvent } from 'firebase/analytics';
import { isSupported } from 'firebase/analytics';

// Get the project name from environment variable with fallback
const projectName = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_NAME || 'reavers-56900';

// Project-specific configurations
type ProjectConfig = {
  appName: string;
  messagingSenderId: string;
  measurementId: string;
  appId: string;
};

const projectConfigs: { [key: string]: ProjectConfig } = {
  'reavers-56900': {
    appName: 'reavers',
    messagingSenderId: '635778471204', // Firebase project id
    measurementId: 'G-10G5Y47GSL',
    appId: '1:635778471204:web:1da739ac088aaed2508fb1'
  },
  'reavers-instance-2': {
    appName: 'reavers-instance-2',
    messagingSenderId: '628410070716', // Firebase project id
    measurementId: 'G-NQWZ8B9XM3',
    appId: '1:628410070716:web:40f0e2aeb9e257efb342b9'
  }
};

const currentConfig = projectConfigs[projectName];

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: currentConfig.messagingSenderId,
  measurementId: currentConfig.measurementId,
  appId: currentConfig.appId
};

// Initialize Firebase with project-specific app name
const app = getApps.length > 0 
  ? getApp() 
  : initializeApp(firebaseConfig, currentConfig.appName);

let analytics: Analytics | null = null;

if (process.env.NEXT_PUBLIC_NODE_ENV === 'prod') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export const signIn = async (customToken: string) => {
  const firebaseAuth = getAuth(app);
  const credentials = await signInWithCustomToken(firebaseAuth, customToken);

  if (analytics) {
    console.log('Logging sign in');
    logEvent(analytics, 'sign_in');
  }

  return await credentials.user.getIdToken();
};

;