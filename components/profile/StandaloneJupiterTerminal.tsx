import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { Commitment } from '@solana/web3.js';
import { useJupiter } from '../../contexts/JupiterProvider';

interface JupiterTerminalProps {
  rpcUrl?: string;
  commitment?: Commitment;
  containerClassName?: string;
  containerStyles?: React.CSSProperties;
  formProps?: {
    initialAmount?: string;
    fixedAmount?: boolean;
    initialInputMint?: string;
    fixedInputMint?: boolean;
    initialOutputMint?: string;
    fixedOutputMint?: boolean;
  };
}

const StandaloneJupiterTerminal: React.FC<JupiterTerminalProps> = ({
  rpcUrl = 'https://margalit-5axa8t-fast-mainnet.helius-rpc.com',
  commitment = 'confirmed',
  containerClassName = '',
  containerStyles = {},
  formProps,
}) => {
  const { isScriptLoaded, isScriptLoading, scriptError, getConnection } =
    useJupiter();
  const [isTerminalLoaded, setIsTerminalLoaded] = useState(false);
  const [error, setError] = useState<string | null>(scriptError);
  const terminalInitialized = useRef(false);
  const containerId = useRef(
    `jupiter-terminal-container-${Math.random().toString(36).substring(2, 9)}`,
  );

  // Get a connection object from our provider
  const connection = useMemo(() => {
    try {
      return getConnection(rpcUrl, commitment);
    } catch (err) {
      console.error('Failed to create Solana connection:', err);
      setError('Failed to connect to Solana network');
      return null;
    }
  }, [rpcUrl, commitment, getConnection]);

  // Initialize Jupiter Terminal
  const initializeTerminal = useCallback(() => {
    // Skip if already initialized (for this specific instance)
    if (terminalInitialized.current) {
      return;
    }

    if (!window.Jupiter || !window.Jupiter.init) {
      setError('Jupiter Terminal not available');
      return;
    }

    if (!connection) {
      setError('Solana connection not established');
      return;
    }

    try {
      // Check if terminal is already initialized
      if (window.Jupiter._instance) {
        // If Jupiter is already initialized but for a different container,
        // we need to close it first
        window.Jupiter.close();
      }

      console.log(
        'Initializing Jupiter Terminal with container ID:',
        containerId.current,
      );
      window.Jupiter.init({
        displayMode: 'integrated',
        integratedTargetId: containerId.current,
        connectionObj: connection,
        enableWalletPassthrough: false,
        ...(formProps && { formProps }),
        containerStyles: {
          borderRadius: '12px',
          boxShadow: 'none',
          ...containerStyles,
        },
        containerClassName: `bg-transparent ${containerClassName}`,
        onSwapError: ({ error }) => {
          console.error('Jupiter Terminal swap error:', error);
        },
        onFormUpdate: () => {
          setIsTerminalLoaded(true);
        },
        onScreenUpdate: () => {
          setIsTerminalLoaded(true);
        },
      });

      terminalInitialized.current = true;

      // Set a timeout to consider the terminal loaded even if callbacks don't fire
      setTimeout(() => {
        setIsTerminalLoaded(true);
      }, 2000);
    } catch (err) {
      console.error('Error initializing Jupiter Terminal:', err);
      setError('Failed to initialize Jupiter Terminal');
    }
  }, [connection, formProps, containerClassName, containerStyles]);

  // Initialize terminal once script is loaded
  useEffect(() => {
    if (isScriptLoaded && !terminalInitialized.current) {
      initializeTerminal();
    }
  }, [isScriptLoaded, initializeTerminal]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (
        terminalInitialized.current &&
        window.Jupiter &&
        window.Jupiter.close
      ) {
        terminalInitialized.current = false;
        window.Jupiter.close();
      }
    };
  }, []);

  // If the script error changes, update our local error
  useEffect(() => {
    if (scriptError) {
      setError(scriptError);
    }
  }, [scriptError]);

  return (
    <div
      className={`relative ${containerClassName}`}
      style={{
        width: '100%',
        minHeight: '500px',
        ...containerStyles,
      }}>
      {error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-black/50 p-4 text-red-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mb-2 h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-center">{error}</p>
          <button
            className="mt-4 rounded-lg border border-white/20 bg-black px-4 py-2 transition-colors hover:bg-white/10"
            onClick={() => {
              setError(null);
              terminalInitialized.current = false;
              initializeTerminal();
            }}>
            Retry
          </button>
        </div>
      )}

      {(isScriptLoading || (!isScriptLoaded && !error)) && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-black/50">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
          <p className="text-sm text-white/70">Loading Jupiter Terminal...</p>
        </div>
      )}

      {!isTerminalLoaded && isScriptLoaded && !error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-black/30">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
          <p className="text-sm text-white/70">Initializing Terminal...</p>
        </div>
      )}

      <div
        id={containerId.current}
        className={`h-full w-full overflow-auto rounded-xl ${
          !isTerminalLoaded ? 'opacity-50' : 'opacity-100'
        } transition-opacity duration-300`}
      />
    </div>
  );
};

export default StandaloneJupiterTerminal;
