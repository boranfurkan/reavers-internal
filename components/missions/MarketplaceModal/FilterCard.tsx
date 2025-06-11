'use client';
import Image from 'next/image';
import Tilt from 'react-parallax-tilt';
import styled from 'styled-components';

interface FilterCardProps {
  key: string;
  cardData: {
    title: string;
    subtitle: string;
    image: string;
  };
  onClick: () => void;
  className?: string;
}

const FilterCard = ({ cardData, onClick, className, key }: FilterCardProps) => {
  return (
    <Tilt
      className={`h-full w-full ${className} overflow-hidden rounded-[8px]`}
      tiltReverse={true}
      tiltMaxAngleY={4.5}
      tiltMaxAngleX={4.5}
      key={key}
      glareEnable={true}
      glareMaxOpacity={0.5}
      glarePosition="top">
      <div className="relative h-full w-full text-white" onClick={onClick}>
        <button onClick={() => {}} className="h-full w-full cursor-pointer">
          <div className="absolute left-4 top-4 z-[10] uppercase md:left-6 md:top-6">
            <h1 className="text-start text-[24px] font-bold md:text-[30px] lg:text-[40px]">
              {cardData?.title}
            </h1>
            <h4 className="mt-2 max-w-xl text-left text-[10px] md:text-[12px] lg:text-[14px]">
              {cardData?.subtitle}
            </h4>
          </div>
          <ImageContainer>
            <ResponsiveImage
              src={cardData?.image}
              alt={cardData?.title!}
              fill
              objectFit="cover"
              priority
            />
          </ImageContainer>
        </button>
      </div>
    </Tilt>
  );
};

export default FilterCard;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.3);
    pointer-events: none;
    z-index: 1;
  }
`;

const ResponsiveImage = styled(Image)`
  object-fit: cover;
  width: 100%;
  height: 100%;
`;
