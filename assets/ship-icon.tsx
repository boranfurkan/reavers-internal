import * as React from 'react';
import { SVGProps, memo } from 'react';

const Icon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    data-name="Layer 1"
    viewBox="0 0 23.25 20.99"
    {...props}>
    <path
      fill="currentColor"
      d="M23.25 13.28v1.45s-1.96.87-2.68 2.16-2.19 4.07-3.97 4.09-10.91 0-10.91 0S.01 20.4 0 14.4l5.84.02.02.71s.36 1.59 1.73 1.59 2.88-.02 2.88-.02v-2.15l-2.87-.02s4.9-4.95-.05-12.96l2.94.76-.04-1.52s1.17-1.88 2.16.09l.02 1.98s9.6 5.76 1.66 11.7l-1.67-.02v2.15h2.54s1.42-.49 2.12-1.74l5.97-1.69Z"
    />
    <path fill="currentColor" d="M6.64 12.22H1.27l5.2-8.16s3.1 4.84.17 8.16Z" />
  </svg>
);

const ShipIcon = memo(Icon);
export default ShipIcon;
