import React, { useContext, useEffect, useState } from 'react';
import { Slider, Spin } from 'antd';
import { LayerContext } from '../../contexts/LayerContext';
import { ActiveMission, PostMission } from '../../lib/types';
import { useNfts } from '../../contexts/NftContext';
import { config } from '../../config';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import { mutate } from 'swr';
import { NotificationContext } from '../../contexts/NotificationContext';
import { Popconfirm } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

function ClaimSlider() {
  const layerContext = useContext(LayerContext);
  const { notifications } = useContext(NotificationContext);

  if (!layerContext) {
    throw new Error('LayerSelect must be used within a LayerProvider');
  }

  const {
    setMissionResultModalOpen,
    selectedMissions,
    setSelectedMissions,
    setClaimedMissions,
    currentMission,
  } = layerContext;

  const { filteredActiveMissions } = useNfts();
  const auth = useAuth();
  const user = useUser();

  const [openClaim, setOpenClaim] = useState(false);
  const [openClaimAll, setOpenClaimAll] = useState(false);
  const [enablePop, setEnablePop] = useState(false);

  const [loading, setLoading] = useState(false);
  const [jobIds, setJobIds] = useState<{
    wallet: string;
    jobIds: { jobId: string; mission: ActiveMission }[];
  } | null>(null);

  const changeCondition = (checked: boolean) => {
    setEnablePop(checked);
  };

  const confirmClaim = () => {
    setOpenClaim(false);
    handleClaim(selectedMissions);
  };

  const confirmClaimAll = () => {
    const filteredClaimable = filteredActiveMissions.filter(
      (mission) =>
        (mission.endTimeCalculated &&
          mission.endTimeCalculated < new Date().getTime()) ||
        mission.duration === 0,
    );

    if (filteredClaimable.length === 0) {
      toast.error('No missions available to claim');
      return;
    }

    sliderOnChange(filteredClaimable.length);
    setSelectedMissions(filteredClaimable);
    handleClaim(filteredClaimable);

    setOpenClaimAll(false);
  };

  const cancel = () => {
    setOpenClaim(false);
    setOpenClaimAll(false);
  };

  const handleOpenChangeClaim = (newOpen: boolean) => {
    if (!newOpen) {
      setOpenClaim(newOpen);
      return;
    }

    confirmClaim();
  };

  const handleOpenChangeClaimAll = (newOpen: boolean) => {
    if (!newOpen) {
      setOpenClaimAll(newOpen);
      return;
    }

    const filteredClaimable = filteredActiveMissions.filter(
      (mission) =>
        (mission.endTimeCalculated &&
          mission.endTimeCalculated < new Date().getTime()) ||
        mission.duration === 0,
    );

    confirmClaimAll();
  };

  const sliderOnChange = (value: number) => {
    if (value > selectedMissions.length) {
      setSelectedMissions((prevMissions) => {
        // Find the first mission that hasn't been selected yet
        const nextMission = filteredActiveMissions.find(
          (mission) =>
            //Compare mission ID instead of object
            !prevMissions.map((mission) => mission.id).includes(mission.id) &&
            ((mission.endTimeCalculated &&
              mission.endTimeCalculated < new Date().getTime()) || // For making sure only finished missions can be claimed
              mission.duration === 0),
        );
        if (nextMission) {
          // If found, add it to the selected missions
          return [...prevMissions, nextMission];
        } else {
          // If not found, return the previous missions
          return prevMissions;
        }
      });
    } else if (value < selectedMissions.length) {
      // When the slider decreases, remove the last added mission
      setSelectedMissions((prevMissions) => prevMissions.slice(0, value));
    }
  };

  useEffect(() => {
    type ActiveMissionWithError = ActiveMission & {
      error?: boolean;
      message?: string;
    };

    if (!jobIds?.jobIds?.length) return;

    const allReceived = jobIds.jobIds.every((jobId) =>
      notifications.some(
        (n) => n.data.id === jobId.jobId && n.type === 'claim',
      ),
    );

    if (allReceived) {
      const results: (PostMission | ActiveMissionWithError)[] =
        jobIds.jobIds.map((jobId) => {
          const notification = notifications.find(
            (n) => n.data.id === jobId.jobId && n.type === 'claim',
          );

          if (!notification || notification.data.error) {
            return {
              ...jobId.mission,
              error: true,
              message:
                notification?.data.message ||
                'Something went wrong, please try again later',
            };
          }

          return {
            ...jobId.mission,
            outcome: notification.data.result.result?.selectedOutcome,
            arrrReward: notification.data.result.result.result?.reward,
            gemsReward: notification.data.result.result.result?.earnedGems,
          };
        });

      const successfulMissions = results.filter(
        (mission): mission is PostMission => !('error' in mission),
      );
      const failedMissions = results.filter(
        (mission): mission is ActiveMissionWithError => 'error' in mission,
      );

      // Handle UI updates
      failedMissions.forEach((m) => toast(m.message));
      if (successfulMissions.length) {
        setClaimedMissions(successfulMissions);
        setMissionResultModalOpen(true);
        toast(`Successfully claimed ${successfulMissions.length} mission(s)`);
      }

      // Reset states
      setLoading(false);
      setSelectedMissions([]);
      setJobIds(null);

      Promise.all([
        mutate(`${config.worker_server_url}/missions/active-missions`),
        mutate(`${config.worker_server_url}/nfts`),
        ,
        new Promise((resolve) =>
          setTimeout(() => {
            Promise.all([
              mutate(`${config.worker_server_url}/items/fetch-items`),
              mutate(`${config.worker_server_url}/arena/leaderboard`),
            ]).then(resolve);
          }, 1000),
        ),
      ]).catch((error) => {
        console.error('Error during mutations:', error);
        toast('Error updating data. Please refresh the page.');
      });
    } else {
      // Handle timeout case
      const timeoutId = setTimeout(() => {
        setLoading(false);
        setSelectedMissions([]);
        setJobIds(null);

        // Batch timeout mutations
        Promise.all([
          mutate(`${config.worker_server_url}/missions/active-missions`),
          mutate(`${config.worker_server_url}/nfts`),
          mutate(`${config.worker_server_url}/items/fetch-items`),
        ]).catch((error) => {
          console.error('Error during timeout mutations:', error);
        });

        toast('Timeout, reloading...');
      }, 20000);

      return () => clearTimeout(timeoutId);
    }
  }, [jobIds, notifications]); // Depend on jobIds and notifications

  const handleClaim = async (missions: ActiveMission[]) => {
    if (!user.user?.wallet) {
      toast.error('No Wallet Connected');
      return;
    }

    if (missions.length === 0) {
      toast.error('No Missions Selected');
      return;
    }

    setLoading(true);

    try {
      const jobIds: { jobId: string; mission: ActiveMission }[] = [];

      for (const mission of missions) {
        const missionData = {
          activeMissionPath: `${config.active_missions_firebase_collection}/${mission.id}`,
        };

        const res = await fetch(`${config.worker_server_url}/missions/claim`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.jwtToken}`,
          },
          body: JSON.stringify(missionData),
        });

        if (res.status !== 200) {
          throw new Error('An error occurred, try again later');
        }

        const data = await res.json();
        jobIds.push({ jobId: data.jobId, mission: mission });
      }

      setJobIds({ wallet: user.user!.wallet, jobIds });
    } catch (error) {
      console.log(error);
      toast.error('An error occurred, try again later');
      setSelectedMissions([]);
      setLoading(false);
    }
  };

  return (
    <div className="z-[100] -ml-2 flex w-fit flex-row items-center justify-center gap-2 rounded-md border border-white border-opacity-[0.10] bg-reavers-bg p-4">
      <div className="flex h-[34px] flex-row items-center justify-center gap-2 rounded-md border border-white border-opacity-[0.10]">
        <div className="border-r border-r-white border-opacity-[0.10] p-4 py-2">
          {selectedMissions.length}
        </div>
        <div className="p-1 px-4">
          <Slider
            value={selectedMissions.length}
            max={filteredActiveMissions.length}
            className="nft-management-slider w-[125px] text-white  max-xl:w-[138px] md:w-[276px]"
            trackStyle={{ backgroundColor: '#fff' }}
            handleStyle={{ backgroundColor: '#fff' }}
            railStyle={{ backgroundColor: '#ffffff1a', height: '3px' }}
            onChange={sliderOnChange}
          />
        </div>
      </div>
      <div className="flex h-full w-1/2 flex-row items-center justify-end gap-2">
        <Popconfirm
          title=""
          description="Are you sure?"
          open={openClaimAll}
          onOpenChange={handleOpenChangeClaimAll}
          onConfirm={confirmClaimAll}
          onCancel={cancel}
          icon={<></>}
          okText="Yes"
          okType="text"
          okButtonProps={{ style: { backgroundColor: '#19d363d3' } }}
          cancelText="No">
          <button className="h-full w-full rounded-md border border-white border-opacity-[0.05] p-4 py-2 text-xs uppercase text-white transition-all duration-200 ease-in-out hover:border-opacity-20">
            Claim All
          </button>
        </Popconfirm>

        <Popconfirm
          title="Claim Reavers"
          description="Are you sure?"
          open={openClaim}
          onOpenChange={handleOpenChangeClaim}
          disabled={selectedMissions.length === 0 || loading}
          onConfirm={confirmClaim}
          onCancel={cancel}
          icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
          okButtonProps={{ style: { backgroundColor: 'red', color: 'white' } }}
          okText="Yes"
          cancelText="No">
          <button
            className={`h-full w-full whitespace-nowrap break-keep rounded-md ${
              selectedMissions.length === 0 || loading
                ? 'bg-gray-800'
                : 'bg-[#6535c9]'
            } bg-[#6535c9] p-4 py-2  text-xs uppercase text-white  disabled:cursor-not-allowed`}
            disabled={selectedMissions.length === 0 || loading}>
            {loading && <Spin />} CLAIM SELECTED
          </button>
        </Popconfirm>
      </div>
    </div>
  );
}

export default ClaimSlider;
