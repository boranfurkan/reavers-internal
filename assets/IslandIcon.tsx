import * as React from 'react';
import { SVGProps, memo } from 'react';

const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" {...props}>
    <path d="m384 476.1-192-54.9V35.9l192 54.9v385.3zm32-1.2V88.4l127.1-50.9c15.8-6.3 32.9 5.3 32.9 22.3v334.8c0 9.8-6 18.6-15.1 22.3L416 474.8zM15.1 95.1 160 37.2v386.5L32.9 474.5C17.1 480.8 0 469.2 0 452.2V117.4c0-9.8 6-18.6 15.1-22.3z" />
  </svg>
);

const IslandIcon = memo(SvgComponent);
export default IslandIcon;
