import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Scroll,
  Zap,
  Coins,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { LayerContext } from '../../contexts/LayerContext';
import Image from 'next/image';
import CrewIcon from '../../assets/crew-icon';
import ItemsIcon from '../../assets/items-icon';
import ShipIcon from '../../assets/ship-icon';
import BattleTokenIcon from '../../assets/battle-token-icon';

// Image Lightbox Component
interface ImageLightboxProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({
  src,
  alt,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-lg">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70">
            <X className="h-6 w-6" />
          </button>
          <Image
            src={src}
            alt={alt}
            width={1920}
            height={1080}
            quality={100}
            className="object-contain"
            style={{ maxHeight: '90vh', maxWidth: '90vw' }}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Progress Indicator Component
interface ProgressIndicatorProps {
  currentPage: number;
  totalPages: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentPage,
  totalPages,
}) => {
  return (
    <div className="mb-4 flex items-center justify-center gap-2">
      {Array.from({ length: totalPages }, (_, index) => (
        <div
          key={index}
          className={`h-1.5 w-6 rounded-full transition-all duration-300 md:h-2 md:w-8 ${
            index <= currentPage
              ? 'bg-blue-400' // Current and completed - subtle blue
              : 'bg-white bg-opacity-20' // Not reached
          }`}
        />
      ))}
      <span className="ml-3 text-xs text-white text-opacity-45 md:text-sm">
        {currentPage + 1} of {totalPages}
      </span>
    </div>
  );
};

// Page Components
const OverviewPage: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-4 md:space-y-6">
    {/* Title Section */}
    <div className="text-center">
      <h1 className="mb-3 text-xl font-bold text-white md:mb-4 md:text-2xl">
        Streamline your journey in the latest Rising Tides update
      </h1>
      <p className="text-sm leading-relaxed text-white text-opacity-80 md:text-base">
        The seas just got smoother as we introduce{' '}
        <span className="font-semibold text-purple-400">The Graveyard</span> — a
        powerful new toolset that combines your assets into a single force,
        setting the stage for the age of BOOTY. Simplify, consolidate, and
        prepare for what's ahead... because this is only the beginning.
      </p>
    </div>

    {/* Important Notice */}
    <div className="rounded-lg border border-red-400 border-opacity-30 bg-red-500 bg-opacity-10 p-3 md:p-4">
      <div className="mb-2 flex items-center gap-2">
        <Zap className="h-4 w-4 text-red-400 md:h-5 md:w-5" />
        <span className="text-sm font-bold text-red-400 md:text-base">
          IMPORTANT NOTE:
        </span>
      </div>
      <p className="text-xs text-red-200 md:text-sm">
        Emissions will be Halted until Wednesday @7pm UTC to Allow All Users the
        Opportunity to Ready their Teams
      </p>
    </div>

    {/* Table of Contents */}
    <div className="rounded-lg border border-white border-opacity-10 bg-black bg-opacity-40 p-3 md:p-4">
      <h3 className="mb-3 text-base font-bold text-white md:mb-4 md:text-lg">
        WHAT'S NEW IN THIS UPDATE
      </h3>
      <ol className="list-inside list-decimal space-y-1.5 text-xs text-white text-opacity-80 md:space-y-2 md:text-sm">
        <li>The Graveyard - Central hub for transformation</li>
        <li>Captain Merging - Unify your legacy collections</li>
        <li>Items, Ships and Crew - New burning system</li>
        <li>Battle Tokens - Streamlined progression</li>
      </ol>
    </div>
  </motion.div>
);

