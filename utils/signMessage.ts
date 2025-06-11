import bs58 from 'bs58';
import nacl from 'tweetnacl';

interface SignMessageParams {
  domain: string;
  publicKey: string;
  nonce: string;
  statement: string;
}

export class SigninMessage {
  domain: string;
  publicKey: string;
  nonce: string;
  statement: string;

  constructor({ domain, publicKey, nonce, statement }: SignMessageParams) {
    this.domain = domain;
    this.publicKey = publicKey;
    this.nonce = nonce;
    this.statement = statement;
  }

  /**
   * Prepare the message to be signed
   */
  prepare(): string {
    return `${this.statement} | ${this.nonce}`;
  }

  /**
   * Validate a signature against the message
   */
  async validate(signature: string): Promise<boolean> {
    try {
      const msg = this.prepare();
      const msgUint8 = new TextEncoder().encode(msg);

      // Solana chain
      const signatureUint8 = bs58.decode(signature);
      const pubKeyUint8 = bs58.decode(this.publicKey);

      return nacl.sign.detached.verify(msgUint8, signatureUint8, pubKeyUint8);
    } catch (error) {
      console.error('Signature validation error:', error);
      return false;
    }
  }

  /**
   * Convert to JSON for API requests
   */
  toJSON() {
    return {
      domain: this.domain,
      publicKey: this.publicKey,
      nonce: this.nonce,
      statement: this.statement,
    };
  }
}
