import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      outDir: 'lib',
      exclude: [
        'src/__tests__',
        'src/**/*.test.ts',
        'src/vanilla.ts',
        'src/main.ts',
        'src/App.vue',
        'src/demo/**/*'
      ],
      entryRoot: 'src',
      copyDtsFiles: false
    })
  ],
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
    extensions: ['.ts', '.vue']
  },
  build: {
    lib: {
      entry: {
        'context-menu': resolve(__dirname, 'src/index.ts'),
        'context-menu-vue': resolve(__dirname, 'src/vue.ts'),
        'styles': resolve(__dirname, 'src/scss/styles.scss')
      },
      name: 'ContextMenu',
      fileName: (_, entryName) => `${entryName}.js`,
      formats: ['es']
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        },
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.names?.[0]) return ''

          const name = assetInfo.names[0].split('/').pop()

          if (name && name.endsWith('.css')) {
            return `styles.css`
          }

          return '[name][extname]'
        }
      }
    },
    outDir: 'lib',
    emptyOutDir: true,
    copyPublicDir: false,
    target: 'es2023',
    minify: 'esbuild',
    sourcemap: true,
  },
  server: {
    port: 3000
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api']
      }
    }
  }
})
