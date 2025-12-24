// Type declarations for global objects in Jest environment
declare global {
  interface Global {
    TextEncoder: typeof TextEncoder;
    TextDecoder: typeof TextDecoder;
    ResizeObserver: typeof ResizeObserver;
  }
}

export {};
