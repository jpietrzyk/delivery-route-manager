// src/components/HereMap.jsx
import { useEffect, useRef } from 'react';

// Stores the DOM node (mapRef) that contains the map
const HereMap = () => {
const mapRef = useRef(null);

// Initializes the HERE map once after mount
useEffect(() => {
  const platform = new window.H.service.Platform({
    apikey: import.meta.env.VITE_HERE_MAPS_API_KEY,
  });

  // Define the engine type:
  const engineType = H.Map.EngineType['HARP'];

  // Obtain the default map types from the platform object:
  const defaultLayers = platform.createDefaultLayers({engineType});

  // Instantiate (and display) a map:
  const map = new window.H.Map(mapRef.current, defaultLayers.vector.normal.map, {
    center: { lat: 52.5200, lng: 13.4050 },
    zoom: 10,
    engineType,
    pixelRatio: window.devicePixelRatio || 1,
  });

  // Enable dynamic resizing of the map, based on the current size of the enclosing cntainer
  window.addEventListener('resize', () => map.getViewPort().resize());

  // MapEvents enables the event system.
  // The behavior variable implements default interactions for pan/zoom
  // Also on mobile touch environments).
  const behavior = new window.H.mapevents.Behavior(
    new window.H.mapevents.MapEvents(map)
  );

  // Create the default UI:
  const ui = window.H.ui.UI.createDefault(map, defaultLayers);

  return () => map.dispose();
}, []);

// Return the map component with the map size set to
// the full height and width of the browser window
return (
  <div
    ref={mapRef}
        style={
          {
            width: '100vw',
            height: '100vh'
          }
        }
  />
  );
};

export default HereMap;
