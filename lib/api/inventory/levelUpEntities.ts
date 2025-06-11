import { config } from '../../../config';
import { getSignature } from '../../../utils/getSignature';
export const levelUpEntities = async ({
  type,
  levelUpUid,
  levelUpCount,
  jwtToken,
}: {
  type: string;
  levelUpUid: string;
  levelUpCount: number;
  jwtToken: string;
}) => {
  const endpoint = `${config.worker_server_url}/inventory/level-up-entities`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwtToken}`,
    },
    body: JSON.stringify({
      type,
      levelUpUid,
      levelUpCount,
    }),
  });
  const responseBody = await res.json();
  if (res.status !== 200) {
    const errorMessage = responseBody.error;
    throw new Error(errorMessage || 'An error occurred, try again later');
  }
  return responseBody as { jobId: string; message: string };
};
