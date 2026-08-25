/**
 * CardMark public types.
 *
 * The pipeline is: markdown string → Block[] (parsed model) → SatoriElement (layout)
 * → svg string → png Buffer.
 */

export interface SizePreset {
  /** Short machine name, e.g. "x" or "og" */
  id: string
  /** Human label, e.g. "X / Twitter Post" */
  label: string
  width: number
  height: number
}

export type Padding = 'sm' | 'md' | 'lg' | 'xl'

/** A theme is a plain data object — easy to author, easy to share. */
export interface Theme {
  id: string
  label: string
  /** Dark or light overall appearance, used to pick sensible defaults */
  appearance: 'dark' | 'light'
  /** Page background (behind the card) */
  background: string
  /** Card surface color */
  cardBackground: string
  /** Decorative gradient blobs behind the card; use 'none' to disable */
  glowA?: string
  glowB?: string
  text: string
  textSecondary: string
  accent: string
  border: string
  codeBackground: string
  codeText: string
  quoteBar: string
  linkColor: string
  /** Which built-in font set this theme uses: default | serif | latin | editorial */
  fontSet?: 'default' | 'serif' | 'latin' | 'editorial'
  /** Font family for headings/body; must resolve on the host system or via loadFont */
  fontFamily?: string
  /** Font family for inline/block code */
  monoFamily?: string
}

/** Partial theme: unspecified colors inherit from the Midnight base theme. */
export type ThemeInput = Partial<Theme> & Pick<Theme, 'id' | 'label' | 'appearance'>

export interface RenderOptions {
  theme?: Theme | ThemeInput | string
  size?: SizePreset | string
  padding?: Padding
  /** Watermark handle shown in the card footer, e.g. "@yourhandle" */
  byline?: string
  /** Hide the CardMark footer entirely (not recommended, but your call) */
  hideFooter?: boolean
  /** Extra fonts to embed so satori can measure text. See loadFont(). */
  fonts?: LoadedFont[]
  /** Built-in font set id (see FONT_SETS); overrides the theme's fontSet.
   *  Ignored when `fonts` is provided explicitly. */
  fontSet?: string
}

export interface LoadedFont {
  name: string
  weight: 400 | 500 | 600 | 700
  data: ArrayBuffer | Uint8Array
}

export interface RenderResult {
  /** Complete standalone SVG markup */
  svg: string
  width: number
  height: number
  themeId: string
  sizeId: string
}

/** Parsed markdown block types (internal model, exported for advanced use) */
export type Block =
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'paragraph'; inlines: Inline[] }
  | { kind: 'quote'; lines: string[] }
  | { kind: 'list'; ordered: boolean; items: Inline[][] }
  | { kind: 'code'; lang: string; code: string }
  | { kind: 'divider' }
  | { kind: 'table'; header: string[]; rows: string[][] }

export type Inline =
  | { t: 'text'; v: string }
  | { t: 'strong'; v: string }
  | { t: 'em'; v: string }
  | { t: 'code'; v: string }
  | { t: 'del'; v: string }
  | { t: 'link'; v: string; href: string }

export interface SplitResult {
  cards: string[]
}
