import type { LoadedFont } from './types.js'
import type { FontData } from './render.js'

/**
 * Built-in font presets, tuned for card typography.
 *
 * CJK and mono faces are fetched on first use and cached on disk (Node) or
 * in-memory (browser), so the npm package stays small. System faces
 * (Times New Roman, Georgia, Arial) are read from disk when available.
 *
 * All CDN URLs point at fontsource/jsdelivr — pinned majors, no tracking.
 */

export interface FontPreset {
  /** Preset id used on the CLI and in themes */
  id: string
  /** Font family name satori will register/resolve */
  name: string
  weight: 400 | 500 | 600 | 700
  /** Remote source (woff keeps CJK faces small) */
  url?: string
  /** System font paths to try first (Node only) */
  systemPaths?: string[]
  /** What this face is good for */
  role: 'sans' | 'serif' | 'mono' | 'display'
  /** Languages the face covers well */
  coverage: 'latin' | 'cjk' | 'both'
}

export const FONT_PRESETS: Record<string, FontPreset> = {
  'noto-sans-sc': {
    id: 'noto-sans-sc',
    name: 'Noto Sans SC',
    weight: 400,
    url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@5/files/noto-sans-sc-chinese-simplified-400-normal.woff',
    role: 'sans',
    coverage: 'cjk',
  },
  'noto-sans-sc-bold': {
    id: 'noto-sans-sc-bold',
    name: 'Noto Sans SC',
    weight: 700,
    url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@5/files/noto-sans-sc-chinese-simplified-700-normal.woff',
    role: 'sans',
    coverage: 'cjk',
  },
  'noto-serif-sc': {
    id: 'noto-serif-sc',
    name: 'Noto Serif SC',
    weight: 400,
    url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-serif-sc@5/files/noto-serif-sc-chinese-simplified-400-normal.woff',
    role: 'serif',
    coverage: 'cjk',
  },
  'noto-serif-sc-bold': {
    id: 'noto-serif-sc-bold',
    name: 'Noto Serif SC',
    weight: 700,
    url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-serif-sc@5/files/noto-serif-sc-chinese-simplified-700-normal.woff',
    role: 'serif',
    coverage: 'cjk',
  },
  'jetbrains-mono': {
    id: 'jetbrains-mono',
    name: 'JetBrains Mono',
    weight: 400,
    url: 'https://cdn.jsdelivr.net/npm/@fontsource/jetbrains-mono@5/files/jetbrains-mono-latin-400-normal.woff',
    role: 'mono',
    coverage: 'latin',
  },
  'jetbrains-mono-bold': {
    id: 'jetbrains-mono-bold',
    name: 'JetBrains Mono',
    weight: 700,
    url: 'https://cdn.jsdelivr.net/npm/@fontsource/jetbrains-mono@5/files/jetbrains-mono-latin-700-normal.woff',
    role: 'mono',
    coverage: 'latin',
  },
  'times-new-roman': {
    id: 'times-new-roman',
    name: 'Times New Roman',
    weight: 400,
    systemPaths: [
      '/System/Library/Fonts/Supplemental/Times New Roman.ttf',
      '/usr/share/fonts/truetype/msttcorefonts/Times_New_Roman.ttf',
      '/usr/share/fonts/TTF/times.ttf',
    ],
    url: 'https://cdn.jsdelivr.net/npm/@fontsource/pt-serif@5/files/pt-serif-latin-400-normal.woff',
    role: 'serif',
    coverage: 'latin',
  },
  georgia: {
    id: 'georgia',
    name: 'Georgia',
    weight: 400,
    systemPaths: [
      '/System/Library/Fonts/Supplemental/Georgia.ttf',
      '/System/Library/Fonts/Supplemental/Georgia Bold.ttf',
      '/usr/share/fonts/truetype/msttcorefonts/Georgia.ttf',
    ],
    url: 'https://cdn.jsdelivr.net/npm/@fontsource/lora@5/files/lora-latin-400-normal.woff',
    role: 'serif',
    coverage: 'latin',
  },
  inter: {
    id: 'inter',
    name: 'Inter',
    weight: 400,
    url: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5/files/inter-latin-400-normal.woff',
    role: 'sans',
    coverage: 'latin',
  },
}

/** Bundles commonly combined presets. */
export const FONT_SETS: Record<string, string[]> = {
  default: ['noto-sans-sc', 'noto-sans-sc-bold', 'jetbrains-mono'],
  serif: ['noto-serif-sc', 'noto-serif-sc-bold', 'jetbrains-mono'],
  latin: ['inter', 'georgia', 'jetbrains-mono'],
  editorial: ['times-new-roman', 'noto-serif-sc', 'jetbrains-mono'],
}

const memoryCache = new Map<string, LoadedFont>()

