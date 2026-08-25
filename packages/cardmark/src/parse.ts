import { Marked } from 'marked'
import type { Block, Inline } from './types.js'

const marked = new Marked({ gfm: true, async: false })

/** Split markdown source into card-sized chunks on `---` or `===` fences. */
export function splitCards(source: string): string[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n')
  const cards: string[] = []
  let current: string[] = []
  let inFence = false

  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
      current.push(line)
      continue
    }
    if (!inFence && /^\s*(-{3,}={0,}|={3,})\s*$/.test(line)) {
      if (current.some((l) => l.trim().length > 0)) {
        cards.push(current.join('\n'))
      }
      current = []
      continue
    }
    current.push(line)
  }
  if (current.some((l) => l.trim().length > 0)) cards.push(current.join('\n'))
  return cards.length > 0 ? cards : [source]
}

function toInline(tokens: any[]): Inline[] {
  const out: Inline[] = []
  for (const tok of tokens ?? []) {
    switch (tok.type) {
      case 'text': {
        // text tokens may contain nested tokens when GFM is enabled
        if (tok.tokens && tok.tokens.length > 0) {
          out.push(...toInline(tok.tokens))
        } else if (tok.text) {
          out.push({ t: 'text', v: tok.text })
        }
        break
      }
      case 'strong':
        out.push({ t: 'strong', v: flatten(tok.tokens ?? []) })
        break
      case 'em':
        out.push({ t: 'em', v: flatten(tok.tokens ?? []) })
        break
      case 'del':
        out.push({ t: 'del', v: flatten(tok.tokens ?? []) })
        break
      case 'codespan':
        out.push({ t: 'code', v: tok.text })
        break
      case 'link':
        out.push({ t: 'link', v: flatten(tok.tokens ?? []), href: tok.href })
        break
      case 'br':
        out.push({ t: 'text', v: ' ' })
        break
      case 'escape':
        out.push({ t: 'text', v: tok.text })
        break
      default:
        // Unknown inline token: keep its raw text so nothing silently vanishes
        if (tok.text) out.push({ t: 'text', v: tok.text })
        break
    }
  }
  return out
}

function flatten(tokens: any[]): string {
  return (tokens ?? []).map((t: any) => t?.text ?? '').join('')
}

export function parseMarkdown(source: string): Block[] {
  const tokens = marked.lexer(source) as any[]
  const blocks: Block[] = []

  for (const tok of tokens) {
    switch (tok.type) {
      case 'heading':
        blocks.push({
          kind: 'heading',
          level: tok.depth,
          text: flatten(tok.tokens ?? []) || tok.text,
        })
        break
      case 'paragraph':
        blocks.push({ kind: 'paragraph', inlines: toInline(tok.tokens ?? []) })
        break
      case 'blockquote':
        blocks.push({
          kind: 'quote',
          lines: collectQuoteLines(tok),
        })
        break
      case 'list': {
        const items: Inline[][] = []
        for (const item of tok.items ?? []) {
          // list items carry an array of block tokens; use the first paragraph's inlines
          const firstPara = (item.tokens ?? []).find(
            (t: any) => t.type === 'paragraph' || t.type === 'text',
          )
          items.push(firstPara ? toInline(firstPara.tokens ?? []) : [])
        }
        blocks.push({ kind: 'list', ordered: !!tok.ordered, items })
        break
      }
      case 'code':
        blocks.push({ kind: 'code', lang: tok.lang ?? '', code: tok.text.replace(/\n$/, '') })
        break
      case 'hr':
        blocks.push({ kind: 'divider' })
        break
      case 'table': {
        const header: string[] = (tok.header ?? []).map((c: any) => cellText(c))
        const rows: string[][] = (tok.rows ?? []).map((row: any[]) => row.map((c) => cellText(c)))
        blocks.push({ kind: 'table', header, rows })
        break
      }
      case 'space':
        break
      default: {
        // html etc. — render its text content as a paragraph if non-empty
        const raw = (tok as any).text
        if (raw && raw.trim()) {
          blocks.push({ kind: 'paragraph', inlines: [{ t: 'text', v: raw.trim() }] })
        }
        break
      }
    }
  }
  return blocks
}

function collectQuoteLines(tok: any): string[] {
  const lines: string[] = []
  for (const inner of tok.tokens ?? []) {
    if (inner.type === 'paragraph') {
      lines.push(flatten(inner.tokens))
    } else if (inner.type === 'text') {
      lines.push(flatten(inner.tokens ?? []))
    } else if (inner.text) {
      lines.push(inner.text)
    }
  }
  return lines
}

function cellText(cell: any): string {
  return flatten(cell.tokens ?? []).trim() || String(cell.text ?? '').trim()
}
