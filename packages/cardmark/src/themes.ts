import type { SizePreset, Theme, ThemeInput } from './types.js'

/**
 * Built-in size presets. All values chosen from the platforms' current
 * recommended upload dimensions.
 */
export const SIZES: Record<string, SizePreset> = {
  x: { id: 'x', label: 'X / Twitter Post', width: 1200, height: 1350 },
  og: { id: 'og', label: 'Open Graph / Link Card', width: 1200, height: 630 },
  square: { id: 'square', label: 'Square', width: 1080, height: 1080 },
  xiaohongshu: { id: 'xiaohongshu', label: 'Xiaohongshu 3:4', width: 1080, height: 1440 },
  instagram: { id: 'instagram', label: 'Instagram Portrait', width: 1080, height: 1350 },
  story: { id: 'story', label: 'Story / Reels 9:16', width: 1080, height: 1920 },
}

export const SIZE_ALIASES: Record<string, string> = {
  twitter: 'x',
  tweet: 'x',
  post: 'x',
  opengraph: 'og',
  link: 'og',
  '1:1': 'square',
  '3:4': 'xiaohongshu',
  red: 'xiaohongshu',
  ig: 'instagram',
  '4:5': 'instagram',
  '9:16': 'story',
  portrait: 'story',
}

export function resolveSize(size?: SizePreset | string): SizePreset {
  if (size && typeof size === 'object') return size
  const key = (size ?? 'x').toLowerCase()
  const id = SIZES[key] ? key : (SIZE_ALIASES[key] ?? null)
  if (id && SIZES[id]) return SIZES[id]
  // Allow explicit "WxH" like "1200x675"
  const m = /^(\d{2,5})\s*[x×]\s*(\d{2,5})$/.exec(key)
  if (m) {
    return {
      id: `${m[1]}x${m[2]}`,
      label: `Custom ${m[1]}×${m[2]}`,
      width: Number(m[1]),
      height: Number(m[2]),
    }
  }
  throw new Error(
    `Unknown size "${size}". Available: ${Object.keys(SIZES).join(', ')}, or "1200x675".`,
  )
}

/**
 * Built-in themes. Plain data — fork one and pass it as an object to make
 * your own.
 */
