import { BaseEntity, NFTType } from './BaseEntity';
import { Collection } from './Collections';

export const MAX_COMMON_SHIP_LEVEL = 125;
export const MAX_LEGENDARY_SHIP_LEVEL = 250;

enum ShipKind {
  PirateShip = 'Pirate Ship',
  TugBoat = 'Tug Boat',
  VikingShip = 'Viking Ship',
  Submarine = 'Submarine',
  DragonRider = 'Dragon Rider',
  MegalodonShark = 'Megalodon Shark',
}

enum ShipRarity {
  Common = 'COMMON',
  Legendary = 'LEGENDARY',
}

type ShipCollectionRelation =
  | {
      collection: Collection.REAVERS;
      name: ShipKind.PirateShip;
    }
  | {
      collection: Collection.LAST_HAVEN;
      name: ShipKind.TugBoat;
    }
  | {
      collection: Collection.BROHALLA;
      name: ShipKind.VikingShip;
    }
  | {
      collection: Collection.ELEMENTERRA_RABBITS;
      name: ShipKind.Submarine;
    }
  | {
      collection: Collection.ATOMS;
      name: ShipKind.DragonRider;
    }
  | {
      collection: Collection.SIRENS;
      name: ShipKind.MegalodonShark;
    };

export type Ship = BaseEntity &
  ShipCollectionRelation & {
    type: NFTType.SHIP;

    equippedTo: string;
    equipped: boolean;

    rarity: ShipRarity;
  };
