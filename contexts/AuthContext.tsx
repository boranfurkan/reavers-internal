import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import bs58 from 'bs58';
import { signIn } from '../lib/firebase';
import { config } from '../config';
import { useDynamicContextWrapper } from '../hooks/UseDynamicContextWrapper';
import { SigninMessage } from '../utils/signMessage';
import { login } from '../lib/api/auth/login';
import { loginWithLedger } from '../lib/api/auth/loginLedger';

// Define blacklisted wallets as a constant outside the component
const BLACKLISTED_WALLETS = [
  'GnuDs4noTDNJoVTfHReDoRSZiz3YphYsk6rdMAvPD1X5',
  '2kSJrWMruLty8ChUzxKeKgopZKm1NQD4txXdfDWN6c7h',
  '5p3BAxAUXPabXRzejosYfro6Uxt8wjNNg5xgqZb7aCFa',
  '2kSJrWMruLty8ChUzxKeKgopZKm1NQD4txXdfDWN6c7h',
  'ADXBBVgkgVy9FV31ZbzFQaastpSo5QRQS2BLNrXWhjor',
  'DL7VDhFJHdPGixfemLWapmwuE5mAi1hViDhvs8jwDhHj',
  '6a7k9xtPK9t7irsRZwH2mQeNgNKH5ovDWMMRRLEBWtFU',
  'JBddLqKfCar7S7guBgTQTxpndsUK9ZyzYZiDcwTCmNgR',
  '94r16BFrE21tGJxqSJeE5wLnALa5mraeJLHSwW8knedh',
  '7oatQ7TcXpSYMAPMaWFi86oH68xfHdDXSbPJ2VPk1ZuS',
  '9QRoeXFaEmyfNh3faWFauevCxhNvnA6Zkf4aQAuCWXZk',
  '4hPSQ4pHPM4MqUXtwajaMzqfkWzbBhPANTt9iBoHQn88',
  'EFHePc5CqQ6xUGmXh6jAheVeWXgWwQcvY3whKFweYmTq',
  'DN9R7ty8RyNMfrEz4z6orsAPkvERkz85pSQqRcpxi5MQ',
  'eqiVX3TtXTtdivToDzz1wXGPrBhbX8XkBMjko3i28Wy',
  '3vwFfPF9r4Ky5XieoBNX5nrqros9B6zH5GZV5DsaVfB9',
  'ATvZQaH46XJt4G6hz3zqSigMN4bN3kczD1fbee6VrYtd',
  '3vwFfPF9r4Ky5XieoBNX5nrqros9B6zH5GZV5DsaVfB9',
  '3vwFfPF9r4Ky5XieoBNX5nrqros9B6zH5GZV5DsaVfB9',
  'HuDtqyLYruSDF5aQn8DKZGnXcPkZFDP9EAstnZyP7S1G',
  '4snHxQ6kfYRKJiTbjrWPMuk25Tgb3Yy5T5E2cZCRe5Qz',
  'CF2is5gWWG8TpwyDcXSPVmETyoGZEPiHGPUNL1BTrQf8',
  't5eAFD1HvrRM3QEEzMnnYMszyWnC4rMRsjVMgz7tBnS',
  'EDhWL762D43h3pQEsoU6wZmygT6rMrndZtub8k3DJNFY',
  '512Fy8qqRBsvr6Huvg7ANfmbVNoHRQstsGmejAJAqeGt',
  '6a7k9xtPK9t7irsRZwH2mQeNgNKH5ovDWMMRRLEBWtFU',
  '9uwbKGddmigUzvzF2hKqjT9dnVermVmDJgPgKyaAAQiY',
  'ECwB1u7FNeGN2tHGu9S7vRPDTnjBhTQC3Wka6mKD33UY',
  '7yuh5D9jTJgddvLvHMqXJr252vtJHzuCLX966YCW77X1',
  'C2Y6JEfyKgbwHMvJfwGJMHUFTvo1tCNvDAW29QMqzg5c',
  'ZbDa7ZGDveM6BPdtoHKDQxSKLrnfxib6nQTXQ5bJA6Z',
  '8KFGZB8AQWGizosNvGDDZJbQoTAuSA1fA94y1AR2XqCh',
  '2rbe38M1sbQ7CCCtLzPDgy1izMPFpoFQ7X2Y6E7Uc5Jh',
  'ChrvRqZ2oMsoDoyuwpDXjebaSgatLoBRFEJJuvsu4DNm',
  '7JDFoDmPBJZ59VuvjJGGESBR3M9h1ZwAxDNJgCwLAkBH',
  '69LUezybfyMJNVFTAmxJiDvxHnexCCDSjWBVohfgAQiJ',
  'CHVFMCNGegNvVKKExoRLK3YvzENdvEGP3MTArqQKFjTd',
  'BbMtLT7capUXsKqU2JqQwAzj8jYb1AL37YsLVzqEKTBJ',
  '3Eb6xUrNwGqjRie6q5Vfd67KP7JUe5QycdpNsLu77s24',
  '8LAcHWWhakaEvrgdW4TzWuapCBXtfLzGTY2949GrZ2Qn',
  'ASPW4ULapRXLAWdDy9gXfQvxNLVnoF1ADqPEVq8SGhFv',
  'GL392akqjMVyGdXcjEVsMeA4Fv7fryxQmgmJqv5froaX',
  'DYw4vvyCsfo5MkEL8H5tQ6Wwx8EWfxRvQtYJjTan93um',
  '2ATjVTfBx5WCSkdafmejmrwdQryACYs9dETjE7WWrQjz',
  '52e7z4MLrzpmoL61xL8i1d2yVT4MxbrrUg1op6BpnBnx',
  '52e7z4MLrzpmoL61xL8i1d2yVT4MxbrrUg1op6BpnBnx',
  '9Z8L3XuccgzUgZhm7GUrYtZiGfKgb9AMma7gik8zLkpN',
  '57EqyQvZMpFMLYyvrKbesoivCBjA81crNN7BMMH2Y4jQ',
  '9wRWAu9dooDkL6KTdggyDH9z8E3Sa6C18hrHurdhBorK',
];

