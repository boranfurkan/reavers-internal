import Image from 'next/image';
import styled from 'styled-components';
import { getRarityColorWithOpacity } from '../../../utils/helpers';

interface FilterOptionProps {
  option: {
    key: string;
    icon?: React.ReactNode;
    name: string;
    rarity?: string | null;
  };
  isActive: boolean;
  className?: string;
  onClick: () => void;
}

const RarityIcon = styled.div<{ rarity: string }>`
  width: 24px;
  height: 24px;
  background-color: ${({ rarity }) => getRarityColorWithOpacity(rarity, 100)};
  border-radius: 4px;
`;

const FilterOption: React.FC<FilterOptionProps> = ({
  option,
  isActive,
  className,
  onClick,
}) => (
  <div
    onClick={onClick}
    className={`flex h-[43px] cursor-pointer items-center justify-start gap-2 rounded-lg p-2 uppercase md:justify-center ${
      isActive
        ? 'bg-white bg-opacity-20 font-medium text-white'
        : 'text-white hover:opacity-100'
    } ${className}`}>
    {option.icon && option.icon}
    {option.rarity && <RarityIcon rarity={option.rarity.toUpperCase()} />}
    <span className="w-max">{option.name}</span>
  </div>
);

export default FilterOption;
