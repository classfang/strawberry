import vue from '@vitejs/plugin-vue'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    publicDir: 'resources',
    build: {
      rollupOptions: {
        output: {
          format: 'es'
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      vue({
        template: {
          compilerOptions: {
            // webview是electron原生组件，在此声明避免vue警告
            isCustomElement: (tag) => tag === 'webview'
          }
        }
      }),
      AutoImport({
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        resolvers: [ElementPlusResolver()]
      })
    ],
    css: {
      // css预处理器
      preprocessorOptions: {
        scss: {
          // 定义全局的scss变量
          additionalData: `@use '@renderer/assets/css/scss-vars.scss' as *;`,
          api: 'modern-compiler'
        }
      }
    }
  }
})
