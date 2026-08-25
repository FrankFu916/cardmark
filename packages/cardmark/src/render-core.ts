import satori from 'satori'
import { parseMarkdown } from './parse.js'
import { renderBlocks } from './layout.js'
import { resolveSize, resolveTheme } from './themes.js'
import { loadFontSet, emojiAssetLoader } from './fonts.js'
import type { Padding, RenderOptions, RenderResult } from './types.js'

/**
 * Platform-neutral rendering engine shared by the Node build (`cardmark`) and
 * the browser build (`cardmark/browser`). No node:* imports, no native modules:
 * everything here must bundle cleanly for the web.
 */

export interface FontData {
  name: string
  weight: 400 | 500 | 600 | 700
  data: ArrayBuffer | Uint8Array
}

const PADDING: Record<Padding, number> = { sm: 48, md: 72, lg: 96, xl: 120 }

interface Element {
  type: string
  props: { style?: Record<string, unknown>; children?: any }
}

function footer(byline: string | undefined, hideFooter: boolean, theme: any): Element {
  if (hideFooter) return null as unknown as Element
  const left = byline ?? ''
  // brand mark is drawn as a dot, not a glyph — no font coverage needed
  const right = {
    type: 'div',
    props: {
      style: { display: 'flex', flexDirection: 'row', alignItems: 'center' },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: theme.accent,
              marginRight: 10,
            },
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', fontSize: 20, color: theme.textSecondary, opacity: 0.75 },
            children: 'cardmark',
          },
        },
      ],
    },
  }
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: left ? 'space-between' : 'flex-end',
        alignItems: 'center',
        marginTop: 'auto',
      },
      children: [
        left
          ? {
              type: 'div',
              props: {
                style: { display: 'flex', fontSize: 22, color: theme.textSecondary },
                children: left,
              },
            }
          : null,
        right,
      ].filter(Boolean),
    },
  }
}

export function buildTemplate(
  blocks: ReturnType<typeof parseMarkdown>,
  opts: Required<Pick<RenderOptions, 'byline' | 'hideFooter'>> & {
    theme: ReturnType<typeof resolveTheme>
    width: number
    height: number
    padding: number
    contentScale?: number
  },
): Element {
  const t = opts.theme
  const glowA =
    t.glowA && t.glowA !== 'none'
      ? {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: -140,
              right: -100,
              width: 460,
              height: 460,
              borderRadius: 9999,
              backgroundImage: `radial-gradient(circle, ${t.glowA}, rgba(0,0,0,0))`,
            },
          },
        }
      : null
  const glowB =
    t.glowB && t.glowB !== 'none'
      ? {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: -160,
              left: -120,
              width: 520,
              height: 520,
              borderRadius: 9999,
              backgroundImage: `radial-gradient(circle, ${t.glowB}, rgba(0,0,0,0))`,
            },
          },
        }
      : null

  const content = renderBlocks(blocks, { theme: t })

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundColor: t.background,
        padding: Math.round(opts.padding * 0.6),
      },
      children: {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            backgroundColor: t.cardBackground,
            borderWidth: 1,
            borderColor: t.border,
            borderRadius: 32,
            padding: opts.padding,
          },
          children: [
            glowA,
            glowB,
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  // auto-fit: shrink overflowing content instead of clipping
                  ...(opts.contentScale && opts.contentScale < 1
                    ? { transform: `scale(${opts.contentScale})`, transformOrigin: 'top left' }
                    : {}),
                },
                children: content,
              },
            },
            footer(opts.byline, opts.hideFooter, t),
          ].filter(Boolean),
        },
      },
    },
  }
}

/** SVG generation once fonts are settled. Shared by both entry points. */
export async function cardSvg(
  markdown: string,
  options: RenderOptions,
  fonts: FontData[],
): Promise<RenderResult> {
  const theme = resolveTheme(options.theme)
  const size = resolveSize(options.size)
  const padding = PADDING[options.padding ?? 'md']
  const blocks = parseMarkdown(markdown)

  const outer = Math.round(padding * 0.6)
  const contentWidth = size.width - 2 * (outer + padding)
  const footerReserve = options.hideFooter ? 0 : 64
  const availableHeight = size.height - 2 * (outer + padding) - footerReserve

  // Measure the content at its natural width; if it is taller than the card,
  // scale it down so short formats (og, story) never clip or overlap.
  let scale = 1
  try {
    const measured = await satori(
      {
        type: 'div',
        props: {
          style: { display: 'flex', flexDirection: 'column', width: contentWidth },
          children: renderBlocks(blocks, { theme }),
        },
      } as any,
      { width: contentWidth, fonts: fonts.map(toSatoriFont) },
    )
    const m = /height="(\d+(?:\.\d+)?)"/.exec(measured)
    const contentHeight = m ? Number(m[1]) : 0
    if (contentHeight > availableHeight) {
      scale = Math.max(0.4, availableHeight / contentHeight)
    }
  } catch {
    // measurement is best-effort; render unscaled on failure
  }

  const template = buildTemplate(blocks, {
    theme,
    byline: options.byline ?? '',
    hideFooter: options.hideFooter ?? false,
    width: size.width,
    height: size.height,
    padding,
    contentScale: scale,
  })

  const svg = await satori(template as any, {
    width: size.width,
    height: size.height,
    fonts: fonts.map(toSatoriFont),
    // emoji have no font here — inline them as Twemoji data-URI images so the
    // SVG stays self-contained (survives PNG rasterization and canvas export)
    loadAdditionalAsset: emojiAssetLoader,
  })

  return { svg, width: size.width, height: size.height, themeId: theme.id, sizeId: size.id }
}

function toSatoriFont(f: FontData) {
  return { name: f.name, data: f.data as ArrayBuffer, weight: f.weight, style: 'normal' as const }
}

/**
 * Render Markdown to SVG. Fonts come from options.fonts, or — when omitted —
 * from options.fontSet, then the theme's fontSet, downloaded from pinned CDNs
 * and cached (disk on Node, memory in the browser).
 */
export async function renderCard(
  markdown: string,
  options: RenderOptions = {},
): Promise<RenderResult> {
  const theme = resolveTheme(options.theme)
  let fonts = options.fonts ?? []
  if (fonts.length === 0) {
    const setId = options.fontSet ?? theme.fontSet ?? 'default'
    fonts = await loadFontSet(setId)
  }
  return cardSvg(markdown, options, fonts)
}

/** Not available outside Node — rasterize the SVG on a <canvas> in the browser. */
export async function renderPng(_markdown: string, _options?: RenderOptions): Promise<Uint8Array> {
  throw new Error(
    'renderPng uses a native rasterizer (Node only). In the browser, draw renderCard() SVG output onto a <canvas> — see the CardMark web app.',
  )
}
