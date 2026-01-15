// Minimal HERE JS API global typings just for compile-time friendliness
// We keep it very loose to avoid tight coupling.
declare namespace H {
  namespace service {
    class Platform {
      constructor(options: { apikey: string });
      createDefaultLayers(): any;
    }
  }
  namespace mapevents {
    class MapEvents {
      constructor(map: any);
    }
    class Behavior {
      constructor(events: MapEvents);
    }
  }
  namespace ui {
    namespace UI {
      function createDefault(map: any, defaultLayers: any): any;
    }
  }
  namespace map {
    class Group {
      addObject(obj: any): void;
      getBoundingBox(): any;
    }
    class Marker {
      constructor(coords: { lat: number; lng: number });
    }
    class Polyline {
      constructor(geom: any, options?: any);
    }
  }
  namespace geo {
    class LineString {
      pushLatLngAlt(lat: number, lng: number, alt: number): void;
    }
  }
}

declare var H: typeof H;
