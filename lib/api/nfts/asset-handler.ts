import { config } from '../../../config';
import { getErrorMessage } from '../../../utils/helpers';
import { NFTType } from '../../../types/BaseEntity';

type AssetHandlerProps = (
  | {
      actionType: 'freeze' | 'thaw';
      payload: {
        mintAddresses: string[];
        type: NFTType.CREW | NFTType.SHIP | NFTType.ITEM | 'CHARACTER';
      };
    }
  | {
      actionType: 'mint-and-withdraw';
      payload: {
        uids: string[];
        type: NFTType.CREW | NFTType.SHIP | NFTType.ITEM;
      };
    }
  | {
      actionType: 'handle-assets';
      payload: {
        transactions: {
          tx: string;
          mint: string;
          id?: string;
        }[];
        type: NFTType.CREW | NFTType.SHIP | NFTType.ITEM | 'CHARACTER';
      };
    }
) & {
  bearerToken: string | null;
};

export const assetHandler = async ({
  payload,
  actionType,
  bearerToken,
}: {
  payload: any;
  actionType: string;
  bearerToken: string | null;
}): Promise<any> => {
  try {
    // // Log the action type and payload
    // console.log(`Asset handler - Starting ${actionType} request with payload:`, payload);

    // Update endpoint mapping based on action type
    const getEndpoint = () => {
      switch (actionType) {
        case 'handle-assets':
          return `${config.worker_server_url}/nfts/handle-assets`;
        case 'freeze':
          return `${config.worker_server_url}/nfts/freeze`;
        case 'thaw':
          return `${config.worker_server_url}/nfts/thaw`;
        case 'mint-and-withdraw':
          return `${config.worker_server_url}/nfts/mint-and-withdraw`;
        default:
          throw new Error(`Unknown action type: ${actionType}`);
      }
    };

    const endpoint = getEndpoint();
    // //Log the endpoint
    // console.log('Asset handler - Using endpoint:', endpoint);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearerToken}`,
      },
      body: JSON.stringify(payload),
    });

    // // Log the raw response
    // console.log('Asset handler - Raw response:', {
    //   status: response.status,
    //   statusText: response.statusText,
    // });

    if (!response.ok) {
      const errorBody = await response.text();
      // // Log the error response
      // console.error('Asset handler - Error response:', errorBody);

      try {
        const errorJson = JSON.parse(errorBody);
        throw new Error(errorJson.message || 'Server error');
      } catch (e) {
        throw new Error(`Server error: ${response.status} - ${errorBody}`);
      }
    }

    const data = await response.json();
    // // Log the success response
    // console.log('Asset handler - Success response:', data);
    return data;
  } catch (error) {
    console.error('Asset handler - Error:', error);
    throw error;
  }
};
