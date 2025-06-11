import { config } from '../../../config';
import { getSignature } from '../../../utils/getSignature';
import { SigninMessage } from '../../../utils/signMessage';

export const login = async (message: SigninMessage, msgSignature: string) => {
  try {
    const signinMessage = new SigninMessage(message || {});

    // Validate the signature
    const validationResult = await signinMessage.validate(msgSignature || '');

    if (!validationResult)
      throw new Error('Could not validate the signed message');

    const endpoint = `${config.worker_server_url}/auth/login`;

    const signature = getSignature(
      JSON.stringify({
        signinMessage,
        signature: msgSignature,
      }),
    );

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          signinMessage,
          signature: msgSignature,
        },
        signature,
      }),
    });

    if (res.status !== 200) {
      const body = await res.text();
      throw new Error('An error occurred, try again later');
    }

    const loginToken = await res.text();
    return { loginToken, publicKey: signinMessage.publicKey };
  } catch (e: any) {
    console.log(e);
    throw Error(e);
  }
};
