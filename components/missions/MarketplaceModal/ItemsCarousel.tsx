import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { EmblaOptionsType } from 'embla-carousel';
import { MarketPlaceItem } from '../../../lib/types';
import MarketplaceItemCard from './MarketplaceItemCard';
import { DotButton, useDotButton } from './Carousel/DotButton';
import {
  NextButton,
  PrevButton,
  usePrevNextButtons,
} from './Carousel/ArrowButtons';

interface ItemsCarouselProps {
  itemCardData: MarketPlaceItem[];
}

const ItemsCarousel = ({ itemCardData }: ItemsCarouselProps) => {
  const options: EmblaOptionsType = { loop: true };
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  return (
    <section className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container first:pl-4">
          {itemCardData.map((data, index) => (
            <div className="embla__slide" key={data.name}>
              <div className="embla__slide__number">
                <MarketplaceItemCard
                  item={data}
                  isSelected={index === selectedIndex}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="embla__controls px-4">
        <div className="embla__buttons">
          <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
          <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
        </div>

        <div className="embla__dots">
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={'embla__dot'.concat(
                index === selectedIndex ? ' embla__dot--selected' : '',
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ItemsCarousel;
