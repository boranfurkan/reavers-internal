import React, { useContext, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Spin } from 'antd';
import { toast } from 'sonner';
import { mutate } from 'swr';

import { useUser } from '../../../contexts/UserContext';
import { useNfts } from '../../../contexts/NftContext';
import { NotificationContext } from '../../../contexts/NotificationContext';
import { useAuth } from '../../../contexts/AuthContext';

import { CharacterNFT, ShipNFT } from '../../../types/NFT';
import { NFTType } from '../../../types/BaseEntity';
import { getLevelRarity, cn } from '../../../utils/helpers';
import { config } from '../../../config';
import {
  animations,
  getRarityGradient,
} from '../../../utils/inventory-helpers';

import XMarkIcon from '../../../assets/x-mark-icon';
import CheckIcon from '../../../assets/check-icon';
import EntityBadge from '../../ui/EntityBadge';

// Glass card background animation
const glassAnimation = {
  animate: {
    backgroundImage: [
      'linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0.3))',
      'linear-gradient(to right, rgba(0,0,0,0.3), rgba(0,0,0,0.4))',
      'linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0.3))',
    ],
  },
  transition: {
    duration: 8,
    repeat: Infinity,
    ease: 'linear',
  },
};

// Shimmer effect for buttons
const shimmerAnimation = {
  animate: { x: ['100%', '-100%'] },
  transition: {
    repeat: Infinity,
    duration: 1.5,
    ease: 'linear',
  },
};

interface EquipShipModalProps {
  selectedCharacter: CharacterNFT | null;
  selectedShip: ShipNFT | null;
  setSelectedShip: (ship: ShipNFT | null) => void;
  setIsShipEquipModalOpen: (isOpen: boolean) => void;
}

