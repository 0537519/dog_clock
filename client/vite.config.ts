import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react';
import path from 'path';
import mkcert from 'vite-plugin-mkcert';
import vue from '@vitejs/plugin-vue'


export default defineConfig({
  base:'./',
  server:{
    port:3000
  },
  plugins: [react(),mkcert(),vue()],
  resolve: {
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  }
})
