我的项目是 `vite+vue3+ts` ：

它的 package.json

```
{
  "name": "@site0/ti-walnut",
  "version": "1.3.1",
  "description": "Walnut GUI base on Tijs",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/site-zero/ti-walnut.git"
  },
  "author": "Peter Zhang <zozohtnt@gmail.com>",
  "license": "BSD-3-Clause",
  "private": false,
  "keywords": [
    "ti",
    "tijs",
    "ti-js",
    "walnut",
    "wn"
  ],
  "type": "module",
  "main": "./dist/ti-walnut.umd.cjs",
  "module": "./dist/ti-walnut.js",
  "files": [
    "index.d.ts",
    "dist",
    "assets"
  ],
  "exports": {
    ".": {
      "import": "./index.d.ts",
      "require": "./dist/ti-walnut.umd.js",
      "types": "./index.d.ts"
    }
  },
  "scripts": {
    "build": "vue-tsc && vite build",
    "test": "vitest --silent=false"
  },
  "dependencies": {
    "@types/crypto-js": "^4.1.2",
    "@types/lodash": "^4.17.12",
    "@types/node": "^22.7.9",
    "@types/sprintf-js": "^1.1.3",
    "chance": "^1.1.11",
    "crypto-js": "^4.2.0",
    "json5": "^2.2.3",
    "lodash": "^4.17.21",
    "sprintf-js": "^1.1.3",
    "vue": "^3.5.12",
    "vue-router": "^4.4.5"
  },
  "devDependencies": {
    "@types/chance": "^1.1.6",
    "@vitejs/plugin-vue": "^5.1.4",
    "sass": "^1.80.3",
    "ts-node": "^10.9.2",
    "typescript": "^5.6.3",
    "vite": "^5.4.10",
    "vitest": "^2.1.3",
    "vue-tsc": "^2.1.6"
  }
}
```

它的 vite.config.ts

```
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
```

它的 vite-env.d

```
/// <reference types="vite/client" />
declare module '*.vue' {
  import { App, DefineComponent, defineProps } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
```

它的 tsconfig.json

```
{
  "compilerOptions": {
    "sourceMap": true,
    "declaration": true, // 生成相应的 '.d.ts' 文件
    "outDir": "./dist",
    "declarationMap": true, // 生成 source map 文件对应的声明文件
    "useDefineForClassFields": true,
    "module": "ESNext",
    "target": "ESNext",
    "lib": ["ES2021", "DOM", "DOM.Iterable"],
    "skipLibCheck": false,
    "rootDir": "./src",

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "allowJs": false,

    /* Linting */
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

它的 tsconfig.node.json

```
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

我访问页面，浏览器控制台出现这样的错误

```
[Vue warn]: Component provided template option but runtime compilation is not supported in this build of Vue. Configure your bundler to alias "vue" to "vue/dist/vue.esm-bundler.js".
  at <Anonymous className="cover-parent" tabsAlign="left" tabsAt="bottom"  ... >
  at <AsyncComponentWrapper className="cover-parent" tabsAlign="left" tabsAt="bottom"  ... >
  at <WnObjViewer meta=undefined content="" keepTab="local: Wn-Hub-DIR-Detail-Tabs-orjkfqgbr0h3gqt66aeppcj8al"  ... >
  at <TiBlock key=0 ref_for=true name="detail"  ... >
  at <TiLayoutGrid className="fit-parent as-card with-shadow r-s" keepSizes="local: Wn-Hub-DIR-MainSizes-${HomeId}" gridStyle= {backgroundColor: 'var(--ti-color-body)', padding: 'var(--ti-gap-m)'}  ... >
  at <AsyncComponentWrapper className="fit-parent as-card with-shadow r-s" keepSizes="local: Wn-Hub-DIR-MainSizes-${HomeId}" gridStyle= {backgroundColor: 'var(--ti-color-body)', padding: 'var(--ti-gap-m)'}  ... >
  at <WnHubArena hubPath="settings/_test" hashId=undefined onVnodeUnmounted=fn<onVnodeUnmounted>  ... >
  at <RouterView name="arena" key="arena" >
  at <TiLayoutGrid className="fit-parent as-card" blockOverflowMode="cover" keepSizes= {keepAt: 'WnHub-APP-Main-Layout-Sizes'}  ... >
  at <AsyncComponentWrapper className="fit-parent as-card" blockOverflowMode="cover" keepSizes= {keepAt: 'WnHub-APP-Main-Layout-Sizes'}  ... >
  at <WnHubApp >
```

如果你能很确定原因，请直接告诉我，如果你还需要获取更多的信息，请把你还要对这个项目想要了解的信息列给我，我会逐条回答你
