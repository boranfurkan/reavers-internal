import * as React from 'react';
import { SVGProps, memo } from 'react';
const Icon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={14.5}
    height={13.05}
    {...props}>
    <path
      fill="#FE4434"
      d="M7.975 0a6.48 6.48 0 0 1 4.613 1.912A6.48 6.48 0 0 1 14.5 6.525a6.48 6.48 0 0 1-1.912 4.614 6.48 6.48 0 0 1-4.613 1.911 6.48 6.48 0 0 1-4.615-1.91l1.026-1.025A5.042 5.042 0 0 0 7.975 11.6a5.04 5.04 0 0 0 3.588-1.486 5.042 5.042 0 0 0 1.487-3.589 5.04 5.04 0 0 0-1.487-3.588A5.042 5.042 0 0 0 7.975 1.45c-1.356 0-2.63.528-3.588 1.487L3.36 1.912A6.48 6.48 0 0 1 7.975 0zm-4.35 3.625V5.8h6.524v1.45H3.625v2.175L0 6.525l3.625-2.9z"
    />
  </svg>
);
const LogoutIcon = memo(Icon);
export default LogoutIcon;
