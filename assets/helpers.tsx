import React from 'react';
import AtomsIcon from './atoms-icon';
import BrohallaIcon from './brohalla-icon';
import LastHavenIcon from './last-haven-icon';
import ReaversIcon from './reavers-icon';
import TheSevenSeasIcon from './the-seven-seas-icon';
import ElementerraIcon from './elementerra-icon';

type IconProps = Omit<React.SVGProps<SVGSVGElement>, 'ref'> & {
  ref?: React.Ref<SVGSVGElement>;
};

export const getCollectionIcon = (
  collectionName: string,
  props: IconProps = {},
) => {
  switch (collectionName) {
    case 'The Seven Seas':
      return <TheSevenSeasIcon {...props} />;
    case 'Reavers':
      return <ReaversIcon {...props} />;
    case 'BroHalla':
      return <BrohallaIcon {...props} />;
    case 'Atoms':
      return <AtomsIcon {...props} />;
    case 'Elementerra':
      return <ElementerraIcon {...props} />;
    case 'Last Haven':
      return <LastHavenIcon {...props} />;
    default:
      return <TheSevenSeasIcon {...props} />;
  }
};
