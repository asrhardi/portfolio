import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    optimizeDeps: { entries: ['index.html'] },
    server: {
      host: '127.0.0.1',
      port: 5174,
      strictPort: true,
      watch: { ignored: ['**/cms/**'] },
      fs: { deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/cms/**'] },
      proxy: {
        '/cms': {
          target: env.CMS_URL || 'http://127.0.0.1:1337',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/cms/, ''),
        },
      },
    },
  };
});