async function fetchLatestBlockHash(): Promise<string | undefined> {
  try {
    const res = await fetch(`${config.worker_server_url}/rpc/latestBlockhash`);
    const data = await res.json();
    return data.blockhash;
  } catch (error) {
    console.error('Error fetching latest blockhash:', error);
    return undefined;
  }
}

interface AuthContextType {
  isLoggedIn: boolean;
  loading: boolean;
  error: boolean;
  jwtToken: string | null;
  resetAuth: () => void;
  manualSignIn: () => Promise<void>;
}

const defaultAuthContextValue: AuthContextType = {
  isLoggedIn: false,
  loading: false,
  error: false,
  jwtToken: null,
  resetAuth: () => {},
  manualSignIn: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContextValue);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [authAttempted, setAuthAttempted] = useState(false);

  const { primaryWallet } = useDynamicContextWrapper();

  // Reset auth state
  const resetAuth = useCallback(() => {
    setIsLoggedIn(false);
    setLoading(false);
    setError(false);
    setJwtToken(null);
    setAuthAttempted(false);
  }, []);

  /**
   * Unified sign-in method that handles both normal and hardware wallet flows
   */
  const handleSignIn = useCallback(async (): Promise<void> => {
    // Skip if already logged in or loading or previously attempted
    if (isLoggedIn || loading || authAttempted) return;

    const publicKeyBase58 = primaryWallet?.publicKey?.toBase58?.();
    if (!publicKeyBase58) return;

    // Check blacklist
    if (BLACKLISTED_WALLETS.includes(publicKeyBase58)) {
      console.error('This wallet is blacklisted');
      setError(true);
      setAuthAttempted(true);
      return;
    }

    try {
      setLoading(true);
      setAuthAttempted(true);

      // Get blockhash for nonce
      const blockHash = await fetchLatestBlockHash();
      if (!blockHash) throw new Error('Could not fetch blockhash');

      // Prepare message parameters
      const domain = window.location.host;
      const statement =
        'Arrrr - Sign Message to Login, Sailor! 🏴‍☠️ - Reavers Game';

      // Get connector from Dynamic wallet
      const connector = (primaryWallet as any)?._connector;
      if (!connector) {
        throw new Error('No connector found on primaryWallet');
      }

      // Create signin message
      const message = new SigninMessage({
        domain,
        publicKey: publicKeyBase58,
        statement,
        nonce: blockHash,
      });

      // Prepare the message to sign
      const dataToSign = message.prepare();

      // Try normal signing first, fall back to transaction signing if needed
      try {
        // Standard extension signing flow
        const base64Signature = await connector.signMessage(dataToSign);
        const rawSignature = Uint8Array.from(atob(base64Signature), (c) =>
          c.charCodeAt(0),
        );
        const signature = bs58.encode(rawSignature);

        // Normal sign-in flow (non-hardware wallet)
        const { loginToken } = await login(message, signature);
        const jwt = await signIn(loginToken);

        // Store the JWT token and update login state
        setJwtToken(jwt);
        setIsLoggedIn(true);

        // Clear any previous session data
        sessionStorage.clear();

        console.log('Signed in successfully with regular wallet');
      } catch (err: any) {
        // For hardware wallets: fallback to signMessageViaTransaction
        if (
          err.message?.includes('SignMessageNotSupportedError') ||
          (err.message?.includes('not supported on Phantom hardware') &&
            typeof connector.signMessageViaTransaction === 'function')
        ) {
          console.log(
            'Falling back to transaction-based signing for hardware wallet',
          );

          // Use transaction-based signing
          const result = await connector.signMessageViaTransaction(dataToSign);
          let txBuffer: Buffer | Uint8Array;

          // Process the result based on its format
          if (typeof result === 'object' && result.signature) {
            // Format 1: { signature: base64 }
            txBuffer = decodeBase64(result.signature);
          } else if (typeof result === 'string') {
            try {
              // Try to parse as JSON first
              const parsed = JSON.parse(result);
              if (
                parsed?.signedTransaction?.type === 'Buffer' &&
                Array.isArray(parsed.signedTransaction.data)
              ) {
                txBuffer = Buffer.from(parsed.signedTransaction.data);
              } else {
                // Not a valid format, try as base64
                if (isValidBase64(result)) {
                  txBuffer = decodeBase64(result);
                } else {
                  throw new Error('Unrecognized signature format');
                }
              }
            } catch {
              // Not JSON, try as base64
              if (isValidBase64(result)) {
                txBuffer = decodeBase64(result);
              } else {
                throw new Error('Unrecognized signature format');
              }
            }
          } else {
            throw new Error('Unable to process hardware wallet signature');
          }

          // Use the modified loginWithLedger function
          const { loginToken } = await loginWithLedger(txBuffer);

          // Complete signin using Firebase
          try {
            const jwt = await signIn(loginToken);
            sessionStorage.clear();
            setJwtToken(jwt);
            setIsLoggedIn(true);
            console.log('Signed in successfully with hardware wallet');
          } catch (firebaseError) {
            console.error('Firebase authentication error:', firebaseError);
            setError(true);
            throw new Error('Firebase authentication failed');
          }
        } else {
          // Rethrow if not a hardware wallet error
          throw err;
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, loading, authAttempted, primaryWallet]);

  // Auto login when wallet changes
  useEffect(() => {
    if (!primaryWallet?.publicKey) {
      resetAuth();
      return;
    }

    if (!isLoggedIn && !authAttempted && !loading) {
      handleSignIn().catch(console.error);
    }
  }, [
    primaryWallet?.publicKey,
    isLoggedIn,
    authAttempted,
    loading,
    handleSignIn,
    resetAuth,
  ]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        loading,
        error,
        jwtToken,
        resetAuth,
        manualSignIn: handleSignIn,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

// Helper functions
function isValidBase64(str: string): boolean {
  const base64Regex =
    /^(?:[A-Za-z0-9+/]{4})*?(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  return base64Regex.test(str.trim());
}

function decodeBase64(str: string): Uint8Array {
  if (!isValidBase64(str)) {
    throw new Error(`Invalid base64 string: "${str}"`);
  }
  return Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
}
