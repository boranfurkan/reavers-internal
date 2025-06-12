import React from 'react';
import { ForgeTabValue } from '../../types/forge';
import { forgeAssetTabs } from './forge-constants';

interface ForgeTabNavigationProps {
  activeTab: ForgeTabValue;
  onTabChange: (tab: ForgeTabValue) => void;
  isMobile?: boolean;
}

export const ForgeTabNavigation: React.FC<ForgeTabNavigationProps> = ({
  activeTab,
  onTabChange,
  isMobile = false,
}) => {
  if (isMobile) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {forgeAssetTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex flex-shrink-0 items-center gap-2 rounded-md border px-3 py-2 font-Body text-sm transition-colors sm:px-4 ${
              activeTab === tab.key
                ? 'border-reavers-fill bg-reavers-fill/20 text-white'
                : 'border-reavers-border bg-reavers-bg-secondary text-white/60 hover:border-reavers-fill/50 hover:text-white'
            }`}>
            {tab.icon}
            <span>{tab.name}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-1">
      {forgeAssetTabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`flex items-center gap-2 rounded-md px-3 py-2 font-Body text-sm transition-all duration-200 sm:px-4 sm:text-base ${
            activeTab === tab.key
              ? 'bg-reavers-fill font-bold text-white'
              : 'bg-transparent text-white/70 hover:bg-reavers-fill/20 hover:text-white'
          }`}>
          {tab.icon}
          <span className="hidden sm:inline">{tab.name}</span>
        </button>
      ))}
    </div>
  );
};
