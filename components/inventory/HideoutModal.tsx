import React, { useContext } from 'react';
import TabComponent from './TabComponent';
import { motion } from 'framer-motion';
import { LayerContext } from '../../contexts/LayerContext';

function HideoutModal() {
  const layerContext = useContext(LayerContext);

  if (!layerContext) {
    throw new Error('LayerSelect must be used within a LayerProvider');
  }

  const { setHideoutModalOpen, toggleInventoryTab } = layerContext;

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex h-screen w-full flex-row items-start justify-between bg-reavers-bg bg-opacity-90 text-white backdrop-blur-xl"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1, transition: { duration: 0.2 } }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}>
      <div onClick={(e) => e.stopPropagation()} className="w-full">
        <TabComponent
          handleClose={() => {
            setHideoutModalOpen((prev) => !prev);
            toggleInventoryTab('Reavers');
          }}
        />
      </div>
    </motion.div>
  );
}

export default HideoutModal;
