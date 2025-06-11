import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { PublicKey } from '@solana/web3.js';

/**
 * If we had a more complex `ChainWalletWithPublicKey` type
 * that included `chain`, remove that property now.
 */
type ChainWalletWithPublicKey = {
  address?: string;          // The base58 address for Solana
  publicKey?: PublicKey;     // We'll store a Solana PublicKey here
  // ... any other wallet fields we might need ...
};

/**
 * Define the shape of the "dynamic context" minus primaryWallet,
 * then re-inject our custom wallet type. 
 */
interface DynamicContextWrapperReturn extends Omit<ReturnType<typeof useDynamicContext>, 'primaryWallet'> {
  primaryWallet: ChainWalletWithPublicKey | null;
}

export function useDynamicContextWrapper(): DynamicContextWrapperReturn {
  const dynamicContext = useDynamicContext();
  const { primaryWallet } = dynamicContext;

  let newPrimaryWallet = primaryWallet as ChainWalletWithPublicKey | null;

  // If a Solana wallet is connected, create a new `publicKey`.
  if (newPrimaryWallet && newPrimaryWallet.address) {
    newPrimaryWallet = {
      ...newPrimaryWallet,
      publicKey: new PublicKey(newPrimaryWallet.address),
    };
  }

  return {
    ...dynamicContext,
    primaryWallet: newPrimaryWallet,
  };
}
