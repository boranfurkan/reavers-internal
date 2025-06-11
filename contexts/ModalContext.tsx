'use client';
import React, { useState, createContext, useContext } from 'react';
import { motion } from 'framer-motion';
import ModalCloseButton from '../components/HUD/modals/ModalCloseButton';

interface ModalContextType {
  modalContent: React.ReactNode;
  setModalContent: (content: React.ReactNode) => void;
  parentClassName?: string;
  setParentClassName?: (className: string) => void;

  secondaryModalContent: React.ReactNode;
  setSecondaryModalContent: (content: React.ReactNode) => void;
  secondaryParentClassName?: string;
  setSecondaryParentClassName?: (className: string) => void;
}

const defaultModalContextValue: ModalContextType = {
  modalContent: null,
  setModalContent: () => {},
  parentClassName: '',
  setParentClassName: () => {},

  secondaryModalContent: null,
  setSecondaryModalContent: () => {},
  secondaryParentClassName: '',
  setSecondaryParentClassName: () => {},
};

const ModalContext = createContext<ModalContextType>(defaultModalContextValue);

const useModalContext = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('Modal Context must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [parentClassName, setParentClassName] = useState<string>('');

  const [secondaryModalContent, setSecondaryModalContent] =
    useState<React.ReactNode>(null);
  const [secondaryParentClassName, setSecondaryParentClassName] =
    useState<string>('');

  return (
    <ModalContext.Provider
      value={{
        modalContent,
        setModalContent,
        parentClassName,
        setParentClassName,
        secondaryModalContent,
        setSecondaryModalContent,
        secondaryParentClassName,
        setSecondaryParentClassName,
      }}>
      {children}
      {modalContent && (
        <motion.div
          className={`fixed inset-0 z-[98] h-screen w-full overflow-y-scroll bg-black text-white backdrop-blur-sm ${parentClassName}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: 0.2 } }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 1 } }}>
          <div className="flex h-full w-full items-center justify-center">
            {modalContent}
          </div>
          <ModalCloseButton
            handleClose={() => {
              setModalContent(null);
              setParentClassName('');
            }}
          />
        </motion.div>
      )}
      {secondaryModalContent && (
        <motion.div
          className={`fixed inset-0 z-[99] h-screen w-full overflow-y-scroll bg-black text-white backdrop-blur-sm ${secondaryParentClassName}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: 0.2 } }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 1 } }}>
          <div className="flex h-full w-full items-center justify-center">
            {secondaryModalContent}
          </div>
          <ModalCloseButton
            handleClose={() => {
              setSecondaryModalContent(null);
              setSecondaryParentClassName('');
            }}
          />
        </motion.div>
      )}
    </ModalContext.Provider>
  );
};
