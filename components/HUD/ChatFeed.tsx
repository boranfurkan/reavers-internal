import { AnimatePresence, motion } from 'framer-motion';
import React, { useContext, useEffect, useRef, useState } from 'react';
import ChatComponent from '../chat/ChatComponent';
import { LayerContext } from '../../contexts/LayerContext';
import FeedComponent from '../chat/FeedComponent';
import Image from 'next/image';
import ChatIcon from '../../assets/chat-icon';

const tabs = [{ name: 'chat', disabled: false }];

function ChatFeed() {
  const layerContext = useContext(LayerContext);

  if (!layerContext) {
    throw new Error('LayerSelect must be used within a LayerProvider');
  }

  const { inputRef, chatRef } = layerContext;

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs[0].name);

  const rotateInOut = {
    hidden: { rotate: 0 },
    show: { rotate: 360 },
    exit: { rotate: 0, transition: { delay: 0.5 } },
  };

  const expandInOut = {
    hidden: { width: '15%' },
    show: { width: '25%' },
    exit: { width: '15%', transition: { delay: 0.5 } },
  };

  const slideInOut = {
    hidden: { height: '0vh', opacity: 0 },
    show: { height: '59vh', opacity: 1, transition: { delay: 0.2 } },
    exit: { height: '0vh', opacity: 0, transition: { delay: 0.5 } }, // Add this line
  };

  const node = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (node.current?.contains(e.target as Node)) {
        // Inside click
        return;
      }
      // Ignore clicks on layer items
      if ((e.target as Element).classList.contains('layer-item')) {
        return;
      }
      // Outside click
      setIsOpen(false);
      // resetNewMessagesCount(); // Reset new messages count when chat feed is opened
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (node.current && !node.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const current = node.current; // capture current node reference

    if (isOpen) {
      document.addEventListener('mousedown', handleClick);
    }

    return () => {
      // use the captured reference in the cleanup function
      if (current && isOpen) {
        document.removeEventListener('mousedown', handleClick);
      }
    };
  }, [isOpen]);

  function getTabContent(tabName: string) {
    switch (tabName) {
      case 'chat':
        return <ChatComponent inputRef={inputRef} key="chat" isOpen={isOpen} />;
      case 'feed':
        return <FeedComponent key="feed" />;
      default:
        return null;
    }
  }

  return (
    <motion.div
      className={`fixed bottom-0 left-2 z-30 rounded-[3px] border-reavers-border border-opacity-40 bg-opacity-80 text-white transition-all duration-300 ease-in-out hover:border-white hover:border-opacity-90 
                  md:bottom-2 md:left-4 md:w-60  md:min-w-[240px] md:border md:bg-reavers-bg md:backdrop-blur-sm ${
                    isOpen
                      ? 'outline mb-24 min-w-[90vw] border  bg-reavers-bg outline-4 outline-reavers-outline md:mb-0'
                      : 'cursor-pointer  '
                  } flex flex-row items-center justify-between`}
      animate={isOpen ? 'show' : 'hidden'}
      variants={expandInOut}
      ref={node}
      onClick={isOpen ? undefined : () => setIsOpen(!isOpen)}>
      <div className="relative h-full w-full " ref={chatRef}>
        <AnimatePresence>
          {!isOpen && (
            <div
              key={'closed'}
              className="ransition-all flex cursor-pointer items-center justify-center rounded-[3px] border border-reavers-border bg-reavers-bg p-1.5 md:hidden">
              <ChatIcon width={28} height={28} />
            </div>
          )}
          <div
            key={'closeds'}
            className={`${isOpen ? 'chat-open' : 'chat-closed'}`}></div>
          <div className="sticky top-0 flex w-full flex-row items-center justify-between p-3 ">
            <div
              className={`${
                isOpen ? 'flex' : 'hidden md:flex'
              } flex-row items-center justify-center gap-4`}>
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  disabled={tab.disabled}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex h-full w-full cursor-pointer flex-row items-center justify-center  gap-0.5 p-[0.152rem] ${
                    activeTab === tab.name
                      ? 'active-tab-class bg-opacity-10'
                      : 'inactive-tab-class  bg-opacity-5'
                  } ${tab.disabled ? 'cursor-not-allowed opacity-50' : ''}`}>
                  <span
                    className={`text-[14px] uppercase ${
                      activeTab === tab.name
                        ? 'font-bold text-white'
                        : 'font-thin  text-gray-400'
                    }`}>
                    {' '}
                    {tab.name}
                  </span>
                </button>
              ))}
            </div>
            <motion.div
              variants={rotateInOut}
              onClick={() => {
                // resetNewMessagesCount(); // Reset new messages count when chat feed is opened
                setIsOpen((prev) => !prev);
              }}
              className="cursor-pointer">
              {isOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5 text-white hover:scale-105">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="hidden h-5 w-5 text-white hover:scale-105 md:flex">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 15.75l7.5-7.5 7.5 7.5"
                  />
                </svg>
              )}
            </motion.div>
          </div>
          {isOpen ? (
            <motion.div
              key={'content'}
              variants={slideInOut}
              initial="hidden"
              animate="show"
              exit="hidden"
              className={`chat-frame w-full flex-col items-start justify-between gap-8 overflow-hidden text-white ${
                isOpen ? '59vh visible flex' : 'hidden'
              }`}>
              {getTabContent(activeTab)}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default ChatFeed;
