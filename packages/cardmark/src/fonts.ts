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
  'noto-sans-jp': {
    id: 'noto-sans-jp',
    name: 'Noto Sans JP',
    weight: 400,
    url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5/files/noto-sans-jp-japanese-400-normal.woff',
    role: 'sans',
    coverage: 'cjk',
  },
  'noto-sans-jp-bold': {
    id: 'noto-sans-jp-bold',
    name: 'Noto Sans JP',
    weight: 700,
    url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5/files/noto-sans-jp-japanese-700-normal.woff',
    role: 'sans',
    coverage: 'cjk',
  },
  'noto-serif-jp': {
    id: 'noto-serif-jp',
    name: 'Noto Serif JP',
    weight: 400,
    url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-serif-jp@5/files/noto-serif-jp-japanese-400-normal.woff',
    role: 'serif',
    coverage: 'cjk',
  },
  'noto-sans-kr': {
    id: 'noto-sans-kr',
    name: 'Noto Sans KR',
    weight: 400,
    url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-kr@5/files/noto-sans-kr-korean-400-normal.woff',
    role: 'sans',
    coverage: 'cjk',
  },
  'noto-sans-kr-bold': {
    id: 'noto-sans-kr-bold',
    name: 'Noto Sans KR',
    weight: 700,
    url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-kr@5/files/noto-sans-kr-korean-700-normal.woff',
    role: 'sans',
    coverage: 'cjk',
  },
  'noto-serif-kr': {
    id: 'noto-serif-kr',
    name: 'Noto Serif KR',
    weight: 400,
    url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-serif-kr@5/files/noto-serif-kr-korean-400-normal.woff',
    role: 'serif',
    coverage: 'cjk',
  },
}

/** Bundles commonly combined presets. */
export const FONT_SETS: Record<string, string[]> = {
  default: ['noto-sans-sc', 'noto-sans-sc-bold', 'jetbrains-mono'],
  serif: ['noto-serif-sc', 'noto-serif-sc-bold', 'jetbrains-mono'],
  latin: ['inter', 'georgia', 'jetbrains-mono'],
  editorial: ['times-new-roman', 'noto-serif-sc', 'jetbrains-mono'],
  japanese: ['noto-sans-jp', 'noto-sans-jp-bold', 'jetbrains-mono'],
  'japanese-serif': ['noto-serif-jp', 'noto-serif-jp', 'jetbrains-mono'],
  korean: ['noto-sans-kr', 'noto-sans-kr-bold', 'jetbrains-mono'],
  'korean-serif': ['noto-serif-kr', 'noto-serif-kr', 'jetbrains-mono'],
  // broadest CJK coverage: SC first for simplified glyphs, JP fills kana, KR fills hangul
  'cjk-all': [
    'noto-sans-sc',
    'noto-sans-sc-bold',
    'noto-sans-jp',
    'noto-sans-kr',
    'jetbrains-mono',
  ],
}

/** Human-readable font set descriptions for UIs and --list-font-sets. */
export const FONT_SET_LABELS: Record<string, string> = {
  default: 'Sans (SC) — Noto Sans SC + JetBrains Mono',
  serif: 'Serif (SC) — Noto Serif SC + JetBrains Mono',
  latin: 'Latin — Inter + Georgia + JetBrains Mono',
  editorial: 'Editorial — Times New Roman + Noto Serif SC + JetBrains Mono',
  japanese: '日本語 — Noto Sans JP + JetBrains Mono',
  'japanese-serif': '日本語 Serif — Noto Serif JP + JetBrains Mono',
  korean: '한국어 — Noto Sans KR + JetBrains Mono',
  'korean-serif': '한국어 Serif — Noto Serif KR + JetBrains Mono',
  'cjk-all': 'CJK 全覆盖 — SC + JP + KR + JetBrains Mono',
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

/** Public alias for tests and tooling: the Twemoji file code for one glyph. */
export const twemojiCodeFor = twemojiCode

export function isEmojiSegment(language: string, segment: string): boolean {
  if (language !== 'emoji') return false
  // Regional-indicator pairs (flags) are not Extended_Pictographic, so test
  // for them explicitly alongside pictographics, ZWJ and variation selectors.
  return /\p{Extended_Pictographic}|\p{RI}|\u200D|\uFE0F/u.test(segment)
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
