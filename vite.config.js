import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/dev-profile-vue/', // EXACT repo name with leading & trailing slash
})
