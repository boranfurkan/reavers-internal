import { motion } from 'framer-motion';
import Link from 'next/link';
import React, { useContext, useEffect } from 'react';
import Image, { StaticImageData } from 'next/image';

import ActivityFeed from '../login/ActivityFeed';

import Brand from '../../public/images/reavers-symbol.svg';
import Brand2 from '../../public/images/reavers-logo-text.svg';
import BrandLastHaven from '../../public/images/LastHaven.png';
import BrandBrohalla from '../../public/images/brologo.png';
import BrandThesevenseas from '../../public/thesevenseas-transparent-logo.png';
import BrandAtoms from '../../public/images/atoms-logo.svg';

import { LayerContext } from '../../contexts/LayerContext';
import { useDomain } from '../../contexts/DomainContext';
import MagicEdenIcon from '../../assets/magic-eden-icon';

// Import from Dynamic
import { DynamicWidget } from '@dynamic-labs/sdk-react-core';

const DiscordIcon = ({ className }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 512"
    fill="#fff"
    className={`hover:fill-reavers-stroke ${className}`}
  >
    <path d="M524.5 69.8a1.5 1.5 0 0 0-.8-.7A485.1 485.1 0 0 0 404.1 32a1.8 1.8 0 0 0-1.9.9 337.5 337.5 0 0 0-14.9 30.6 447.8 447.8 0 0 0-134.4 0 309.5 309.5 0 0 0-15.1-30.6 1.9 1.9 0 0 0-1.9-.9 483.7 483.7 0 0 0-119.8 37.1 1.7 1.7 0 0 0-.8.7C39.1 183.7 18.2 294.7 28.4 404.4a2 2 0 0 0 .8 1.4A487.7 487.7 0 0 0 176 479.9a1.9 1.9 0 0 0 2.1-.7 348.2 348.2 0 0 0 30-48.8 1.9 1.9 0 0 0-1-2.6 321.2 321.2 0 0 1-45.9-21.9 1.9 1.9 0 0 1-.2-3.1c3.1-2.3 6.2-4.7 9.1-7.1a1.8 1.8 0 0 1 1.9-.3c96.2 43.9 200.4 43.9 295.5 0a1.8 1.8 0 0 1 1.9.2c2.9 2.4 6 4.9 9.1 7.2a1.9 1.9 0 0 1-.2 3.1 301.4 301.4 0 0 1-45.9 21.8 1.9 1.9 0 0 0-1 2.6 391.1 391.1 0 0 0 30 48.8 1.9 1.9 0 0 0 2.1.7 486 486 0 0 0 147.2-74.1 1.9 1.9 0 0 0 .8-1.4c12.2-126.7-20.6-236.8-87-334.5zm-302 267.8c-29 0-52.8-26.6-52.8-59.2s23.4-59.3 52.8-59.3c29.7 0 53.3 26.8 52.8 59.2 0 32.7-23.4 59.3-52.8 59.3zm195.4 0c-29 0-52.8-26.6-52.8-59.2s23.3-59.3 52.8-59.3c29.7 0 53.3 26.8 52.8 59.2 0 32.7-23.2 59.3-52.8 59.3z" />
  </svg>
);

const TwitterIcon = ({ className }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="#fff"
    className={`hover:fill-reavers-stroke ${className}`}
  >
    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
  </svg>
);

/**
 * Domain config type without Ledger references
 */
type DomainConfig = {
  name: string;
  backgroundImage: string;
  backgroundStyle?: React.CSSProperties;
  brand: { src: StaticImageData; className: string }[];
  links: {
    href: string;
    text?: string;
    className: string;
    icon?: JSX.Element;
  }[];
  buyLink?: { href: string; text: string };
  hideWelcomeText?: boolean;
  hideAllText?: boolean;
  walletButtonClass?: string;
  parentClass?: string;
};