export const THEMES: Record<string, Theme> = {
  aurora: {
    id: 'aurora',
    label: 'Aurora',
    appearance: 'dark',
    background: '#0b1020',
    cardBackground: 'rgba(255,255,255,0.04)',
    glowA: '#7c3aed66',
    glowB: '#06b6d466',
    text: '#f4f7ff',
    textSecondary: '#9aa7c7',
    accent: '#8b5cf6',
    border: 'rgba(255,255,255,0.12)',
    codeBackground: 'rgba(255,255,255,0.08)',
    codeText: '#c4b5fd',
    quoteBar: '#8b5cf6',
    linkColor: '#a78bfa',
  },
  midnight: {
    id: 'midnight',
    label: 'Midnight',
    appearance: 'dark',
    background: '#09090b',
    cardBackground: 'rgba(255,255,255,0.03)',
    glowA: '#2563eb55',
    glowB: '#0ea5e944',
    text: '#fafafa',
    textSecondary: '#a1a1aa',
    accent: '#38bdf8',
    border: 'rgba(255,255,255,0.10)',
    codeBackground: 'rgba(255,255,255,0.07)',
    codeText: '#93c5fd',
    quoteBar: '#38bdf8',
    linkColor: '#7dd3fc',
  },
  paper: {
    id: 'paper',
    label: 'Paper',
    appearance: 'light',
    background: '#e7e5e4',
    cardBackground: '#ffffff',
    glowA: 'none',
    glowB: 'none',
    text: '#1c1917',
    textSecondary: '#78716c',
    accent: '#dc2626',
    border: '#e7e5e4',
    codeBackground: '#f5f5f4',
    codeText: '#b91c1c',
    quoteBar: '#dc2626',
    linkColor: '#dc2626',
  },
  matcha: {
    id: 'matcha',
    label: 'Matcha',
    appearance: 'light',
    background: '#ecfccb',
    cardBackground: '#ffffff',
    glowA: '#a3e63533',
    glowB: '#34d39933',
    text: '#1a2e05',
    textSecondary: '#65a30d',
    accent: '#16a34a',
    border: '#d9f99d',
    codeBackground: '#f7fee7',
    codeText: '#15803d',
    quoteBar: '#16a34a',
    linkColor: '#15803d',
  },
  peach: {
    id: 'peach',
    label: 'Peach',
    appearance: 'light',
    background: '#fff1eb',
    cardBackground: '#ffffff',
    glowA: '#fb718533',
    glowB: '#fbbf2433',
    text: '#431407',
    textSecondary: '#c2410c',
    accent: '#ea580c',
    border: '#fed7aa',
    codeBackground: '#fff7ed',
    codeText: '#c2410c',
    quoteBar: '#ea580c',
    linkColor: '#ea580c',
  },
  noir: {
    id: 'noir',
    label: 'Noir',
    appearance: 'dark',
    background: '#000000',
    cardBackground: '#0a0a0a',
    glowA: 'none',
    glowB: 'none',
    text: '#fafafa',
    textSecondary: '#737373',
    accent: '#fafafa',
    border: '#262626',
    codeBackground: '#171717',
    codeText: '#e5e5e5',
    quoteBar: '#737373',
    linkColor: '#e5e5e5',
  },
  ocean: {
    id: 'ocean',
    label: 'Ocean',
    appearance: 'dark',
    background: '#082f49',
    cardBackground: 'rgba(255,255,255,0.05)',
    glowA: '#0ea5e966',
    glowB: '#22d3ee44',
    text: '#f0f9ff',
    textSecondary: '#7dd3fc',
    accent: '#22d3ee',
    border: 'rgba(255,255,255,0.12)',
    codeBackground: 'rgba(255,255,255,0.09)',
    codeText: '#67e8f9',
    quoteBar: '#22d3ee',
    linkColor: '#67e8f9',
  },
  blossom: {
    id: 'blossom',
    label: 'Blossom',
    appearance: 'light',
    background: '#fdf2f8',
    cardBackground: '#ffffff',
    glowA: '#f472b633',
    glowB: '#c084fc2e',
    text: '#500724',
    textSecondary: '#be185d',
    accent: '#db2777',
    border: '#fbcfe8',
    codeBackground: '#fdf2f8',
    codeText: '#be185d',
    quoteBar: '#db2777',
    linkColor: '#db2777',
    fontSet: 'serif',
  },
  classic: {
    id: 'classic',
    label: 'Classic',
    appearance: 'light',
    background: '#f5f0e6',
    cardBackground: '#fffdf8',
    glowA: 'none',
    glowB: 'none',
    text: '#292524',
    textSecondary: '#78716c',
    accent: '#9a3412',
    border: '#e7dbc5',
    codeBackground: '#f0e9d8',
    codeText: '#9a3412',
    quoteBar: '#b45309',
    linkColor: '#9a3412',
    fontSet: 'editorial',
  },
  ink: {
    id: 'ink',
    label: 'Ink',
    appearance: 'dark',
    background: '#1c1917',
    cardBackground: '#292524',
    glowA: '#fbbf2422',
    glowB: 'none',
    text: '#fafaf9',
    textSecondary: '#a8a29e',
    accent: '#fbbf24',
    border: '#44403c',
    codeBackground: '#1c1917',
    codeText: '#fcd34d',
    quoteBar: '#fbbf24',
    linkColor: '#fcd34d',
    fontSet: 'serif',
  },
}

export function resolveTheme(theme?: Theme | ThemeInput | string): Theme {
  if (theme && typeof theme === 'object') {
    // Merge over a base so partial custom themes work
    return { ...THEMES.midnight, ...theme }
  }
  const key = (theme ?? 'aurora').toLowerCase()
  const t = THEMES[key]
  if (!t) {
    throw new Error(`Unknown theme "${theme}". Available: ${Object.keys(THEMES).join(', ')}.`)
  }
  return t
}
