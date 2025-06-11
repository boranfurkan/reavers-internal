import { AnimatePresence, motion } from 'framer-motion';
import React, { useContext, useEffect, useState } from 'react';
import { NotificationContext } from '../../../../contexts/NotificationContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNfts } from '../../../../contexts/NftContext';
import { useUser } from '../../../../contexts/UserContext';
import { CharacterNFT } from '../../../../types/NFT';
import { config } from '../../../../config';
import { toast } from 'sonner';
import { mutate } from 'swr';
import { Spin } from 'antd';
import Image from 'next/image';
import styled from 'styled-components';

interface ArenaSendModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

function ArenaSendModal({ isModalOpen, setIsModalOpen }: ArenaSendModalProps) {
  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterNFT | null>(null);

  const [jobId, setJobId] = useState('');
  const auth = useAuth();
  const { notifications } = useContext(NotificationContext);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useUser();
  const { restingNfts } = useNfts();

  const handleClick = (character: CharacterNFT) => {
    if (selectedCharacter?.uid === character.uid) {
      setSelectedCharacter(null);
    } else {
      setSelectedCharacter(character);
    }
  };

  const handleSendToArena = async () => {
    if (!selectedCharacter) return;

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
          nftuid: selectedCharacter.uid,
          action: true,
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

    mutate(`${config.worker_server_url}/users/me`);
    mutate(`${config.worker_server_url}/arena/leaderboard/me`);
    mutate(`${config.worker_server_url}/arena/leaderboard`);
    mutate(`${config.worker_server_url}/nfts`);
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
          toast.success('Successfully sent captain to the arena!');
        }

        mutate(`${config.worker_server_url}/users/me`);
        mutate(`${config.worker_server_url}/arena/leaderboard/me`);
        mutate(`${config.worker_server_url}/nfts`);
        setIsLoading(false);
        setIsModalOpen(false);
        setJobId('');
      } else {
        const timeoutId = setTimeout(() => {
          mutate(`${config.worker_server_url}/users/me`);
          mutate(`${config.worker_server_url}/arena/leaderboard/me`);
          mutate(`${config.worker_server_url}/nfts`);
          setIsLoading(false);
          toast('Timeout, reloading...');
          setJobId('');
        }, 20000);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [jobId, user?.wallet, notifications]);

  return !isModalOpen ? null : (
    <motion.div
      className="fixed inset-0 z-[99] flex w-full flex-col items-center justify-start gap-8 bg-black bg-opacity-90 text-white backdrop-blur-xl"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1, transition: { duration: 0.2 } }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 1 } }}>
      <div className="flex min-h-[82px] w-full flex-row items-center justify-between border-b border-b-reavers-border">
        <div className="ml-[73px] w-full p-4 font-Header text-2xl uppercase md:text-4xl">
          Select Captain for The Arena
        </div>
        <div
          onClick={() => {
            setSelectedCharacter(null);
            setIsModalOpen(false);
          }}
          className="cursor-pointer border-l border-l-reavers-border p-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6 cursor-pointer font-thin text-white transition-all duration-300 ease-in-out hover:scale-125">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
      </div>

      <div className="container mx-auto flex h-auto flex-col items-center justify-between gap-8 overflow-y-scroll rounded-[6px] p-4 pb-20">
        {restingNfts && restingNfts.length === 0 ? (
          <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4">
            <span>No captain available for equipping.</span>
          </div>
        ) : (
          <div
            className="grid w-full gap-4"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(284px, auto))',
              justifyContent: 'center',
              justifyItems: 'center',
              alignItems: 'center',
            }}>
            <AnimatePresence>
              {restingNfts
                .filter((captain) => !captain.currentMission)
                .sort((a, b) => b.level! - a.level!)
                .map((captain, index) => {
                  const isSelected = selectedCharacter?.uid === captain.uid;

                  return (
                    <Container
                      key={index}
                      selected={isSelected}
                      onClick={() => handleClick(captain)}
                      className="relative flex h-full w-max flex-col items-start justify-start rounded-[6px] border bg-[#161616] p-4 transition-all duration-300 ease-in-out hover:border-white hover:border-opacity-80">
                      <Image
                        src={captain.metadata?.image || '/images/reavers.webp'}
                        alt={captain.metadata?.name || 'Captain'}
                        className="scale-[1] object-cover transition-all duration-300 ease-in-out hover:scale-[1]"
                        width={250}
                        height={250}
                        unoptimized={true}
                      />
                      <span className="mt-2">
                        {captain.metadata?.name || 'Captain'} ({captain.level})
                      </span>
                    </Container>
                  );
                })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {selectedCharacter && (
        <div className="fixed bottom-0 left-0 z-50 flex h-20 w-full items-center justify-end border-t border-t-reavers-border bg-black bg-opacity-80 px-8 backdrop-blur-xl">
          <button
            className="flex flex-row items-center justify-center gap-4 rounded-md bg-white p-4 py-2 text-xs uppercase text-black disabled:bg-gray-800"
            onClick={handleSendToArena}
            disabled={isLoading}>
            {isLoading && <Spin />} SEND CAPTAIN TO THE ARENA
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default ArenaSendModal;

const Container = styled.div<{
  selected: boolean;
}>`
  border: ${({ selected }) =>
    selected
      ? '1px solid #43b083' // A green color for selected state
      : '1px solid rgba(255, 255, 255, 0.2)'};
  background-color: ${({ selected }) =>
    selected
      ? 'rgba(67, 176, 131, 0.2)'
      : 'transparent'}; // Light green background for selected state
  opacity: 1;
  &:hover {
    border-color: #43b083; // Green border on hover
    background-color: rgba(
      67,
      176,
      131,
      0.1
    ); // Very light green background on hover
  }
`;
