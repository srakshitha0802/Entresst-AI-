import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
// Removed Replit-specific plugins to use standard Vite configuration

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // Ensure proper source maps for debugging
    sourcemap: true,
    // Optimize for all devices
    target: 'esnext',
    minify: 'esbuild',
  },
  server: {
    host: "0.0.0.0", // Allow connections from all network interfaces
    allowedHosts: true, // Allow all hostnames (useful for mobile testing)
    port: 5174,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        // Add timeout for slow connections
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err);
          });
        },
      },
    },
    // Optimize for mobile
    hmr: {
      clientPort: 5174,
      port: 5174,
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'wouter'],
  },
});
