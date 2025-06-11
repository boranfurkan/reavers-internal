import { PublicKey as Web3JsPublicKey } from '@solana/web3.js';
import type { Umi, UmiPlugin, Signer } from '@metaplex-foundation/umi';
import { signerIdentity, publicKey as umiPublicKey } from '@metaplex-foundation/umi';
import { toWeb3JsTransaction, fromWeb3JsTransaction } from '@metaplex-foundation/umi-web3js-adapters';

/**
 * 1) Define your custom wallet interface, since 
 * '@dynamic-labs/sdk-react-core' no longer exports 'DynamicWallet'.
 */
interface DynamicWallet {
  address?: string; // e.g. a base58 Solana address
  getSigner: () => Promise<{
    signTransaction?: (tx: any) => Promise<any>;
    signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
    signAndSendTransaction?: (tx: any) => Promise<{ transaction: any }>;
    signAllTransactions?: (txs: any[]) => Promise<any[]>;
  }>;
}

/** Helper to fetch the dynamic wallet's signing methods. */
async function getWalletSigner(dynamicWallet: DynamicWallet) {
  try {
    const signer = await dynamicWallet.getSigner();
    if (!signer) {
      throw new Error('No signer available');
    }
    return signer;
  } catch (error) {
    console.error('Error getting signer:', error);
    throw new Error('Failed to get wallet signer');
  }
}

/**
 * 2) Create a Umi `Signer`, 
 *    using `publicKey()` from Umi to create a branded `PublicKey`.
 */
function createDynamicWalletSigner(dynamicWallet: DynamicWallet): Signer {
  // Ensure we have a valid address
  if (!dynamicWallet.address) {
    throw new Error('No wallet address found!');
  }

  // Convert the base58 string to a Web3.js PublicKey
  const web3PublicKey = new Web3JsPublicKey(dynamicWallet.address);
  // Then get a normal Uint8Array
  const bytes = web3PublicKey.toBytes();
  // Then create a Umi-branded PublicKey
  const umiPubKey = umiPublicKey(bytes);

  return {
    publicKey: umiPubKey, // Satisfies Umi's `PublicKey` brand

    // signMessage for signing messages
    signMessage: async (message: Uint8Array) => {
      try {
        const signer = await getWalletSigner(dynamicWallet);

        if (typeof signer.signMessage !== 'function') {
          throw new Error('No signMessage method available');
        }

        return await signer.signMessage(message);
      } catch (err) {
        const e = err as Error;
        console.error('Error signing message:', e);
        throw new Error(`Failed to sign message: ${e.message}`);
      }
    },

    // signTransaction for a single transaction
    signTransaction: async (transaction: any) => {
      try {
        const signer = await getWalletSigner(dynamicWallet);

        // 1) If signTransaction is available, use it
        if (typeof signer.signTransaction === 'function') {
          const web3Tx = toWeb3JsTransaction(transaction);
          const signedTx = await signer.signTransaction(web3Tx);
          return fromWeb3JsTransaction(signedTx);
        }

        // 2) Otherwise fallback to signAndSendTransaction
        if (typeof signer.signAndSendTransaction === 'function') {
          console.log('Using signAndSendTransaction fallback...');
          const web3Tx = toWeb3JsTransaction(transaction);
          const { transaction: signedTx } = await signer.signAndSendTransaction(web3Tx);
          return fromWeb3JsTransaction(signedTx);
        }

        throw new Error('No suitable signing method available');
      } catch (err) {
        const e = err as Error;
        console.error('Error signing transaction:', e);
        throw new Error(`Failed to sign transaction: ${e.message}`);
      }
    },

    // signAllTransactions for multiple transactions
    signAllTransactions: async (transactions: any[]) => {
      try {
        const signer = await getWalletSigner(dynamicWallet);

        if (typeof signer.signAllTransactions !== 'function') {
          throw new Error('No signAllTransactions method available');
        }

        const web3Txs = transactions.map(toWeb3JsTransaction);
        const signedTxs = await signer.signAllTransactions(web3Txs);
        return signedTxs.map(fromWeb3JsTransaction);
      } catch (err) {
        const e = err as Error;
        console.error('Error signing multiple transactions:', e);
        throw new Error(`Failed to sign transactions: ${e.message}`);
      }
    },
  };
}

/**
 * 3) The plugin that sets `umi.identity` to our dynamic wallet for signing
 */
export function createDynamicWalletPlugin(dynamicWallet: DynamicWallet): UmiPlugin {
  return {
    install(umi: Umi) {
      // Convert the dynamic wallet => Umi Signer
      const dynamicSigner = createDynamicWalletSigner(dynamicWallet);
      // Then set as identity via signerIdentity
      umi.use(signerIdentity(dynamicSigner));
    },
  };
}
