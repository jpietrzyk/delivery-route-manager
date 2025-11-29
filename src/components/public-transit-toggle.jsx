// src/components/PublicTransitToggle.jsx

import { useState } from 'react';
import { useHereMap } from './here-map-context';

const PublicTransitToggle = () => {
const { styleRef, isReady } = useHereMap(); // Access shared map state
const [enabled, setEnabled] = useState(false); // Track toggle state

const toggleTransit = () => {
   if (!isReady || !styleRef.current) {
      console.warn('Map style is not ready yet');
      return;
   }

   const style = styleRef.current;
   const feature = 'public transit';
   const mode = 'all systems';

   const enabledFeatures = style.getEnabledFeatures();
   const featureIndex = enabledFeatures.findIndex(f => f.feature === feature);

   if (featureIndex === -1) {
      // Enable the feature
      enabledFeatures.push({ feature, mode });
      setEnabled(true);
   } else {
      // Disable the feature
      enabledFeatures.splice(featureIndex, 1);
      setEnabled(false);
   }

   style.setEnabledFeatures(enabledFeatures);
};

// Returns the button with the associated styling, depending on the toggle state
return (
   <button
      onClick={toggleTransit}
      disabled={!isReady}
      style={
         {
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 1000,
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '700',
            fontFamily: 'Roboto, Helvetica Neue, Arial, sans-serif',
            backgroundColor: isReady ? (enabled ? '#1A73E8' : '#f4f6f9') : '#e0e0e0',
            color: isReady ? (enabled ? '#ffffff' : '#1A73E8') : '#aaa',
            border: `2px solid ${isReady ? '#1A73E8' : '#ccc'}`,
            borderRadius: '6px',
            cursor: isReady ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease-in-out',
            boxShadow: isReady ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
         }
      }
   >
      {enabled ? 'Disable Public Transit' : 'Enable Public Transit'}
   </button>
   );
};

export default PublicTransitToggle;
