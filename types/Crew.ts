import { BaseEntity, NFTType } from './BaseEntity';

export interface Crew extends BaseEntity {
  type: NFTType.CREW;

  equippedTo: string;
  equipped: boolean;
}
