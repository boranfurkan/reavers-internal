import { config } from '../../config';
import {
  createUmi,
  Umi,
  signerIdentity,
  signAllTransactions,
} from '@metaplex-foundation/umi';
import base58 from 'bs58';
import {
  AssetLocation,
  AssetCardProps,
} from '../../components/asset-manager/AssetCard';
import {
  SecondaryTabValue,
  MintStatusValue,
} from '../../components/asset-manager/AssetManagementFilterOptions';
import { ItemData } from '../../lib/types';
import { NFTType } from '../../types/BaseEntity';
import {
  CharacterNFT,
  ShipNFT,
  CrewNFT,
  GenesisShipNFT,
} from '../../types/NFT';
import {
  getLevelRarity,
  getAssetIdentifier,
  getCollectionNameFromSymbol,
  getItemsImageUrlByName,
} from '../helpers';
import { assetHandler } from '../../lib/api/nfts/asset-handler';
import {
  Transaction,
  VersionedTransaction,
  TransactionMessage,
  Connection,
  PublicKey,
} from '@solana/web3.js';
import {
  toWeb3JsTransaction,
  fromWeb3JsTransaction,
} from '@metaplex-foundation/umi-web3js-adapters';

/**
 * 1) Define our own `DynamicWallet` interface to fix
 *    "Cannot find name 'DynamicWallet'."
 *    This interface matches the code that calls `.getSigner()`.
 */
interface DynamicWallet {
  address?: string;
  /**
   * getSigner: a function returning an object that has .signTransaction(...)
   */
  getSigner: () => Promise<{
    signTransaction?: (
      tx: VersionedTransaction,
    ) => Promise<VersionedTransaction>;
  }>;
}

// Define the expected response type from assetHandler
type AssetHandlerResponse = {
  jobId?: string;
  tx?: string;
  mint?: string;
};

// Define the payload types
type AssetHandlerPayload = {
  mintAddresses?: string[];
  uids?: string[];
  type: string;
  transactions?: { mint: string; tx: string }[];
  isCoreNFT?: boolean;
};

/**
 * For getAssetCardPropsFromNFT
 */
type GetAssetCardPropsFromNFTProps = {
  location: AssetLocation;
  handleSelect: (id: string) => any;
  selectedAssets: string[];
} & (
  | {
      type: 'CAPTAIN';
      nfts: CharacterNFT[];
    }
  | {
      type: NFTType.SHIP;
      nfts: ShipNFT[];
    }
  | {
      type: NFTType.ITEM;
      nfts: ItemData[];
    }
  | {
      type: NFTType.CREW;
      nfts: CrewNFT[];
    }
  | {
      type: NFTType.GENESIS_SHIP;
      nfts: GenesisShipNFT[];
    }
);

/**
 * Build an array of AssetCardProps from our NFT objects
 */
export const getAssetCardPropsFromNFT = ({
  type,
  nfts,
  location,
  handleSelect,
  selectedAssets,
}: GetAssetCardPropsFromNFTProps): AssetCardProps[] => {
  return nfts.map((nft) => {
    const metadata: any = nft.metadata || nft.content?.metadata;

    let imageUrl = '';
    let level = 1;
    let isActionLimited = false;
    let goldBurned = 0;

    if (type === NFTType.ITEM) {
      imageUrl = getItemsImageUrlByName(metadata?.name);
    } else {
      imageUrl =
        metadata?.image || nft.content?.links?.image || '/images/reavers.webp';
    }

    if (type !== NFTType.GENESIS_SHIP) {
      if ((nft as any).level) {
        level = (nft as any).level;
      } else if (nft.content?.metadata?.attributes) {
        const metadataLevel = nft.content.metadata.attributes.find(
          (attribute: { trait_type: string; value: string }) =>
            attribute.trait_type === 'Level',
        )?.value;
        if (metadataLevel) {
          level = parseInt(metadataLevel);
        }
      }
    }

    const rarity =
      type === NFTType.GENESIS_SHIP
        ? (nft as any).rarity
        : getLevelRarity(type == 'CAPTAIN' ? NFTType.CREW : type, level);

    if (location === AssetLocation.IN_WALLET) {
      isActionLimited = false;
    } else {
      if (type === 'CAPTAIN') {
        const characterNFT = nft as CharacterNFT;
        goldBurned = characterNFT.goldBurned || 0;
        if (characterNFT.currentMission !== '') {
          isActionLimited = true;
        }
      } else if (type === NFTType.GENESIS_SHIP) {
        isActionLimited =
          (!!(nft as GenesisShipNFT).assignedUserId &&
            (nft as GenesisShipNFT).assignedUserId !== null) ||
          (nft as GenesisShipNFT).isOnMission === true;
      }
    }

    return {
      id: getAssetIdentifier(nft) as string,
      imageUrl,
      collection:
        // metadata?.symbol == ''
        //   ? 'getCollectionNameFromCollectionAddress()'
        //   :
        getCollectionNameFromSymbol(
          type === NFTType.ITEM ? 'REAVERS' : metadata?.symbol,
        ),
      type,
      name: metadata?.name || type,
      level: level,
      rarity,
      location,
      minted: !!nft.minted,
      mint: nft.mint || nft.id,
      isActionLimited: isActionLimited,
      isSelected: selectedAssets.includes(getAssetIdentifier(nft)),
      handleSelect,
      goldBurned,
    };
  });
};

