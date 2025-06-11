import React, { useContext, useMemo, useState, useCallback } from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import { LayerContext } from '../../../contexts/LayerContext';
import ExchangeItemCard from './ExchangeItemCard';
import { ExchangeItem, DynamicExchangeItem } from '../../../lib/types';
import GemIcon from '../../../assets/gem-icon';
import TreasureIcon from '../../../assets/treasure-icon';
import SkullIcon from '../../../assets/skull-icon';
import GoldTokenIcon from '../../../assets/gold-token-icon';

interface ExchangeItemsContext {
  exchangeItems: {
    exchangeItems: ExchangeItem[];
  };
  exchangeItemsLoading: boolean;
}

type CategorizedItems = {
  GEMS: ExchangeItem[];
  TREASURE: ExchangeItem[];
};

const TabOptions = [
  {
    name: 'GEMS',
    key: 'GEMS',
    icon: <GemIcon width={16} height={16} />,
  },
  {
    name: 'TREASURE',
    key: 'TREASURE',
    icon: <TreasureIcon width={16} height={16} />,
  },
];

const ExchangeComponent = () => {
  const layerContext = useContext(LayerContext);
  if (!layerContext) {
    throw new Error('LayerContext must be used within a LayerProvider');
  }

  const { exchangeItems, exchangeItemsLoading } =
    layerContext as ExchangeItemsContext;

  const [activeTab, setActiveTab] = useState<keyof CategorizedItems>('GEMS');

  const categorizedItems: CategorizedItems = useMemo(() => {
    return {
      GEMS: exchangeItems.exchangeItems.filter(
        (item) => item.costType === 'gemsAmount',
      ),
      TREASURE: exchangeItems.exchangeItems.filter(
        (item) => item.costType === 'treasureAmount',
      ),
    };
  }, [exchangeItems]);

  const filteredItems = useMemo(
    () => categorizedItems[activeTab],
    [categorizedItems, activeTab],
  );

  const handleTabChange = useCallback((key: keyof CategorizedItems) => {
    setActiveTab(key);
  }, []);

  return (
    <ShopContainer>
      <Header>
        <h1>Exchange Shop</h1>
        <Divider />
        <Image
          src="/images/shop/shop-banner.webp"
          alt="shop banner"
          width={1920}
          height={500}
          className="w-full"
          unoptimized={true}
        />
      </Header>

      <Tabs>
        {TabOptions.map((tab) => (
          <Tab
            key={tab.key}
            isActive={tab.key === activeTab}
            onClick={() => handleTabChange(tab.key as keyof CategorizedItems)}>
            {tab.icon}
            <span>{tab.name}</span>
          </Tab>
        ))}
      </Tabs>

      <CardContainer>
        {filteredItems.length > 0 ? (
          filteredItems
            .sort(
              (
                a: ExchangeItem | DynamicExchangeItem,
                b: ExchangeItem | DynamicExchangeItem,
              ) => a.costAmount - b.costAmount,
            )
            .map((item) => <ExchangeItemCard key={item.image} item={item} />)
        ) : (
          <NoItems>No items available in this category.</NoItems>
        )}
      </CardContainer>
    </ShopContainer>
  );
};

export default ExchangeComponent;

// Styled Components
const ShopContainer = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  padding-top: 20px;
  padding-bottom: 20px;
  color: white;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  flex-direction: column;
  gap: 20px;
`;

const Divider = styled.div`
  height: 2px;
  width: 100%;
  background: white;
  opacity: 0.2;
  border-radius: 1px;
`;

const Tabs = styled.div`
  display: flex;
  margin-top: 20px;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 768px) {
    column-gap: 10px;
    row-gap: 10px;
  }
`;

const Tab = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 10px 15px;
  font-weight: bold;
  text-transform: uppercase;
  border-bottom: 2px solid
    ${({ isActive }) => (isActive ? 'white' : 'transparent')};
  color: ${({ isActive }) => (isActive ? 'white' : 'gray')};
  transition: color 0.3s, border-bottom 0.3s;

  &:hover {
    color: white;
  }

  span {
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    padding: 5px 7px;
  }
`;

const CardContainer = styled.div`
  display: grid;
  gap: 20px;
  padding: 20px;
  grid-template-columns: repeat(4, minmax(200px, 1fr));
  justify-items: center;
  justify-content: center;
  align-items: start;
  height: @media (max-width: 1200px) {
    grid-template-columns: repeat(3, minmax(200px, 1fr));
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(200px, 1fr));
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  &:empty {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px; /* Fallback for consistent layout */
  }
`;

const NoItems = styled.div`
  font-size: 1.2rem;
  color: gray;
  text-align: center;
  padding: 20px;

  @media (max-width: 600px) {
    font-size: 1rem;
  }
`;
