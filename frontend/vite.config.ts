import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  define: {
    global: 'globalThis',
  },
  build: {
    // Performance optimizations
    target: 'esnext',
    minify: 'esbuild', // Using esbuild for faster builds
    // terserOptions: {
    //   compress: {
    //     drop_console: true,
    //     drop_debugger: true,
    //   },
    // },
    // Code splitting for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for external libraries
          vendor: ['react', 'react-dom'],
          // Ethers chunk for blockchain functionality
          ethers: ['ethers'],
          // UI chunk for UI components
          ui: ['lucide-react', 'recharts'],
        },
      },
    },
    // Asset optimization
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 3005,
    // Performance optimizations for dev server
    hmr: {
      overlay: false,
    },
  },
  // PWA and performance headers
  preview: {
    headers: {
      'Cache-Control': 'public, max-age=31536000',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    },
  },
})
