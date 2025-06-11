import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Spin } from 'antd';
import { toast } from 'sonner';
import { Transaction } from '@solana/web3.js';
import base58 from 'bs58';
import { mutate } from 'swr';

// Import from Dynamic
import { useDynamicContext, Wallet } from '@dynamic-labs/sdk-react-core';

import { useUser } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { config } from '../../config';
import {
  getErrorMessage,
  getUserBootyOrGoldAmount,
  getUserOnChainBootyOrGoldAmount,
  formatNumberWithSuffix,
} from '../../utils/helpers';
import { Token } from '../../types/Token';

// Icons
import SkullIcon from '../../assets/skull-icon';
import GemIcon from '../../assets/gem-icon';
import GoldTokenIcon from '../../assets/gold-token-icon';
import TreasureIcon from '../../assets/treasure-icon';
import LegendaryShipTokenIcon from '../../assets/legendary-ship-token-icon';
import BattleTokenIcon from '../../assets/battle-token-icon';
import ArrowDownIcon from '../../assets/arrow-down-icon';

// Helper function to get the wallet signer
async function getWalletSigner(wallet: Wallet<any>) {
  if (!wallet) {
    throw new Error('No wallet provided');
  }

  // Get the signer from the wallet
  const signer = await (wallet as any).getSigner();
  if (!signer || typeof signer.signTransaction !== 'function') {
    throw new Error('This wallet does not provide signTransaction method');
  }

  return signer;
}

