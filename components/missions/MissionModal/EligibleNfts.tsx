import { useContext } from 'react';
import { LayerContext } from '../../../contexts/LayerContext';
import { Spin } from 'antd';
import { useNfts } from '../../../contexts/NftContext';
import { config } from '../../../config';

interface EligibleNftsProps {
  onClick: () => void;
  isLoading: boolean;
}

const EligibleNfts = ({ onClick, isLoading }: EligibleNftsProps) => {
  const layerContext = useContext(LayerContext);

  if (!layerContext) {
    throw new Error('LayerMap must be used within a LayerProvider');
  }

  const { isMobile } = layerContext;
  const nfts = useNfts();

  const availableCount = nfts.restingNfts.filter(
    (nft) => nft.isCore === true || nft.minted === false,
  ).length;

  return (
    <div
      className={
        'relative col-span-2 flex h-[241px] w-full rounded border border-[#8d56ff] bg-[rgba(141,86,255,0.2)]'
      }>
      <div className="absolute left-0 top-0 z-0 h-full w-full blur-[10px]"></div>
      <div
        className={'z-10 flex h-full w-full flex-col justify-between px-2.5'}>
        <span className="pt-[14px] text-[12px] uppercase text-[#ad86ff]">
          Send Reavers
        </span>

        <div
          className={
            'flex w-full flex-col gap-1 ' + (isMobile ? ' p-2 ' : ' p-5 ')
          }>
          {isLoading ? (
            <Spin />
          ) : (
            <>
              <span className="text-3xl">{availableCount}</span>
              <span className="text-[10px] uppercase leading-[10px] opacity-40">
                Available
              </span>
            </>
          )}
        </div>

        <button
          className="mb-2.5 flex w-full cursor-pointer justify-center rounded bg-[#622bd7] py-1 text-[12px] font-semibold uppercase"
          onClick={isLoading ? () => {} : onClick}
          disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Select Captains'}
        </button>
      </div>
    </div>
  );
};

export default EligibleNfts;
