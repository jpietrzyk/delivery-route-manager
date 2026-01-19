// Minimal HERE JS API global typings just for compile-time friendliness
// We keep it very loose to avoid tight coupling.
declare namespace H {
  class Map {
    constructor(element: HTMLElement, layer: unknown, options?: unknown);
    addObject(obj: unknown): void;
    removeObject(obj: unknown): void;
    getViewPort(): { resize(): void };
    getViewModel(): { setLookAtData(data: unknown, animate?: boolean): void };
    dispose(): void;
  }
  namespace service {
    class Platform {
      constructor(options: { apikey: string });
      createDefaultLayers(): {
        vector: {
          normal: {
            map: unknown;
            traffic: unknown;
            trafficincidents: unknown;
          };
          satellite: {
            map: unknown;
            traffic: unknown;
            trafficincidents: unknown;
          };
        };
        raster: {
          normal: {
            map: unknown;
            traffic: unknown;
            trafficincidents: unknown;
          };
          satellite: {
            map: unknown;
            traffic: unknown;
            trafficincidents: unknown;
          };
        };
      };
    }
  }
  namespace mapevents {
    class MapEvents {
      constructor(map: unknown);
    }
    class Behavior {
      constructor(events: MapEvents);
    }
  }
  namespace ui {
    namespace UI {
      function createDefault(map: unknown, defaultLayers: unknown): unknown;
    }
  }
  namespace map {
    class Group {
      addObject(obj: unknown): void;
      getBoundingBox(): unknown;
    }
    class Icon {
      constructor(svg: string);
    }
    class Marker {
      constructor(coords: { lat: number; lng: number }, options?: { icon?: unknown });
      addEventListener(event: string, handler: () => void): void;
      setIcon(icon: unknown): void;
    }
    class Polyline {
      constructor(geom: unknown, options?: unknown);
    }
  }
  namespace geo {
    class LineString {
      pushLatLngAlt(lat: number, lng: number, alt: number): void;
    }
  }
}

declare global {
  interface Window {
    H: typeof H;
  }
}

declare const H: typeof H;
