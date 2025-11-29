// src/components/HereMap.jsx
import { useEffect, useRef } from 'react';
import { useHereMap } from './here-map-context'; // Obtain the context

const HereMap = () => {
const mapRef = useRef(null);
const { styleRef, setIsReady } = useHereMap(); // Get the context setters

useEffect(() => {
  const platform = new window.H.service.Platform({ apikey: import.meta.env.VITE_HERE_MAPS_API_KEY });

  const engineType = window.H.Map.EngineType.HARP;
  const defaultLayers = platform.createDefaultLayers({ engineType });

  const map = new window.H.Map(mapRef.current, defaultLayers.vector.normal.map, {
    center: { lat: 52.52, lng: 13.405 },
    zoom: 10,
    engineType,
    pixelRatio: window.devicePixelRatio || 1,
  });

  new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));
  window.H.ui.UI.createDefault(map, defaultLayers);

  const baseLayer = map.getBaseLayer();
  const style = baseLayer.getProvider().getStyle();

  // Enable other components to use the style once it is ready
  if (style) {
    styleRef.current = style;
    setIsReady(true);
  }

  window.addEventListener('resize', () => map.getViewPort().resize());

  return () => map.dispose();
}, [styleRef, setIsReady]);

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
