import React, { useState } from 'react';
import styled from 'styled-components';
import { getRarityColorWithOpacity } from '../../../../utils/helpers';

const SwitchContainer = styled.div<{ isEnabled: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border-radius: 8px;
  border: ${({ isEnabled }) =>
    `1px solid ${isEnabled ? '#22c55e' : '#ef4444'}`};
  background-color: ${({ isEnabled }) =>
    isEnabled ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)'};
  cursor: pointer;
  transition: all 0.2s ease;
  pointer-events: auto !important;
  backdrop-filter: blur(4px);

  &:hover {
    border-color: ${({ isEnabled }) => (isEnabled ? '#16a34a' : '#dc2626')};
    background-color: ${({ isEnabled }) =>
      isEnabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  * {
    pointer-events: auto !important;
  }
`;

const SwitchTrack = styled.div<{ isEnabled: boolean }>`
  position: relative;
  width: 40px;
  height: 20px;
  border-radius: 10px;
  background-color: ${({ isEnabled }) =>
    isEnabled ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
  border: 1px solid ${({ isEnabled }) => (isEnabled ? '#22c55e' : '#ef4444')};
  transition: all 0.2s ease;
`;

const SwitchThumb = styled.div<{ isEnabled: boolean }>`
  position: absolute;
  top: 1.5px;
  left: ${({ isEnabled }) => (isEnabled ? '20px' : '1.5px')};
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: ${({ isEnabled }) => (isEnabled ? '#22c55e' : '#ef4444')};
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
`;

const SwitchLabel = styled.div<{ isEnabled: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
`;

const SwitchTitle = styled.span<{ isEnabled: boolean }>`
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
  color: ${({ isEnabled }) => (isEnabled ? '#22c55e' : '#ef4444')};
  transition: color 0.2s ease;
  opacity: 0.8;
  letter-spacing: 0.5px;
`;

const SwitchStatus = styled.span<{ isEnabled: boolean }>`
  font-size: 11px;
  font-weight: 600;
  color: ${({ isEnabled }) => (isEnabled ? '#22c55e' : '#ef4444')};
  transition: color 0.2s ease;
`;

const BattleTokenSwitcher = ({
  isEnabled = false,
  onToggle,
}: {
  isEnabled?: boolean;
  onToggle?: (enabled: boolean) => void;
}) => {
  const [enabled, setEnabled] = useState(isEnabled);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = !enabled;
    setEnabled(newState);
    onToggle?.(newState);
  };

  return (
    <SwitchContainer isEnabled={enabled} onClick={handleToggle}>
      <SwitchLabel isEnabled={enabled}>
        <SwitchTitle isEnabled={enabled}>Battle Token</SwitchTitle>
        <SwitchStatus isEnabled={enabled}>
          {enabled ? 'Enabled' : 'Disabled'}
        </SwitchStatus>
      </SwitchLabel>
      <SwitchTrack isEnabled={enabled}>
        <SwitchThumb isEnabled={enabled} />
      </SwitchTrack>
    </SwitchContainer>
  );
};

export default BattleTokenSwitcher;
