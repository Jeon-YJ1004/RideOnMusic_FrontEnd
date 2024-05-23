import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    server: {
      host: '0.0.0.0', // 모든 IP 주소에서 접속 가능하게 설정
      port: 5173 // 원하는 포트 번호로 설정 (기본값 3000)
    }, 
  }
})
