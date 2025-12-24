declare module 'text-encoding' {
  export class TextEncoder {
    constructor(label?: string, options?: { fatal?: boolean, ignoreBOM?: boolean });
    encode(input?: string): Uint8Array;
    encoding: string;
  }

  export class TextDecoder {
    constructor(label?: string, options?: { fatal?: boolean, ignoreBOM?: boolean });
    decode(input?: Uint8Array): string;
    encoding: string;
    fatal: boolean;
    ignoreBOM: boolean;
  }
}
