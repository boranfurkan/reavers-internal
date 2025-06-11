import React from 'react';

interface ControlButtonsProps {
  onUpButtonClick: () => void;
  onDownButtonClick: () => void;
  onMiddleButtonClick: () => void;
  disabled?: boolean;
}

const ControlButtons = ({
  onUpButtonClick,
  onDownButtonClick,
  onMiddleButtonClick,
  disabled,
}: ControlButtonsProps) => {
  return (
    <div className="layer-nav fixed right-2 top-1/2 z-10 grid -translate-y-1/2 scale-90 transform grid-cols-1 text-white md:right-4 md:scale-100">
      <div
        className="btn rounded-b-[0px] rounded-t-[4px] bg-reavers-bg"
        onClick={!disabled ? onDownButtonClick : undefined}
        style={{
          pointerEvents: disabled ? 'none' : 'auto',
          opacity: disabled ? 0.5 : 1,
        }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 15.75l7.5-7.5 7.5 7.5"
          />
        </svg>
      </div>
      <div
        className={'btn rounded-[0px] bg-reavers-bg'}
        onClick={!disabled ? onMiddleButtonClick : undefined}
        style={{
          pointerEvents: disabled ? 'none' : 'auto',
          opacity: disabled ? 0.5 : 1,
        }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3"
          />
        </svg>
      </div>
      <div
        className="btn rounded-b-[5px] rounded-t-[0px] bg-reavers-bg"
        onClick={!disabled ? onUpButtonClick : undefined}
        style={{
          pointerEvents: disabled ? 'none' : 'auto',
          opacity: disabled ? 0.5 : 1,
        }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </div>
    </div>
  );
};

export default ControlButtons;
