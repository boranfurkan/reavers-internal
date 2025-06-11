import React from 'react';
import Image from 'next/image';
import Logo from '../public/thesevenseas-transparent-logo.png';

function ReaversLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex h-full w-full items-center justify-center bg-reavers-bg bg-opacity-60 backdrop-blur-xl">
      <div className="logo spin">
        <Image
          src={Logo}
          alt="Reavers Logo"
          width={96}
          height={96}
          className="h-16 w-16 object-center md:h-24 md:w-24"
        />
      </div>
    </div>
  );
}

export default ReaversLoader;
