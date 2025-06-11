import * as React from 'react';
import { SVGProps, memo } from 'react';
const Icon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={11.863}
    height={12.839}
    {...props}>
    <path
      fill="#FFF"
      d="M9.7 8.515c-.563 0-1.105.22-1.508.615L4.264 6.922a2.146 2.146 0 0 0 0-1.014l3.927-2.209a2.155 2.155 0 1 0-.626-1.207L3.546 4.753a2.162 2.162 0 1 0 0 3.322l4.02 2.262A2.162 2.162 0 1 0 9.7 8.515z"
    />
  </svg>
);
const ConnectSocialsIcon = memo(Icon);
export default ConnectSocialsIcon;
