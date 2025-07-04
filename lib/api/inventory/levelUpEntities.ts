import { config } from '../../../config';
import { UpgradeType } from '../../../types/Upgrade';

export const levelUpEntities = async ({
  captainId,
  levelUpCount,
  type,
  jwtToken,
}: {
  captainId: string;
  levelUpCount: number;
  type: UpgradeType;
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
      captainId,
      levelUpCount,
      type,
    }),
  });

  const responseBody = await res.json();
  if (res.status !== 200) {
    const errorMessage = responseBody.error;
    throw new Error(errorMessage || 'An error occurred, try again later');
  }
  return responseBody as { jobId: string; message: string };
};
