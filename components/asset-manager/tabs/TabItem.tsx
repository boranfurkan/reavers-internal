interface TabItemProps {
  tab: {
    key: string;
    icon?: React.ReactNode;
    name: string;
  };
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

const TabItem: React.FC<TabItemProps> = ({
  tab,
  isActive,
  className,
  onClick,
}) => (
  <div
    onClick={onClick}
    className={`flex cursor-pointer items-center space-x-2 rounded-lg p-2 max-md:justify-center ${
      isActive
        ? 'bg-white bg-opacity-10 font-medium text-white'
        : 'text-white hover:opacity-100'
    } ${className}`}>
    {tab.icon && tab.icon}
    <span>{tab.name}</span>
  </div>
);

export default TabItem;
