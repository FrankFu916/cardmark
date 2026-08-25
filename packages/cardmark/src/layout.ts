import type { Block, Inline, Theme } from './types.js'

/**
 * Layout: turn parsed blocks into a satori element tree.
 * Satori is a strict subset of flexbox — everything here uses inline styles
 * that satori understands (no CSS shorthands except a few it supports).
 */

interface Ctx {
  theme: Theme
}

export function renderBlocks(blocks: Block[], ctx: Ctx): any {
  return blocks.map((b) => renderBlock(b, ctx))
}

function renderBlock(b: Block, ctx: Ctx): any {
  switch (b.kind) {
    case 'heading':
      return heading(b.level, b.text, ctx)
    case 'paragraph':
      return paragraph(b.inlines, ctx)
    case 'quote':
      return quote(b.lines, ctx)
    case 'list':
      return list(b.ordered, b.items, ctx)
    case 'code':
      return codeBlock(b.lang, b.code, ctx)
    case 'divider':
      return divider(ctx)
    case 'table':
      return table(b.header, b.rows, ctx)
  }
}

const scaleFor = (level: number): number => [0, 64, 46, 34, 27][Math.min(level, 4)] ?? 24

const bodyFont = (ctx: Ctx): string => ctx.theme.fontFamily ?? '"Noto Sans SC", Inter, sans-serif'
const monoFont = (ctx: Ctx): string => ctx.theme.monoFamily ?? '"JetBrains Mono", Menlo, monospace'

function heading(level: number, text: string, ctx: Ctx): any {
  const size = Math.round(scaleFor(level) * 1.15)
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        marginBottom: level === 1 ? 26 : 18,
        marginTop: level === 1 ? 6 : 14,
      },
      children: {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            fontSize: size,
            fontWeight: 700,
            color: ctx.theme.text,
            lineHeight: 1.25,
            fontFamily: bodyFont(ctx),
          },
          children: text,
        },
      },
    },
  }
}

function paragraph(inlines: Inline[], ctx: Ctx): any {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        fontSize: 26,
        lineHeight: 1.7,
        color: ctx.theme.text,
        marginBottom: 20,
        fontFamily: bodyFont(ctx),
      },
      children: renderInlines(inlines, ctx),
    },
  }
}

function quote(lines: string[], ctx: Ctx): any {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        borderLeftWidth: 5,
        borderLeftColor: ctx.theme.quoteBar,
        paddingLeft: 22,
        marginBottom: 22,
      },
      children: {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            flexDirection: 'column',
            fontSize: 25,
            lineHeight: 1.65,
            color: ctx.theme.textSecondary,
            fontStyle: 'italic',
            fontFamily: bodyFont(ctx),
          },
          children: lines.map((l) => ({
            type: 'div',
            props: { style: { display: 'flex' }, children: l || ' ' },
          })),
        },
      },
    },
  }
}

function list(ordered: boolean, items: Inline[][], ctx: Ctx): any {
  return {
    type: 'div',
    props: {
      style: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 22 },
      children: items.map((item, i) => ({
        type: 'div',
        props: {
          style: { display: 'flex', alignItems: 'flex-start' },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  width: 36,
                  minWidth: 36,
                  color: ctx.theme.accent,
                  fontWeight: 700,
                  fontSize: 25,
                },
                children: ordered ? `${i + 1}.` : '•',
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flex: 1,
                  fontSize: 26,
                  lineHeight: 1.6,
                  color: ctx.theme.text,
                  fontFamily: bodyFont(ctx),
                },
                children: renderInlines(item, ctx),
              },
            },
          ],
        },
      })),
    },
  }
}

function codeBlock(lang: string, code: string, ctx: Ctx): any {
  // Keep line structure; escape handled by satori (it XML-escapes strings)
  const lines = code.split('\n')
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: ctx.theme.codeBackground,
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: ctx.theme.border,
      },
      children: [
        lang
          ? {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  fontSize: 17,
                  color: ctx.theme.textSecondary,
                  marginBottom: 10,
                  letterSpacing: 1,
                },
                children: lang.toUpperCase(),
              },
            }
          : null,
        ...lines.map((line) => ({
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontFamily: monoFont(ctx),
              fontSize: 21,
              lineHeight: 1.55,
              color: ctx.theme.codeText,
            },
            children: line.length > 0 ? line : ' ',
          },
        })),
      ].filter(Boolean),
    },
  }
}

function divider(ctx: Ctx): any {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        height: 2,
        backgroundColor: ctx.theme.border,
        marginVertical: 26,
      },
    },
  }
}

function table(header: string[], rows: string[][], ctx: Ctx): any {
  const cellStyle = {
    display: 'flex',
    padding: '10px 16px',
    fontSize: 22,
    lineHeight: 1.5,
    flex: 1,
  }
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        borderWidth: 1,
        borderColor: ctx.theme.border,
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 24,
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              backgroundColor: ctx.theme.codeBackground,
              fontWeight: 700,
              color: ctx.theme.text,
            },
            children: header.map((h) => ({
              type: 'div',
              props: { style: cellStyle, children: h || ' ' },
            })),
          },
        },
        ...rows.map((row, ri) => ({
          type: 'div',
          props: {
            style: {
              display: 'flex',
              borderTopWidth: 1,
              borderTopColor: ctx.theme.border,
              color: ri % 2 === 1 ? ctx.theme.textSecondary : ctx.theme.text,
            },
            children: row.map((c) => ({
              type: 'div',
              props: { style: cellStyle, children: c || ' ' },
            })),
          },
        })),
      ],
    },
  }
}

function renderInlines(inlines: Inline[], ctx: Ctx): any[] {
  if (!inlines || inlines.length === 0) return [' ']
  return inlines.map((inl) => inlineNode(inl, ctx))
}

function inlineNode(inl: Inline, ctx: Ctx): any {
  switch (inl.t) {
    case 'text':
      return inl.v
    case 'strong':
      return {
        type: 'span',
        props: { style: { fontWeight: 700, color: ctx.theme.text }, children: inl.v },
      }
    case 'em':
      return { type: 'span', props: { style: { fontStyle: 'italic' }, children: inl.v } }
    case 'del':
      return {
        type: 'span',
        props: { style: { textDecoration: 'line-through' }, children: inl.v },
      }
    case 'code':
      return {
        type: 'span',
        props: {
          style: {
            fontFamily: monoFont(ctx),
            backgroundColor: ctx.theme.codeBackground,
            color: ctx.theme.codeText,
            paddingHorizontal: 8,
            borderRadius: 6,
          },
          children: inl.v,
        },
      }
    case 'link':
      return {
        type: 'span',
        props: { style: { color: ctx.theme.linkColor }, children: `${inl.v}` },
      }
  }
}
