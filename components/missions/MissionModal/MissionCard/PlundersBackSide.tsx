import React from 'react';
import { CardFace } from './MissionCard';

const PlundersBackSide = () => {
  return (
    <CardFace className="back">
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <h4 className="text-lg font-bold text-white">Mission Details</h4>
        <p>(Coming Soon)</p>
      </div>
    </CardFace>
  );
};

export default PlundersBackSide;
