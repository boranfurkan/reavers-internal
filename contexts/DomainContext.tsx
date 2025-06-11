import Head from 'next/head';
import React, {
  createContext,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useMemo,
} from 'react';
import { useCookies } from 'react-cookie';
import { CookieSetOptions } from 'universal-cookie';

interface DomainContextType {
  domain: 'reavers' | 'lasthaven' | 'brohalla' | 'thesevenseas' | 'atoms';
  setDomain: Dispatch<
    SetStateAction<
      'reavers' | 'lasthaven' | 'brohalla' | 'thesevenseas' | 'atoms'
    >
  >;
  cookies: any;
  setCookie: (
    name: string,
    value: any,
    options?: CookieSetOptions | undefined,
  ) => void;
}

const DomainContext = createContext<DomainContextType | undefined>(undefined);

export const useDomain = () => {
  const context = React.useContext(DomainContext);
  if (context === undefined) {
    throw new Error('useDomain must be used within a DomainProvider');
  }
  return context;
};

const domainConfigMap = {
  reavers: {
    domains: [
      'reavers.io',
      'reavers.xyz',
      'r34v3rs-3xp3r1m3nt4l.vercel.app',
      'r34v3rsd3v3l0pm3nt.vercel.app',
      'r34v3rs-st4g1ng.vercel.app',
    ],
    title: 'Reavers',
    description: 'Reavers Game',
    icon: '/reavers-favicon.ico',
  },
  brohalla: {
    domains: [
      'brohalla.io',
      'brohalla.xyz',
      'brohalla.vercel.app',
      'brohalla-staging.vercel.app',
    ],
    title: 'Brohalla',
    description: 'Brohalla Game',
    icon: '/images/brologo.png',
  },
  lasthaven: {
    domains: ['thelasthaven.io', 'lasthaven.io'],
    title: 'Last Haven',
    description: 'Last Haven Game',
    icon: '/lastHavenIcon.png',
  },
  atoms: {
    domains: ['atomia.io'],
    title: 'Atoms',
    description: 'Atoms Game',
    icon: '/images/atoms-logo.svg',
  },
  thesevenseas: {
    domains: ['thesevenseas.io', 'localhost'],
    title: 'The Seven Seas',
    description: 'The Seven Seas Game',
    icon: '/thesevenseas-transparent-logo.png',
  },
};

export const DomainProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [domain, setDomain] = useState<
    'reavers' | 'lasthaven' | 'brohalla' | 'thesevenseas' | 'atoms'
  >('reavers');
  const [cookies, setCookie] = useCookies();

  useEffect(() => {
    const determineDomain = () => {
      const hostname = window.location.hostname;
      for (const [key, config] of Object.entries(domainConfigMap)) {
        if (config.domains.includes(hostname) || hostname.includes(key)) {
          setDomain(key as keyof typeof domainConfigMap);
          setCookie('connectedDomain', hostname, { path: '/' });
          return;
        }
      }
      setDomain('thesevenseas');
      setCookie('connectedDomain', hostname, { path: '/' });
    };

    determineDomain();
  }, [setCookie]);

  const { title, description, icon } = domainConfigMap[domain];

  return (
    <DomainContext.Provider
      value={{
        domain,
        setDomain,
        cookies,
        setCookie,
      }}>
      <Head>
        <title>The Seven Seas</title>
        <meta name="description" content="The Seven Seas Game" />
        <link rel="icon" href="/thesevenseas-transparent-logo.png" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        />
      </Head>
      {children}
    </DomainContext.Provider>
  );
};
