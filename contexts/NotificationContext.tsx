import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
  useCallback,
  use,
} from 'react';
import Pusher from 'pusher-js';
import { config } from '../config';
import { useUser } from './UserContext';
import { toast } from 'sonner';
import { mutate } from 'swr';

interface NotificationContextType {
  notifications: NotificationData[];
  toastId: string;
  setToastId: (id: string) => void;
}

interface NotificationData {
  type: string;
  data: {
    success: boolean;
    message: string;
    details: string;
    id: string;
    result?: any;
    error?: boolean;
    tickets?: number;
    levelUpCount?: number;
  };
}

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  toastId: '',
  setToastId: () => {},
});

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [toastId, setToastId] = useState<string>('');
  const [lastNotification, setLastNotification] = useState<NotificationData>();
  const user = useUser();

  useEffect(() => {
    if (!user.user?.wallet) return;
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY ?? '', {
      cluster: 'eu',
      forceTLS: true,
    });

    const channel = pusher.subscribe(user.user.wallet);

    channel.bind(
      `notification-${config.notification_channel}`,
      function (data: NotificationData) {
        setNotifications((prevNotifications) => [...prevNotifications, data]);
        if (data.type === 'deposit' || data.type === 'withdraw') {
          if (data.data.message === 'Success') {
            setLastNotification(data);
            mutate(`${config.worker_server_url}/users/me`);
          } else {
            setLastNotification(data);
          }
        }
      },
    );

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [user.user?.wallet]);

  useEffect(() => {
    if (lastNotification) {
      if (lastNotification.data.message === 'Success') {
        toast.success(lastNotification.data.message, {
          id: toastId,
        });
        setTimeout(() => {
          toast.dismiss(toastId);
        }, 2000);
      } else {
        toast.error(lastNotification.data.message, {
          id: toastId,
        });
        setTimeout(() => {
          toast.dismiss(toastId);
        }, 2000);
      }
    }
  }, [lastNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        toastId,
        setToastId,
      }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  if (!useContext(NotificationContext)) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider',
    );
  }
  return useContext(NotificationContext);
};
