import { BaseEntity, NFTType } from './BaseEntity';

export const MAX_CREW_LEVEL = 125;

export interface Crew extends BaseEntity {
  type: NFTType.CREW;

  equippedTo: string;
  equipped: boolean;
}
