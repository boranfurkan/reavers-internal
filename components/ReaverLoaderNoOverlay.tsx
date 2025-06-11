import React from 'react';
import Image from 'next/image';
import Logo from '../public/thesevenseas-transparent-logo.png';

const ReaverLoaderNoOverlay = () => {
  return (
    <div className="logo spin">
      <Image
        src={Logo}
        alt="Reavers Logo"
        className="h-16 w-16 object-center md:h-24 md:w-24"
      />
    </div>
  );
};

export default ReaverLoaderNoOverlay;
