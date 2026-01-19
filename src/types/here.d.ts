// Minimal HERE JS API global typings just for compile-time friendliness
// We keep it very loose to avoid tight coupling.
declare namespace H {
  namespace service {
    class Platform {
      constructor(options: { apikey: string });
      createDefaultLayers(): unknown;
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
    class Marker {
      constructor(coords: { lat: number; lng: number });
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
