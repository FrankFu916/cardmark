import { describe, expect, it, beforeAll } from 'vitest'
import { renderCard, renderPng, loadSystemFonts } from '../src/render.js'

// Rendering needs a real font for text measurement. CI (ubuntu-latest) has
// DejaVu; macOS dev machines have Helvetica. Skip if neither exists.
let fontsReady = false
beforeAll(async () => {
  const fonts = await loadSystemFonts()
  fontsReady = fonts.length > 0
})

const SAMPLE = `# Hello CardMark

Turn **markdown** into beautiful cards.

- fast
- themeable

\`\`\`ts
const hi = 'world'
\`\`\`

> quote here
`

describe('renderCard', () => {
  it('produces a standalone SVG with expected dimensions', async () => {
    if (!fontsReady) return
    const r = await renderCard(SAMPLE, { size: 'og', hideFooter: true })
    expect(r.svg).toContain('<svg')
    expect(r.width).toBe(1200)
    expect(r.height).toBe(630)
    // satori output embeds our content as SVG paths/text
    expect(r.svg.length).toBeGreaterThan(1000)
  })

  it('renders CJK text without throwing', async () => {
    if (!fontsReady) return
    const r = await renderCard('# 中文卡片\n\n这是内容。', { hideFooter: true })
    expect(r.svg).toContain('<svg')
  })

  it('applies the requested theme', async () => {
    if (!fontsReady) return
    const aurora = await renderCard('# t', { theme: 'aurora', hideFooter: true })
    const paper = await renderCard('# t', { theme: 'paper', hideFooter: true })
    expect(aurora.themeId).toBe('aurora')
    expect(paper.themeId).toBe('paper')
    // different backgrounds produce different svg
    expect(aurora.svg).not.toBe(paper.svg)
  })

  it('renders byline into the footer', async () => {
    if (!fontsReady) return
    const plain = await renderCard('# t')
    const withByline = await renderCard('# t', { byline: '@tester' })
    // satori embeds text as vector paths, so assert on layout difference
    expect(withByline.svg.length).toBeGreaterThan(plain.svg.length)
    expect(withByline.svg).not.toBe(plain.svg)
  })

  it('rejects unknown themes and sizes', async () => {
    await expect(renderCard('# x', { theme: 'nope' })).rejects.toThrow(/Unknown theme/)
    await expect(renderCard('# x', { size: 'nope' })).rejects.toThrow(/Unknown size/)
  })
})

describe('renderPng', () => {
  it('produces a PNG buffer with correct signature', async () => {
    if (!fontsReady) return
    const png = await renderPng(SAMPLE, { size: 'square' })
    expect(png).toBeInstanceOf(Buffer)
    // PNG magic bytes
    expect([...png.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    expect(png.length).toBeGreaterThan(10_000)
  })
})
