import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Inject env vars into a global constant for runtime code
    define: {
      __ENV__: {
        VITE_PFS_API_ORDERS_URL: env.VITE_PFS_API_ORDERS_URL,
        VITE_PFS_API_KEY: env.VITE_PFS_API_KEY,
      },
    },
  };
})
