// src/components/HereMapContext.jsx
import { createContext, useContext, useRef, useState } from 'react';

const HereMapContext = createContext();

export const HereMapProvider = ({ children }) => {

// Holds the HERE map style object
const styleRef = useRef(null);

// Tracks whether the map style is ready
const [isReady, setIsReady] = useState(false);

return (
  <HereMapContext.Provider
    value={
      {
        styleRef,
        isReady,
        setIsReady
      }
    }
  >
    {children}
  </HereMapContext.Provider>
  );
};

// Custom hook that lets any component access the HERE map and style
export const useHereMap = () => useContext(HereMapContext);
