import { describe, expect, it } from 'vitest'
import {
  FONT_PRESETS,
  FONT_SETS,
  FONT_SET_LABELS,
  isEmojiSegment,
  twemojiCodeFor,
} from '../src/fonts.js'

describe('font sets', () => {
  it('covers all languages with dedicated sets', () => {
    for (const id of [
      'default',
      'serif',
      'latin',
      'editorial',
      'japanese',
      'japanese-serif',
      'korean',
      'korean-serif',
      'cjk-all',
    ]) {
      expect(FONT_SETS[id], `missing font set ${id}`).toBeTruthy()
      expect(FONT_SETS[id].length).toBeGreaterThan(2)
      expect(FONT_SET_LABELS[id], `missing label for ${id}`).toBeTruthy()
    }
  })

  it('references only defined presets', () => {
    for (const [setId, presets] of Object.entries(FONT_SETS)) {
      for (const p of presets) {
        expect(FONT_PRESETS[p], `${setId} references unknown preset ${p}`).toBeTruthy()
      }
    }
  })

  it('japanese/korean sets include their language faces', () => {
    expect(FONT_SETS.japanese).toContain('noto-sans-jp')
    expect(FONT_SETS['japanese-serif']).toContain('noto-serif-jp')
    expect(FONT_SETS.korean).toContain('noto-sans-kr')
    expect(FONT_SETS['cjk-all']).toEqual(
      expect.arrayContaining(['noto-sans-sc', 'noto-sans-jp', 'noto-sans-kr']),
    )
  })
})

describe('emoji segmentation', () => {
  it('accepts pictographics, flags, ZWJ sequences and keycaps', () => {
    for (const seg of ['🚀', '🎉', '🇨🇳', '🇯🇵', '👨‍👩‍👧', '1️⃣', '🏳️‍🌈']) {
      expect(isEmojiSegment('emoji', seg), `should accept ${seg}`).toBe(true)
    }
  })

  it('rejects plain text segments', () => {
    expect(isEmojiSegment('unknown', 'hello world')).toBe(false)
    expect(isEmojiSegment('emoji', 'abc')).toBe(false)
  })

  it('maps emoji to twemoji file codes', () => {
    expect(twemojiCodeFor('🚀')).toBe('1f680')
    expect(twemojiCodeFor('🇨🇳')).toBe('1f1e8-1f1f3')
    expect(twemojiCodeFor('👨‍👩‍👧')).toBe('1f468-200d-1f469-200d-1f467')
  })
})