const GraveyardPage: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-4 md:space-y-6">
    <div className="mb-3 flex items-center gap-3 md:mb-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-purple-400 border-opacity-30 bg-purple-500 bg-opacity-20 md:h-10 md:w-10">
        <span className="text-sm font-bold text-purple-300 md:text-lg">1</span>
      </div>
      <h2 className="text-xl font-bold text-white md:text-2xl">
        The Graveyard
      </h2>
    </div>

    <div className="rounded-lg border border-white border-opacity-10 bg-black bg-opacity-40 p-4 md:p-6">
      <p className="mb-4 text-sm leading-relaxed text-white text-opacity-80 md:mb-6 md:text-base">
        The Graveyard is your central hub for transformation — accessible
        directly from the main menu. Here, you can burn outdated assets from
        legacy collections to align with the new Captain's Club system.
      </p>

      <div className="mb-4 space-y-3 md:mb-6 md:space-y-4">
        <div className="flex items-start gap-3 rounded-lg bg-white bg-opacity-5 p-3 md:p-4">
          <CrewIcon className="mt-1 h-5 w-5 flex-shrink-0 text-white text-opacity-60 md:h-6 md:w-6" />
          <div>
            <h4 className="mb-1.5 text-sm font-bold text-white md:mb-2 md:text-base">
              Legacy Captain Collections
            </h4>
            <p className="text-xs text-white text-opacity-80 md:text-sm">
              Captains from{' '}
              <span className="font-semibold text-purple-400">
                Reavers, Last Haven, Dragon Sols, Asgardians, Steam Punks, and
                Sirens
              </span>{' '}
              can be sacrificed to receive a 1:1 clone under the unified
              Captain's Club collection.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg bg-white bg-opacity-5 p-3 md:p-4">
          <ItemsIcon className="mt-1 h-5 w-5 flex-shrink-0 text-white text-opacity-60 md:h-6 md:w-6" />
          <div>
            <h4 className="mb-1.5 text-sm font-bold text-white md:mb-2 md:text-base">
              Assets Transformation
            </h4>
            <p className="text-xs text-white text-opacity-80 md:text-sm">
              Items, Crew, and Ships will be permanently burned in exchange for
              Leveling Tokens, which can be used to upgrade your new Captains.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white border-opacity-10 py-3 text-center md:py-4">
        <p className="text-sm font-bold italic text-purple-300 md:text-base">
          Out with the old. In with the legendary.
        </p>
      </div>
    </div>
  </motion.div>
);

const CaptainMergingPage: React.FC<{
  openLightbox: (src: string, alt: string) => void;
}> = ({ openLightbox }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-4 md:space-y-6">
    <div className="mb-3 flex items-center gap-3 md:mb-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-400 border-opacity-30 bg-blue-500 bg-opacity-20 md:h-10 md:w-10">
        <span className="text-sm font-bold text-blue-300 md:text-lg">2</span>
      </div>
      <h2 className="text-xl font-bold text-white md:text-2xl">
        The Captains Merge
      </h2>
    </div>

    {/* Images Row */}
    <div className="mb-4 grid grid-cols-1 gap-3 md:mb-6 md:gap-4 lg:grid-cols-2">
      <div className="overflow-hidden rounded-lg border border-white border-opacity-10">
        <div
          className="flex h-40 w-full cursor-pointer items-center justify-center bg-black bg-opacity-40 transition-colors hover:bg-opacity-60 md:h-48"
          onClick={() =>
            openLightbox(
              '/images/captains-log/page-1-1.png',
              'Captain Merge Interface',
            )
          }>
          <div className="text-center text-white text-opacity-60">
            <CrewIcon className="mx-auto mb-2 h-8 w-8 md:h-12 md:w-12" />
            <p className="text-xs md:text-sm">Captain Merge Interface</p>
            <p className="text-xs">(Click to view full size)</p>
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-white border-opacity-10">
        <div
          className="flex h-40 w-full cursor-pointer items-center justify-center bg-black bg-opacity-40 transition-colors hover:bg-opacity-60 md:h-48"
          onClick={() =>
            openLightbox(
              '/images/captains-log/page-1-2.png',
              'Legacy Collections',
            )
          }>
          <div className="text-center text-white text-opacity-60">
            <CrewIcon className="mx-auto mb-2 h-8 w-8 md:h-12 md:w-12" />
            <p className="text-xs md:text-sm">Legacy Collections</p>
            <p className="text-xs">(Click to view full size)</p>
          </div>
        </div>
      </div>
    </div>

    <div className="rounded-lg border border-white border-opacity-10 bg-black bg-opacity-40 p-4 md:p-6">
      <p className="mb-4 text-sm leading-relaxed text-white text-opacity-80 md:mb-6 md:text-base">
        As the tides shift, so too must the fleets that sail them. The Captains
        Merge marks a major evolution in Rising Tides — bringing together six
        legacy collections into one unified force:{' '}
        <span className="font-bold text-blue-300">The Captain's Club</span>.
      </p>

      <h4 className="mb-3 text-base font-bold text-blue-300 md:mb-4 md:text-lg">
        How it works:
      </h4>
      <div className="mb-4 space-y-2.5 md:mb-6 md:space-y-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex aspect-square h-5 w-5 items-center justify-center rounded-full bg-blue-500 bg-opacity-30 text-xs font-bold text-blue-300 md:h-6 md:w-6 md:text-sm">
            1
          </div>
          <p className="text-xs text-white text-opacity-80 md:text-sm">
            Merging is done one Captain at a time.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex aspect-square h-5 w-5 items-center justify-center rounded-full bg-blue-500 bg-opacity-30 text-xs font-bold text-blue-300 md:h-6 md:w-6 md:text-sm">
            2
          </div>
          <p className="text-xs text-white text-opacity-80 md:text-sm">
            When a legacy Captain is burned via The Graveyard, a 1:1 Captain's
            Club clone is immediately minted to your wallet.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex aspect-square h-5 w-5 items-center justify-center rounded-full bg-blue-500 bg-opacity-30 text-xs font-bold text-blue-300 md:h-6 md:w-6 md:text-sm">
            3
          </div>
          <p className="text-xs text-white text-opacity-80 md:text-sm">
            The new Captain must then be manually restaked in-game to resume
            progression.
          </p>
        </div>
      </div>

      <div className="mb-3 rounded-lg border border-yellow-400 border-opacity-30 bg-yellow-500 bg-opacity-10 p-3 md:mb-4 md:p-4">
        <h5 className="mb-1.5 text-sm font-bold text-yellow-400 md:mb-2 md:text-base">
          ⚠️ Important:
        </h5>
        <p className="text-xs text-yellow-200 md:text-sm">
          With this update, Legacy Minted Captains are no longer eligible for
          Missions or gameplay progression. To continue earning and leveling,
          all legacy Captains must go through the merging process.
        </p>
      </div>

      <div className="border-t border-white border-opacity-10 py-3 text-center md:py-4">
        <p className="text-sm font-bold italic text-blue-300 md:text-base">
          This isn't just a cleanup — it's the rebirth of your fleet,
          restructured and ready to conquer what's ahead.
        </p>
      </div>
    </div>
  </motion.div>
);

