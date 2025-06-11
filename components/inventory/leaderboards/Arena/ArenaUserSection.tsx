import React, { useContext } from 'react';
import HorizontalArenaCard from './ArenaUserCard';
import styled from 'styled-components';
import { useLeaderboardContext } from '../../../../contexts/LeaderboardContext';

const ArenaUserSection = () => {
  const leaderboardContext = useLeaderboardContext();
  const data = leaderboardContext?.arenaLeaderboardMe.data;

  return (
    <Section>
      <HorizontalArenaCard data={data} />
    </Section>
  );
};

export default ArenaUserSection;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
