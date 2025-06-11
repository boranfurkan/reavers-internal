import React from 'react';
import { formatNumberWithSuffix } from '../../utils/helpers';
import Image from 'next/image';
import GoldBarIcon from '../../assets/gold-bar-icon';

const GoldBarDisplay = ({
  goldBurned,
  className,
}: {
  goldBurned: number | undefined;
  className?: string;
}) => {
  return (
    <div
      className={`flex items-center justify-start gap-4 text-[10px] uppercase text-white/70 sm:text-xs ${className}`}>
      <h6 className="opacity-50">GOLD BARS</h6>
      <div className="flex items-center gap-0.5">
        <p
          style={{
            color: '#e4c368',
          }}>
          {formatNumberWithSuffix(goldBurned)}
        </p>
        <GoldBarIcon width={13} height={13} />
      </div>
    </div>
  );
};

export default GoldBarDisplay;
