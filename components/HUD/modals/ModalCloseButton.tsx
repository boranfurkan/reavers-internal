import React from 'react';

interface ModalCloseButtonProps {
  handleClose: () => void;
  isWithBackground?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

function ModalCloseButton({
  handleClose,
  isWithBackground,
  className,
  style,
}: ModalCloseButtonProps) {
  return (
    <div
      onClick={handleClose}
      className={`scale-75 cursor-pointer border-l border-l-reavers-border p-6 md:scale-100  ${
        isWithBackground && 'bg-reavers-bg'
      } ${className}`}
      style={{
        ...style,
      }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-6 w-6 cursor-pointer font-thin text-white transition-all duration-300 ease-in-out hover:scale-125">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </div>
  );
}

export default ModalCloseButton;
