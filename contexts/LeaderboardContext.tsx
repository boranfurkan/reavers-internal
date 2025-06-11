import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useUser } from './UserContext';
import { useTreasureLeaderboardNfts } from '../hooks/api/leaderboard/useTreasureLeaderboardNfts';
import { useTreasureLeaderboardUsers } from '../hooks/api/leaderboard/useTreasureLeaderboardUsers';
import { useLeaderboardMe } from '../hooks/api/leaderboard/useLeaderboardMe';
import { useArenaLeaderboard } from '../hooks/api/leaderboard/useArenaLeaderboard';
import { useArenaLeaderboardMe } from '../hooks/api/leaderboard/useArenaLeaderboardMe'; // Import the new hook

interface LeaderboardContextType {
  treasureLeaderboardNfts: ReturnType<typeof useTreasureLeaderboardNfts>;
  treasureLeaderboardUsers: ReturnType<typeof useTreasureLeaderboardUsers>;
  leaderboardMe: ReturnType<typeof useLeaderboardMe>;

  arenaLeaderboard: ReturnType<typeof useArenaLeaderboard>;
  arenaLeaderboardMe: ReturnType<typeof useArenaLeaderboardMe>; // Added type
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  showUserRank: boolean;
  setShowUserRank: Dispatch<SetStateAction<boolean>>;

  arenaModalOpen: boolean;
  setArenaModalOpen: Dispatch<SetStateAction<boolean>>;
}

const LeaderboardContext = createContext<LeaderboardContextType | undefined>(
  undefined,
);

export const useLeaderboardContext = () => {
  if (!useContext(LeaderboardContext)) {
    throw new Error(
      'useLeaderboardContext must be used within a LeaderboardProvider',
    );
  }
  return useContext(LeaderboardContext);
};

export const LeaderboardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const PAGE_LIMIT = 10;
  const user = useUser();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showUserRank, setShowUserRank] = useState(false);
  const [arenaModalOpen, setArenaModalOpen] = useState(false);

  const treasureLeaderboardNfts = useTreasureLeaderboardNfts(PAGE_LIMIT);
  const treasureLeaderboardUsers = useTreasureLeaderboardUsers(PAGE_LIMIT);
  const leaderboardMe = useLeaderboardMe();

  const arenaLeaderboard = useArenaLeaderboard(PAGE_LIMIT);
  const arenaLeaderboardMe = useArenaLeaderboardMe();

  useEffect(() => {
    if (showUserRank) {
      if (user.user) {
        setSearchTerm(user.user.wallet);
      } else {
        setSearchTerm('');
        setShowUserRank(false);
      }
    } else {
      setSearchTerm('');
    }
  }, [showUserRank]);

  return (
    <LeaderboardContext.Provider
      value={{
        treasureLeaderboardNfts,
        treasureLeaderboardUsers,
        arenaLeaderboard,
        leaderboardMe,
        arenaLeaderboardMe,
        searchTerm,
        setSearchTerm,
        showUserRank,
        setShowUserRank,
        arenaModalOpen,
        setArenaModalOpen,
      }}>
      {children}
    </LeaderboardContext.Provider>
  );
};
