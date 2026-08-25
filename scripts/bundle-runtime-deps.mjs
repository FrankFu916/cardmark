/**
 * Post-build step: vendor satori's prebuilt ESM bundle into dist/vendor and
 * rewrite dist imports, so the published package ships a single self-contained
 * copy of satori with zero transitive runtime dependencies (resvg stays a
 * regular dep since it is a native module).
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkgDir = join(root, 'packages', 'cardmark')
const distRender = join(pkgDir, 'dist', 'render.js')

if (!existsSync(distRender)) {
  console.error('bundle-runtime-deps: run tsc build first')
  process.exit(1)
}

// Locate satori's prebuilt ESM bundle (hoisted root install or workspace-local)
const candidates = [
  join(root, 'node_modules/satori/dist/index.js'),
  join(pkgDir, 'node_modules/satori/dist/index.js'),
]
const satoriBundle = candidates.find((p) => existsSync(p))
if (!satoriBundle) {
  console.error('bundle-runtime-deps: satori not found')
  process.exit(1)
}

const vendorDir = join(pkgDir, 'dist', 'vendor')
mkdirSync(vendorDir, { recursive: true })
copyFileSync(satoriBundle, join(vendorDir, 'satori.js'))
copyFileSync(join(dirname(satoriBundle), 'index.js.LEGAL.txt'), join(vendorDir, 'satori.LEGAL.txt'))

let src = readFileSync(distRender, 'utf8')
src = src.replace(/from ['"]satori['"]/g, `from './vendor/satori.js'`)
writeFileSync(distRender, src)
console.log('bundle-runtime-deps: vendored satori ->', join('dist', 'vendor', 'satori.js'))
