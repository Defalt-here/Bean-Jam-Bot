import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Enable HTTPS if certificates exist (optional, for geolocation in non-localhost scenarios)
    // https: fs.existsSync('./cert.pem') && fs.existsSync('./key.pem') 
    //   ? {
    //       key: fs.readFileSync('./key.pem'),
    //       cert: fs.readFileSync('./cert.pem'),
    //     }
    //   : undefined,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
