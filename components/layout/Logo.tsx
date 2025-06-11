import Brand from '../../public/thesevenseas-transparent-logo.png';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export const Logo = () => {
  return (
    <Link
      href="/"
      passHref
      className="flex h-max w-max flex-row items-center justify-start gap-2 rounded-md bg-reavers-bg px-1 py-0.5">
      <Image
        src={Brand}
        alt="brand-logo"
        className="w-8 cursor-pointer"
        unoptimized={true}
      />
      <h3 className="!mb-0 text-white">
        <span className="!mb-0"> THE SEVEN SEAS</span>
      </h3>
    </Link>
  );
};
