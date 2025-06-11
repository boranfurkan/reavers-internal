import '../styles/globals.css';
import '../styles/bankingStyle.css';
import '../styles/fonts.css';
import '../styles/markets.css';
import 'overlayscrollbars/overlayscrollbars.css';

import { ThemeProvider } from 'next-themes';
import CssBaseline from '@mui/material/CssBaseline';
import { LayerProvider } from '../contexts/LayerContext';
import { Toaster } from 'sonner';

import '../styles/dumpling.css';
import '../styles/gambling.css';
import '../styles/embla.css';
import { NFTProvider } from '../contexts/NftContext';
import { UserProvider } from '../contexts/UserContext';
import { AuthProvider } from '../contexts/AuthContext';
import { SWRConfig } from 'swr';
import { NotificationProvider } from '../contexts/NotificationContext';
import { LeaderboardProvider } from '../contexts/LeaderboardContext';
import { DomainProvider } from '../contexts/DomainContext';
import { ModalProvider } from '../contexts/ModalContext';

// Import Dynamic providers
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { SolanaWalletConnectors } from '@dynamic-labs/solana';
import { JupiterProvider } from '../contexts/JupiterProvider';

function MyApp({ Component, pageProps }: any) {
  return (
    <SWRConfig
      value={{
        onErrorRetry(err, key, config, revalidate, revalidateOpts) {
          // Not found, don't retry
          if (err.status === 404) return;

          // Stop retrying after 3 times
          if (revalidateOpts.retryCount >= 3) return;

          // Retry after 10 seconds.
          setTimeout(
            () =>
              revalidate({
                retryCount: revalidateOpts.retryCount,
              }),
            10000,
          );
        },
      }}>
      <ThemeProvider attribute="class">
        <DomainProvider>
          <DynamicContextProvider
            theme={'dark'}
            settings={{
              environmentId:
                process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || '',
              walletConnectors: [SolanaWalletConnectors],
              initialAuthenticationMode: 'connect-and-sign',
              // logLevel: 'DEBUG',
            }}>
            <JupiterProvider>
              <AuthProvider>
                <LayerProvider>
                  <UserProvider>
                    <ModalProvider>
                      <NFTProvider>
                        <LeaderboardProvider>
                          <NotificationProvider>
                            <CssBaseline enableColorScheme />
                            <Component {...pageProps} />
                            <div id="modal-root" className="z-[9999]" />
                            {/* Change Notification settings here */}
                            {/* <ToastContainer
                  position="bottom-right"
                  theme="dark"
                  autoClose={5000}
                  hideProgressBar
                  newestOnTop
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                /> */}
                          </NotificationProvider>
                        </LeaderboardProvider>
                        <Toaster
                          expand={false}
                          theme="dark"
                          position="top-center"
                          className="text-center"
                        />
                      </NFTProvider>
                    </ModalProvider>
                  </UserProvider>
                </LayerProvider>
              </AuthProvider>
            </JupiterProvider>
          </DynamicContextProvider>
        </DomainProvider>
      </ThemeProvider>
    </SWRConfig>
  );
}

export default MyApp;
