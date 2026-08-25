import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import App from '../src/App.js'

describe('web editor', () => {
  it('renders the app shell without crashing', () => {
    // renderCard uses canvas-free satori; in jsdom it should still produce svg
    const html = renderToString(<App />)
    expect(html).toContain('CardMark')
    expect(html).toContain('Markdown')
  })
})