const domainConfig: Record<string, DomainConfig> = {
  reavers: {
    name: 'Reavers',
    backgroundImage: '/images/reavers-bg-min.webp',
    brand: [
      { src: Brand, className: 'w-12' },
      { src: Brand2, className: 'w-[110px]' },
    ],
    links: [
      {
        href: 'https://discord.com/invite/reavers',
        className: 'flex w-[40px] z-50',
        icon: <DiscordIcon className="" />,
      },
      {
        href: 'https://x.com/reaversnft',
        className: 'flex w-[38px] z-50',
        icon: <TwitterIcon className="" />,
      },
    ],
    buyLink: {
      href: 'https://magiceden.io/marketplace/reavers',
      text: 'Buy a Captain',
    },
    hideWelcomeText: false,
    hideAllText: false,
    walletButtonClass: '',
    parentClass: '',
  },
  brohalla: {
    name: 'Brohalla',
    backgroundImage: '/images/brohalla-bg-min.jpeg',
    backgroundStyle: { backgroundSize: 'cover', backgroundPosition: 'center' },
    brand: [{ src: BrandBrohalla, className: 'w-20' }],
    links: [
      {
        href: 'https://discord.com/invite/brohalla',
        className: 'flex w-[40px]',
        icon: <DiscordIcon className="" />,
      },
      {
        href: 'https://x.com/BroHallaNFT?t=ZY5hobm--EfTGzwpjaKukA&s=09',
        className: 'flex w-[38px]',
        icon: <TwitterIcon className="" />,
      },
    ],
    buyLink: {
      href: 'https://magiceden.io/marketplace/gates_of_brohalla',
      text: 'Buy a Brohalla',
    },
    hideWelcomeText: false,
    hideAllText: false,
    walletButtonClass: '',
    parentClass: '',
  },
  lastHaven: {
    name: 'The Last Haven',
    backgroundImage: '/images/last-haven-bg-min.jpg',
    backgroundStyle: { backgroundSize: 'cover', backgroundPosition: 'center' },
    brand: [{ src: BrandLastHaven, className: 'aspect-[30/8] w-48' }],
    links: [
      {
        href: 'https://discord.com/invite/thelasthaven',
        className: 'flex w-[40px]',
        icon: <DiscordIcon className="" />,
      },
      {
        href: 'https://x.com/lasthaven_io',
        className: 'flex w-[38px]',
        icon: <TwitterIcon className="" />,
      },
    ],
    buyLink: {
      href: 'https://magiceden.io/marketplace/last_haven',
      text: 'Buy a Last Haven',
    },
    hideWelcomeText: true,
    hideAllText: false,
    walletButtonClass: '',
    parentClass: '',
  },
  thesevenseas: {
    name: 'The Seven Seas',
    backgroundImage: '/images/thesevenseas-bg-min.webp',
    backgroundStyle: { backgroundSize: 'cover', backgroundPosition: 'center' },
    brand: [{ src: BrandThesevenseas, className: 'w-20' }],
    links: [
      {
        href: 'https://discord.com/invite/TheSevenSeas',
        className: 'flex w-[40px]',
        icon: <DiscordIcon className="" />,
      },
      {
        href: 'https://x.com/TheSevenSeas_io',
        className: 'flex w-[38px]',
        icon: <TwitterIcon className="" />,
      },
    ],
    hideWelcomeText: true,
    hideAllText: false,
    walletButtonClass: '',
    parentClass: '',
  },
  atoms: {
    name: 'Atoms',
    backgroundImage: '/images/atoms-bg-min.png',
    brand: [{ src: BrandAtoms, className: 'hidden' }],
    links: [
      {
        href: 'https://discord.gg/atoms',
        className: 'flex w-[40px]',
        icon: <DiscordIcon className="" />,
      },
      {
        href: 'https://x.com/Atomia_io',
        className: 'flex w-[38px]',
        icon: <TwitterIcon className="" />,
      },
    ],
    hideWelcomeText: true,
    hideAllText: true,
    walletButtonClass: 'self-end',
    parentClass: '!h-full !items-end !justify-end pb-20',
  },
};

