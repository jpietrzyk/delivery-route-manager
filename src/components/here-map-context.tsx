// src/components/here-map-context.tsx
import { useRef, useState } from "react";
import { HereMapContext } from "@/contexts/HereMapContext";

interface HereMapProviderProps {
  children: React.ReactNode;
}

export const HereMapProvider: React.FC<HereMapProviderProps> = ({
  children,
}) => {
  // Holds the HERE map style object
  const styleRef = useRef<unknown>(null);

  // Holds the HERE map instance
  const mapRef = useRef<unknown>(null);

  // Tracks whether the map style is ready
  const [isReady, setIsReady] = useState<boolean>(false);

  return (
    <HereMapContext.Provider
      value={{
        styleRef,
        mapRef,
        isReady,
        setIsReady,
      }}
    >
      {children}
    </HereMapContext.Provider>
  );
};
