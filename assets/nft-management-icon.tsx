import * as React from 'react';
import { SVGProps, memo } from 'react';
const Icon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={12.8} {...props}>
    <path
      fill="#FFF"
      d="m10.4 6.4 4-3.2-4-3.2v2.4H0V4h10.4v2.4zM16 8.8H5.6V6.4l-4 3.2 4 3.2v-2.4H16V8.8z"
    />
  </svg>
);
const NftManagementIcon = memo(Icon);
export default NftManagementIcon;