const AssetBurningPage: React.FC<{
  openLightbox: (src: string, alt: string) => void;
}> = ({ openLightbox }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-4 md:space-y-6">
    <div className="mb-3 flex items-center gap-3 md:mb-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-green-400 border-opacity-30 bg-green-500 bg-opacity-20 md:h-10 md:w-10">
        <span className="text-sm font-bold text-green-300 md:text-lg">3</span>
      </div>
      <h2 className="text-xl font-bold text-white md:text-2xl">
        Burning Items, Crew and Ships
      </h2>
    </div>

    {/* Images Row */}
    <div className="mb-4 grid grid-cols-1 gap-3 md:mb-6 md:gap-4 lg:grid-cols-2">
      <div className="overflow-hidden rounded-lg border border-white border-opacity-10">
        <div
          className="flex h-40 w-full cursor-pointer items-center justify-center bg-black bg-opacity-40 transition-colors hover:bg-opacity-60 md:h-48"
          onClick={() =>
            openLightbox(
              '/images/captains-log/page-2-1.png',
              'Items Burning Interface',
            )
          }>
          <div className="text-center text-white text-opacity-60">
            <ItemsIcon className="mx-auto mb-2 h-8 w-8 md:h-12 md:w-12" />
            <p className="text-xs md:text-sm">Items Burning Interface</p>
            <p className="text-xs">(Click to view full size)</p>
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-white border-opacity-10">
        <div
          className="flex h-40 w-full cursor-pointer items-center justify-center bg-black bg-opacity-40 transition-colors hover:bg-opacity-60 md:h-48"
          onClick={() =>
            openLightbox(
              '/images/captains-log/page-2-2.png',
              'Ship Burning Interface',
            )
          }>
          <div className="text-center text-white text-opacity-60">
            <ShipIcon className="mx-auto mb-2 h-8 w-8 text-white md:h-12 md:w-12" />
            <p className="text-xs md:text-sm">Ship Burning Interface</p>
            <p className="text-xs">(Click to view full size)</p>
          </div>
        </div>
      </div>
    </div>

    <div className="rounded-lg border border-white border-opacity-10 bg-black bg-opacity-40 p-4 md:p-6">
      <p className="mb-4 text-sm leading-relaxed text-white text-opacity-80 md:mb-6 md:text-base">
        With this update, the old makes way for the new — and your gear finds
        new purpose. Items, Crew, and Ships must be burned to transition into
        the streamlined progression system under the Captain's Club.
      </p>

      <p className="mb-4 text-sm leading-relaxed text-white text-opacity-80 md:mb-6 md:text-base">
        These assets are no longer stored as standalone NFTs. Instead, each
        Captain NFT now features new metadata slots for Ship, Item, and Crew —
        where leveling is visually tracked and strategically upgraded.
      </p>

      <h4 className="mb-3 text-base font-bold text-green-300 md:mb-4 md:text-lg">
        Token Breakdown:
      </h4>
      <div className="mb-4 grid grid-cols-1 gap-3 md:mb-6 md:grid-cols-2 md:gap-4">
        <div className="flex items-center gap-3 rounded-lg bg-white bg-opacity-5 p-3 md:p-4">
          <ShipIcon className="h-6 w-6 text-blue-400 md:h-8 md:w-8" />
          <div className="flex w-full flex-col">
            <div className="text-sm font-bold text-blue-400 md:text-base">
              Ships
            </div>
            <div className="text-xs text-white text-opacity-60 md:text-sm">
              Grant Ship Leveling Tokens
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-white bg-opacity-5 p-3 md:p-4">
          <ItemsIcon className="h-6 w-6 text-purple-400 md:h-8 md:w-8" />
          <div className="flex w-full flex-col">
            <div className="text-sm font-bold text-purple-400 md:text-base">
              Items
            </div>
            <div className="text-xs text-white text-opacity-60 md:text-sm">
              Grant Item Leveling Tokens
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-white bg-opacity-5 p-3 md:p-4">
          <CrewIcon className="h-6 w-6 text-green-400 md:h-8 md:w-8" />
          <div className="flex w-full flex-col">
            <div className="text-sm font-bold text-green-400 md:text-base">
              Crew
            </div>
            <div className="text-xs text-white text-opacity-60 md:text-sm">
              Grant Crew Leveling Tokens
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-white bg-opacity-5 p-3 md:p-4">
          <ShipIcon className="h-6 w-6 text-yellow-400 md:h-8 md:w-8" />
          <div className="flex w-full flex-col">
            <div className="text-sm font-bold text-yellow-400 md:text-base">
              Mythic Ships
            </div>
            <div className="text-xs text-white text-opacity-60 md:text-sm">
              Grant 2x Mythic Ship Upgrade Tokens
            </div>
          </div>
        </div>
      </div>

      <div className="mb-3 rounded-lg border border-yellow-400 border-opacity-30 bg-yellow-500 bg-opacity-10 p-3 md:mb-4 md:p-4">
        <h5 className="mb-1.5 text-sm font-bold text-yellow-400 md:mb-2 md:text-base">
          🎁 Bonus Airdrop:
        </h5>
        <p className="text-xs text-yellow-200 md:text-sm">
          If any of the burned assets were previously minted NFTs, you'll also
          receive a GOLD airdrop as part of the process — a reward for your
          early contributions to the fleet.
        </p>
      </div>

      <div className="border-t border-white border-opacity-10 py-3 text-center md:py-4">
        <p className="text-sm font-bold italic text-green-300 md:text-base">
          The power is now in your hands. Customize. Optimize. And prepare your
          Captains for the battles ahead.
        </p>
      </div>
    </div>
  </motion.div>
);

