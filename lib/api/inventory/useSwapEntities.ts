// hooks/api/inventory/useSwapEntities.ts
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import { config } from '../../../config';
import { useAuth } from '../../../contexts/AuthContext';
import { useUser } from '../../../contexts/UserContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import { SwapEntityRequest, SwapEntitiesResponse } from '../../../types/forge';

const swapEntities = async ({
  entities,
  jwtToken,
}: {
  entities: SwapEntityRequest[];
  jwtToken: string;
}): Promise<SwapEntitiesResponse> => {
  const endpoint = `${config.worker_server_url}/inventory/swap-entity-with-token`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwtToken}`,
    },
    body: JSON.stringify(entities),
  });

  const responseBody = await res.json();
  if (res.status !== 200) {
    const errorMessage = responseBody.error;
    throw new Error(errorMessage || 'An error occurred, try again later');
  }
  return responseBody;
};

export const useSwapEntities = () => {
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState('');

  const auth = useAuth();
  const { user } = useUser();
  const { notifications } = useNotifications();

  // Handle the swap action
  const swapEntitiesWithTokens = useCallback(
    async (entities: SwapEntityRequest[]) => {
      if (!auth.isLoggedIn || !auth.jwtToken) {
        toast.error('Please log in to swap entities');
        return;
      }

      if (!entities || entities.length === 0) {
        toast.error('No entities selected for swapping');
        return;
      }

      // Check if all entities are of the same type for minted restriction
      const entityTypes = Array.from(new Set(entities.map((e) => e.type)));
      if (entityTypes.length > 1) {
        toast.error('All selected entities must be of the same type');
        return;
      }

      setLoading(true);
      try {
        const response = await swapEntities({
          entities,
          jwtToken: auth.jwtToken,
        });

        setJobId(response.jobId || '');
      } catch (error: any) {
        toast.error(error.message || 'Error during entity swap');
        setLoading(false);
      }
    },
    [auth],
  );

  // Monitor job status for notifications
  useEffect(() => {
    if (user?.wallet && jobId !== '') {
      const notification = notifications.find(
        (n) => n.data.id === jobId && n.type === 'swapEntities',
      );

      if (notification) {
        if (notification.data.error) {
          toast.error(notification.data.message);
        } else {
          toast.success('Successfully swapped entities with tokens!');
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
    swapEntitiesWithTokens,
    loading,
    resetState,
  };
};