function ProfileAssetManagement() {
  const { primaryWallet } = useDynamicContext();
  const { notifications, setToastId } = useNotifications();
  const user = useUser();
  const auth = useAuth();

  const [selectedToken, setSelectedToken] = useState<Token>(Token.BOOTY);
  const [isDeposit, setIsDeposit] = useState(true);
  const [amount, setAmount] = useState(0);
  const [inputValue, setInputValue] = useState('0');
  const [loading, setLoading] = useState(false);

  const handleTokenSelect = (token: Token) => {
    if (token !== selectedToken) {
      setSelectedToken(token);
      setAmount(0);
      setInputValue('0');
    }
  };

  const handleTransactionType = (deposit: boolean) => {
    if (deposit !== isDeposit) {
      setIsDeposit(deposit);
      setAmount(0);
      setInputValue('0');
    }
  };

  const handleDeposit = async () => {
    if (!auth.isLoggedIn || !primaryWallet) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);

    // Basic checks
    const onChainAmount =
      selectedToken === Token.BOOTY
        ? user.user?.onChainAr
        : user.user?.onChainGold;
    const inGameAmount =
      selectedToken === Token.BOOTY
        ? user.user?.arAmount
        : user.user?.goldAmount;

    if (onChainAmount && onChainAmount < amount && isDeposit) {
      toast.error(`Not enough ${selectedToken} on-chain`);
      setLoading(false);
      return;
    }
    if (inGameAmount && inGameAmount < amount && !isDeposit) {
      toast.error(`Not enough ${selectedToken} in game`);
      setLoading(false);
      return;
    }

    const idToken = auth.jwtToken;
    const transactionType = isDeposit ? 'deposit' : 'withdraw';

    try {
      // 1) Create a transaction on the server
      const createTxRes = await fetch(
        `${config.worker_server_url}/spl-token/deposit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            amount,
            type: transactionType,
            token: selectedToken.toLowerCase(),
          }),
        },
      );

      if (!createTxRes.ok) {
        const bodyText = await createTxRes.text();
        const errorMessage = await getErrorMessage(bodyText);
        throw new Error(errorMessage);
      }

      const data = await createTxRes.json();

      // 2) Decode the transaction
      const tx = Transaction.from(base58.decode(data.tx));

      // 3) Get the signer and sign the transaction
      const signer = await getWalletSigner(primaryWallet);
      const signedTx = await signer.signTransaction(tx);

      if (!signedTx) {
        throw new Error('Failed to sign transaction');
      }

      // 4) Serialize the transaction with requireAllSignatures: false for withdrawals
      const serializedTx = base58.encode(
        signedTx.serialize({ requireAllSignatures: false }),
      );

      // 5) Send the signed transaction to the server
      const handleDepositRes = await fetch(
        `${config.worker_server_url}/spl-token/handleDeposit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            amount,
            token: selectedToken.toLowerCase(),
            transactionType: transactionType,
            transaction: serializedTx,
          }),
        },
      );

      if (!handleDepositRes.ok) {
        const responseText = await handleDepositRes.text();
        console.error('Server response:', responseText);
        throw new Error(
          `Transaction failed: ${
            handleDepositRes.status
          } - ${responseText.slice(0, 100)}`,
        );
      }
    } catch (error: any) {
      console.error(`Error in ${transactionType} flow:`, error);
      toast.error(error.toString());
      setLoading(false);
      return;
    }

    // Show a "processing" toast AFTER the transaction is submitted
    const loadingToastId = toast.loading('Processing transaction...', {
      id: Date.now().toString(),
      duration: 999999,
    });
    setToastId(loadingToastId.toString());

    // Reset form
    setAmount(0);
    setInputValue('0');

    // Refresh user data
    setTimeout(() => {
      mutate(`${config.worker_server_url}/users/me`);
      mutate(`${config.worker_server_url}/rpc/onChainBalance`);
    }, 2000);

    setLoading(false);
  };

  // Get the token color based on the selected token type
  const getTokenColor = (token: Token) => {
    if (token === Token.BOOTY) {
      return {
        text: 'text-[rgb(255,99,71)]',
        border: 'border-[rgb(255,99,71)]',
        bg: 'bg-[rgba(255,99,71,0.2)]',
        hoverBg: 'hover:bg-[rgba(255,99,71,0.2)]',
      };
    } else {
      return {
        text: 'text-[#e09309fa]',
        border: 'border-[#e09309fa]',
        bg: 'bg-[rgba(224,147,9,0.2)]',
        hoverBg: 'hover:bg-[rgba(224,147,9,0.2)]',
      };
    }
  };

  const bootyColors = getTokenColor(Token.BOOTY);
  const goldColors = getTokenColor(Token.GOLD);

  return (
    <div className="flex w-full flex-col items-start justify-start gap-4 border-b border-b-profile-stroke px-4 py-6 md:px-8">
      <p className="myConnect font-SemiBold font-semibold uppercase opacity-50">
        Asset Management
      </p>

      {/* Asset Balances Overview */}
      <div className="grid w-full grid-cols-1 gap-4 rounded-lg border border-profile-stroke bg-black bg-opacity-30 p-3 md:p-4">
        <div className="flex w-full flex-col items-start justify-start gap-4">
          <p className="text-sm font-semibold uppercase opacity-70">
            Current Balances
          </p>

          {/* Tokens display grid - more columns on larger screens */}
          <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6 md:gap-4">
            {/* $BOOTY */}
            <div className="flex flex-col items-center justify-center gap-1 rounded-md border border-profile-stroke bg-black bg-opacity-30 p-2 md:gap-2 md:p-3">
              <SkullIcon className="h-5 w-5 md:h-6 md:w-6" />
              <p className="text-xs font-semibold">
                ${formatNumberWithSuffix(user.user?.arAmount)}
              </p>
              <p className="text-xs opacity-70">BOOTY</p>
            </div>

            {/* GEMS */}
            <div className="flex flex-col items-center justify-center gap-1 rounded-md border border-profile-stroke bg-black bg-opacity-30 p-2 md:gap-2 md:p-3">
              <GemIcon className="h-5 w-5 md:h-6 md:w-6" />
              <p className="text-xs font-semibold">
                {formatNumberWithSuffix(user.user?.gemsAmount)}
              </p>
              <p className="text-xs opacity-70">GEMS</p>
            </div>

            {/* GOLD */}
            <div className="flex flex-col items-center justify-center gap-1 rounded-md border border-profile-stroke bg-black bg-opacity-30 p-2 md:gap-2 md:p-3">
              <GoldTokenIcon className="h-5 w-5 md:h-6 md:w-6" />
              <p className="text-xs font-semibold">
                {formatNumberWithSuffix(user.user?.goldAmount)}
              </p>
              <p className="text-xs opacity-70">GOLD</p>
            </div>

            {/* TREASURE */}
            <div className="flex flex-col items-center justify-center gap-1 rounded-md border border-profile-stroke bg-black bg-opacity-30 p-2 md:gap-2 md:p-3">
              <TreasureIcon className="h-5 w-5 md:h-6 md:w-6" />
              <p className="text-xs font-semibold">
                {formatNumberWithSuffix(user.user?.treasureAmount)}
              </p>
              <p className="text-xs opacity-70">TREASURE</p>
            </div>

            {/* LEGENDARY SHIP */}
            <div className="flex flex-col items-center justify-center gap-1 rounded-md border border-profile-stroke bg-black bg-opacity-30 p-2 md:gap-2 md:p-3">
              <LegendaryShipTokenIcon className="h-5 w-5 md:h-6 md:w-6" />
              <p className="text-xs font-semibold">
                {formatNumberWithSuffix(user.user?.legendaryShipToken, 0)}
              </p>
              <p className="text-xs opacity-70">L. SHIP</p>
            </div>

            {/* BATTLE TOKEN */}
            <div className="flex flex-col items-center justify-center gap-1 rounded-md border border-profile-stroke bg-black bg-opacity-30 p-2 md:gap-2 md:p-3">
              <BattleTokenIcon className="h-5 w-5 md:h-6 md:w-6" />
              <p className="text-xs font-semibold">
                {user.user?.battleTokens || 0}
              </p>
              <p className="text-xs opacity-70">BATTLE</p>
            </div>
          </div>
        </div>
      </div>

      {/* Deposit/Withdraw Form */}
      <div className="w-full rounded-lg border border-profile-stroke bg-black bg-opacity-30 p-3 md:p-6">
        <div className="flex w-full flex-col gap-4 md:gap-6">
          <div className="flex w-full flex-col items-start justify-between gap-2 md:flex-row md:items-center">
            <p className="text-sm font-semibold uppercase opacity-70">
              {isDeposit ? 'Deposit Tokens' : 'Withdraw Tokens'}
            </p>

            {/* On-chain balances - stack on mobile */}
            <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2 md:items-center">
              <p className="text-xs opacity-70">On-Chain:</p>
              <div className="flex flex-row items-center gap-2">
                <div className="flex flex-row items-center gap-1">
                  <SkullIcon className="h-4 w-4" />
                  <p className="text-xs">
                    {formatNumberWithSuffix(user.user?.onChainAr || 0)}
                  </p>
                </div>
                <div className="ml-2 flex flex-row items-center gap-1">
                  <GoldTokenIcon className="h-4 w-4" />
                  <p className="text-xs">
                    {formatNumberWithSuffix(user.user?.onChainGold || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Token Selection */}
          <div className="flex w-full flex-row items-center justify-between gap-2 md:gap-4">
            <button
              className={`flex h-10 w-1/2 items-center justify-center gap-1 rounded-md border-2 md:h-12 md:gap-2 ${
                selectedToken === Token.BOOTY
                  ? `${bootyColors.border} ${bootyColors.bg} ${bootyColors.text}`
                  : `${bootyColors.border} bg-transparent ${bootyColors.text}`
              } transition-all duration-300 ${bootyColors.hoverBg}`}
              onClick={() => handleTokenSelect(Token.BOOTY)}>
              <SkullIcon
                width={18}
                height={18}
                className="h-4 w-4 md:h-5 md:w-5"
              />
              <span className="text-xs font-semibold md:text-sm">
                {Token.BOOTY}
              </span>
            </button>

            <button
              className={`flex h-10 w-1/2 items-center justify-center gap-1 rounded-md border-2 md:h-12 md:gap-2 ${
                selectedToken === Token.GOLD
                  ? `${goldColors.border} ${goldColors.bg} ${goldColors.text}`
                  : `${goldColors.border} bg-transparent ${goldColors.text}`
              } transition-all duration-300 ${goldColors.hoverBg}`}
              onClick={() => handleTokenSelect(Token.GOLD)}>
              <GoldTokenIcon
                width={18}
                height={18}
                className="h-4 w-4 md:h-5 md:w-5"
              />
              <span className="text-xs font-semibold md:text-sm">
                {Token.GOLD}
              </span>
            </button>
          </div>

          {/* Transaction Type Selection */}
          <div className="flex w-full flex-row items-center justify-between gap-2 md:gap-4">
            <button
              className={`flex h-10 w-1/2 items-center justify-center gap-1 rounded-md border text-xs md:h-12 md:gap-2 md:text-sm ${
                isDeposit
                  ? 'border-white border-opacity-80 bg-white bg-opacity-10'
                  : 'border-white border-opacity-30 bg-transparent'
              } transition-all duration-300 hover:bg-white hover:bg-opacity-5`}
              onClick={() => handleTransactionType(true)}>
              <ArrowDownIcon
                width={14}
                height={14}
                className="h-3 w-3 md:h-4 md:w-4"
              />
              <span className="hidden sm:inline">Deposit to Game</span>
              <span className="sm:hidden">Deposit</span>
            </button>

            <button
              className={`flex h-10 w-1/2 items-center justify-center gap-1 rounded-md border text-xs md:h-12 md:gap-2 md:text-sm ${
                !isDeposit
                  ? 'border-white border-opacity-80 bg-white bg-opacity-10'
                  : 'border-white border-opacity-30 bg-transparent'
              } transition-all duration-300 hover:bg-white hover:bg-opacity-5`}
              onClick={() => handleTransactionType(false)}>
              <ArrowDownIcon
                width={14}
                height={14}
                className="h-3 w-3 rotate-180 md:h-4 md:w-4"
              />
              <span className="hidden sm:inline">Withdraw to Wallet</span>
              <span className="sm:hidden">Withdraw</span>
            </button>
          </div>

          {/* Amount Input */}
          <div className="flex w-full flex-col gap-2">
            <div className="flex w-full flex-col items-start justify-between gap-1 sm:flex-row sm:items-center">
              <span className="text-xs uppercase opacity-70">Amount</span>
              <div className="flex flex-row items-center gap-1 sm:gap-2">
                <span className="text-xs opacity-70">Balance:</span>
                <span className="text-xs">
                  {isDeposit
                    ? getUserOnChainBootyOrGoldAmount(user.user, selectedToken)
                    : getUserBootyOrGoldAmount(user.user, selectedToken)}{' '}
                  {selectedToken}
                </span>
              </div>
            </div>

            <div className="relative flex w-full flex-row items-center">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (isNaN(value)) {
                    setAmount(0);
                    setInputValue('0');
                  } else if (value >= 0) {
                    setAmount(value);
                    setInputValue(value.toString());
                  }
                }}
                min={0}
                step={0.01}
                className="input h-10 w-full rounded-md border border-profile-stroke bg-black bg-opacity-50 text-xs md:h-12 md:text-sm"
              />
              <div className="absolute right-3 flex flex-row items-center gap-2">
                <span className="text-xs font-semibold md:text-sm">
                  {selectedToken}
                </span>
              </div>
            </div>

            {/* Info about withdrawal tax */}
            {!isDeposit && (
              <div className="mt-1 text-xs opacity-70">
                Note: A 10% treasury tax applies to all withdrawals
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            className={`flex h-10 w-full items-center justify-center gap-2 rounded-md text-xs md:h-12 md:text-sm
                       ${
                         loading || amount <= 0
                           ? 'cursor-not-allowed border border-white border-opacity-20 bg-white bg-opacity-5 text-white text-opacity-50'
                           : 'border border-white bg-white text-black hover:bg-transparent hover:text-white'
                       } transition-all duration-300`}
            onClick={handleDeposit}
            disabled={loading || amount <= 0}>
            {loading && <Spin />}
            {isDeposit ? 'Deposit to Game' : 'Withdraw to Wallet'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileAssetManagement;
