// Type declarations for HERE Maps SDK
// This file provides TypeScript support for the HERE Maps SDK loaded from CDN

declare global {
  interface Window {
    H: HereMapsNamespace;
  }

  interface HereMapsNamespace {
    Map: {
      new (container: Element, baseLayer: unknown, options: MapOptions): HereMap;
      EngineType: {
        HARP: string;
      };
    };
    service: {
      Platform: new (options: PlatformOptions) => HerePlatform;
      RoutingService: new (options?: unknown, version?: number) => RoutingService;
    };
    mapevents: {
      MapEvents: new (map: HereMap) => unknown;
      Behavior: new (events: unknown) => unknown;
    };
    ui: {
      UI: {
        createDefault: (map: HereMap, layers: unknown) => unknown;
        getUi: (map: HereMap) => HereMapsUI;
      };
      InfoBubble: new (geometry: unknown, options: InfoBubbleOptions) => InfoBubble;
    };
    map: {
      Group: new () => MapGroup;
      Marker: new (options: MarkerOptions, behavior?: unknown) => MapMarker;
      Icon: new (src: string) => MapIcon;
      Polyline: new (geometry: unknown, options: PolylineOptions) => MapPolyline;
    };
    geo: {
      LineString: {
        new (): GeoLineString;
        fromFlexiblePolyline: (polyline: string) => GeoLineString;
      };
    };
  }

  interface HereMapsUI {
    addBubble: (bubble: InfoBubble) => void;
    removeBubble: (bubble: InfoBubble) => void;
  }

  interface HereMap {
    addObject: (obj: unknown) => void;
    removeObject: (obj: unknown) => void;
    getBaseLayer: () => unknown;
    getViewModel: () => ViewModel;
    getViewPort: () => ViewPort;
    dispose: () => void;
  }

  interface MapGroup {
    addObject: (obj: unknown) => void;
    getBoundingBox: () => unknown;
  }

  interface MapMarker {
    setData: (data: unknown) => void;
    getData: () => unknown;
    setIcon: (icon: MapIcon) => void;
    addEventListener: (event: string, handler: (event?: Event) => void) => void;
    getGeometry: () => unknown;
  }

  // HERE Maps Icon type - empty interface for extensibility
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface MapIcon {}

  interface MapPolyline {
    getType: () => string;
  }

  interface GeoLineString {
    pushPoint: (lat: number, lng: number) => void;
  }

  interface PolylinePoint {
    lat: number;
    lng: number;
  }

  interface PolylineOptions {
    style?: {
      lineWidth?: number;
      strokeColor?: string;
      lineTail?: string;
      lineHead?: string;
      lineDash?: number[];
    };
  }

  interface HerePlatform {
    createDefaultLayers: (options: unknown) => unknown;
    getRoutingService: (options?: unknown, version?: number) => RoutingService;
  }

  interface RoutingService {
    calculateRoute: (
      params: RoutingParams,
      successCallback: (result: RoutingResult) => void,
      errorCallback: (error: RoutingError) => void
    ) => void;
  }

  interface RoutingParams {
    transportMode: string;
    origin: string;
    destination: string;
    routingMode: string;
    return: string[];
  }

  interface RoutingResult {
    routes?: Array<{
      sections: Array<{
        polyline: string;
      }>;
    }>;
  }

  interface RoutingError {
    error?: {
      message: string;
      code: string;
    };
  }

  interface ViewModel {
    setLookAtData: (data: LookAtData) => void;
  }

  interface ViewPort {
    resize: () => void;
  }

  interface InfoBubble {
    content: string;
    [key: string]: unknown;
  }

  interface MapOptions {
    center: { lat: number; lng: number };
    zoom: number;
    engineType: string;
    pixelRatio: number;
  }

  interface PlatformOptions {
    apikey: string;
  }

  interface InfoBubbleOptions {
    content: string;
  }

  interface MarkerOptions {
    lat: number;
    lng: number;
  }

  interface LookAtData {
    bounds: unknown;
  }
}

// Re-export types for easier importing
export type {
  HereMap,
  MapGroup,
  MapMarker,
  MapIcon,
  MapPolyline,
  GeoLineString,
  PolylinePoint,
  PolylineOptions,
  HerePlatform,
  ViewModel,
  ViewPort,
  InfoBubble,
  MapOptions,
  PlatformOptions,
  InfoBubbleOptions,
  MarkerOptions,
  LookAtData,
  RoutingService,
  RoutingParams,
  RoutingResult,
  RoutingError,
  HereMapsUI,
};

// Also export the namespace interface itself
export type { HereMapsNamespace };