const BattleTokensPage: React.FC<{
  openLightbox: (src: string, alt: string) => void;
}> = ({ openLightbox }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-4 md:space-y-6">
    <div className="mb-3 flex items-center gap-3 md:mb-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-orange-400 border-opacity-30 bg-orange-500 bg-opacity-20 md:h-10 md:w-10">
        <span className="text-sm font-bold text-orange-300 md:text-lg">4</span>
      </div>
      <h2 className="text-xl font-bold text-white md:text-2xl">
        Battle Tokens
      </h2>
    </div>

    {/* Battle Token Image */}
    <div className="mb-4 md:mb-6">
      <div className="overflow-hidden rounded-lg border border-white border-opacity-10">
        <div
          className="flex h-48 w-full cursor-pointer items-center justify-center bg-black bg-opacity-40 transition-colors hover:bg-opacity-60 md:h-64"
          onClick={() =>
            openLightbox(
              '/images/captains-log/page-3-1.png',
              'Battle Tokens System',
            )
          }>
          <div className="text-center text-white text-opacity-60">
            <BattleTokenIcon className="mx-auto mb-2 h-12 w-12  md:h-16 md:w-16" />
            <p className="text-sm md:text-base">Battle Tokens System</p>
            <p className="text-xs">(Click to view full size)</p>
          </div>
        </div>
      </div>
    </div>

    <div className="rounded-lg border border-white border-opacity-10 bg-black bg-opacity-40 p-4 md:p-6">
      <p className="mb-4 text-sm leading-relaxed text-white text-opacity-80 md:mb-6 md:text-base">
        The old Battle Token system is gone. No more sending your Captains to
        the Supply Store to farm tokens — it was clunky, slow, and held back
        progression.
      </p>

      <p className="mb-4 text-sm leading-relaxed text-white text-opacity-80 md:mb-6 md:text-base">
        Battle Tokens have now been streamlined and can be purchased directly
        via the in-game exchange at a fixed rate:
      </p>

      <div className="mb-4 py-4 text-center md:mb-6 md:py-6">
        <div className="inline-flex items-center gap-3 rounded-lg border border-yellow-400 border-opacity-30 bg-yellow-400 bg-opacity-10 px-6 py-3 md:gap-4 md:px-8 md:py-4">
          <Coins className="h-6 w-6 text-yellow-400 md:h-8 md:w-8" />
          <span className="text-lg font-bold text-yellow-400 md:text-2xl">
            1 Battle Token = 1 BOOTY
          </span>
        </div>
      </div>

      <div className="mb-4 space-y-3 md:mb-6 md:space-y-4">
        <p className="text-sm leading-relaxed text-white text-opacity-80 md:text-base">
          While leveling remains free on Island 1, earning Treasure during
          leveling now requires:
        </p>

        <div className="py-3 text-center md:py-4">
          <div className="inline-flex items-center gap-3 rounded-lg border border-white border-opacity-20 bg-white bg-opacity-5 px-6 py-3 md:gap-4 md:px-8 md:py-4">
            <Zap className="h-6 w-6 text-orange-400 md:h-8 md:w-8" />
            <span className="text-lg font-bold text-white md:text-2xl">
              2 Battle Tokens per 4 hours per Captain
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-white border-opacity-10 bg-white bg-opacity-5 p-3 md:mb-6 md:p-4">
        <h5 className="mb-2 text-sm font-bold text-white md:mb-3 md:text-base">
          📋 Important Details:
        </h5>
        <div className="space-y-1.5 md:space-y-2">
          <div className="flex items-center gap-2 text-xs md:text-sm">
            <span className="text-white text-opacity-60">⚓</span>
            <span className="text-white text-opacity-80">
              This only applies to Levelling Locations on Island 1
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm">
            <span className="text-white text-opacity-60">❌</span>
            <span className="text-white text-opacity-80">
              It does not apply to Treasure Battle Locations
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm">
            <span className="text-white text-opacity-60">❌</span>
            <span className="text-white text-opacity-80">
              It does not apply to Island 2 leveling (for now)
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-white border-opacity-10 py-3 text-center md:py-4">
        <p className="text-sm leading-relaxed text-orange-300 md:text-base">
          This new system gives players more control over progression pacing,
          while keeping the grind clean, optional, and balanced.
        </p>
      </div>
    </div>
  </motion.div>
);

