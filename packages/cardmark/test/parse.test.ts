import { describe, expect, it } from 'vitest'
import { parseMarkdown, splitCards } from '../src/parse.js'

describe('splitCards', () => {
  it('splits on --- fences', () => {
    const cards = splitCards('# A\n\ncontent\n\n---\n\n# B')
    expect(cards).toHaveLength(2)
    expect(cards[0]).toContain('# A')
    expect(cards[1]).toContain('# B')
  })

  it('does not split inside code fences', () => {
    const src = '# T\n\n```md\n---\nnormal text\n```\n'
    expect(splitCards(src)).toHaveLength(1)
  })

  it('drops empty chunks', () => {
    expect(splitCards('---\n---\n# real')).toHaveLength(1)
  })

  it('returns whole source when no divider present', () => {
    expect(splitCards('# solo')).toEqual(['# solo'])
  })
})

describe('parseMarkdown', () => {
  it('parses headings with levels', () => {
    const blocks = parseMarkdown('# One\n## Two\n### Three')
    expect(blocks.filter((b) => b.kind === 'heading')).toMatchObject([
      { kind: 'heading', level: 1, text: 'One' },
      { kind: 'heading', level: 2, text: 'Two' },
      { kind: 'heading', level: 3, text: 'Three' },
    ])
  })

  it('parses inline styles', () => {
    const blocks = parseMarkdown('this is **bold** and *italic* and `code` and ~~gone~~')
    const p = blocks[0]
    expect(p.kind).toBe('paragraph')
    if (p.kind !== 'paragraph') return
    const kinds = p.inlines.map((i) => i.t)
    expect(kinds).toContain('strong')
    expect(kinds).toContain('em')
    expect(kinds).toContain('code')
    expect(kinds).toContain('del')
    const bold = p.inlines.find((i) => i.t === 'strong')
    expect(bold && bold.t === 'strong' && bold.v).toBe('bold')
  })

  it('parses links keeping label and href', () => {
    const blocks = parseMarkdown('see [the docs](https://example.com)')
    const p = blocks[0]
    if (p.kind !== 'paragraph') return
    const link = p.inlines.find((i) => i.t === 'link')
    expect(link).toBeDefined()
    expect(link && link.t === 'link' && link.href).toBe('https://example.com')
    expect(link && link.t === 'link' && link.v).toBe('the docs')
  })

  it('parses bullet and ordered lists', () => {
    const bullets = parseMarkdown('- alpha\n- beta')[0]
    expect(bullets.kind).toBe('list')
    if (bullets.kind === 'list') {
      expect(bullets.ordered).toBe(false)
      expect(bullets.items).toHaveLength(2)
    }
    const ordered = parseMarkdown('1. first\n2. second')[0]
    if (ordered.kind === 'list') expect(ordered.ordered).toBe(true)
  })

  it('parses code blocks with language', () => {
    const blocks = parseMarkdown('```ts\nconst x = 1\n```')
    expect(blocks[0]).toEqual({ kind: 'code', lang: 'ts', code: 'const x = 1' })
  })

  it('parses blockquotes', () => {
    const blocks = parseMarkdown('> hello world')
    expect(blocks[0].kind).toBe('quote')
    if (blocks[0].kind === 'quote') expect(blocks[0].lines).toEqual(['hello world'])
  })

  it('parses GFM tables', () => {
    const blocks = parseMarkdown('| a | b |\n| - | - |\n| 1 | 2 |')
    expect(blocks[0].kind).toBe('table')
    if (blocks[0].kind === 'table') {
      expect(blocks[0].header).toEqual(['a', 'b'])
      expect(blocks[0].rows).toEqual([['1', '2']])
    }
  })

  it('handles dividers as block type', () => {
    // NOTE: --- at top level after a paragraph is a setext heading in GFM;
    // use *** which is unambiguous
    const blocks = parseMarkdown('above\n\n***\n\nbelow')
    expect(blocks.some((b) => b.kind === 'divider')).toBe(true)
  })

  it('keeps CJK text intact', () => {
    const blocks = parseMarkdown('# 中文标题\n\n这是一段**中文**内容，包含 English 混排。')
    expect(blocks[0]).toMatchObject({ kind: 'heading', level: 1, text: '中文标题' })
    const p = blocks[1]
    if (p.kind === 'paragraph') {
      expect(p.inlines.some((i) => i.t === 'strong' && i.v === '中文')).toBe(true)
    }
  })
})
