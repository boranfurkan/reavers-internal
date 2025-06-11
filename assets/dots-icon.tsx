import * as React from 'react';
import { SVGProps, memo } from 'react';
const Icon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={1} height={417} {...props}>
    <title>{'Line 2'}</title>
    <path
      fill="none"
      stroke="#FFF"
      strokeDasharray="0,8"
      strokeLinecap="square"
      d="M.5.5v422.561"
    />
  </svg>
);
const DotsIcon = memo(Icon);
export default DotsIcon;
