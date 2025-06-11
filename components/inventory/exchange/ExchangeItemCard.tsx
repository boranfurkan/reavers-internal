import React, { useState, useCallback, useContext, useEffect } from 'react';
import Image from 'next/image';
import styled from 'styled-components';
import PlusIcon from '../../../assets/plus-icon';
import MinusIcon from '../../../assets/minus-icon';
import { ExchangeItem, DynamicExchangeItem } from '../../../lib/types';
import GemIcon from '../../../assets/gem-icon';
import TreasureIcon from '../../../assets/treasure-icon';
import SkullIcon from '../../../assets/skull-icon';
import GoldTokenIcon from '../../../assets/gold-token-icon';
import { useAuth } from '../../../contexts/AuthContext';
import { useUser } from '../../../contexts/UserContext';
import { NotificationContext } from '../../../contexts/NotificationContext';
import { toast } from 'sonner';
import { config } from '../../../config';
import { mutate } from 'swr';
import { Spin } from 'antd';

type Item = ExchangeItem | DynamicExchangeItem;

interface ExchangeItemCardProps {
  item: Item;
}

const ExchangeItemCard: React.FC<ExchangeItemCardProps> = ({ item }) => {
  const [amount, setAmount] = useState(1); // Only for non-dynamic items
  const [loading, setLoading] = useState(false);

  const auth = useAuth();
  const user = useUser();
  const { notifications } = useContext(NotificationContext);
  const [jobId, setJobId] = useState('');

  const isDynamicItem = (item: Item): item is DynamicExchangeItem =>
    'type' in item;

  const handleAmountChange = useCallback(
    (change: number) => {
      if (isDynamicItem(item)) return;
      const newAmount = amount + change;
      if (newAmount < 1) return;
      setAmount(newAmount);
    },
    [amount, item],
  );

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null) return '';
    return num.toLocaleString('en-US');
  };

  const handlePurchase = async (item: Item) => {
    setLoading(true);

    if (!user.user) {
      toast.error('User not found');
      setLoading(false);
      return;
    }

    const costAmount = isDynamicItem(item)
      ? item.costAmount
      : item.costAmount * amount;
    const costType = item.costType;

    if (user.user[costType] < costAmount) {
      toast.error(
        `You don't have enough ${costType} to purchase this item. Missing ${formatNumber(
          costAmount - user.user[costType],
        )} ${costType}`,
      );
      setLoading(false);
      return;
    }

    if (!auth.jwtToken) {
      toast.error('JWT Token is missing!');
      setLoading(false);
      return;
    }

    try {
      const url = isDynamicItem(item)
        ? `${config.worker_server_url}/exchange/dynamic-purchase`
        : `${config.worker_server_url}/exchange/purchase`;

      const body = isDynamicItem(item)
        ? JSON.stringify({
            name: item.name,
          })
        : JSON.stringify({
            name: item.name,
            multiplier: amount,
          });

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.jwtToken}`,
        },
        body: body,
      });
      const responseBody = await res.json();

      if (res.status !== 200) {
        throw new Error(
          responseBody.error || 'An error occurred, try again later',
        );
      }

      setJobId(responseBody.jobId);
    } catch (error) {
      console.error(error);
      toast.error('Error Purchasing');
    }
  };

  useEffect(() => {
    if (user.user?.wallet && jobId !== '') {
      const notification = notifications.find(
        (n) => n.data.id === jobId && n.type === 'exchange',
      );
      if (notification) {
        if (notification.data.error) {
          toast.error(notification.data.message);
          setLoading(false);
          setJobId('');
          return;
        } else {
          toast.success(
            `Purchased ${notification.data.result.name} successfully`,
          );
        }
        mutate(`${config.worker_server_url}/users/me`);
        mutate(`${config.worker_server_url}/nfts`);
        setTimeout(() => {
          mutate(`${config.worker_server_url}/exchange/fetch-exchange-items`);

          setLoading(false);
          setJobId('');
        }, 1000);
      } else {
        const timeoutId = setTimeout(() => {
          mutate(`${config.worker_server_url}/users/me`);
          mutate(`${config.worker_server_url}/exchange/fetch-exchange-items`);
          setLoading(false);
          toast('Timeout, reloading...');
          setJobId('');
        }, 20000);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [jobId, user.user?.wallet, notifications]);

  return (
    <Card>
      <ImageContainer>
        <Image
          src={item.image}
          alt={item.name}
          width={300}
          height={300}
          className="rounded-lg object-cover"
          unoptimized
        />
      </ImageContainer>
      <Content>
        <TitleSection>
          <h3>{item.name}</h3>
          {!item.active && <InactiveBadge>Inactive</InactiveBadge>}
        </TitleSection>
        <Details>
          <Info>
            <InfoLabel>Cost</InfoLabel>
            <InfoValue>
              <span>
                {formatNumber(
                  isDynamicItem(item)
                    ? item.costAmount
                    : item.costAmount * amount,
                )}
              </span>
              {item.costType === 'gemsAmount' ? (
                <GemIcon width={20} height={20} className="h-5 w-5" />
              ) : item.costType === 'treasureAmount' ? (
                <TreasureIcon width={20} height={20} className="h-5 w-5" />
              ) : item.costType === 'goldAmount' ? (
                <GoldTokenIcon width={20} height={20} className="h-5 w-5" />
              ) : (
                <SkullIcon width={20} height={20} className="h-5 w-5" />
              )}
            </InfoValue>
          </Info>
          <Info>
            <InfoLabel>Yield</InfoLabel>
            <InfoValue>
              <span>
                {formatNumber(
                  isDynamicItem(item)
                    ? item.yieldAmount
                    : item.yieldAmount * amount,
                )}
              </span>
              {item.yieldType === 'arAmount' ? (
                <SkullIcon width={20} height={20} className="h-5 w-5" />
              ) : (
                <GoldTokenIcon width={20} height={20} className="h-5 w-5" />
              )}
            </InfoValue>
          </Info>
          {isDynamicItem(item) && (
            <Info>
              <InfoLabel>Amount Available</InfoLabel>
              <InfoValue>{item.amountAvailable}</InfoValue>
            </Info>
          )}
        </Details>
        <Actions>
          {!isDynamicItem(item) && (
            <AmountControl>
              <ActionButton onClick={() => handleAmountChange(-1)}>
                <MinusIcon className="h-4 w-4" fill="currentColor" />
              </ActionButton>
              <AmountDisplay>{amount}</AmountDisplay>
              <ActionButton onClick={() => handleAmountChange(1)}>
                <PlusIcon className="h-4 w-4" fill="currentColor" />
              </ActionButton>
            </AmountControl>
          )}
          <PurchaseButton
            onClick={() => handlePurchase(item)}
            disabled={!item.active || loading}>
            {loading ? <Spin /> : 'Purchase'}
          </PurchaseButton>
        </Actions>
      </Content>
      <span className="absolute left-4 top-2 text-center text-[#ffd700]">
        (%10 TAX)
      </span>
    </Card>
  );
};

export default ExchangeItemCard;

// Styled Components
const Card = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 341px; /* Match MarketplaceItemCard */
  min-height: 490px; /* Match MarketplaceItemCard */
  background: #4c2f6b; /* Match MarketplaceItemCard */
  border: 1px solid #d1b3ff; /* Match MarketplaceItemCard */
  border-radius: 12px; /* Match MarketplaceItemCard */
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4); /* Match MarketplaceItemCard */
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6); /* Match MarketplaceItemCard */
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 200px;
  background: #3d2659; /* Match MarketplaceItemCard */
  border-bottom: 1px solid #d1b3ff; /* Match MarketplaceItemCard */
  display: flex;
  padding: 16px;
  justify-content: center;
  align-items: center;

  img {
    border-radius: 12px; /* Match MarketplaceItemCard */
  }
`;

const Content = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 16px;
  flex-grow: 1;
  justify-content: space-between;
  padding: 16px;
  background: #422a5b;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const TitleSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 1.5rem;
    color: #ffd700;
    transition: color 0.4s;

    ${Card}:hover & {
      color: #e6bf4f;
    }
  }
`;

const InactiveBadge = styled.span`
  position: absolute;
  top: 10px;
  right: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #ff4c4c;
  color: white;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.8rem;
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 1rem;
`;

const Info = styled.div`
  display: flex;
  justify-content: space-between;
  background: rgba(100, 60, 160, 0.3);
  padding: 8px 12px;
  border-radius: 8px;
  transition: background 0.4s;
`;

const InfoLabel = styled.span`
  color: #d1b3ff;
  font-weight: 600;
`;

const InfoValue = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #ffd700;
  font-weight: bold;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
`;

const AmountControl = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  background: rgba(100, 60, 160, 0.4);
  border: 1px solid #d1b3ff;
  border-radius: 8px;
  overflow: hidden;
`;

const ActionButton = styled.button`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 36px;
  background: none;
  color: #ffd700;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const AmountDisplay = styled.span`
  width: 50px;
  text-align: center;
  font-size: 1.2rem;
  color: #ffd700;
`;

const PurchaseButton = styled.button`
  width: 100%;
  background: linear-gradient(45deg, #e0c07f, #ffd700);
  color: black;
  font-weight: bold;
  padding: 12px 0;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s, background 0.4s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-2px);
    background: linear-gradient(45deg, #f7d37f, #ffe066);
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.5);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
