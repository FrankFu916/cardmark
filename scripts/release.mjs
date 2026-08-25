#!/usr/bin/env node
/**
 * Release helper used by .github/workflows/release.yml.
 *
 * - `--check`: verify the working tree is ready to publish (build artifacts exist).
 * - `--publish`: pack cardmark and publish it to npm with NODE_AUTH_TOKEN.
 *   Publishing failures are surfaced with the full npm output for debugging.
 */

import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkgDir = join(root, 'packages', 'cardmark')
const mode = process.argv[2] ?? '--check'

function run(cmd, opts = {}) {
  execSync(cmd, { cwd: pkgDir, stdio: 'inherit', ...opts })
}

if (mode === '--check') {
  for (const f of ['dist/index.js', 'dist/browser.js', 'dist/cli.js', 'dist/vendor/satori.js']) {
    if (!existsSync(join(pkgDir, f))) {
      console.error(`release check failed: missing ${f} — run the build first`)
      process.exit(1)
    }
  }
  console.log('release check ok: all dist artifacts present')
} else if (mode === '--publish') {
  if (!process.env.NODE_AUTH_TOKEN) {
    console.error('NODE_AUTH_TOKEN is not set; skipping publish')
    process.exit(1)
  }
  // npm's prepublishOnly runs build+test again; keep it for safety on CI
  run(`npm publish --access public --provenance`, {
    env: { ...process.env, NODE_AUTH_TOKEN: process.env.NODE_AUTH_TOKEN },
  })
} else {
  console.error(`unknown mode "${mode}" (expected --check or --publish)`)
  process.exit(2)
}
