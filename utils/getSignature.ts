import crypto from "crypto";

export const getSignature = (
  body: string,
): string => {
  const signature = crypto
    .createHmac("sha256", process.env.NEXT_PUBLIC_HMAC_SECRET_KEY!)
    .update(body)
    .digest("hex");

  return signature;
};