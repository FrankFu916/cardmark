/**
 * Browser-safe entry (`cardmark/browser`). No node:* APIs, no native modules —
 * bundles cleanly with Vite/webpack/esbuild. SVG rendering is fully supported;
 * rasterization is left to a <canvas> in your app (see web/src/App.tsx).
 */
export { renderCard, renderPng, buildTemplate, type FontData } from './render-core.js'
export {
  FONT_PRESETS,
  FONT_SETS,
  loadFontPreset,
  loadFontSet,
  emojiAssetLoader,
} from './fonts.js'
export { parseMarkdown, splitCards } from './parse.js'
export { THEMES, SIZES, resolveTheme, resolveSize, SIZE_ALIASES } from './themes.js'
export type {
  Block,
  Inline,
  Theme,
  ThemeInput,
  SizePreset,
  RenderOptions,
  RenderResult,
} from './types.js'
