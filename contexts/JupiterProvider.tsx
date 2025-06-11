import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Connection, Commitment } from '@solana/web3.js';
import Script from 'next/script';

interface JupiterContextType {
  isScriptLoaded: boolean;
  isScriptLoading: boolean;
  scriptError: string | null;
  getConnection: (rpcUrl: string, commitment: Commitment) => Connection;
}

// Create context
const JupiterContext = createContext<JupiterContextType | undefined>(undefined);

// Connection cache to avoid recreating connections
const connectionCache = new Map<string, Connection>();

// Provider component
export const JupiterProvider = ({ children }: { children: ReactNode }) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isScriptLoading, setIsScriptLoading] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);

  // Add the Jupiter script to the page once
  useEffect(() => {
    if (!isScriptLoaded && !isScriptLoading && typeof window !== 'undefined') {
      // Check if script already exists or Jupiter is already in window
      if (
        window.Jupiter ||
        document.querySelector(
          'script[src="https://terminal.jup.ag/main-v4.js"]',
        )
      ) {
        console.log('Jupiter script already loaded');
        setIsScriptLoaded(true);
        return;
      }

      setIsScriptLoading(true);

      // Manually create and append script
      const script = document.createElement('script');
      script.src = 'https://terminal.jup.ag/main-v4.js';
      script.async = true;

      script.onload = () => {
        console.log('Jupiter script loaded successfully');
        setIsScriptLoaded(true);
        setIsScriptLoading(false);
      };

      script.onerror = (e) => {
        console.error('Error loading Jupiter script:', e);
        setScriptError('Failed to load Jupiter Terminal script');
        setIsScriptLoading(false);
      };

      document.head.appendChild(script);
    }
  }, [isScriptLoaded, isScriptLoading]);

  // Function to get or create a connection
  const getConnection = (
    rpcUrl: string,
    commitment: Commitment,
  ): Connection => {
    const cacheKey = `${rpcUrl}-${commitment}`;

    if (connectionCache.has(cacheKey)) {
      return connectionCache.get(cacheKey)!;
    }

    const connection = new Connection(rpcUrl, {
      commitment,
      confirmTransactionInitialTimeout: 60000,
      disableRetryOnRateLimit: false,
    });

    connectionCache.set(cacheKey, connection);
    return connection;
  };

  // Also add the custom styles once
  useEffect(() => {
    if (isScriptLoaded && typeof window !== 'undefined') {
      // Check if our styles already exist
      if (document.getElementById('jupiter-custom-styles')) {
        return;
      }

      const style = document.createElement('style');
      style.id = 'jupiter-custom-styles';
      style.textContent = `
        /* Override Jupiter Terminal styles to match your app */
        :root {
          --primary-color: white;
          --secondary-color: rgba(255, 255, 255, 0.7);
          --accent-color: rgba(255, 255, 255, 0.1);
          --background-color: transparent;
          --border-color: rgba(255, 255, 255, 0.1);
        }
        
        /* Form inputs and buttons */
        #jupiter-terminal-container button {
          border-radius: 0.5rem !important;
          height: 2.5rem !important;
          transition: all 0.3s ease !important;
        }
        
        #jupiter-terminal-container input {
          background-color: rgba(0, 0, 0, 0.3) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 0.5rem !important;
        }
        
        /* Token selectors */
        #jupiter-terminal-container .jupiter-swap-token-selector {
          background-color: rgba(0, 0, 0, 0.3) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 0.5rem !important;
        }
        
        /* Swap button */
        #jupiter-terminal-container .jupiter-swap-button {
          background-color: rgba(255, 255, 255, 0.9) !important;
          color: black !important;
          border-radius: 0.5rem !important;
          font-weight: 600 !important;
        }
        
        #jupiter-terminal-container .jupiter-swap-button:hover {
          background-color: white !important;
        }
        
        /* Disabled swap button */
        #jupiter-terminal-container .jupiter-swap-button:disabled {
          background-color: rgba(255, 255, 255, 0.1) !important;
          color: rgba(255, 255, 255, 0.5) !important;
        }
        
        /* Container backgrounds */
        #jupiter-terminal-container .jupiter-container {
          background-color: transparent !important;
        }
        
        /* Remove shadows */
        #jupiter-terminal-container * {
          box-shadow: none !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, [isScriptLoaded]);

  return (
    <JupiterContext.Provider
      value={{
        isScriptLoaded,
        isScriptLoading,
        scriptError,
        getConnection,
      }}>
      {children}
    </JupiterContext.Provider>
  );
};

// Hook to use the context
export function useJupiter() {
  const context = useContext(JupiterContext);
  if (context === undefined) {
    throw new Error('useJupiter must be used within a JupiterProvider');
  }
  return context;
}