// Main Captain's Log Modal Component
const CaptainsLogModal: React.FC = () => {
  const layerContext = useContext(LayerContext);
  const [currentPage, setCurrentPage] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!layerContext) {
    throw new Error('CaptainsLogModal must be used within a LayerProvider');
  }

  const { isCaptainsLogModalOpen, setCaptainsLogModalOpen } = layerContext;

  const totalPages = 5;

  // Check localStorage on component mount
  useEffect(() => {
    const shouldHideModal = localStorage.getItem('captainsLog_dontShowAgain');
    if (shouldHideModal === 'true' && isCaptainsLogModalOpen) {
      setCaptainsLogModalOpen(false);
    }
  }, [isCaptainsLogModalOpen, setCaptainsLogModalOpen]);

  const handleClose = () => {
    // Save preference to localStorage if checkbox is checked
    if (dontShowAgain) {
      localStorage.setItem('captainsLog_dontShowAgain', 'true');
    }

    setCaptainsLogModalOpen(false);
    setCurrentPage(0); // Reset to first page when modal closes
    setDontShowAgain(false); // Reset checkbox state
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const openLightbox = (src: string, alt: string) => {
    setLightboxImage({ src, alt });
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 0:
        return <OverviewPage />;
      case 1:
        return <GraveyardPage />;
      case 2:
        return <CaptainMergingPage openLightbox={openLightbox} />;
      case 3:
        return <AssetBurningPage openLightbox={openLightbox} />;
      case 4:
        return <BattleTokensPage openLightbox={openLightbox} />;
      default:
        return <OverviewPage />;
    }
  };

  if (!isCaptainsLogModalOpen) return null;

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-90 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg border border-white border-opacity-20 bg-black bg-opacity-60 shadow-2xl backdrop-blur-md">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white border-opacity-10 bg-black bg-opacity-40 px-4 py-3 md:px-6 md:py-4">
              <div className="flex items-center gap-2 md:gap-3">
                <Scroll className="h-5 w-5 text-white text-opacity-80 md:h-6 md:w-6" />
                <h2 className="text-sm font-bold text-white md:text-xl">
                  The Captain's Log
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-yellow-400 md:gap-2 md:text-sm">
                  <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                  <span>6/23/2025</span>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="rounded-full p-1.5 text-white text-opacity-45 transition-colors hover:bg-white hover:bg-opacity-10 hover:text-white md:p-2">
                <X className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="px-4 pt-3 md:px-6 md:pt-4">
              <ProgressIndicator
                currentPage={currentPage}
                totalPages={totalPages}
              />
            </div>

            {/* Content */}
            <div className="max-h-[calc(90vh-200px)] overflow-y-auto p-4 md:p-6">
              <AnimatePresence mode="wait">
                {renderCurrentPage()}
              </AnimatePresence>
            </div>

            {/* Navigation Footer */}
            <div className="border-t border-white border-opacity-10 bg-black bg-opacity-40 px-4 py-3 md:px-6 md:py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentPage === 0}
                  className={`inline-flex items-center gap-1.5 rounded-lg border border-white border-opacity-20 px-3 py-1.5 text-sm font-medium transition-all md:gap-2 md:px-4 md:py-2 md:text-base ${
                    currentPage === 0
                      ? 'cursor-not-allowed text-white text-opacity-45 opacity-50'
                      : 'bg-black bg-opacity-40 text-white hover:bg-opacity-60'
                  }`}>
                  <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
                  Previous
                </button>

                {/* Don't show again checkbox */}
                <div className=" flex items-center justify-center gap-2">
                  <input
                    type="checkbox"
                    id="dontShowAgain"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="h-4 w-4 rounded border-white border-opacity-20 bg-black bg-opacity-40 text-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
                  />
                  <label
                    htmlFor="dontShowAgain"
                    className="cursor-pointer text-sm text-white text-opacity-70 hover:text-opacity-90 md:text-base">
                    Don't show this again
                  </label>
                </div>

                {currentPage === totalPages - 1 ? (
                  <button
                    onClick={handleClose}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-yellow-400 px-4 py-1.5 text-sm font-bold text-black transition-all hover:bg-yellow-300 md:gap-2 md:px-6 md:py-2 md:text-base">
                    <Scroll className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="max-md:hidden">Acknowledge & </span>Close
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white border-opacity-20 bg-white bg-opacity-10 px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-opacity-20 md:gap-2 md:px-4 md:py-2 md:text-base">
                    Next
                    <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Lightbox */}
      <ImageLightbox
        src={lightboxImage?.src || ''}
        alt={lightboxImage?.alt || ''}
        isOpen={!!lightboxImage}
        onClose={closeLightbox}
      />
    </>
  );
};

export default CaptainsLogModal;