const getDomainConfig = (domain: string): DomainConfig =>
  domainConfig[domain] || domainConfig.lastHaven;

function LoginModal() {
  const layerContext = useContext(LayerContext);
  const { domain } = useDomain();

  if (!layerContext) {
    throw new Error('LayerMap must be used within a LayerProvider');
  }

  const { isMobile } = layerContext;
  const {
    name,
    backgroundImage,
    backgroundStyle,
    brand,
    links,
    buyLink,
    hideWelcomeText,
    hideAllText,
    walletButtonClass,
    parentClass,
  } = getDomainConfig(domain);

  useEffect(() => {
    const bgDiv = document.getElementById('bg-div');
    if (bgDiv) {
      bgDiv.style.backgroundImage = `url(${backgroundImage})`;
      Object.assign(bgDiv.style, backgroundStyle);
    }
  }, [backgroundImage, backgroundStyle]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex h-full w-full flex-col items-center justify-center gap-[6px] bg-black bg-opacity-90 p-[20px] backdrop-blur-md"
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 1, scale: 1, transition: { duration: 0.5 } }}
      transition={{ duration: 1, delay: 0.5 }}
      exit={{ opacity: 0 }}
    >
      <div
        className={`relative flex h-[calc(100vh_-_220px)] w-full max-w-[2400px] flex-col items-center justify-start overflow-hidden rounded-xl border border-white border-opacity-40 bg-[#2d2d2d9c] bg-opacity-40 bg-logged-out text-white backdrop-blur-xl ${
          isMobile && '!h-full items-center justify-between gap-4 pb-16'
        }`}
        id="bg-div"
      >
        {/* Header */}
        <div
          className={`flex w-full flex-row items-center justify-between p-6 ${
            isMobile && '!mb-2 !p-1'
          }`}
        >
          <Link
            href="/"
            passHref
            className="flex scale-75 flex-row items-center justify-center gap-4 md:scale-100"
          >
            {brand.map((b, index) => (
              <Image
                key={index}
                src={b.src}
                alt=""
                className={`cursor-pointer ${b.className}`}
                unoptimized
              />
            ))}
          </Link>
          <div className="z-50 flex items-center justify-end gap-3">
            {links.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                target="_blank"
                passHref
                className={link.className}
              >
                {link.text || link.icon}
              </Link>
            ))}
          </div>
        </div>

        {/* Body */}
        <div
          className={`relative flex h-[50%] w-full flex-col items-center justify-center gap-0 ${
            isMobile && '!h-max gap-7'
          } ${parentClass}`}
        >
          {!hideAllText && (
            <h1 className={`DO-YOU-HAVE-WHAT-IT mx-auto ${isMobile && '!mb-0'}`}>
              {!hideWelcomeText && (
                <>
                  <span>Enter the world of</span>
                  <br />
                </>
              )}
              <span>{name}</span>
            </h1>
          )}

          <div
            className={`relative -mt-4 flex w-full flex-col items-center justify-center gap-6 md:flex-row 2xl:mt-0 ${
              isMobile && 'scale-[0.85] !flex-col !gap-3'
            }`}
          >
            {buyLink && (
              <button
                className={`mymultibutton relative z-[99] flex flex-row items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-[22px] ${
                  isMobile && '!px-8'
                } ${walletButtonClass}`}
              >
                <a
                  href={buyLink.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-row items-center justify-center gap-4"
                >
                  <div className="pt-1.5">{buyLink.text}</div>
                  <MagicEdenIcon className="text-whites h-6 w-6" />
                </a>
              </button>
            )}

            {/* Dynamic widget is enough for all wallet connections, including Ledger */}
            <DynamicWidget />
          </div>
        </div>
      </div>
      {/* Activity Feed */}
      <div className="flex h-auto w-full items-center justify-center">
        <ActivityFeed />
      </div>
    </motion.div>
  );
}

export default LoginModal;
