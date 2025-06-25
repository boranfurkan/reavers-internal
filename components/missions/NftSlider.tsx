import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Modal, Slider, Spin } from 'antd';
import { LayerContext } from '../../contexts/LayerContext';
import { getUserBootyOrGoldAmount } from '../../utils/helpers';
import { toast } from 'sonner';
import { config } from '../../config';
import { useUser } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';
import { mutate } from 'swr';
import { NotificationContext } from '../../contexts/NotificationContext';
import { Token } from '../../types/Token';
import { CharacterNFT } from '../../types/NFT';
import { debounce } from 'lodash';
import styled from 'styled-components';

// Simplified type for selected NFTs
type SelectedNftType = {
  captain: CharacterNFT;
  levelUpCount: number;
};

function NftSlider({
  setSelectedNfts,
  selectedNfts,
  onSelect,
  nftsEligibleForMission,
}: {
  setSelectedNfts: React.Dispatch<React.SetStateAction<SelectedNftType[]>>;
  selectedNfts: SelectedNftType[];
  nftsEligibleForMission: CharacterNFT[] | null;
  onSelect?: () => any;
  halfTime?: boolean;
}) {
  const user = useUser();
  const auth = useAuth();
  const layerContext = useContext(LayerContext);
  const { notifications } = useContext(NotificationContext);

  if (!layerContext) {
    throw new Error('LayerMap must be used within a LayerProvider');
  }

  const { currentMission, isMobile } = layerContext;

  const [jobIds, setJobIds] = useState<{
    wallet: string;
    jobIds: string[];
  } | null>(null);

  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSliderValue(selectedNfts.length);
  }, [selectedNfts]);

  // Calculate total cost based on mission cost and number of selected entities
  const totalCost =
    selectedNfts.length && currentMission?.missionStats?.cost
      ? selectedNfts.length * currentMission.missionStats.cost
      : 0;

  const debouncedHandleSliderChange = useCallback(
    debounce((value: number) => {
      if (!Array.isArray(nftsEligibleForMission)) {
        console.error('nftsEligibleForMission is not an array.');
        return;
      }

      setSelectedNfts((prev) => {
        if (value > prev.length) {
          // Adding captains
          const additionalCount = value - prev.length;
          const availableCharacters = nftsEligibleForMission.filter(
            (nft) => !prev.some((selected) => selected.captain.uid === nft.uid),
          );

          const newCharacters = availableCharacters
            .slice(0, additionalCount)
            .map((nft) => ({
              captain: nft,
              levelUpCount: 1, // Default levelUpCount
            }));

          return [...prev, ...newCharacters];
        } else {
          // Removing captains
          return prev.slice(0, value);
        }
      });
    }, 50),
    [nftsEligibleForMission, setSelectedNfts],
  );

  const handleSliderChange = (value: number) => {
    setSliderValue(value); // Update the slider value immediately for smooth UI
    debouncedHandleSliderChange(value);
  };

  useEffect(() => {
    if (jobIds?.jobIds && jobIds.jobIds.length > 0) {
      // Check if all notifications for the current jobIds have been received
      const allReceived = jobIds.jobIds.every((jobId) =>
        notifications.some(
          (n) =>
            n.data.id === jobId &&
            (n.type === 'initiate' || n.type === 'initiateSpecial'),
        ),
      );

      if (allReceived) {
        const successfull = [];
        const failed: any[] = [];

        jobIds.jobIds.forEach((jobId) => {
          const notification = notifications.find(
            (n) =>
              n.data.id === jobId &&
              (n.type === 'initiate' || n.type === 'initiateSpecial'),
          );

          if (notification?.data.error || !notification?.data.success) {
            failed.push(notification?.data);
          } else {
            successfull.push(notification?.data);
          }
        });

        // All notifications have been received, reset and update UI
        setSelectedNfts([]);
        setLoading(false);
        mutate([
          `${config.worker_server_url}/missions/eligible-nfts`,
          currentMission?.missionStats?.name,
        ]);
        mutate(`${config.worker_server_url}/missions/active-missions/`);
        mutate(`${config.worker_server_url}/nfts`);
        mutate(`${config.worker_server_url}/items/fetch-items`);
        setJobIds(null);
        successfull.length &&
          toast.success(`${successfull.length} mission(s) started`);
        if (failed.length > 0) {
          failed.forEach((fail) => {
            toast.error(fail.message);
          });
        }
        if (onSelect && successfull.length) {
          onSelect();
        }
      } else {
        const timeoutId = setTimeout(() => {
          setLoading(false);
          setSelectedNfts([]);
          mutate([
            `${config.worker_server_url}/missions/eligible-nfts`,
            currentMission?.missionStats?.name,
          ]);
          mutate(`${config.worker_server_url}/missions/active-missions/`);
          mutate(`${config.worker_server_url}/nfts`);
          mutate(`${config.worker_server_url}/items/fetch-items`);
          toast('Timeout, reloading...');
          setJobIds(null);
        }, 20000);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [jobIds, notifications]); // Depend on jobIds and notifications

  // Send Handler - only for captain missions now
  const handleSend = async () => {
    setLoading(true);

    try {
      const jobIds: string[] = [];

      for (const captain of selectedNfts) {
        type MissionData = {
          missionPath: string | undefined;
          nfts: (string | undefined)[];
          levelCount?: number;
        };

        const levelUpCount = captain.levelUpCount || 1;

        let missionData: MissionData = {
          missionPath: layerContext?.currentMission?.missionStats?.path,
          nfts: [captain.captain.uid],
          levelCount: levelUpCount,
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
          throw new Error('An error occurred, try again later');
        }

        const data = await res.json();
        jobIds.push(data.jobId);
      }

      setJobIds({ wallet: user.user!.wallet, jobIds });
    } catch (error) {
      console.log(error);
      toast('An error occurred');
      setSelectedNfts([]);
      setLoading(false);
    }
  };

  // Loading state handling
  if (!nftsEligibleForMission) {
    return <Spin />;
  }

  const handleSendClick = () => {
    if (currentMission?.missionStats?.kind === 'Specials') {
      setIsConfirmModalVisible(true);
    } else {
      handleSend();
    }
  };

  const handleConfirmSend = () => {
    setIsConfirmModalVisible(false);
    handleSend();
  };

  // Determine max number of entities that can be selected
  const maxSelectable = nftsEligibleForMission?.length || 0;

  // Format the mission cost display with the currency
  const formatCost = () => {
    if (!currentMission?.missionStats?.cost) return '0';
    const currency = currentMission?.missionStats?.currency || 'BOOTY';
    return `${totalCost} $${currency}`;
  };

  return (
    <>
      <div
        className={
          'z-50 flex !h-max w-full flex-col items-center justify-center gap-5 rounded-b-lg border-t border-white border-opacity-20 bg-dark-purple px-4 py-2 ' +
          (isMobile && ' !h-max !gap-2 border-none !p-2')
        }>
        <div className="flex w-full justify-between gap-2">
          {/* Slider and Value Container */}
          <div className="flex w-full flex-row items-center justify-center gap-2 rounded-md border border-white border-opacity-[0.20] max-md:flex-grow md:flex-1">
            <div className="border-r border-r-white border-opacity-[0.20] p-4 py-2 font-mono">
              {sliderValue}
            </div>
            <div className="flex w-full p-1 px-4">
              <Slider
                value={sliderValue}
                max={maxSelectable}
                className="nft-management-slider w-full text-white"
                trackStyle={{ backgroundColor: '#fff' }}
                handleStyle={{ backgroundColor: '#fff' }}
                railStyle={{ backgroundColor: '#ffffff1a', height: '3px' }}
                onChange={handleSliderChange}
                step={1}
                min={0}
              />
            </div>
          </div>
          {/* Buttons Container */}
          <div className="flex w-full flex-row items-center justify-end gap-3 md:flex-1">
            <button
              onClick={() => handleSliderChange(maxSelectable)}
              className="h-full w-full whitespace-nowrap rounded-md border border-white border-opacity-[0.2] p-4 py-2 font-mono text-xs uppercase text-white">
              ALL
            </button>
            <button
              className="h-full w-full rounded-md bg-[#6535c9] p-4 py-2 font-mono text-xs uppercase text-white disabled:cursor-not-allowed disabled:bg-card-not-selected-bg"
              disabled={sliderValue === 0 || loading}
              onClick={handleSendClick}>
              {loading && <Spin />} {sliderValue === 0 ? 'SELECT' : `SEND`}
            </button>
          </div>
        </div>
        <div className="flex w-full items-center justify-between">
          <span className="text-left font-mono text-[10px] uppercase leading-[10px] text-[#fff] opacity-30">
            BALANCE: {getUserBootyOrGoldAmount(user.user, Token.BOOTY)} $BOOTY
          </span>
          {/* Display total cost when selected NFTs exist */}
          {selectedNfts.length > 0 && currentMission?.missionStats?.cost && (
            <span className="text-right font-mono text-[10px] uppercase leading-[10px] text-[#fff] opacity-80">
              TOTAL COST: {formatCost()}
            </span>
          )}
        </div>
      </div>
      <StyledModal
        title="Confirm Special Mission"
        centered
        open={isConfirmModalVisible}
        onOk={handleConfirmSend}
        onCancel={() => setIsConfirmModalVisible(false)}
        okText="Confirm"
        cancelText="Cancel">
        <p>
          Are you sure you want to send your reavers on this special mission?
          You won't be able to unstake your NFT(s) until 1st of November 2025.
        </p>
      </StyledModal>
    </>
  );
}

export default NftSlider;

const StyledModal = styled(Modal)`
  .ant-modal-content {
    background-color: #1a1525; // Dark purple background matching the app theme
    border: 1px solid rgba(101, 53, 201, 0.2); // Subtle purple border
    border-radius: 8px;
    box-shadow: 0 4px 24px rgba(101, 53, 201, 0.15);
  }

  .ant-modal-header {
    background-color: #1a1525;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 16px 24px;
  }

  .ant-modal-title {
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .ant-modal-body {
    color: rgba(255, 255, 255, 0.8);
    padding: 24px;
    font-size: 14px;
    line-height: 1.5;
  }

  .ant-modal-footer {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: 16px 24px;
  }

  .ant-btn {
    height: 40px;
    border-radius: 6px;
    text-transform: uppercase;
    font-size: 12px;
    font-weight: 500;
    padding: 0 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .ant-btn-primary {
    background-color: #6535c9;
    border: none;
    color: white;

    &:hover {
      background-color: #7445d9;
      border: none;
    }

    &:active {
      background-color: #5425b9;
    }
  }

  .ant-btn-default {
    background-color: transparent;
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;

    &:hover {
      border-color: rgba(255, 255, 255, 0.3);
      background-color: rgba(255, 255, 255, 0.05);
    }

    &:active {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }

  // Add custom close button styling
  .ant-modal-close {
    color: rgba(255, 255, 255, 0.45);
    transition: color 0.2s ease;

    &:hover {
      color: rgba(255, 255, 255, 0.85);
    }
  }
`;
