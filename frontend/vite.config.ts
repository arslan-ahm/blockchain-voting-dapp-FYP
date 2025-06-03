import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), NodeGlobalsPolyfillPlugin({
    buffer: true,
  }),],
  define: {
    'process.env': {},
    global: "globalThis",
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      buffer: "buffer",
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react', '@gsap/react', 'gsap'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        {
          name: 'buffer-polyfill',
          setup(build) {
            build.onResolve({ filter: /^buffer$/ }, () => ({
              path: require.resolve('buffer'),
              namespace: 'file',
            }));
          },
        },
      ],
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  // server: {
  //   host: '0.0.0.0',
  //   port: 5173,
  //   strictPort: true,
  //   hmr: {
  //     protocol: 'ws',
  //     host: 'localhost',
  //     port: 5173,
  //   },
  // },
})
