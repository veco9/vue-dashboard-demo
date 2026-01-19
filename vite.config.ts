import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  base: '/vue-dashboard-demo/',
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('ag-charts')) return 'ag-charts'
          if (id.includes('primevue') || id.includes('@primevue')) return 'primevue'
          if (
            id.includes('node_modules/vue/') ||
            id.includes('node_modules/@vue/') ||
            id.includes('vue-i18n') ||
            id.includes('@vueuse') ||
            id.includes('grid-layout-plus') ||
            id.includes('dayjs')
          ) return 'vendor'
        },
      },
    },
  },
})
