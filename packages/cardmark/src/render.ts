import { Resvg } from '@resvg/resvg-js'
import { cardSvg } from './render-core.js'
import { loadFontSet } from './fonts.js'
import { resolveTheme } from './themes.js'
import type { FontData } from './render-core.js'
import type { RenderOptions, RenderResult } from './types.js'

/**
 * Node-only entry: adds system-font discovery and PNG rasterization on top of
 * the platform-neutral engine in render-core.ts (also shipped as
 * `cardmark/browser`).
 */

export { buildTemplate } from './render-core.js'
export type { FontData } from './render-core.js'

/**
 * Load a font so satori can measure/embed it. Accepts a file path or raw bytes.
 * In Node you will usually want to load at least one font covering your text
 * (e.g. Noto Sans SC for Chinese). When no fonts are given, CardMark tries a
 * list of common system fonts.
 */
export async function loadFont(spec: string | FontData): Promise<FontData> {
  if (typeof spec !== 'string') return spec
  const { readFile } = await import('node:fs/promises')
  const data = await readFile(spec)
  const base = spec.split('/').pop() ?? 'font'
  const weightMatch = /-(\d{3})/.exec(base)
  const weight = (weightMatch ? Number(weightMatch[1]) : 400) as FontData['weight']
  const name =
    base
      .replace(/\.[a-z0-9]+$/i, '')
      .replace(/-(\d{3})$/, '')
      .replace(/[-_]/g, ' ') || 'Sans'
  return { name: normalizeFontName(name), weight, data }
}

function normalizeFontName(name: string): string {
  // "JetBrainsMono Regular" -> "JetBrains Mono"; keep it simple
  return name.replace(/\s+(Regular|Bold|Medium|SemiBold|Light)$/i, '').trim() || 'Sans'
}

/** Best-effort default fonts from the host system.
 *  Only .ttf/.otf singles are listed — satori's opentype parser rejects
 *  .ttc collections. Used when offline CDN downloads fail. */
export async function loadSystemFonts(): Promise<FontData[]> {
  const candidates = process.platform === 'darwin' ? macFonts() : linuxFonts()
  const { readFile } = await import('node:fs/promises')
  const loaded: FontData[] = []
  for (const [name, weight, path] of candidates) {
    try {
      const data = await readFile(path)
      loaded.push({ name, weight, data })
    } catch {
      // not present on this machine; skip
    }
  }
  return loaded
}

function macFonts(): Array<[string, FontData['weight'], string]> {
  return [
    // Names must be unique per face — satori indexes fonts by (name, weight),
    // and duplicate names break its missing-glyph fallback for CJK.
    ['Arial', 400, '/System/Library/Fonts/Supplemental/Arial.ttf'],
    ['Arial', 700, '/System/Library/Fonts/Supplemental/Arial Bold.ttf'],
    ['CardMark CJK', 400, '/System/Library/Fonts/Supplemental/Arial Unicode.ttf'],
    ['CardMark Mono', 400, '/System/Library/Fonts/Supplemental/Courier New.ttf'],
    ['DejaVu Sans', 400, '/opt/homebrew/share/fonts/dejavu/DejaVuSans.ttf'],
  ]
}

function linuxFonts(): Array<[string, FontData['weight'], string]> {
  return [
    ['DejaVu Sans', 400, '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'],
    ['DejaVu Sans', 700, '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'],
    ['DejaVu Sans Mono', 400, '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'],
    ['Noto Sans SC', 400, '/usr/share/fonts/truetype/noto/NotoSansSC-Regular.otf'],
    ['Noto Sans CJK SC', 400, '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'],
  ]
}

async function resolveFonts(options: RenderOptions): Promise<FontData[]> {
  const theme = resolveTheme(options.theme)
  let fonts = options.fonts ?? []
  if (fonts.length === 0) {
    try {
      fonts = await loadFontSet(theme.fontSet ?? 'default')
    } catch {
      // offline or CDN unreachable: fall back to host fonts
      fonts = await loadSystemFonts()
    }
  }
  if (fonts.length === 0) {
    throw new Error(
      'No fonts available. Pass options.fonts, or check network access for font downloads.',
    )
  }
  return fonts
}

export async function renderCard(
  markdown: string,
  options: RenderOptions = {},
): Promise<RenderResult> {
  return cardSvg(markdown, options, await resolveFonts(options))
}

export async function renderPng(markdown: string, options: RenderOptions = {}): Promise<Buffer> {
  const { svg } = await cardSvg(markdown, options, await resolveFonts(options))
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'original' },
  })
  return resvg.render().asPng()
}
