declare const Loader: {
  async: boolean;
  load: (config: unknown, onLoad: () => void, apiKey?: string) => void;
};

interface SMapInstance {
  addDefaultLayer(layer: unknown): { enable(): void };
  addDefaultControls(): void;
  addLayer(layer: { enable(): void }): void;
  setCenterZoom(center: unknown, zoom: number, animate?: boolean): void;
}

interface SMapConstructor {
  new (container: HTMLElement, center: unknown, zoom?: number): SMapInstance;
  DEF_BASE: unknown;
  Coords: {
    fromWGS84(lng: number, lat: number): unknown;
  };
  Layer: {
    Marker: new () => {
      enable(): void;
      addMarker(marker: unknown): void;
      removeAll(): void;
    };
  };
  Marker: {
    Feature: {
      Tooltip: unknown;
    };
    new (coords: unknown, id: string): {
      decorate(feature: unknown, content: string): void;
    };
  };
}

declare const SMap: SMapConstructor;
declare const JAK: {
  gel: (element: string | HTMLElement) => HTMLElement;
};
