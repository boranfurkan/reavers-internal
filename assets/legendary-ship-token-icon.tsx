import * as React from 'react';
import { SVGProps, memo } from 'react';

const Icon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    data-name="Layer 1"
    viewBox="0 0 23.76 23.76"
    {...props}>
    <circle cx={11.88} cy={11.88} r={11.88} fill="#cc9d46" />
    <circle
      cx={11.88}
      cy={11.88}
      r={9.71}
      fill="none"
      stroke="#f9c675"
      strokeMiterlimit={10}
    />
    <g fill="#f9c675">
      <path d="M18.99 12.78v.86s-1.16.51-1.58 1.28-1.29 2.4-2.34 2.41-6.44 0-6.44 0-3.35-.34-3.36-3.88h3.45v.43s.22.94 1.03.94 1.7-.01 1.7-.01v-1.27H9.76s2.89-2.93-.03-7.66l1.74.45-.02-.9s.69-1.11 1.28.05v1.17s5.68 3.4.99 6.91h-.99v1.26h1.5s.84-.29 1.25-1.03l3.52-1h-.01Z" />
      <path d="M9.18 12.16H6.01l3.07-4.82s1.83 2.86.1 4.82Z" />
    </g>
    <path
      fill="#ffd597"
      d="m6.01 12.16 3.07-4.82s.37 1.82-.35 3.17-2.72 1.65-2.72 1.65ZM17.75 13.13l-2.29.65s-.56.84-1.25 1.03H9.64s-.75-.13-.92-.93v-.42H5.26s0 1.25.48 2.02c3.44.03 6.89.06 10.33.1l1.68-2.43v-.02Z"
    />
    <path
      fill="#f9c675"
      fillRule="evenodd"
      d="m11.14 18.58.74-.68.71.68-.71 1.89-.74-1.89z"
    />
  </svg>
);

const LegendaryShipTokenIcon = memo(Icon);
export default LegendaryShipTokenIcon;
