import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file from current directory (for environment variables)
  loadEnv(mode, process.cwd(), '');
  
  return {
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
            blockchain: ['ethers'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-scroll-area'],
          },
        },
      },
      sourcemap: mode === 'development',
      minify: mode === 'production',
      target: 'es2015',
      chunkSizeWarningLimit: 1600,
    },
    server: {
      host: true,
      port: 3000,
      open: true,
    },
    preview: {
      port: 4173,
      host: true,
    },
  }
});
