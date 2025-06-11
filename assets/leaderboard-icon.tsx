import * as React from 'react';
import { SVGProps, memo } from 'react';

const Icon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={12}
    height={13}
    fill="none"
    {...props}>
    <path
      fill="#fff"
      d="M7.208 0H4.236v13h2.972V0ZM2.972 13H0V4.333h2.972V13Zm5.5-7.222h2.972V13H8.472V5.778Z"
    />
  </svg>
);

const LeaderboardIcon = memo(Icon);
export default LeaderboardIcon;
