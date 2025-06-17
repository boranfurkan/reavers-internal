import { config } from '../../../config';

export const levelUpCaptain = async ({
  captainId,
  levelUpCount,
  jwtToken,
}: {
  captainId: string;
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
      captainId,
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
