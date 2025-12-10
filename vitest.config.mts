import path from 'node:path'
import { defineConfig, type ViteUserConfigExport } from 'vitest/config'

async function getConfig() {
  const tsConfigPaths = (await import('vite-tsconfig-paths')).default

  const config: ViteUserConfigExport = {
    plugins: [tsConfigPaths()],
    test: {
      globals: true,
      environment: 'node',
      include: ['src/**/*.{test,spec}.ts'],
      exclude: ['src/**/*.d.ts', 'node_modules', 'dist', 'coverage'],
      coverage: {
        reporter: ['text', 'json', 'html'],
      },
      setupFiles: ['vitest.setup.ts'],
    },
    resolve: {
      alias: [{ find: '@', replacement: path.resolve(__dirname, './src') }],
    },
    build: {
      target: 'esnext',
    },
  }

  return defineConfig(config)
}

export default getConfig()
