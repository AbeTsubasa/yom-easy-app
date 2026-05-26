import { defineConfig } from 'vite';

export default defineConfig({
  base: '/yom-easy-app/',
  build: {
    target: 'es2022',
    sourcemap: true,
  },
  server: {
    port: 5173,
    host: true,
  },
});
