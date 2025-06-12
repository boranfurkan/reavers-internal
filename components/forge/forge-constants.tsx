import CaptainIcon from '../../assets/captain-icon';
import ShipIcon from '../../assets/ship-icon';
import CrewIcon from '../../assets/crew-icon';
import ItemsIcon from '../../assets/items-icon';
import { ForgeTabValue } from '../../types/forge';

export const forgeAssetTabs = [
  {
    name: 'CAPTAINS',
    key: ForgeTabValue.CAPTAIN,
    icon: (
      <CaptainIcon
        width={24}
        height={24}
        className="inline-block h-5 w-5 sm:h-6 sm:w-6"
      />
    ),
  },
  {
    name: 'SHIPS',
    key: ForgeTabValue.SHIP,
    icon: (
      <ShipIcon
        width={24}
        height={24}
        className="inline-block h-5 w-5 sm:h-6 sm:w-6"
      />
    ),
  },
  {
    name: 'CREWS',
    key: ForgeTabValue.CREW,
    icon: (
      <CrewIcon
        width={24}
        height={24}
        className="inline-block h-5 w-5 sm:h-6 sm:w-6"
      />
    ),
  },
  {
    name: 'ITEMS',
    key: ForgeTabValue.ITEM,
    icon: (
      <ItemsIcon
        width={24}
        height={24}
        className="inline-block h-5 w-5 sm:h-6 sm:w-6"
      />
    ),
  },
] as const;
