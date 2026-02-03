// Jest setup file for polyfills
const { TextEncoder, TextDecoder } = require('text-encoding');

// Add TextEncoder and TextDecoder to global scope
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock environment config for Jest
jest.mock('./src/config/env', () => ({
  ENV: {
    HERE_MAPS_API_KEY: process.env.VITE_HERE_MAPS_API_KEY,
    MAPY_COM_API_KEY: process.env.VITE_MAPY_COM_API_KEY,
    PFS_API_KEY: process.env.VITE_PFS_API_KEY,
    PFS_API_URL: process.env.VITE_PFS_API_URL,
  },
}));
