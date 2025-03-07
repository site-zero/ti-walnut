我的项目是 Vue3+vite+ts, 是一个库项目， 它的 package.json 文件如下：

```
{
  "name": "@site0/ti-walnut",
  "version": "1.3.2",
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
    "highlight.js": "^11.11.1",
    "json5": "^2.2.3",
    "lodash": "^4.17.21",
    "markdown-it": "^14.1.0",
    "markdown-it-front-matter": "^0.2.4",
    "sprintf-js": "^1.1.3",
    "vue": "^3.5.12",
    "vue-router": "^4.4.5"
  },
  "devDependencies": {
    "@types/chance": "^1.1.6",
    "@types/markdown-it": "^14.1.2",
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

整个项目依赖关系:

```
PS D:\workspace\git\github\site-zero\ti-walnut> yarn list
yarn list v1.22.22
├─ @babel/helper-string-parser@7.25.9
├─ @babel/helper-validator-identifier@7.25.9
├─ @babel/parser@7.26.9
│  └─ @babel/types@^7.26.9
├─ @babel/types@7.26.9
│  ├─ @babel/helper-string-parser@^7.25.9
│  └─ @babel/helper-validator-identifier@^7.25.9
├─ @cspotcode/source-map-support@0.8.1
│  └─ @jridgewell/trace-mapping@0.3.9
├─ @esbuild/aix-ppc64@0.21.5
├─ @esbuild/android-arm@0.21.5
├─ @esbuild/android-arm64@0.21.5
├─ @esbuild/android-x64@0.21.5
├─ @esbuild/darwin-arm64@0.21.5
├─ @esbuild/darwin-x64@0.21.5
├─ @esbuild/freebsd-arm64@0.21.5
├─ @esbuild/freebsd-x64@0.21.5
├─ @esbuild/linux-arm@0.21.5
├─ @esbuild/linux-arm64@0.21.5
├─ @esbuild/linux-ia32@0.21.5
├─ @esbuild/linux-loong64@0.21.5
├─ @esbuild/linux-mips64el@0.21.5
├─ @esbuild/linux-ppc64@0.21.5
├─ @esbuild/linux-riscv64@0.21.5
├─ @esbuild/linux-s390x@0.21.5
├─ @esbuild/linux-x64@0.21.5
├─ @esbuild/netbsd-x64@0.21.5
├─ @esbuild/openbsd-x64@0.21.5
├─ @esbuild/sunos-x64@0.21.5
├─ @esbuild/win32-arm64@0.21.5
├─ @esbuild/win32-ia32@0.21.5
├─ @esbuild/win32-x64@0.21.5
├─ @jridgewell/resolve-uri@3.1.2
├─ @jridgewell/sourcemap-codec@1.5.0
├─ @jridgewell/trace-mapping@0.3.9
│  ├─ @jridgewell/resolve-uri@^3.0.3
│  └─ @jridgewell/sourcemap-codec@^1.4.10
├─ @parcel/watcher-android-arm64@2.5.1
├─ @parcel/watcher-darwin-arm64@2.5.1
├─ @parcel/watcher-darwin-x64@2.5.1
├─ @parcel/watcher-freebsd-x64@2.5.1
├─ @parcel/watcher-linux-arm-glibc@2.5.1
├─ @parcel/watcher-linux-arm-musl@2.5.1
├─ @parcel/watcher-linux-arm64-glibc@2.5.1
├─ @parcel/watcher-linux-arm64-musl@2.5.1
├─ @parcel/watcher-linux-x64-glibc@2.5.1
├─ @parcel/watcher-linux-x64-musl@2.5.1
├─ @parcel/watcher-win32-arm64@2.5.1
├─ @parcel/watcher-win32-ia32@2.5.1
├─ @parcel/watcher-win32-x64@2.5.1
├─ @parcel/watcher@2.5.1
│  ├─ @parcel/watcher-android-arm64@2.5.1
│  ├─ @parcel/watcher-darwin-arm64@2.5.1
│  ├─ @parcel/watcher-darwin-x64@2.5.1
│  ├─ @parcel/watcher-freebsd-x64@2.5.1
│  ├─ @parcel/watcher-linux-arm-glibc@2.5.1
│  ├─ @parcel/watcher-linux-arm-musl@2.5.1
│  ├─ @parcel/watcher-linux-arm64-glibc@2.5.1
│  ├─ @parcel/watcher-linux-arm64-musl@2.5.1
│  ├─ @parcel/watcher-linux-x64-glibc@2.5.1
│  ├─ @parcel/watcher-linux-x64-musl@2.5.1
│  ├─ @parcel/watcher-win32-arm64@2.5.1
│  ├─ @parcel/watcher-win32-ia32@2.5.1
│  ├─ @parcel/watcher-win32-x64@2.5.1
│  ├─ detect-libc@^1.0.3
│  ├─ is-glob@^4.0.3
│  ├─ micromatch@^4.0.5
│  └─ node-addon-api@^7.0.0
├─ @rollup/rollup-android-arm-eabi@4.34.9
├─ @rollup/rollup-android-arm64@4.34.9
├─ @rollup/rollup-darwin-arm64@4.34.9
├─ @rollup/rollup-darwin-x64@4.34.9
├─ @rollup/rollup-freebsd-arm64@4.34.9
├─ @rollup/rollup-freebsd-x64@4.34.9
├─ @rollup/rollup-linux-arm-gnueabihf@4.34.9
├─ @rollup/rollup-linux-arm-musleabihf@4.34.9
├─ @rollup/rollup-linux-arm64-gnu@4.34.9
├─ @rollup/rollup-linux-arm64-musl@4.34.9
├─ @rollup/rollup-linux-loongarch64-gnu@4.34.9
├─ @rollup/rollup-linux-powerpc64le-gnu@4.34.9
├─ @rollup/rollup-linux-riscv64-gnu@4.34.9
├─ @rollup/rollup-linux-s390x-gnu@4.34.9
├─ @rollup/rollup-linux-x64-gnu@4.34.9
├─ @rollup/rollup-linux-x64-musl@4.34.9
├─ @rollup/rollup-win32-arm64-msvc@4.34.9
├─ @rollup/rollup-win32-ia32-msvc@4.34.9
├─ @rollup/rollup-win32-x64-msvc@4.34.9
├─ @tsconfig/node10@1.0.11
├─ @tsconfig/node12@1.0.11
├─ @tsconfig/node14@1.0.3
├─ @tsconfig/node16@1.0.4
├─ @types/chance@1.1.6
├─ @types/crypto-js@4.2.2
├─ @types/estree@1.0.6
├─ @types/linkify-it@5.0.0
├─ @types/lodash@4.17.16
├─ @types/markdown-it@14.1.2
│  ├─ @types/linkify-it@^5
│  └─ @types/mdurl@^2
├─ @types/mdurl@2.0.0
├─ @types/node@22.13.9
│  └─ undici-types@~6.20.0
├─ @types/sprintf-js@1.1.4
├─ @vitejs/plugin-vue@5.2.1
├─ @vitest/expect@2.1.9
│  ├─ @vitest/spy@2.1.9
│  ├─ @vitest/utils@2.1.9
│  ├─ chai@^5.1.2
│  └─ tinyrainbow@^1.2.0
├─ @vitest/mocker@2.1.9
│  ├─ @vitest/spy@2.1.9
│  ├─ estree-walker@^3.0.3
│  ├─ estree-walker@3.0.3
│  │  └─ @types/estree@^1.0.0
│  └─ magic-string@^0.30.12
├─ @vitest/pretty-format@2.1.9
│  └─ tinyrainbow@^1.2.0
├─ @vitest/runner@2.1.9
│  ├─ @vitest/utils@2.1.9
│  └─ pathe@^1.1.2
├─ @vitest/snapshot@2.1.9
│  ├─ @vitest/pretty-format@2.1.9
│  ├─ magic-string@^0.30.12
│  └─ pathe@^1.1.2
├─ @vitest/spy@2.1.9
│  └─ tinyspy@^3.0.2
├─ @vitest/utils@2.1.9
│  ├─ @vitest/pretty-format@2.1.9
│  ├─ loupe@^3.1.2
│  └─ tinyrainbow@^1.2.0
├─ @volar/language-core@2.4.12
│  └─ @volar/source-map@2.4.12
├─ @volar/source-map@2.4.12
├─ @volar/typescript@2.4.12
│  ├─ @volar/language-core@2.4.12
│  ├─ path-browserify@^1.0.1
│  └─ vscode-uri@^3.0.8
├─ @vue/compiler-core@3.5.13
│  ├─ @babel/parser@^7.25.3
│  ├─ @vue/shared@3.5.13
│  ├─ entities@^4.5.0
│  ├─ estree-walker@^2.0.2
│  └─ source-map-js@^1.2.0
├─ @vue/compiler-dom@3.5.13
│  ├─ @vue/compiler-core@3.5.13
│  └─ @vue/shared@3.5.13
├─ @vue/compiler-sfc@3.5.13
│  ├─ @babel/parser@^7.25.3
│  ├─ @vue/compiler-core@3.5.13
│  ├─ @vue/compiler-dom@3.5.13
│  ├─ @vue/compiler-ssr@3.5.13
│  ├─ @vue/shared@3.5.13
│  ├─ estree-walker@^2.0.2
│  ├─ magic-string@^0.30.11
│  ├─ postcss@^8.4.48
│  └─ source-map-js@^1.2.0
├─ @vue/compiler-ssr@3.5.13
│  ├─ @vue/compiler-dom@3.5.13
│  └─ @vue/shared@3.5.13
├─ @vue/compiler-vue2@2.7.16
│  ├─ de-indent@^1.0.2
│  └─ he@^1.2.0
├─ @vue/devtools-api@6.6.4
├─ @vue/language-core@2.2.8
│  ├─ @volar/language-core@~2.4.11
│  ├─ @vue/compiler-dom@^3.5.0
│  ├─ @vue/compiler-vue2@^2.7.16
│  ├─ @vue/shared@^3.5.0
│  ├─ alien-signals@^1.0.3
│  ├─ minimatch@^9.0.3
│  ├─ muggle-string@^0.4.1
│  └─ path-browserify@^1.0.1
├─ @vue/reactivity@3.5.13
│  └─ @vue/shared@3.5.13
├─ @vue/runtime-core@3.5.13
│  ├─ @vue/reactivity@3.5.13
│  └─ @vue/shared@3.5.13
├─ @vue/runtime-dom@3.5.13
│  ├─ @vue/reactivity@3.5.13
│  ├─ @vue/runtime-core@3.5.13
│  ├─ @vue/shared@3.5.13
│  └─ csstype@^3.1.3
├─ @vue/server-renderer@3.5.13
│  ├─ @vue/compiler-ssr@3.5.13
│  └─ @vue/shared@3.5.13
├─ @vue/shared@3.5.13
├─ acorn-walk@8.3.4
│  └─ acorn@^8.11.0
├─ acorn@8.14.1
├─ alien-signals@1.0.4
├─ arg@4.1.3
├─ argparse@2.0.1
├─ assertion-error@2.0.1
├─ balanced-match@1.0.2
├─ brace-expansion@2.0.1
│  └─ balanced-match@^1.0.0
├─ braces@3.0.3
│  └─ fill-range@^7.1.1
├─ cac@6.7.14
├─ chai@5.2.0
│  ├─ assertion-error@^2.0.1
│  ├─ check-error@^2.1.1
│  ├─ deep-eql@^5.0.1
│  ├─ loupe@^3.1.0
│  └─ pathval@^2.0.0
├─ chance@1.1.12
├─ check-error@2.1.1
├─ chokidar@4.0.3
│  └─ readdirp@^4.0.1
├─ create-require@1.1.1
├─ crypto-js@4.2.0
├─ csstype@3.1.3
├─ de-indent@1.0.2
├─ debug@4.4.0
│  └─ ms@^2.1.3
├─ deep-eql@5.0.2
├─ detect-libc@1.0.3
├─ diff@4.0.2
├─ entities@4.5.0
├─ es-module-lexer@1.6.0
├─ esbuild@0.21.5
│  ├─ @esbuild/aix-ppc64@0.21.5
│  ├─ @esbuild/android-arm@0.21.5
│  ├─ @esbuild/android-arm64@0.21.5
│  ├─ @esbuild/android-x64@0.21.5
│  ├─ @esbuild/darwin-arm64@0.21.5
│  ├─ @esbuild/darwin-x64@0.21.5
│  ├─ @esbuild/freebsd-arm64@0.21.5
│  ├─ @esbuild/freebsd-x64@0.21.5
│  ├─ @esbuild/linux-arm@0.21.5
│  ├─ @esbuild/linux-arm64@0.21.5
│  ├─ @esbuild/linux-ia32@0.21.5
│  ├─ @esbuild/linux-loong64@0.21.5
│  ├─ @esbuild/linux-mips64el@0.21.5
│  ├─ @esbuild/linux-ppc64@0.21.5
│  ├─ @esbuild/linux-riscv64@0.21.5
│  ├─ @esbuild/linux-s390x@0.21.5
│  ├─ @esbuild/linux-x64@0.21.5
│  ├─ @esbuild/netbsd-x64@0.21.5
│  ├─ @esbuild/openbsd-x64@0.21.5
│  ├─ @esbuild/sunos-x64@0.21.5
│  ├─ @esbuild/win32-arm64@0.21.5
│  ├─ @esbuild/win32-ia32@0.21.5
│  └─ @esbuild/win32-x64@0.21.5
├─ estree-walker@2.0.2
├─ expect-type@1.2.0
├─ fill-range@7.1.1
│  └─ to-regex-range@^5.0.1
├─ fsevents@2.3.3
├─ he@1.2.0
├─ highlight.js@11.11.1
├─ immutable@5.0.3
├─ is-extglob@2.1.1
├─ is-glob@4.0.3
│  └─ is-extglob@^2.1.1
├─ is-number@7.0.0
├─ json5@2.2.3
├─ linkify-it@5.0.0
│  └─ uc.micro@^2.0.0
├─ lodash@4.17.21
├─ loupe@3.1.3
├─ magic-string@0.30.17
│  └─ @jridgewell/sourcemap-codec@^1.5.0
├─ make-error@1.3.6
├─ markdown-it-front-matter@0.2.4
├─ markdown-it@14.1.0
│  ├─ argparse@^2.0.1
│  ├─ entities@^4.4.0
│  ├─ linkify-it@^5.0.0
│  ├─ mdurl@^2.0.0
│  ├─ punycode.js@^2.3.1
│  └─ uc.micro@^2.1.0
├─ mdurl@2.0.0
├─ micromatch@4.0.8
│  ├─ braces@^3.0.3
│  └─ picomatch@^2.3.1
├─ minimatch@9.0.5
│  └─ brace-expansion@^2.0.1
├─ ms@2.1.3
├─ muggle-string@0.4.1
├─ nanoid@3.3.9
├─ node-addon-api@7.1.1
├─ path-browserify@1.0.1
├─ pathe@1.1.2
├─ pathval@2.0.0
├─ picocolors@1.1.1
├─ picomatch@2.3.1
├─ postcss@8.5.3
│  ├─ nanoid@^3.3.8
│  ├─ picocolors@^1.1.1
│  └─ source-map-js@^1.2.1
├─ punycode.js@2.3.1
├─ readdirp@4.1.2
├─ rollup@4.34.9
│  ├─ @rollup/rollup-android-arm-eabi@4.34.9
│  ├─ @rollup/rollup-android-arm64@4.34.9
│  ├─ @rollup/rollup-darwin-arm64@4.34.9
│  ├─ @rollup/rollup-darwin-x64@4.34.9
│  ├─ @rollup/rollup-freebsd-arm64@4.34.9
│  ├─ @rollup/rollup-freebsd-x64@4.34.9
│  ├─ @rollup/rollup-linux-arm-gnueabihf@4.34.9
│  ├─ @rollup/rollup-linux-arm-musleabihf@4.34.9
│  ├─ @rollup/rollup-linux-arm64-gnu@4.34.9
│  ├─ @rollup/rollup-linux-arm64-musl@4.34.9
│  ├─ @rollup/rollup-linux-loongarch64-gnu@4.34.9
│  ├─ @rollup/rollup-linux-powerpc64le-gnu@4.34.9
│  ├─ @rollup/rollup-linux-riscv64-gnu@4.34.9
│  ├─ @rollup/rollup-linux-s390x-gnu@4.34.9
│  ├─ @rollup/rollup-linux-x64-gnu@4.34.9
│  ├─ @rollup/rollup-linux-x64-musl@4.34.9
│  ├─ @rollup/rollup-win32-arm64-msvc@4.34.9
│  ├─ @rollup/rollup-win32-ia32-msvc@4.34.9
│  ├─ @rollup/rollup-win32-x64-msvc@4.34.9
│  ├─ @types/estree@1.0.6
│  └─ fsevents@~2.3.2
├─ sass@1.85.1
│  ├─ @parcel/watcher@^2.4.1
│  ├─ chokidar@^4.0.0
│  ├─ immutable@^5.0.2
│  └─ source-map-js@>=0.6.2 <2.0.0
├─ siginfo@2.0.0
├─ source-map-js@1.2.1
├─ sprintf-js@1.1.3
├─ stackback@0.0.2
├─ std-env@3.8.1
├─ tinybench@2.9.0
├─ tinyexec@0.3.2
├─ tinypool@1.0.2
├─ tinyrainbow@1.2.0
├─ tinyspy@3.0.2
├─ to-regex-range@5.0.1
│  └─ is-number@^7.0.0
├─ ts-node@10.9.2
│  ├─ @cspotcode/source-map-support@^0.8.0
│  ├─ @tsconfig/node10@^1.0.7
│  ├─ @tsconfig/node12@^1.0.7
│  ├─ @tsconfig/node14@^1.0.0
│  ├─ @tsconfig/node16@^1.0.2
│  ├─ acorn-walk@^8.1.1
│  ├─ acorn@^8.4.1
│  ├─ arg@^4.1.0
│  ├─ create-require@^1.1.0
│  ├─ diff@^4.0.1
│  ├─ make-error@^1.1.1
│  ├─ v8-compile-cache-lib@^3.0.1
│  └─ yn@3.1.1
├─ typescript@5.8.2
├─ uc.micro@2.1.0
├─ undici-types@6.20.0
├─ v8-compile-cache-lib@3.0.1
├─ vite-node@2.1.9
│  ├─ cac@^6.7.14
│  ├─ debug@^4.3.7
│  ├─ es-module-lexer@^1.5.4
│  ├─ pathe@^1.1.2
│  └─ vite@^5.0.0
├─ vite@5.4.14
│  ├─ esbuild@^0.21.3
│  ├─ fsevents@~2.3.3
│  ├─ postcss@^8.4.43
│  └─ rollup@^4.20.0
├─ vitest@2.1.9
│  ├─ @vitest/expect@2.1.9
│  ├─ @vitest/mocker@2.1.9
│  ├─ @vitest/pretty-format@^2.1.9
│  ├─ @vitest/runner@2.1.9
│  ├─ @vitest/snapshot@2.1.9
│  ├─ @vitest/spy@2.1.9
│  ├─ @vitest/utils@2.1.9
│  ├─ chai@^5.1.2
│  ├─ debug@^4.3.7
│  ├─ expect-type@^1.1.0
│  ├─ magic-string@^0.30.12
│  ├─ pathe@^1.1.2
│  ├─ std-env@^3.8.0
│  ├─ tinybench@^2.9.0
│  ├─ tinyexec@^0.3.1
│  ├─ tinypool@^1.0.1
│  ├─ tinyrainbow@^1.2.0
│  ├─ vite-node@2.1.9
│  ├─ vite@^5.0.0
│  └─ why-is-node-running@^2.3.0
├─ vscode-uri@3.1.0
├─ vue-router@4.5.0
│  └─ @vue/devtools-api@^6.6.4
├─ vue-tsc@2.2.8
│  ├─ @volar/typescript@~2.4.11
│  └─ @vue/language-core@2.2.8
├─ vue@3.5.13
│  ├─ @vue/compiler-dom@3.5.13
│  ├─ @vue/compiler-sfc@3.5.13
│  ├─ @vue/runtime-dom@3.5.13
│  ├─ @vue/server-renderer@3.5.13
│  └─ @vue/shared@3.5.13
├─ why-is-node-running@2.3.0
│  ├─ siginfo@^2.0.0
│  └─ stackback@0.0.2
└─ yn@3.1.1
Done in 0.12s.
```

我的一个组件使用了 markdown-it，这个组件由下面的文件构成

```
目录: D:\workspace\git\github\site-zero\ti-walnut\src\lib\view\obj\obj-preview


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----          2025/3/7     17:17            757 use-markdown.ts
-a----          2025/3/7     17:01           3284 use-obj-preview.ts
-a----          2025/3/1     23:25            462 wn-obj-preview-index.ts
-a----          2025/3/7     16:47            771 wn-obj-preview-types.ts
-a----          2025/3/6     22:58           3453 wn-obj-preview.scss
-a----          2025/3/7     17:01           5588 WnObjPreview.vue
```

其中，我在 use-markdown.ts 中引入了 markdown-it，代码如下：

```ts
import MarkdownIt from 'markdown-it';
import { WnObjPreivewInfo } from './wn-obj-preview-types';

const md = new MarkdownIt();

export function renderMarkdown(
  info: WnObjPreivewInfo,
  content: string
): string {
  if (!content || info.type != 'markdown') return '';
  return md.render(content);
}
```



执行编译的时候报错：

```
$ vue-tsc && vite build
node_modules/@types/markdown-it/dist/index.cjs.d.ts:981:23 - error TS2709: Cannot use namespace 'LinkifyIt' as a type.

981     readonly linkify: LinkifyIt;
                          ~~~~~~~~~


Found 1 error in node_modules/@types/markdown-it/dist/index.cjs.d.ts:981

error Command failed with exit code 2.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
```