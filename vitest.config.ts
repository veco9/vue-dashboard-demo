import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'happy-dom',
      include: ['tests/unit/**/*.{test,spec}.ts'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      setupFiles: ['tests/unit/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        include: ['src/utils/**', 'src/composables/**', 'src/components/**'],
        exclude: ['src/mock/**', 'src/plugins/**'],
      },
    },
  }),
)
