import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import base58 from 'bs58';
import { VersionedTransaction } from '@solana/web3.js';
import { config } from '../../config';
import { useAuth } from '../../contexts/AuthContext';

interface DynamicWallet {
  address?: string;
  getSigner: () => Promise<{
    signTransaction?: (
      tx: VersionedTransaction,
    ) => Promise<VersionedTransaction>;
  }>;
}

interface BurnMintedEntityHookReturn {
  burnMintedEntity: (
    mintAddress: string,
    dynamicWallet: DynamicWallet,
  ) => Promise<boolean>;
  isLoading: boolean;
}

export const useBurnMintedEntity = (): BurnMintedEntityHookReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const { jwtToken } = useAuth();

  const burnMintedEntity = useCallback(
    async (
      mintAddress: string,
      dynamicWallet: DynamicWallet,
    ): Promise<boolean> => {
      if (!jwtToken) {
        toast.error('Please log in to burn entity');
        return false;
      }

      if (!dynamicWallet) {
        toast.error('Wallet not connected');
        return false;
      }

      setIsLoading(true);

      try {
        // Step 1: Create burn transaction
        const burnResponse = await fetch(
          `${config.worker_server_url}/nfts/burn-side-nft`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}`,
            },
            body: JSON.stringify({
              mintAddress,
            }),
          },
        );

        if (!burnResponse.ok) {
          const errorData = await burnResponse.json();
          throw new Error(
            errorData.error || 'Failed to create burn transaction',
          );
        }

        const { transaction: rawTransaction } = await burnResponse.json();

        // Step 2: Sign transaction following project pattern
        const decodedTx = base58.decode(rawTransaction);
        const versionedTx = VersionedTransaction.deserialize(decodedTx);

        // Get signer from dynamicWallet (following asset-manager.ts pattern)
        const signer = await dynamicWallet.getSigner();
        if (!signer || typeof signer.signTransaction !== 'function') {
          throw new Error('No valid signer available');
        }

        // Sign transaction
        const signedTx = await signer.signTransaction(versionedTx);
        const serializedTx = signedTx.serialize();
        const encodedTx = base58.encode(serializedTx);

        // Step 3: Confirm the burn with burn-side-nft endpoint
        const confirmResponse = await fetch(
          `${config.worker_server_url}/nfts/handle-assets/burn-side-nft`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}`,
            },
            body: JSON.stringify({
              rawTransaction: encodedTx,
            }),
          },
        );

        if (!confirmResponse.ok) {
          const errorData = await confirmResponse.json();
          throw new Error(errorData.error || 'Failed to confirm entity burn');
        }

        toast.success('Entity successfully burned!');
        return true;
      } catch (error: any) {
        console.error('Error burning minted entity:', error);
        toast.error(error.message || 'Failed to burn entity');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [jwtToken],
  );

  return {
    burnMintedEntity,
    isLoading,
  };
};
