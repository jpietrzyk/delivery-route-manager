/**
 * Environment configuration
 * This module provides access to environment variables in a way that works
 * in both Vite (browser) and Jest (Node.js) environments.
 */

// Vite transforms import.meta.env at build time
// Jest will use process.env instead
export const ENV = {
  HERE_MAPS_API_KEY: import.meta.env.VITE_HERE_MAPS_API_KEY as string | undefined,
  MAPY_COM_API_KEY: import.meta.env.VITE_MAPY_COM_API_KEY as string | undefined,
  PFS_API_KEY: import.meta.env.VITE_PFS_API_KEY as string | undefined,
  PFS_API_URL: import.meta.env.VITE_PFS_API_URL as string | undefined,
};
