// Jest setup file for polyfills
const { TextEncoder, TextDecoder } = require('text-encoding');

// Add TextEncoder and TextDecoder to global scope
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
