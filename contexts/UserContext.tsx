import { createContext, useContext, ReactNode } from 'react';
import { User, HideoutStats } from '../lib/types';
import { useHideout } from '../hooks/api/user/UseHideout';
import { useUserData } from '../hooks/api/user/useUserData';

// Updated UserContextType and default value
interface UserContextType {
  user: User | undefined;
  loading: boolean;
  error: boolean;
  hideoutStats: HideoutStats | undefined;
  hideoutStatsLoading: boolean;
  hideoutStatsError: any;
}

const defaultUserContextValue: UserContextType = {
  user: undefined,
  loading: false,
  error: false,
  hideoutStats: undefined,
  hideoutStatsLoading: false,
  hideoutStatsError: null,
};

const UserContext = createContext<UserContextType>(defaultUserContextValue);

export const useUser = () => {
  return useContext(UserContext);
};

// Update the UserProvider component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: user, error, isLoading: loading } = useUserData();
  const { hideoutStats, hideoutStatsError, hideoutStatsLoading } = useHideout();

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        hideoutStats,
        hideoutStatsLoading,
        hideoutStatsError,
      }}>
      {children}
    </UserContext.Provider>
  );
};