async function fetchWithCache(url: string, cacheFile: string): Promise<Uint8Array> {
  // 1. memory
  const mem = memoryCache.get(url)
  if (mem) return mem.data as Uint8Array
  // 2. disk (Node)
  let fs: typeof import('node:fs/promises') | null = null
  try {
    fs = await import('node:fs/promises')
  } catch {
    /* browser */
  }
  if (fs) {
    try {
      const cached = await fs.readFile(cacheFile)
      const data = new Uint8Array(cached)
      memoryCache.set(url, { name: '', weight: 400, data })
      return data
    } catch {
      /* not cached yet */
    }
  }
  // 3. network
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download font: ${url} (${res.status})`)
  const buf = new Uint8Array(await res.arrayBuffer())
  memoryCache.set(url, { name: '', weight: 400, data: buf })
  if (fs) {
    try {
      await fs.mkdir(cacheFile.slice(0, cacheFile.lastIndexOf('/')), { recursive: true })
      await fs.writeFile(cacheFile, buf)
    } catch {
      /* cache write is best-effort */
    }
  }
  return buf
}

function cachePath(id: string): string {
  const env = (globalThis as any).process?.env ?? {}
  const dir =
    env.CARDMARK_CACHE_DIR ??
    ((globalThis as any).process?.platform === 'win32'
      ? undefined
      : `${env.HOME}/.cache/cardmark/fonts`)
  return `${dir ?? '/tmp/cardmark-fonts'}/${id}`
}

async function readSystemFile(path: string): Promise<Uint8Array | null> {
  try {
    const fs = await import('node:fs/promises')
    return new Uint8Array(await fs.readFile(path))
  } catch {
    return null
  }
}

/**
 * Resolve one preset by id: system file if present, otherwise download+cache.
 * In the browser, systemPaths are skipped and the CDN copy is fetched.
 */
export async function loadFontPreset(id: string): Promise<LoadedFont> {
  const preset = FONT_PRESETS[id]
  if (!preset) {
    throw new Error(
      `Unknown font preset "${id}". Available: ${Object.keys(FONT_PRESETS).join(', ')}.`,
    )
  }
  const mem = memoryCache.get(`preset:${id}`)
  if (mem) return { ...mem, name: preset.name, weight: preset.weight }

  if (preset.systemPaths) {
    for (const p of preset.systemPaths) {
      const data = await readSystemFile(p)
      if (data) {
        const font: LoadedFont = { name: preset.name, weight: preset.weight, data }
        memoryCache.set(`preset:${id}`, font)
        return font
      }
    }
  }
  if (preset.url) {
    const data = await fetchWithCache(preset.url, cachePath(`${id}.${preset.url.split('.').pop()}`))
    const font: LoadedFont = { name: preset.name, weight: preset.weight, data }
    memoryCache.set(`preset:${id}`, font)
    return font
  }
  throw new Error(`Font preset "${id}" has neither system paths nor a URL.`)
}

/** Load a named set of presets (see FONT_SETS). */
export async function loadFontSet(setId: keyof typeof FONT_SETS | string): Promise<LoadedFont[]> {
  const ids = FONT_SETS[setId]
  if (!ids) {
    throw new Error(`Unknown font set "${setId}". Available: ${Object.keys(FONT_SETS).join(', ')}.`)
  }
  return Promise.all(ids.map(loadFontPreset))
}

/**
 * Emoji support: satori has no emoji font, so emoji are rendered as Twemoji
 * images via its loadAdditionalAsset hook. We return inline data URIs so the
 * output SVG stays self-contained (PNG rasterization and canvas export both
 * keep the emoji). Fetched once per glyph, cached on disk like fonts.
 */
const TWEMOJI_BASE = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg'

function twemojiCode(segment: string): string {
  // Strip VS16 unless the glyph is nothing but VS16 — matches Twemoji file naming.
  const chars = [...segment]
  const hexes = chars
    .map((c) => c.codePointAt(0)!.toString(16))
    .filter((hex) => hex !== 'fe0f' || chars.length === 1)
  return hexes.join('-')
}

export function isEmojiSegment(language: string, segment: string): boolean {
  if (language !== 'emoji') return false
  return /\p{Extended_Pictographic}|\u200D|\uFE0F/u.test(segment)
}

const emojiMemory = new Map<string, string>()

async function fetchEmojiDataUri(segment: string, cacheFile: string): Promise<string> {
  const mem = emojiMemory.get(segment)
  if (mem) return mem
  let data: Uint8Array | null = null
  let fs: typeof import('node:fs/promises') | null = null
  try {
    fs = await import('node:fs/promises')
    data = new Uint8Array(await fs.readFile(cacheFile))
  } catch {
    /* not cached */
  }
  if (!data) {
    const res = await fetch(`${TWEMOJI_BASE}/${twemojiCode(segment)}.svg`)
    if (!res.ok) throw new Error(`Failed to download emoji: ${segment} (${res.status})`)
    data = new Uint8Array(await res.arrayBuffer())
    if (fs) {
      try {
        await fs.mkdir(cacheFile.slice(0, cacheFile.lastIndexOf('/')), { recursive: true })
        await fs.writeFile(cacheFile, data)
      } catch {
        /* cache write is best-effort */
      }
    }
  }
  const base64 = bytesToBase64(data)
  const uri = `data:image/svg+xml;base64,${base64}`
  emojiMemory.set(segment, uri)
  return uri
}

function bytesToBase64(bytes: Uint8Array): string {
  // Node: use Buffer. Browser: btoa over a binary string.
  const BufferCtor = (globalThis as any).Buffer
  if (BufferCtor) return BufferCtor.from(bytes).toString('base64')
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

/**
 * satori `loadAdditionalAsset` callback: pass as an option to renderCard to
 * render emoji as inline Twemoji images. Text segments are ignored.
 */
export async function emojiAssetLoader(language: string, segment: string): Promise<string> {
  if (!isEmojiSegment(language, segment)) return ''
  return fetchEmojiDataUri(segment, cachePath(`emoji-${twemojiCode(segment)}.svg`))
}

export type { FontData }
