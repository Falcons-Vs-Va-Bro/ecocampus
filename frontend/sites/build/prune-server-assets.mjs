import { readdir, rm } from 'node:fs/promises'
import { extname, join } from 'node:path'

const serverAssetsDirectory = new URL('../dist/server/ssr/assets/', import.meta.url)
const browserOnlyExtensions = new Set(['.css', '.jpg', '.jpeg', '.png', '.webp'])

for (const entry of await readdir(serverAssetsDirectory, { withFileTypes: true })) {
  if (entry.isFile() && browserOnlyExtensions.has(extname(entry.name).toLowerCase())) {
    await rm(join(serverAssetsDirectory.pathname, entry.name))
  }
}
