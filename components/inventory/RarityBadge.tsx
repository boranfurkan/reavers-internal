import React from 'react';

interface RarityBadgeProps {
  bgColor: string;
  rarityText: string;
  secondayText?: string;
  className?: string;
  size?: 'extraSmall' | 'small' | 'medium' | 'large';
}

const RarityBadge = ({
  bgColor,
  rarityText,
  secondayText,
  className,
  size = 'medium',
}: RarityBadgeProps) => {
  const sizeClasses = {
    extraSmall: {
      textSize: 'text-[8px] leading-[8px]',
      secondaryTextSize: 'text-[6px] leading-[6px]',
      padding: 'px-[5px] py-[2.5px]',
    },
    small: {
      textSize: 'text-[9px] leading-[9px]',
      secondaryTextSize: 'text-[7px] leading-[7px]',
      padding: 'px-[6.5px] py-[3px]',
    },
    medium: {
      textSize: 'text-xs',
      secondaryTextSize: 'text-[10px]',
      padding: 'px-[6.5px] py-[3px]',
    },
    large: {
      textSize: 'text-sm',
      secondaryTextSize: 'text-[12px]',
      padding: 'px-[8px] py-[4px]',
    },
  };

  const { textSize, secondaryTextSize, padding } = sizeClasses[size];

  return (
    <div
      style={{
        backgroundColor: bgColor,
      }}
      className={`flex h-max w-max items-center justify-center rounded-full !bg-opacity-40 ${padding} ${className}`}>
      <span className={`${textSize} uppercase`}>
        <span className="text-center">{rarityText}</span>
        {secondayText && (
          <span className={`${secondaryTextSize} uppercase`}>
            {secondayText}
          </span>
        )}
      </span>
    </div>
  );
};

export default RarityBadge;
