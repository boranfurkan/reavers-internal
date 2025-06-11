// File: lib/api/auth/loginLedger.ts
import { config } from '../../../config';
import { getSignature } from '../../../utils/getSignature';

/**
 * Login with a ledger/hardware wallet using a signed transaction
 */
export const loginWithLedger = async (
  signedTransaction: Buffer | Uint8Array,
) => {
  try {
    const endpoint = `${config.worker_server_url}/auth/login`;

    // Convert to Array for JSON serialization
    const txArray = Array.from(signedTransaction);

    // Create signature using the same format as the old implementation
    const signature = getSignature(
      JSON.stringify({
        isLedger: true,
        serializedTx: txArray,
      }),
    );

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          isLedger: true,
          serializedTx: txArray,
        },
        signature,
      }),
    });

    if (res.status !== 200) {
      const body = await res.text();
      throw new Error('An error occurred, try again later');
    }

    const loginToken = await res.text();
    return { loginToken };
  } catch (e: any) {
    console.error('Ledger login error:', e);
    throw Error(e);
  }
};
