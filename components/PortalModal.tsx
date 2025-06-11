import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
  children: React.ReactNode;
}

export const ModalPortal: React.FC<ModalPortalProps> = ({ children }) => {
  const modalRoot = document.getElementById('modal-root');

  useEffect(() => {
    if (!modalRoot) {
      console.error('Modal root element not found');
      return;
    }

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [modalRoot]);

  if (!modalRoot) {
    return null;
  }

  return createPortal(children, modalRoot);
};
