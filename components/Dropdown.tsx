'use client';
import React, {
  useState,
  useEffect,
  useRef,
  ReactNode,
  ReactElement,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const slideInOut = {
  hidden: { height: 0, opacity: 0, overflow: 'hidden' },
  show: { height: 'auto', opacity: 1, overflow: 'hidden' },
  exit: { height: 0, opacity: 0, overflow: 'hidden' },
};

interface DropdownProps {
  children: ReactNode;
  isDefaultOpen?: boolean;
}

interface DropdownHeaderProps {
  children: ReactNode;
  isExpanded?: boolean;
}

interface DropdownContentProps {
  children: ReactNode;
}

const DropdownHeader: React.FC<DropdownHeaderProps> = ({
  children,
  isExpanded,
}) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
    <div className="w-full">{children}</div>
    <motion.div
      initial={{ rotate: 90 }}
      animate={{ rotate: isExpanded ? 0 : 90 }}
      transition={{ duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        style={{ height: '24px', width: '24px', color: '#fff' }}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
        />
      </svg>
    </motion.div>
  </div>
);

const DropdownContent: React.FC<DropdownContentProps> = ({ children }) => (
  <>{children}</>
);

const Dropdown: React.FC<DropdownProps> = ({
  children,
  isDefaultOpen = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(isDefaultOpen);
  const divRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
  };

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (divRef.current && !divRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    }

    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  let header: ReactElement | null = null;
  let content: ReactElement | null = null;

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === DropdownHeader) {
        header = React.cloneElement(
          child as ReactElement<DropdownHeaderProps>,
          { isExpanded },
        );
      } else if (child.type === DropdownContent) {
        content = child;
      }
    }
  });

  return (
    <div
      className="dropdown-container mb-2 w-full rounded-md border border-[rgba(255,255,255,0.3)]"
      ref={divRef}>
      <div
        onClick={handleToggle}
        className="dropdown-header cursor-pointer rounded-t-md bg-white bg-opacity-15 p-4">
        {header}
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            variants={slideInOut}
            initial="hidden"
            animate="show"
            exit="exit"
            transition={{ duration: 0.3 }}
            style={{
              overflow: 'hidden',
              borderRadius: '0 0 6px 6px',
              backgroundColor: '#000',
            }}>
            <motion.div
              className="bg-white bg-opacity-10 p-4"
              style={{
                overflow: 'hidden',
                borderRadius: '0 0 6px 6px',
              }}
              layout
              transition={{ duration: 0.3 }}>
              {content}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { Dropdown, DropdownHeader, DropdownContent };
