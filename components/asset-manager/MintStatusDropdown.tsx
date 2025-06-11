import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  mintStatusOptions,
  MintStatusValue,
} from './AssetManagementFilterOptions';
import DownArrowIcon from '../../assets/down-arrow-icon';
import ArrowDownIcon from '../../assets/arrow-down-icon';

interface MintStatusDropdownProps {
  mintStatus: string;
  setMintStatus: (status: MintStatusValue) => void;
}

const MintStatusDropdown = ({
  mintStatus,
  setMintStatus,
}: MintStatusDropdownProps) => {
  return (
    <Menu
      as="div"
      className="relative mx-auto inline-block w-max self-center text-left">
      <div>
        <Menu.Button className="inline-flex h-[30px] w-[150px] items-center justify-between rounded-lg border border-white border-opacity-[0.15] bg-transparent px-4 text-white">
          {mintStatusOptions.find((option) => option.value === mintStatus)
            ?.title || 'All'}
          <ArrowDownIcon width={16} height={16} />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95">
        <Menu.Items className="absolute right-0 z-50 mt-1 w-[150px] origin-top-left rounded-lg border border-white border-opacity-[0.15] bg-black bg-opacity-80 shadow-lg">
          {mintStatusOptions.map((option) => (
            <Menu.Item key={option.value}>
              {({ active }) => (
                <div
                  onClick={() => setMintStatus(option.value)}
                  className={`block cursor-pointer p-2 text-white ${
                    active ? 'bg-white bg-opacity-[0.1]' : ''
                  }`}>
                  {option.title}
                </div>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default MintStatusDropdown;
