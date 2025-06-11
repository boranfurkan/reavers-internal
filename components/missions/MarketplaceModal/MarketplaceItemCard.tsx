import React, { useState, useCallback, useContext, useEffect } from 'react';
import Image from 'next/image';
import styled from 'styled-components';
import PlusIcon from '../../../assets/plus-icon';
import MinusIcon from '../../../assets/minus-icon';
import { MarketPlaceItem } from '../../../lib/types';
import { useAuth } from '../../../contexts/AuthContext';
import { useUser } from '../../../contexts/UserContext';
import { NotificationContext } from '../../../contexts/NotificationContext';
import { toast } from 'sonner';
import { config } from '../../../config';
import { mutate } from 'swr';
import LegendaryShipTokenIcon from '../../../assets/legendary-ship-token-icon';
import { Spin } from 'antd';

interface MarketplaceItemCardProps {
  item: MarketPlaceItem;
  isSelected?: boolean;
}

const MarketplaceItemCard: React.FC<MarketplaceItemCardProps> = ({
  item,
  isSelected,
}) => {
  const auth = useAuth();
  const user = useUser();
  const { notifications } = useContext(NotificationContext);
  const [jobId, setJobId] = useState('');

  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleAmountChange = useCallback(
    (value: number) => {
      const newAmount = amount + value;
      if (newAmount < 1 || newAmount > item.amountAvailable) return;
      setAmount(newAmount);
    },
    [amount, item.amountAvailable],
  );

  const handlePurchase = async (item: MarketPlaceItem, amount: number = 1) => {
    setLoading(true);

    if (!user.user) {
      toast.error('User not found');
      setLoading(false);
      return;
    }

    if (item.type === 'SHIP' && item.rarity === 'MYTHIC') {
      if ((user.user.legendaryShipToken || 0) < item.price * amount) {
        toast.error("You don't have enough Mythic Ship Token");
        setLoading(false);
        return;
      }
    } else if (user.user.arAmount < item.price * amount) {
      toast.error("You don't have enough BOOTY");
      setLoading(false);
      return;
    }

    if (!auth.jwtToken) {
      toast.error('JWT Token is missing!');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${config.worker_server_url}/shop/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.jwtToken}`,
        },
        body: JSON.stringify({ name: item.name, multiplier: amount }),
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
        (n) => n.data.id === jobId && n.type === 'ItemPurchase',
      );
      if (notification) {
        if (notification.data.error) {
          toast.error(notification.data.message);
          setLoading(false);
          setJobId('');
          return;
        } else {
          toast.success(
            `Purchased ${notification.data.result.itemName} successfully`,
          );
        }
        mutate(`${config.worker_server_url}/users/me`);
        mutate(`${config.worker_server_url}/nfts`);
        setTimeout(() => {
          mutate(`${config.worker_server_url}/items/fetch-items`);
          mutate(`${config.worker_server_url}/shop/fetch-shop-items`);

          setLoading(false);
          setJobId('');
        }, 1000);
      } else {
        const timeoutId = setTimeout(() => {
          mutate(`${config.worker_server_url}/users/me`);
          mutate(`${config.worker_server_url}/nfts`);
          mutate(`${config.worker_server_url}/items/fetch-items`);
          mutate(`${config.worker_server_url}/shop/fetch-shop-items`);
          setLoading(false);
          toast('Timeout, reloading...');
          setJobId('');
        }, 20000);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [jobId, user.user?.wallet, notifications]);

  return (
    <CardContainer isSelected={isSelected}>
      <ImageContainer className="pointer-events-none select-none">
        <Image
          src={item.image}
          alt={item.name}
          width={160}
          height={160}
          className="rounded-lg object-cover"
          unoptimized
        />
      </ImageContainer>

      <CardContent>
        <h3 className="pointer-events-none mb-2 select-none text-lg font-bold text-white">
          {item.name}
        </h3>
        <p className="pointer-events-none mb-4 flex min-h-[40px] flex-1 select-none items-center justify-center text-xs text-gray-300">
          {item.description}
        </p>
        <CardDetails className="pointer-events-none select-none">
          <Detail className="text-left">
            <span className="labels">Price</span>
            <span className="value flex items-center gap-1">
              {item.price}
              <span className="">
                {item.type === 'SHIP' && item.rarity === 'LEGENDARY' ? (
                  <LegendaryShipTokenIcon
                    className="h-4 w-4"
                    fill="currentColor"
                  />
                ) : (
                  <span>$BOOTY</span>
                )}
              </span>
            </span>
          </Detail>
          <Detail className="text-right">
            <span className="labels">Available</span>
            <span className="value text-right">{item.amountAvailable}</span>
          </Detail>
        </CardDetails>

        <CardActions>
          <AmountControl>
            <ActionButton
              onClick={() => handleAmountChange(-1)}
              disabled={amount <= 1}>
              <MinusIcon className="h-4 w-4" fill="currentColor" />
            </ActionButton>
            <AmountDisplay>{amount}</AmountDisplay>
            <ActionButton
              onClick={() => handleAmountChange(1)}
              disabled={amount >= item.amountAvailable}>
              <PlusIcon className="h-4 w-4" fill="currentColor" />
            </ActionButton>
          </AmountControl>
          <PurchaseButton
            onClick={() => handlePurchase(item, amount)}
            disabled={loading || item.amountAvailable === 0}>
            {loading ? <Spin /> : 'Purchase'}
          </PurchaseButton>
        </CardActions>
      </CardContent>
    </CardContainer>
  );
};

export default MarketplaceItemCard;

const CardContainer = styled.div<{ isSelected?: boolean }>`
  display: flex;
  flex-direction: column;
  min-height: max-content;
  width: 100%;
  max-width: 500px;
  background: #4c2f6b; /* Darker purple tone for card body */
  border: 1px solid #d1b3ff; /* Bright lavender border for visibility */
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  transition: transform 0.3s, box-shadow 0.3s;

  ${({ isSelected }) =>
    isSelected
      ? `
    transform: scale(1.1);
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.8);
    z-index: 1;
  `
      : `
    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
    }
  `}

  @media (max-width: 768px) {
    max-width: 100%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    ${({ isSelected }) =>
      isSelected &&
      `
      transform: scale(1.03);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
    `}
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  background: #3d2659;
  border-bottom: 1px solid #d1b3ff;
  display: flex;
  padding: 16px;
  justify-content: center;
  align-items: center;

  img {
    border-radius: 12px; /* Ensure rounded corners */
  }

  @media (max-width: 768px) {
    height: auto; /* Let the image size itself */
    max-height: 200px; /* Limit the height */
  }
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-between;
  padding: 16px;
  background: #422a5b;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const CardDetails = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    margin-bottom: 12px; /* Reduce spacing */
  }
`;

const Detail = styled.div`
  .labels {
    font-size: 12px;
    color: #e0c07f; /* Golden yellow for labels */
    display: block;

    @media (max-width: 768px) {
      font-size: 10px; /* Slightly smaller font on mobile */
    }
  }

  .value {
    font-size: 16px;
    color: #ffd700; /* Bright gold for values */
    font-weight: bold;

    @media (max-width: 768px) {
      font-size: 14px; /* Slightly smaller font on mobile */
    }
  }
`;

const CardActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column; /* Stack elements on smaller screens */
    gap: 10px;
    margin-top: 10px;
  }
`;

const AmountControl = styled.div`
  display: flex;
  align-items: center;
  background: rgba(100, 60, 160, 0.4);
  border: 1px solid #d1b3ff;
  border-radius: 8px;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const ActionButton = styled.button`
  width: 36px;
  height: 36px;
  background: none;
  color: #ffd700; /* Golden yellow for icons */
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background 0.3s;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
  }

  &:disabled {
    color: #e0c07f;
    cursor: not-allowed;
  }
`;

const AmountDisplay = styled.span`
  width: 50px;
  text-align: center;
  font-size: 16px;
  color: #ffd700;
  font-weight: bold;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const PurchaseButton = styled.button`
  background: linear-gradient(
    45deg,
    #e0c07f,
    #ffd700
  ); /* Golden yellow gradient */
  color: #000;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 8px;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.5); /* Subtle gold glow */
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    width: 100%; /* Make button full-width on mobile */
  }
`;
