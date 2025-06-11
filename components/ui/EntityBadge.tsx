import React from 'react';
import {
  getRarityBorderColor,
  getRarityGradient,
} from '../../utils/inventory-helpers';

const EntityBadge = ({
  rarityText,
  level = 1,
}: {
  rarityText: string;
  level: number;
}) => (
  <div
    className={`
    absolute left-2 top-2 z-30 flex items-center rounded border
    px-2 py-0.5 text-xs font-bold uppercase tracking-wider shadow-sm
    max-sm:px-1.5 max-sm:py-0.5 max-sm:text-[10px]
  `}
    style={{
      ...getRarityGradient(rarityText),
      ...getRarityBorderColor(rarityText),
    }}>
    {rarityText} ({level})
  </div>
);

export default EntityBadge;
