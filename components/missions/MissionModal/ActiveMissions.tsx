import { useNfts } from '../../../contexts/NftContext';
import React, { useMemo } from 'react';
import ActiveMissionElement from './ActiveMissionElements';
import { ActiveMission } from '../../../lib/types';
import { Timestamp } from 'firebase/firestore';

// Helper function to calculate time left in milliseconds
const getTimeLeftInMs = (mission: ActiveMission): number => {
  const now = Timestamp.now().toMillis();

  // For Plunders (ongoing missions) - sort by longest duration first
  if (mission.type === 'Plunders') {
    return -(now - mission.startTime); // Negative value to sort by longest duration
  }

  // For Events, Burners - use missionEndTime
  if (mission.type === 'Events' || mission.type === 'Burners') {
    if (!mission.missionEndTime) return 0;
    const remaining = Math.max(0, mission.missionEndTime - now);
    return remaining;
  }

  // For Specials - use missionStats.missionEndDate
  if (mission.type === 'Specials') {
    const endTime = mission.mission?.missionStats?.missionEndDate;
    if (
      !endTime ||
      typeof endTime !== 'object' ||
      !('_seconds' in endTime) ||
      !('_nanoseconds' in endTime)
    ) {
      return 0; // Invalid end time, consider as ready to claim
    }

    const convertedTime = new Date(
      (endTime._seconds || 0) * 1000 + (endTime._nanoseconds || 0) / 1000000,
    );

    const remaining = Math.max(0, convertedTime.getTime() - now);
    return remaining;
  }

  return 0;
};

const ActiveMissions: React.FC = () => {
  const nfts = useNfts();
  const { filteredActiveMissions } = nfts;

  // Sort missions with useMemo to avoid unnecessary re-computations
  const sortedMissions = useMemo(() => {
    if (!filteredActiveMissions || filteredActiveMissions.length === 0) {
      return [];
    }

    return [...filteredActiveMissions].sort((a, b) => {
      const timeLeftA = getTimeLeftInMs(a);
      const timeLeftB = getTimeLeftInMs(b);

      // Sort by time left (ascending) - missions ready to claim (0 time left) will appear first
      return timeLeftA - timeLeftB;
    });
  }, [filteredActiveMissions]);

  return (
    <>
      {sortedMissions.length > 0 && (
        <>
          {sortedMissions.map((mission: ActiveMission) => (
            <ActiveMissionElement
              key={`mission-${mission.id}`}
              mission={mission}
            />
          ))}
        </>
      )}
    </>
  );
};

export default ActiveMissions;
