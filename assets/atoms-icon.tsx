import * as React from 'react';
import { SVGProps, memo } from 'react';
const Icon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    data-name="Layer 1"
    viewBox="0 0 18.22 23.9"
    {...props}>
    <path
      fill="#fff"
      fillRule="evenodd"
      d="M2.29 5.26S5.21.29 9.04 0c0 0 1.39.08 2.2.61l-.29 1.3-4.5.85-1.51 2.4-2.65.09Z"
    />
    <path
      fill="#fff"
      fillRule="evenodd"
      d="M11.79.92S14.5 2.66 15.71 5l-.86.64-3.36-.77-1.43 2.66-1.78.35-2.65-2.63 1.54-2.06 4.14-.91.47-1.37Z"
    />
    <path
      fill="#fff"
      fillRule="evenodd"
      d="M15.95 5.39s.97 1.71 1.37 2.86l-1.6 2.15 1.34 5-1.23 1.88-2.78-.11-2.09-2.34 1.63-2.81-1.99-4.27 1.3-2.27 3.16.63.89-.71Z"
    />
    <path
      fill="#fff"
      fillRule="evenodd"
      d="M17.45 8.69s2.03 5.64-.53 10.06l-.64-1.07 1.25-2.19-1.33-5.05 1.26-1.75h-.01ZM16.63 19.27s-1.99 3.86-6.16 4.52l-.89-.89.25-1.75 2.57-.36.71-3.05 2.61.12.92 1.41ZM9.98 23.84s-3.27.58-6.24-1.96l1.49-.44 2.38 1.7L9.29 23l.68.84Z"
    />
    <path
      fill="#fff"
      fillRule="evenodd"
      d="M3.39 21.56s-1.41-1.36-2.35-3.27l.53-.4 2.33.29 1.6-3.2 4.89.18 2.05 2.23-.53 2.97-2.46.41-.32 1.81-1.41.1-2.52-1.62-1.81.51Z"
    />
    <path
      fill="#fff"
      fillRule="evenodd"
      d="M.85 17.91S-.79 14.37.48 9.65l1.33 3.19 3.06 1.81s-.74 2.73-1.44 2.93l-2.03-.17-.55.5Z"
    />
    <path
      fill="#fff"
      fillRule="evenodd"
      d="M.63 9.13s.65-2.12 1.46-3.45l2.77-.17 2.99 2.8 2.25-.24 1.81 4.04-1.55 2.64-4.94-.26-3.15-1.99L.61 9.14h.02Z"
    />
  </svg>
);
const AtomsIcon = memo(Icon);
export default AtomsIcon;
