import React, { memo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { NFTType } from '../../../../types/BaseEntity';
import {
  cn,
  getLevelRarity,
  shortenSolanaAddress,
} from '../../../../utils/helpers';
import {
  animations,
  getEquippedEntityInfo,
  copyToClipboard,
  getRarityGradient,
  getRarityBorderColor,
} from '../../../../utils/inventory-helpers';
import CopyIcon from '../../../../assets/copy-icon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../../components/ui/tooltip';
import { ItemData } from '../../../../lib/types';
import { toast } from 'sonner';
import { GiInfo } from 'react-icons/gi';

interface ItemCardProps {
  item: ItemData;
}

const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  const itemRarity = getLevelRarity(NFTType.ITEM, item.level || 1);
  const equippedEntity = getEquippedEntityInfo(item.equippedTo);

  // Copy handler with toast feedback
  const handleCopy = () =>
    copyToClipboard(item.mint?.toString() || item.uid || '', toast.success);

  return (
    <motion.div
      id={`crew-card-${item.mint ? item.mint : item.uid}`}
      variants={animations.cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      className={cn(
        `relative overflow-hidden rounded-lg border border-white/20`,
      )}
      style={{
        ...getRarityGradient(itemRarity),
      }}>
      {/* Glass overlay with subtle animation */}
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        animate={{
          backgroundImage: [
            'linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0.3))',
            'linear-gradient(to right, rgba(0,0,0,0.3), rgba(0,0,0,0.4))',
            'linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0.3))',
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <div className="relative z-10 flex h-full flex-col">
        {/* Header section with badge and item name */}
        <div className="mb-3 flex items-center justify-between border-b border-white/30 p-3">
          <motion.div
            className="w-2/3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}>
            <h3 className="truncate text-left text-lg font-bold leading-tight tracking-wide text-white">
              {item.name || item.metadata?.name || 'Item'}
            </h3>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className={` inline-flex items-center rounded border px-2 py-0.5 text-xs font-bold uppercase tracking-wider shadow-sm`}
            style={{
              ...getRarityGradient(itemRarity),
              ...getRarityBorderColor(itemRarity),
            }}>
            {itemRarity}
          </motion.div>
        </div>

        {/* Image and Info section */}
        <div className="flex px-3">
          {/* Item Image */}
          <motion.div
            className="relative h-36 w-36 flex-shrink-0 overflow-hidden rounded-md bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}>
            <Image
              src={item.metadata?.image || '/images/default-item.webp'}
              alt={item.metadata?.name || 'Item'}
              fill
              className="object-cover"
              unoptimized
            />

            {(item.mint || item.uid) && (
              <button
                onClick={() => {
                  handleCopy();
                }}
                className="absolute left-1 top-1 z-10 rounded-full bg-black p-1.5">
                <CopyIcon className="h-4 w-4" fill="white" />
              </button>
            )}

            {/* Item type label overlay */}
            <div className="absolute bottom-0 left-0 rounded-tr-md bg-black/80 px-2 py-1">
              <span className="block max-w-[90%] text-xs font-medium uppercase text-white">
                ITEM
              </span>
            </div>
          </motion.div>

          {/* Stats Cards - Right side */}
          <div className="ml-3 flex w-full flex-col gap-2">
            {/* Level Card */}
            <motion.div
              className="flex h-1/2 flex-col items-center justify-center rounded bg-black/30 p-2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}>
              <span className="text-xs uppercase text-white/70">Level</span>
              <div className="mt-0.5 flex items-center">
                <span className="text-sm font-medium text-white">
                  {item.level || 1}
                </span>
              </div>
            </motion.div>

            {/* Status Card with Refined Tooltip */}
            <motion.div
              className="flex h-1/2 flex-col items-center justify-center rounded bg-black/30 p-2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}>
              <span className="text-xs uppercase text-white/70">Status</span>

              {item.equipped && item.equippedTo ? (
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger className="w-full">
                      <div className="flex items-center justify-center gap-1">
                        <div className="mt-0.5 flex cursor-pointer items-center justify-center">
                          <motion.div
                            className="mr-1.5 h-2 w-2 rounded-full bg-green-500"
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
                          <span className="text-sm font-medium text-white">
                            Equipped
                          </span>
                        </div>
                        <GiInfo
                          width={16}
                          height={16}
                          className="mb-0.5 self-end text-white/70 transition-colors hover:text-white"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      align="center"
                      sideOffset={5}
                      className="z-[9999] w-52 border border-black/50 bg-black p-0 shadow-xl">
                      <div className="flex flex-col overflow-hidden rounded">
                        {/* Tooltip Header */}
                        <div className="border-b border-black/90 bg-black px-3 py-2">
                          <h4 className="text-xs font-medium uppercase text-white/90">
                            Equipped To
                          </h4>
                        </div>

                        {/* Tooltip Content */}
                        <div className="bg-black/90 p-3">
                          <div className="flex items-center justify-center gap-2 pb-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-xs font-semibold text-white">
                              Active Assignment
                            </span>
                          </div>

                          <div className="mt-1 space-y-2 border-t border-white/10 pt-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                Type:
                              </span>
                              <span className="text-xs font-medium text-white">
                                {equippedEntity.type}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">ID:</span>
                              <span className="text-xs font-medium text-white">
                                {equippedEntity.id}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <div className="mt-0.5 flex items-center">
                  <div className="mr-1.5 h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-white">
                    Not Equipped
                  </span>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Bottom info section */}
        <motion.div
          className="mt-3 border-t border-white/30 bg-black/30 p-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}>
          {item.minted ? (
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider text-white/70">
                Minted
              </div>
              <div className="flex items-center">
                <span className="mr-2 max-w-[100px] text-xs text-white">
                  {shortenSolanaAddress(item.mint || '')}
                </span>
                <motion.button
                  onClick={handleCopy}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-white/70 transition-colors hover:text-white">
                  <CopyIcon width={14} height={14} />
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="text-center text-xs uppercase text-white/70">
              Not Minted
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

// Using memo to prevent unnecessary re-renders
export default memo(ItemCard);
