import { Spin } from 'antd';
import { motion } from 'framer-motion';
import Image from 'next/image';

import React, {
  CSSProperties,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import { useAuth } from '../../../contexts/AuthContext';
import { LayerContext } from '../../../contexts/LayerContext';
import { NotificationContext } from '../../../contexts/NotificationContext';
import { useUser } from '../../../contexts/UserContext';
import { getBootyPriceInSOL } from '../../../lib/orca/getBootyPrice';
import { PostMission, Outcome } from '../../../lib/types';
import _backgroundStyles from '../../../data/bg-styles.json';
import { config } from '../../../config';
import { MissionResultCard } from './MissionResultCard';
import { HorizontalDraggableDiv } from '../../ui/HorizontalDraggableDiv';
import { CharacterNFT } from '../../../types/NFT';
import GemIcon from '../../../assets/gem-icon';

function MissionResultModal() {
  const layerContext = useContext(LayerContext);
  const { notifications } = useContext(NotificationContext);

  if (!layerContext) {
    throw new Error('LayerSelect must be used within a LayerProvider');
  }

  const { setMissionResultModalOpen, claimedMissions, isMobile } = layerContext;

  const user = useUser();
  const auth = useAuth();

  const [loading, setLoading] = useState(false);
  const [jobIds, setJobIds] = useState<{
    wallet: string;
    jobIds: string[];
  } | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    mutate(`${config.worker_server_url}/missions/active-missions/`);
    setMissionResultModalOpen(false);
  };

  // toLocaleString triggers hydration error, this is a workaround.
  const [hydrated, setHydrated] = useState(false);
  const [resendMissions, setResendMissions] = useState<PostMission[]>([]);
  const [plundersMissions, setPlundersMissions] = useState<PostMission[]>([]);

  useEffect(() => {
    if (jobIds?.jobIds && jobIds.jobIds.length > 0) {
      // Check if all notifications for the current jobIds have been received
      const allReceived = jobIds.jobIds.every((jobId) =>
        notifications.some((n) => n.data.id === jobId && n.type === 'initiate'),
      );

      if (allReceived) {
        const successfull: any = [];
        const failed: any = [];

        jobIds.jobIds.forEach((jobId) => {
          const notification = notifications.find(
            (n) => n.data.id === jobId && n.type === 'initiate',
          );

          if (notification?.data.error) {
            failed.push(notification.data.error);
          } else {
            successfull.push(notification?.data);
          }
        });

        // All notifications have been received, you can now proceed with your logic
        setLoading(false);
        mutate(`${config.worker_server_url}/missions/active-missions/`);
        mutate(`${config.worker_server_url}/nfts`);
        toast.success(`${successfull.length} mission(s) started`);
        handleClose();
        setJobIds(null);
      } else {
        const timeoutId = setTimeout(() => {
          mutate(`${config.worker_server_url}/missions/active-missions/`);
          mutate(`${config.worker_server_url}/nfts`);
          toast('Timeout, reloading...');
          setLoading(false);
          setJobIds(null);
        }, 20000);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [jobIds, notifications]); // Depend on jobIds and notifications

  useEffect(() => {
    setResendMissions(() => {
      const resendEligibleMissions = claimedMissions;

      return resendEligibleMissions;
    });
  }, [claimedMissions]);

  const handleSend = async () => {
    if (claimedMissions.length === 0) {
      toast.error('No NFTs to send on Mission');
      return;
    }

    setLoading(true);

    try {
      const jobIds: string[] = [];

      for (const mission of resendMissions) {
        const group = mission.nftsLoaded;

        if (!group || group.every((reaver) => !reaver.uid)) {
          toast.error('An error occurred, try again later');
          return;
        }

        const missionData = {
          missionPath: mission.mission?.missionStats?.path,
          nfts: group.map((nft) => nft.uid),
        };

        const res = await fetch(
          `${config.worker_server_url}/missions/initiate`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${auth.jwtToken}`,
            },
            body: JSON.stringify(missionData),
          },
        );

        if (res.status !== 200) {
          // TODO can I log actual error from function?
          throw new Error('An error occurred, try again later');
        }
        const data = await res.json();

        jobIds.push(data.jobId);
      }

      setJobIds({ wallet: user.user!.wallet, jobIds });
    } catch (error) {
      toast.error('An error occurred, try again later');
      setLoading(false);
      // setClaimedMissions([]);
      handleClose();
    }
  };

  // calculate total lost and total won

  const totalEarnedGems = useMemo(() => {
    return claimedMissions.reduce((totalGems, mission) => {
      // Calculate totalEarnedGems
      if (mission.mission?.missionStats?.yield === 'Gems') {
        totalGems += mission.gemsReward || 0;
      }
      return totalGems;
    }, 0);
  }, [claimedMissions]);

  // totalEarned, totalEarnedGems, and totalLost are now available for use

  // Calculate the total time spent in milliseconds
  const totalTimeSpent = claimedMissions.reduce((acc, mission) => {
    const startTime = mission.startTime;
    const endTime = Date.now();

    if (startTime) {
      const durationInMilliseconds = endTime - startTime;
      return acc + durationInMilliseconds;
    }

    return acc;
  }, 0);

  const groupedMissions = useMemo(() => {
    const grouped = claimedMissions.reduce((state, mission) => {
      const missionName = mission?.mission?.name || 'undefined';

      if (!state[missionName]) {
        state[missionName] = {
          missionIds: [mission.id],
          missionName: missionName,
          nftsLoaded: mission.nftsLoaded || [],
          nftIds: mission.nftIds || [],
          layer: mission.mission?.missionStats?.layer,
          missionType: mission.type,
          outcomeType: mission.outcome.type as 'failure' | 'success',
          missionYield: mission.mission?.missionStats?.yield,
          missionYieldImage: mission.mission?.missionStats?.yieldImage,
          outcomeEffect: mission.outcome.effect,
          reward: mission.reward || 0,
        };
      } else {
        if (!state[missionName].missionIds.includes(mission.id)) {
          state[missionName].missionIds.push(mission.id);
          state[missionName].nftsLoaded = Array.from(
            new Set([
              ...state[missionName].nftsLoaded,
              ...(mission.nftsLoaded || []),
            ]),
          );
          state[missionName].nftIds = Array.from(
            new Set([...state[missionName].nftIds, ...(mission.nftIds || [])]),
          );
          state[missionName].reward += mission.reward || 0;
        }
      }
      return state;
    }, {} as Record<string, any>);

    const sortedMissions = Object.values(grouped)
      .filter((mission) => mission.outcomeType !== 'failure')
      .sort((a, b) => b.outcomeMultiplier - a.outcomeMultiplier);

    return sortedMissions;
  }, [claimedMissions]);

  // Calculate the average time spent
  const averageTimeSpentInMilliseconds = claimedMissions.length
    ? totalTimeSpent / claimedMissions.length
    : 0;

  // Convert milliseconds to minutes, hours, and days
  const averageMinutes = Math.floor(
    averageTimeSpentInMilliseconds / (1000 * 60),
  );
  const averageHours = Math.floor(averageMinutes / 60);
  const averageDays = Math.floor(averageHours / 24);

  // Calculate the remaining hours and minutes after extracting days
  const remainingHours = averageHours % 24;
  const remainingMinutes = averageMinutes % 60;

  useEffect(() => {
    setPlundersMissions(
      claimedMissions.filter((mission) => mission.type === 'Plunders'),
    );
  }, [claimedMissions]);

  return (
    <motion.div
      className="fixed inset-0 z-[998] flex w-full flex-col items-start justify-center overflow-y-scroll bg-reavers-bg bg-opacity-[0.3] text-white backdrop-blur-xl"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1, transition: { duration: 0.2 } }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 1 } }}>
      <div className="relative flex h-screen w-full items-center justify-center">
        <div
          style={{
            background: isMobile
              ? 'linear-gradient(to right, #000000d0 10%, #00000000 100%)'
              : 'linear-gradient(to right, #000000d0 35%, #00000000 100%)',
            pointerEvents: 'none',
          }}
          className="absolute left-0 top-0 z-50 h-full w-[20%]"></div>
        <div
          style={{
            background: isMobile
              ? 'linear-gradient(to left, #000000d0 10%, #00000000 100%)'
              : 'linear-gradient(to left, #000000d0 35%, #00000000 100%)',
            pointerEvents: 'none',
          }}
          className="absolute right-0 top-0 z-50 h-full w-[20%]"></div>
        <div
          className={`absolute left-0 right-10 top-[20px] mx-auto w-fit rounded-xl border border-white border-opacity-30 bg-black px-4 py-1.5 text-center text-[12px] leading-[12px] ${
            isMobile && '!right-0 !top-2'
          }`}>
          MISSION RESULT
        </div>
        <div
          className={`relative flex max-h-[100vh] min-h-[594px] w-full flex-col items-center justify-between overflow-y-scroll pt-7 ${
            isMobile && '!h-full !justify-center'
          }`}
          ref={modalRef}>
          <HorizontalDraggableDiv
            className={`flex max-h-[calc(90vh_-_101px)] min-h-[452px] w-full cursor-pointer select-none flex-row items-center justify-start gap-8 overflow-y-scroll px-[154px] after:content-[''] ${
              isMobile && '!pl-[78px] !pr-[45px]'
            }`}>
            {groupedMissions.map((item, index) => (
              <MissionResultCard key={index} item={item} />
            ))}
          </HorizontalDraggableDiv>

          <div
            className={`mt-4 flex w-[616px] flex-row items-center justify-between rounded-md border border-white border-opacity-10 bg-black bg-opacity-30 p-4 ${
              isMobile && '!mt-0 flex w-full flex-col gap-4 p-4'
            }`}>
            <div className="flex flex-row items-center justify-between gap-10">
              {totalEarnedGems > 0 && (
                <div className="flex flex-col items-center justify-start gap-2">
                  <span className="text-start text-xs opacity-50">
                    Total Earned
                  </span>
                  <div className="flex w-full items-center gap-2 text-start text-[18px] text-success-mission">
                    +
                    {hydrated
                      ? totalEarnedGems.toLocaleString()
                      : totalEarnedGems}
                    <GemIcon className="-mt-0.5 h-[18px] w-[18px]" />
                  </div>
                </div>
              )}

              {claimedMissions.length > 0 && (
                <div className="flex flex-col items-start justify-center gap-2">
                  <span className="text-start text-xs opacity-50">
                    Average Time Spent
                  </span>
                  <div className="flex w-full items-center justify-center gap-2 text-center text-[18px]">
                    {hydrated
                      ? `${averageDays}D ${remainingHours}H ${remainingMinutes}M`
                      : `${averageDays}D ${remainingHours}H ${remainingMinutes}M`}
                  </div>
                </div>
              )}
            </div>
            <div className="flex h-full flex-row items-center justify-end gap-2">
              <button
                onClick={handleClose}
                className="h-9 cursor-pointer rounded border border-white border-opacity-10 p-6 py-0 text-xs uppercase text-white">
                Close
              </button>
              <button
                disabled={loading}
                onClick={handleSend}
                className="h-9 cursor-pointer rounded bg-[#6535c9]  p-6 py-0 text-xs uppercase text-white  disabled:bg-gray-800">
                {loading && <Spin />} Re-Send All
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default MissionResultModal;
