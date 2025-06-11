import React from 'react';

interface CustomProgressBarAttributes {
  progress: number;
  color?: string;
  heigth?: number;
  className?: string;
  borderless?: boolean;
  showText?: boolean;
}

const CustomProgressBar = ({
  progress,
  color,
  heigth,
  className,
  borderless,
  showText,
}: CustomProgressBarAttributes) => {
  let bg = '';

  if (progress < 30) {
    bg = '#e64a4a';
  }
  if (progress >= 30 && progress < 70) {
    bg = '#e5d84a';
  }
  if (progress >= 70) {
    bg = '#4de64b';
  }

  return (
    <div className="flex w-full flex-col items-center gap-0.5">
      {showText && <span className="text-xs">{progress}%</span>}
      <div
        className={`w-full rounded-lg bg-card-not-selected-bg ${
          borderless ? 'p-0' : 'p-1'
        } ${className}`}>
        <div className="bg-dark-gray w-full rounded-lg">
          <div
            className="rounded-full transition-all duration-300 ease-in-out"
            style={{
              width: `${progress}%`,
              backgroundColor: color ? color : bg,
              height: heigth ? `${heigth}px` : '4px',
            }}></div>
        </div>
      </div>
    </div>
  );
};

export default CustomProgressBar;
