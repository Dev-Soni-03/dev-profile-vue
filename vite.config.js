import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // IMPORTANT: use your repo name here
  base: '/dev-profile-vue/',
})
