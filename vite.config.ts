import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js',
    },
  },
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  optimizeDeps: {
    exclude: ['vitest'],
  },
  build: {
    // 单位是 KB
    chunkSizeWarningLimit: 800,
    outDir: 'dist',
    assetsDir: './assert',
    lib: {
      //entry: './src/main.ts',
      entry: 'index.d.ts',
      name: 'Ti',
      fileName: (format) => `ti-walnut.${format}.js`,
    },
    sourcemap: true,
    rollupOptions: {
      external: ['vue'],
      output: {
        // 提供全局变量到外部依赖
        globals: {
          vue: 'Vue',
        },
        // 配置样式输出
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.scss')) {
            return 'style.scss';
          }
          return assetInfo.name;
        },
      },
    },
  },
});
