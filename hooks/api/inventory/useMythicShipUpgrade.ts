import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import { config } from '../../../config';
import { useAuth } from '../../../contexts/AuthContext';
import { useUser } from '../../../contexts/UserContext';
import { useNotifications } from '../../../contexts/NotificationContext';

const upgradeToMythicShip = async ({
  captainId,
  jwtToken,
}: {
  captainId: string;
  jwtToken: string;
}) => {
  const endpoint = `${config.worker_server_url}/inventory/upgrade-captain-ship-rarity`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwtToken}`,
    },
    body: JSON.stringify({
      captainId,
    }),
  });

  const responseBody = await res.json();
  if (res.status !== 200) {
    const errorMessage = responseBody.error;
    throw new Error(errorMessage || 'An error occurred, try again later');
  }
  return responseBody as { jobId: string; message: string };
};

export const useMythicShipUpgrade = () => {
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState('');

  const auth = useAuth();
  const { user } = useUser();
  const { notifications } = useNotifications();

  // Handle the upgrade action
  const upgradeMythicShip = useCallback(
    async (captainId: string, captainName?: string) => {
      if (!auth.isLoggedIn || !auth.jwtToken) {
        toast.error('Please log in to upgrade your ship');
        return;
      }

      // Check if user has enough legendary ship tokens (assuming 2 tokens required)
      if (!user?.legendaryShipToken || user.legendaryShipToken < 2) {
        toast.error('You need 2 Legendary Ship Tokens to upgrade to Mythic');
        return;
      }

      setLoading(true);
      try {
        const response = await upgradeToMythicShip({
          captainId,
          jwtToken: auth.jwtToken,
        });

        setJobId(response.jobId);
        toast.success('Ship upgrade to Mythic initiated!');
      } catch (error: any) {
        toast.error(error.message || 'Error during ship upgrade');
        setLoading(false);
      }
    },
    [auth, user?.legendaryShipToken],
  );

  // Monitor job status for notifications
  useEffect(() => {
    if (user?.wallet && jobId !== '') {
      const notification = notifications.find(
        (n) => n.data.id === jobId && n.type === 'captainShipRarityUpgrade',
      );

      if (notification) {
        if (notification.data.error) {
          toast.error(notification.data.message);
        } else {
          toast.success('Successfully upgraded ship to Mythic!');
        }

        // Refresh data
        mutate(`${config.worker_server_url}/users/me`);
        mutate(`${config.worker_server_url}/nfts`);
        mutate(`${config.worker_server_url}/items/fetch-items`);

        setLoading(false);
        setJobId('');
      } else {
        // Handle timeout for long-running jobs
        const timeoutId = setTimeout(() => {
          // Force refresh after timeout
          mutate(`${config.worker_server_url}/users/me`);
          mutate(`${config.worker_server_url}/nfts`);
          mutate(`${config.worker_server_url}/items/fetch-items`);
          setLoading(false);
          toast('Timeout, reloading...');
          setJobId('');
        }, 20000);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [jobId, user?.wallet, notifications]);

  // Reset state when needed
  const resetState = useCallback(() => {
    setLoading(false);
    setJobId('');
  }, []);

  return {
    upgradeMythicShip,
    loading,
    resetState,
  };
};
