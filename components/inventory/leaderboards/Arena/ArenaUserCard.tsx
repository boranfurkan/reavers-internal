import React, { useContext, useEffect, useState } from 'react';
import Image from 'next/image';
import { Spin } from 'antd';
import { useAuth } from '../../../../contexts/AuthContext';
import { NotificationContext } from '../../../../contexts/NotificationContext';
import { useUser } from '../../../../contexts/UserContext';
import { config } from '../../../../config';
import { toast } from 'sonner';
import { mutate } from 'swr';
import TreasureIcon from '../../../../assets/treasure-icon';
import { ArenaLeaderboardMeResponse } from '../../../../lib/types';
import { useLeaderboardContext } from '../../../../contexts/LeaderboardContext';
import { LayerContext } from '../../../../contexts/LayerContext';

const HorizontalArenaCard = ({
  data,
}: {
  data: ArenaLeaderboardMeResponse | undefined;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [jobId, setJobId] = useState('');

  const layerContext = useContext(LayerContext);
  if (!layerContext) {
    throw new Error('LayerMap must be used within a LayerProvider');
  }

  const { setProfileModalOpen } = layerContext;

  const auth = useAuth();
  const { notifications } = useContext(NotificationContext);
  const arenaLeaderboardContext = useLeaderboardContext();

  const { user } = useUser();
  const handleClaim = async () => {
    if (!data?.arenaNft?.nftId) return;

    setIsLoading(true);
    try {
      const idToken = auth.jwtToken;
      const res = await fetch(`${config.worker_server_url}/arena/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          nftuid: data?.arenaNft?.nftId,
          action: false,
        }),
      });

      const responseBody = await res.json();
      if (res.status !== 200) {
        throw new Error(
          responseBody.error || 'An error occurred, try again later',
        );
      }
      setJobId(responseBody.jobId);
    } catch (error) {
      setIsLoading(false);
      toast.error((error as Error).message);
    }
  };

  useEffect(() => {
    if (user?.wallet && jobId !== '') {
      const notification = notifications.find(
        (n) => n.data.id === jobId && n.type === 'arena',
      );

      if (notification) {
        if (notification.data.error) {
          toast.error(notification.data.message);
        } else {
          toast.success('Successfully claimed The Arena Rewards');
        }

        mutate(`${config.worker_server_url}/users/me`);
        mutate(`${config.worker_server_url}/arena/leaderboard/me`);
        mutate(`${config.worker_server_url}/arena/leaderboard`);
        mutate(`${config.worker_server_url}/nfts`);
        setIsLoading(false);
        arenaLeaderboardContext?.setArenaModalOpen(false);
        setJobId('');
      } else {
        const timeoutId = setTimeout(() => {
          mutate(`${config.worker_server_url}/users/me`);
          mutate(`${config.worker_server_url}/arena/leaderboard/me`);
          mutate(`${config.worker_server_url}/arena/leaderboard`);
          mutate(`${config.worker_server_url}/nfts`);
          setIsLoading(false);
          toast('Timeout, reloading...');
          setJobId('');
        }, 20000);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [jobId, user?.wallet, notifications]);

  if (!data) {
    return (
      <div className="w-full p-4 sm:p-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <h3 className="text-lg font-bold text-orange-500 sm:text-2xl">
            Connect Discord to Join The Arena
          </h3>
          <p className="text-sm text-white/80 sm:text-base">
            Link your Discord account to participate in The Arena and earn
            rewards!
          </p>
          <button
            className="rounded-lg border border-orange-500/50 bg-orange-500/20 px-4 py-2 text-sm text-orange-500 hover:bg-orange-500/30 sm:px-6 sm:py-3 sm:text-base"
            onClick={() => {
              setProfileModalOpen(true);
            }}>
            Connect Discord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden transition-all">
      <div className="flex flex-col border-b border-orange-500/20 md:flex-row">
        {/* Left Section - Image */}
        <div className="w-full border-b border-orange-500/20 p-4 sm:p-6 md:w-1/3 md:border-b-0 md:border-r">
          {data.arenaNft ? (
            <div className="relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 border-orange-500/30 shadow-lg transition-transform hover:scale-[1.02]">
              <Image
                src={data.arenaNft.nftImage}
                alt={data.arenaNft.nftName}
                layout="fill"
                objectFit="cover"
              />
            </div>
          ) : (
            <div
              className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-orange-500/30 transition-all hover:border-orange-500/50"
              onClick={() => arenaLeaderboardContext?.setArenaModalOpen(true)}>
              <div className="text-center">
                <div className="text-4xl text-orange-500/50">+</div>
                <p className="mt-2 text-orange-500/80">Send NFT to Arena</p>
              </div>
            </div>
          )}
        </div>

        {/* Middle Section - User Info & Stats */}
        <div className="flex-1 p-4 sm:p-6">
          <h2 className="mb-4 text-xl font-bold text-yellow-400 sm:text-4xl">
            {data.username}
          </h2>

          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border-2 border-orange-500/20 bg-black/40 p-4 transition-all hover:border-orange-500/40">
              <p className="mb-1 text-xs uppercase text-orange-500/80 sm:text-sm">
                Level
              </p>
              <p className="text-lg font-bold text-yellow-400 sm:text-xl">
                {data.level.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border-2 border-orange-500/20 bg-black/40 p-4 transition-all hover:border-orange-500/40">
              <p className="mb-1 text-xs uppercase text-orange-500/80 sm:text-sm">
                XP
              </p>
              <p className="text-lg font-bold text-yellow-400 sm:text-xl">
                {data.xp.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border-2 border-orange-500/20 bg-black/40 p-4 transition-all hover:border-orange-500/40">
              <p className="mb-1 text-xs uppercase text-orange-500/80 sm:text-sm">
                Battles Won
              </p>
              <p className="text-lg font-bold text-yellow-400 sm:text-xl">
                {data.totalMessages.toLocaleString()}
              </p>
            </div>
          </div>

          <h3 className="mb-4 text-lg font-bold text-orange-500 sm:text-3xl">
            Rank #{data.rank}
          </h3>

          {data.arenaNft ? (
            <div className="rounded-lg border-2 border-orange-500/30 bg-orange-500/10 p-4 sm:p-6">
              <h3 className="text-base font-bold text-yellow-400 sm:text-xl">
                {data.arenaNft.nftName}
              </h3>
              <p className="mt-2 flex items-center justify-center gap-2 text-sm text-white/80 sm:text-lg">
                Reward: {data.arenaNft.reward.toFixed(2)}
                <TreasureIcon width={20} height={20} />
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-4">
              <p className="text-orange-500/80">No NFT in Arena</p>
              <p className="mt-1 text-xs text-white/60 sm:text-sm">
                Send an NFT to start earning rewards!
              </p>
            </div>
          )}
        </div>

        {/* Right Section - Actions */}
        <div className="flex w-full flex-col justify-center border-t border-orange-500/20 p-4 sm:p-6 md:w-48 md:border-l md:border-t-0">
          <button
            onClick={handleClaim}
            disabled={isLoading || !data.arenaNft}
            className={`w-full rounded-lg px-4 py-2 text-sm transition-all sm:px-6 sm:py-3 sm:text-base ${
              data.arenaNft
                ? 'border border-orange-500/50 bg-orange-500/20 text-orange-500 hover:bg-orange-500/30'
                : 'cursor-not-allowed bg-gray-500/20 text-gray-500'
            }`}>
            {isLoading ? <Spin /> : 'Claim'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HorizontalArenaCard;
