import React from 'react';
import { NFTType } from '../types/BaseEntity';
import ShipIcon from '../assets/ship-icon';
import CrewIcon from '../assets/crew-icon';
import ItemsIcon from '../assets/items-icon';
import CaptainIcon from '../assets/captain-icon';

interface GetIconForEntitiyProps extends React.SVGProps<SVGSVGElement> {
  entityType: NFTType;
}

const GetIconForEntitiy = React.forwardRef<
  SVGSVGElement,
  GetIconForEntitiyProps
>(({ entityType, ...svgProps }, ref) => {
  switch (entityType) {
    case NFTType.SHIP:
      return <ShipIcon ref={ref} {...svgProps} />;
    case NFTType.CREW:
      return <CrewIcon ref={ref} {...svgProps} />;
    case NFTType.ITEM:
      return <ItemsIcon ref={ref} {...svgProps} />;
    case NFTType.QM:
    case NFTType.FM:
    case NFTType.UNIQUE:
      return <CaptainIcon ref={ref} {...svgProps} />;
    default:
      return <div>Unknown Icon</div>;
  }
});

GetIconForEntitiy.displayName = 'GetIconForEntitiy';

export default GetIconForEntitiy;
