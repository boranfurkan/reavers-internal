import { useContext, useEffect, useState } from 'react';
import Draggable from 'react-draggable';

// Contexts
import { LayerContext } from '../../contexts/LayerContext';

// Library imports
import Layer from './Layer';
import React from 'react';

let referenceSize = {
  refWidth: 3840,
  refHeight: 2160,
};

// Define breakpoint for mobile devices (below this width is considered mobile)
const MOBILE_BREAKPOINT = 768;

let widthBase = 1920;
let scaleBase = 2; // Keeping your value of 2 for better scaling
let scaleBaseSmall = 0.8;
let zoomFactor = 2;
let scaleFactor = 0;
let windowAspectRatio = 0;

let widthBaseMobile = 1080;
let scaleBaseMobile = 0.8;

function LayerMap() {
  const layerContext = useContext(LayerContext);

  if (!layerContext) {
    throw new Error('LayerMap must be used within a LayerProvider');
  }

  const { setCurrentMission } = layerContext;

  /* Draggable Map when smaller than original size */
  interface WindowDimensions {
    width?: number;
    height?: number;
  }

  const [windowDimensions, setWindowDimensions] = useState<WindowDimensions>(
    {},
  );
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDraggable, setIsDraggable] = useState(false);

  function calculateBounds() {
    const ele = document.getElementById('map-video') as HTMLElement;
    if (ele != null) {
      referenceSize.refWidth = ele.getBoundingClientRect().width;
      referenceSize.refHeight = ele.getBoundingClientRect().height;
    }
  }

  function applyScale() {
    windowAspectRatio = window.innerWidth / window.innerHeight;
    if (windowAspectRatio < 1.0) {
      // Portrait
      scaleFactor = window.innerWidth / (widthBaseMobile * scaleBaseMobile);
    } else {
      if (windowAspectRatio < 1.2)
        // Landscape small added zoom in to avoid cutout
        scaleFactor = window.innerWidth / (widthBase * scaleBaseSmall);
      // Landscape normal
      else scaleFactor = window.innerWidth / (widthBase * scaleBase);
    }
  }

  const handleDrag = (e: any, { x, y }: any) => {
    // Only update position if device is mobile
    if (isDraggable) {
      setPosition({ x, y });
    }
  };

  useEffect(() => {
    function handleResize() {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      calculateBounds();
      applyScale();
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call to get dimensions immediately

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const checkIfDraggable = () => {
      // Only enable dragging on mobile devices
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsDraggable(isMobile);

      // Reset position when screen size changes
      setPosition({ x: 0, y: 0 });
    };

    window.addEventListener('resize', checkIfDraggable);
    checkIfDraggable();

    return () => {
      window.removeEventListener('resize', checkIfDraggable);
    };
  }, [windowDimensions]);

  calculateBounds();
  applyScale();

  const nodeRef = React.useRef(null);

  return (
    <div className="max-w-screen relative flex h-screen max-h-screen w-full flex-col items-center justify-center overflow-hidden">
      <div
        id="draggableParent"
        className="draggable-parent max-w-screen relative flex h-screen max-h-screen w-full flex-col items-center justify-center overflow-hidden">
        {isDraggable ? (
          <div
            id="ScalableParent"
            style={{
              transform: `scale(${scaleFactor})`,
            }}>
            <Draggable
              nodeRef={nodeRef}
              position={position}
              onDrag={handleDrag}
              bounds={{
                top: windowDimensions.height
                  ? -(
                      (referenceSize.refHeight - windowDimensions.height) /
                      (zoomFactor * scaleFactor)
                    )
                  : 0,
                bottom: windowDimensions.height
                  ? (referenceSize.refHeight - windowDimensions.height) /
                    (zoomFactor * scaleFactor)
                  : 0,
                left: windowDimensions.width
                  ? -(
                      (referenceSize.refWidth - windowDimensions.width) /
                      (zoomFactor * scaleFactor)
                    )
                  : 0,
                right: windowDimensions.width
                  ? (referenceSize.refWidth - windowDimensions.width) /
                    (zoomFactor * scaleFactor)
                  : 0,
              }}
              // Explicitly disable when not mobile
              disabled={!isDraggable}>
              <div
                ref={nodeRef}
                id="draggableMap"
                className="map-draggable-parent h-full overflow-hidden">
                <Layer
                  setCurrentMission={setCurrentMission}
                  location="center"
                />
              </div>
            </Draggable>
          </div>
        ) : (
          // Non-mobile view with fixed position and scaling
          <div
            id="ScalableParent"
            style={{
              transform: `scale(${scaleFactor})`,
              transformOrigin: 'center center',
            }}
            className="content flex h-screen w-full items-center justify-center">
            <Layer setCurrentMission={setCurrentMission} location="center" />
          </div>
        )}
      </div>
    </div>
  );
}

export default LayerMap;