/**
 * Verify user isn't mixing minted vs. not minted, etc.
 */
export const assetActionVerifySelection = ({
  selectedAssets,
  assetType,
  gameTab,
  mintStatus,
  sliderValue,
  skipSliderValueCheck,
}: {
  selectedAssets: AssetCardProps[];
  assetType: SecondaryTabValue;
  gameTab: AssetLocation;
  mintStatus: MintStatusValue;
  sliderValue: number;
  skipSliderValueCheck?: boolean;
}) => {
  const assetTypes = new Set(selectedAssets.map((asset) => asset.type));
  if (assetTypes.size !== 1) {
    throw Error('You can handle one asset type at a time.');
  }
  if (!assetTypes.has(assetType)) {
    throw Error('Selected assets do not match the current type.');
  }

  const assetLocations = new Set(selectedAssets.map((asset) => asset.location));
  if (assetLocations.size !== 1) {
    throw Error('You cannot deposit and withdraw at the same time.');
  }
  if (!assetLocations.has(gameTab)) {
    throw Error('Selected assets do not match the current location.');
  }

  const mintStatuses = new Set(selectedAssets.map((asset) => asset.minted));
  if (mintStatuses.size !== 1) {
    throw Error(
      'You cannot manage minted and non-minted assets at the same time.',
    );
  }
  if (
    (mintStatus === 'minted' && mintStatuses.has(false)) ||
    (mintStatus === 'not-minted' && mintStatuses.has(true))
  ) {
    throw Error('Selected assets do not match the current mint status.');
  }

  if (!skipSliderValueCheck && selectedAssets.length !== sliderValue) {
    throw Error('Asset count does not match the slider value.');
  }
};

/**
 * processAction
 * The code that calls dynamicWallet.getSigner() => signTransaction
 */
export const processAction = async ({
  actionType,
  bearerToken,
  selectedAssets,
  assetType,
  umi,
  dynamicWallet,
}: {
  actionType: 'freeze' | 'thaw' | 'mint-and-withdraw';
  bearerToken: string | null;
  selectedAssets: AssetCardProps[];
  assetType: SecondaryTabValue;
  umi: Umi;
  dynamicWallet: DynamicWallet; // Now referencing the local interface above
}): Promise<string | { jobId: string; warning?: string }> => {
  if (!bearerToken) {
    throw new Error('You are not authorized. Please login and try again.');
  }

  const isCoreNFT = assetType === NFTType.GENESIS_SHIP ? true : false;

  try {
    // Build payload for the server
    const payload: AssetHandlerPayload = {
      type: assetType === 'CAPTAIN' ? 'CHARACTER' : assetType,
      isCoreNFT,
      ...(actionType === 'mint-and-withdraw'
        ? { uids: selectedAssets.map((asset) => asset.id) }
        : {
            mintAddresses: selectedAssets
              .map((asset) => asset.mint)
              .filter((mint): mint is string => !!mint),
          }),
    };

    // request transaction(s) from server
    const transactionData = await assetHandler({
      payload,
      actionType,
      bearerToken,
    });

    if (!Array.isArray(transactionData)) {
      console.log(transactionData, 'transactionData');
      throw new Error('Invalid transaction data received from server');
    }

    const processedTxs = [];

    // if (!isCoreNFT) {
    for (const item of transactionData) {
      try {
        const decodedTx = base58.decode(item.tx);
        const versionedTx = VersionedTransaction.deserialize(decodedTx);

        // get signer from dynamicWallet
        const signer = await dynamicWallet.getSigner();
        if (!signer || typeof signer.signTransaction !== 'function') {
          throw new Error('No valid signer available');
        }

        // sign
        const signedTx = await signer.signTransaction(versionedTx);
        const signature = base58.encode(signedTx.signatures[0]);

        const serializedTx = signedTx.serialize();
        const encodedTx = base58.encode(serializedTx);

        processedTxs.push({
          mint: item.mint,
          tx: encodedTx,
          ...(actionType === 'mint-and-withdraw' && { id: item.id }),
        });
      } catch (err) {
        const e = err as Error;
        console.error('Transaction processing error:', {
          mint: item.mint,
          error: e,
          message: e.message,
          stack: e.stack,
        });
        throw e;
      }
    }
    // } else {
    //   //TO DO FOR NOW
    // }

    // Finally, send signed TXs back to server
    const handleAssetsRes = await assetHandler({
      payload: {
        transactions: processedTxs,
        type: payload.type,
      },
      actionType: 'handle-assets',
      bearerToken,
    });

    return handleAssetsRes;
  } catch (error) {
    const e = error as Error;
    console.error('Error in processAction:', {
      error: e,
      message: e.message,
      stack: e.stack,
    });
    throw e;
  }
};
