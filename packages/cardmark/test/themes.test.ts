import { describe, expect, it } from 'vitest'
import { resolveTheme, resolveSize, THEMES, SIZES } from '../src/themes.js'
import type { ThemeInput } from '../src/types.js'

describe('resolveTheme', () => {
  it('resolves built-in themes by id', () => {
    expect(resolveTheme('aurora').id).toBe('aurora')
    expect(resolveTheme('NOIR').id).toBe('noir')
  })

  it('defaults to aurora', () => {
    expect(resolveTheme().id).toBe('aurora')
  })

  it('merges partial custom themes over midnight base', () => {
    const custom: ThemeInput = {
      id: 'brand',
      label: 'Brand',
      appearance: 'dark',
      accent: '#ff0000',
    }
    const t = resolveTheme(custom)
    expect(t.accent).toBe('#ff0000')
    expect(t.text).toBe(THEMES.midnight.text) // inherited
    expect(t.id).toBe('brand')
  })

  it('throws on unknown theme names', () => {
    expect(() => resolveTheme('nope')).toThrow(/Unknown theme/)
  })

  it('exposes at least 8 built-in themes', () => {
    expect(Object.keys(THEMES).length).toBeGreaterThanOrEqual(8)
  })
})

describe('resolveSize', () => {
  it('resolves presets and aliases', () => {
    expect(resolveSize('og')).toMatchObject({ width: 1200, height: 630 })
    expect(resolveSize('twitter')).toMatchObject({ width: 1200, height: 1350 })
    expect(resolveSize('3:4')).toMatchObject({ width: 1080, height: 1440 })
  })

  it('supports custom WxH strings', () => {
    expect(resolveSize('1200x675')).toMatchObject({ width: 1200, height: 675 })
    expect(resolveSize('800×600').width).toBe(800)
  })

  it('accepts preset objects verbatim', () => {
    expect(resolveSize(SIZES.square).id).toBe('square')
  })

  it('throws on unknown sizes', () => {
    expect(() => resolveSize('banana')).toThrow(/Unknown size/)
  })

  it('covers the main social platforms', () => {
    const ids = Object.keys(SIZES)
    for (const must of ['x', 'og', 'xiaohongshu', 'instagram']) {
      expect(ids).toContain(must)
    }
  })
})