function EquipShipModal({
  selectedCharacter,
  selectedShip,
  setSelectedShip,
  setIsShipEquipModalOpen,
}: EquipShipModalProps) {
  const [jobId, setJobId] = useState('');
  const auth = useAuth();
  const { notifications } = useContext(NotificationContext);
  const [isLoading, setIsLoading] = useState(false);
  const nftsContext = useNfts();
  const { user } = useUser();

  // Filter available ships (unequipped)
  const availableShips = useMemo(() => {
    return nftsContext.shipsInGame.filter((ship) => !ship.equipped) || [];
  }, [nftsContext.shipsInGame]);

  // Get character name for display
  const getCharacterName = () => {
    if (!selectedCharacter || !selectedCharacter.metadata) return '';
    const nameParts = selectedCharacter.metadata.name.split('#');
    return nameParts.length > 1 ? `#${nameParts[1]}` : '';
  };

  // Handle ship selection
  const handleSelectShip = (ship: ShipNFT) => {
    if (selectedShip && selectedShip.uid === ship.uid) {
      setSelectedShip(null);
    } else {
      setSelectedShip(ship);
    }
  };

  // Handle equipment action
  const handleEquipShip = async () => {
    if (!selectedCharacter || !selectedShip) {
      toast.error('Please select both a character and a ship');
      return;
    }

    setIsLoading(true);
    try {
      const idToken = auth.jwtToken;
      const res = await fetch(
        `${config.worker_server_url}/nfts/handleShipEquip`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            nftuid: selectedCharacter.uid,
            shipuid: selectedShip.uid,
            action: true,
          }),
        },
      );

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

  // Check for job completion
  useEffect(() => {
    if (user?.wallet && jobId !== '') {
      const notification = notifications.find(
        (n) => n.data.id === jobId && n.type === 'handleShipEquip',
      );

      if (notification) {
        if (notification.data.error) {
          toast.error(notification.data.message);
        } else {
          toast.success(
            'Successfully equipped ' +
              notification.data.result.shipName +
              ' to NFT ' +
              (parseInt(notification.data.result.nftUID) + 1),
          );
        }

        mutate(`${config.worker_server_url}/users/me`);
        mutate(`${config.worker_server_url}/nfts`);
        setIsLoading(false);
        setIsShipEquipModalOpen(false);
        setJobId('');
      } else {
        const timeoutId = setTimeout(() => {
          mutate(`${config.worker_server_url}/users/me`);
          setIsLoading(false);
          toast('Timeout, reloading...');
          setJobId('');
        }, 20000);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [jobId, user?.wallet, notifications, setIsShipEquipModalOpen]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsShipEquipModalOpen(false)}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="z-[99999] w-full max-w-4xl overflow-hidden rounded-lg border border-white/20 bg-gradient-to-br from-gray-900 to-black shadow-xl max-md:max-h-[90vh] max-md:w-[94%]"
          onClick={(e) => e.stopPropagation()}>
          {/* Header - Improved for mobile */}
          <div className="flex items-center justify-between border-b border-white/20 bg-gradient-to-r from-black to-gray-900 px-6 py-4 max-md:px-4 max-md:py-3">
            <h3 className="text-xl font-medium text-white max-md:text-lg">
              <span className="max-sm:hidden">
                SELECT SHIP TO EQUIP TO {selectedCharacter?.type}{' '}
                {getCharacterName()}
              </span>
              <span className="hidden max-sm:inline">
                EQUIP SHIP TO {selectedCharacter?.type} {getCharacterName()}
              </span>
            </h3>
            <button
              onClick={() => setIsShipEquipModalOpen(false)}
              className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white">
              <XMarkIcon className="h-6 w-6 max-md:h-5 max-md:w-5" />
            </button>
          </div>

          {/* Content - Optimized for mobile */}
          <div className="max-h-[70vh] overflow-y-auto bg-black/90 p-6 backdrop-blur-sm max-md:p-4 md:max-h-[60vh]">
            {availableShips.length === 0 ? (
              <div className="flex h-48 items-center justify-center px-4 text-center max-md:h-32">
                <p className="text-gray-400">No ships available to equip</p>
              </div>
            ) : (
              <div className="grid gap-4 max-sm:grid-cols-1 max-sm:gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {availableShips
                  .sort((a, b) => (b.level || 1) - (a.level || 1))
                  .map((ship) => {
                    const isSelected = selectedShip?.uid === ship.uid;
                    // Handle legendary ships differently
                    const isLegendaryShip = ship.rarity === 'LEGENDARY';
                    const rarity = getLevelRarity(
                      NFTType.SHIP,
                      ship.level || 1,
                      isLegendaryShip,
                    );

                    return (
                      <motion.div
                        key={ship.uid}
                        onClick={() => handleSelectShip(ship)}
                        variants={animations.cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileTap="tap"
                        className={cn(
                          'relative h-full overflow-visible rounded-lg border-2 transition-all',
                          isSelected
                            ? 'border-indigo-500 shadow-lg shadow-indigo-500/20'
                            : 'border-white/20',
                        )}
                        style={{
                          ...getRarityGradient(rarity),
                        }}>
                        {/* Glass overlay with subtle animation */}
                        <motion.div
                          className="absolute inset-0 rounded-lg bg-black/40 backdrop-blur-sm"
                          animate={glassAnimation.animate}
                          transition={glassAnimation.transition}
                        />

                        {/* Selection indicator */}
                        {isSelected && (
                          <motion.div
                            className="absolute -right-2 -top-2 z-50 rounded-full bg-indigo-500 p-1 shadow-lg max-sm:right-0 max-sm:top-0"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              type: 'spring',
                              stiffness: 500,
                              damping: 15,
                            }}>
                            <CheckIcon className="h-4 w-4 text-white max-sm:h-3 max-sm:w-3" />
                          </motion.div>
                        )}

                        {/* Rarity Badge */}
                        <EntityBadge
                          rarityText={rarity}
                          level={ship.level || 1}
                        />

                        {/* Image */}
                        <div className="relative z-10 aspect-video w-full overflow-hidden rounded-t-lg bg-black/50">
                          <motion.div
                            className="relative h-full w-full rounded-t-lg"
                            whileHover={{ scale: 1.05 }}
                            transition={{
                              type: 'spring',
                              stiffness: 300,
                              damping: 20,
                            }}>
                            <Image
                              src={
                                ship.metadata?.image || '/images/reavers.webp'
                              }
                              alt={ship.metadata?.name || 'Ship'}
                              fill
                              className="rounded-t-lg object-cover"
                              unoptimized={true}
                            />
                          </motion.div>

                          {/* Type label overlay */}
                          <div className="absolute bottom-0 left-0 rounded-tr-md bg-black/80 px-2 py-1 max-sm:px-1.5 max-sm:py-0.5">
                            <span className="block max-w-[90%] whitespace-nowrap text-xs font-medium uppercase text-white max-sm:text-[10px]">
                              {ship.name && ship.name.length > 7
                                ? `${ship.name.substring(0, 7)}...`
                                : ship.name || 'SHIP'}
                            </span>
                          </div>
                        </div>

                        {/* Info Footer - Optimized for mobile */}
                        <div className="relative z-10 rounded-b-lg border-t border-white/30 bg-black/80 p-3 max-sm:p-2">
                          <div className="mb-1 truncate text-center text-sm font-medium text-white max-sm:text-xs">
                            {ship.name || ship.metadata?.name || 'Ship'}
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400 max-sm:text-[10px]">
                              Level:
                            </span>
                            <span className="text-xs font-medium text-white max-sm:text-[10px]">
                              {ship.level || 1}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400 max-sm:text-[10px]">
                              Status:
                            </span>
                            <div className="flex items-center">
                              <motion.div
                                className="mr-1.5 h-2 w-2 rounded-full bg-green-500 max-sm:mr-1 max-sm:h-1.5 max-sm:w-1.5"
                                animate={{
                                  boxShadow: [
                                    '0 0 0px rgba(74, 222, 128, 0.5)',
                                    '0 0 8px rgba(74, 222, 128, 0.8)',
                                    '0 0 0px rgba(74, 222, 128, 0.5)',
                                  ],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: 'easeInOut',
                                }}
                              />
                              <span className="text-xs font-medium text-green-400 max-sm:text-[10px]">
                                Available
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Footer - Stack buttons on very small screens */}
          <div className="flex justify-end gap-4 border-t border-white/20 bg-gradient-to-r from-black to-gray-900 px-6 py-4 max-md:px-4 max-md:py-3 max-sm:flex-col">
            <button
              onClick={() => setIsShipEquipModalOpen(false)}
              className="rounded-lg border border-white/20 bg-black/50 px-6 py-2 font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white max-sm:order-2 max-sm:w-full">
              Cancel
            </button>

            <button
              onClick={handleEquipShip}
              disabled={!selectedShip || isLoading}
              className="relative overflow-hidden rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-2 font-medium text-white transition-all hover:from-indigo-500 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-50 max-sm:order-1 max-sm:mb-2 max-sm:w-full">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spin size="small" />
                  <span className="max-sm:hidden">Equipping...</span>
                  <span className="hidden max-sm:inline">Loading...</span>
                </span>
              ) : (
                <>
                  <span className="max-sm:hidden">Equip Selected Ship</span>
                  <span className="hidden max-sm:inline">Equip Ship</span>
                </>
              )}
              {/* Add subtle shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-white/10"
                animate={shimmerAnimation.animate}
                transition={shimmerAnimation.transition}
              />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default EquipShipModal;
