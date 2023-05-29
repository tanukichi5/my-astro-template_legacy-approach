import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import tailwind from "@astrojs/tailwind";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { splitVendorChunkPlugin } from 'vite'

// https://astro.build/config

export default defineConfig({
  plugins: [splitVendorChunkPlugin()],
  // base: '/docs',
  integrations: [react(), tailwind()],
  vite: {
    resolve: {
      alias: {
        //scssのエイリアス
        '@/': `${path.resolve(__dirname, 'src')}/`
      }
    },
    build: {
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name]/bundle.js',
          // assetFileNames: (assetInfo) => {
          //   // console.log(assetInfo)
          //   // if (assetInfo.name === '.css') {
          //   //   return 'assets/style.css'
          //   // }
          //   return `assets/asset-${hoge++}.[ext]`
          // },
          assetFileNames: 'assets/style.[ext]',
          // chunkFileNames: 'chunks/chunk.js',
        }
      },
      commonjsOptions: {

      }
    }
  }
});