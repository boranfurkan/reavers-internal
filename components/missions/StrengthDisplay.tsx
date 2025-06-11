import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import {
  getStrengthPercentage,
  getStrengthColor,
  getStrengthBorderColor,
  STRENGTH_COLORS,
} from '../../utils/inventory-helpers';
import { CharacterNFT } from '../../types/NFT';

interface StrengthDisplayProps {
  size?: 'small' | 'medium' | 'large';
  strength: number;
  character?: CharacterNFT;
}

// Animation keyframes for shining effect
const shine = keyframes`
  from {
    -webkit-mask-position: 150%;
  }
  to {
    -webkit-mask-position: -50%;
  }
`;

// Dynamic shine effect based on strength
const getShiningEffect = (strength: number) => css`
  -webkit-mask-image: linear-gradient(
    -75deg,
    rgba(0, 0, 0, 0.6) 30%,
    #000 50%,
    rgba(0, 0, 0, 0.6) 70%
  );
  -webkit-mask-size: 200%;
  animation: ${shine} ${2 - Math.min(strength / 2000000, 1)}s infinite;
`;

/**
 * Get text color based on strength percentage
 * @param strengthPercentage Percentage of theoretical maximum strength
 * @returns Text color for the strength display
 */
const getStrengthTextColorByPercentage = (
  strengthPercentage: number,
): string => {
  // Find the highest threshold that the strength percentage exceeds
  for (const [key, data] of Object.entries(STRENGTH_COLORS)) {
    if (strengthPercentage >= data.threshold) {
      return data.text;
    }
  }

  // Fallback to COMMON if no matches
  return STRENGTH_COLORS.COMMON.text;
};

// Styled component with dynamic properties
const StrengthWrapper = styled.div<{
  textColor: string;
  size?: 'small' | 'medium' | 'large';
  strengthValue: number;
}>`
  position: relative;
  display: inline-flex;
  align-items: center;
  font-weight: bold;
  letter-spacing: -0.5px;
  color: ${({ textColor }) => textColor};
  ${({ strengthValue }) => getShiningEffect(strengthValue)};
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.5);

  font-size: ${({ size }) => {
    switch (size) {
      case 'small':
        return 'calc(10px + (12 - 10) * ((100vw - 320px) / (1920 - 320)))';
      case 'large':
        return 'calc(16px + (20 - 16) * ((100vw - 320px) / (1920 - 320)))';
      case 'medium':
      default:
        return 'calc(12px + (14 - 12) * ((100vw - 320px) / (1920 - 320)))';
    }
  }};

  line-height: ${({ size }) => {
    switch (size) {
      case 'small':
        return 'calc(12px + (14 - 12) * ((100vw - 320px) / (1920 - 320)))';
      case 'large':
        return 'calc(20px + (24 - 20) * ((100vw - 320px) / (1920 - 320)))';
      case 'medium':
      default:
        return 'calc(14px + (16 - 14) * ((100vw - 320px) / (1920 - 320)))';
    }
  }};
`;

// The icon component to show before strength value
const StrengthIcon = styled.span<{ textColor: string }>`
  margin-right: 4px;
  font-size: 0.9em;
  color: ${({ textColor }) => textColor};
  opacity: 0.9;
`;

// Main component implementation
const StrengthDisplay: React.FC<StrengthDisplayProps> = ({
  size = 'medium',
  strength = 0,
  character,
}) => {
  // Calculate strength percentage if character is provided
  const strengthPercentage = character
    ? getStrengthPercentage(strength, character)
    : 0;

  // Get text color based on the strength percentage
  const textColor = getStrengthTextColorByPercentage(strengthPercentage);

  // Format large numbers with proper spacing
  const formattedStrength = strength.toLocaleString();

  return (
    <div className="flex items-center justify-center">
      <StrengthWrapper
        textColor={textColor}
        size={size}
        strengthValue={strength}
        className="flex items-center">
        <StrengthIcon textColor={textColor}>S</StrengthIcon>
        {formattedStrength}
      </StrengthWrapper>
    </div>
  );
};

export default StrengthDisplay;
