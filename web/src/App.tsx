import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { renderCard, loadFontSet, THEMES, SIZES, type FontData } from 'cardmark/browser'

const DEFAULT_MD = `# Ship your ideas 🚀

Paste **Markdown** on the left — get a share-ready card on the right.

- 10 beautiful themes
- 6 social platform sizes
- PNG · SVG · copy to clipboard
- CJK + emoji out of the box

\`\`\`bash
npx cardmark note.md -t matcha -o card.png
\`\`\`

> Cards so nice, you'll want to post them twice.
`

const THEME_IDS = Object.keys(THEMES)
const SIZE_IDS = Object.keys(SIZES)

export default function App() {
  const [md, setMd] = useState(DEFAULT_MD)
  const [themeId, setThemeId] = useState('aurora')
  const [sizeId, setSizeId] = useState('x')
  const [byline, setByline] = useState('')
  const [svg, setSvg] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<'none' | 'png' | 'svg'>('none')
  const [fonts, setFonts] = useState<FontData[]>([])
  const previewRef = useRef<HTMLDivElement>(null)

  const size = SIZES[sizeId]

  // Load the theme's font faces once (CDN woff, cached in memory by cardmark).
  useEffect(() => {
    let alive = true
    loadFontSet('default')
      .then((fonts) => {
        if (alive) setFonts(fonts)
      })
      .catch(() => {
        /* editor shows the render error instead */
      })
    return () => {
      alive = false
    }
  }, [])

  // Debounced render
  useEffect(() => {
    if (fonts.length === 0) return
    let alive = true
    const timer = setTimeout(async () => {
      try {
        const result = await renderCard(md, {
          theme: themeId,
          size: sizeId,
          byline: byline || undefined,
          fonts,
        })
        if (!alive) return
        setSvg(result.svg)
        setError(null)
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : String(err))
      }
    }, 120)
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [md, themeId, sizeId, byline, fonts])

  const scale = useMemo(() => Math.min(1, 560 / size.width), [size.width])

  const downloadSvg = useCallback(() => {
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    triggerDownload(blob, `cardmark-${themeId}-${sizeId}.svg`)
  }, [svg, themeId, sizeId])

  const downloadPng = useCallback(async () => {
    if (!previewRef.current) return
    const el = previewRef.current.querySelector('svg')
    if (!el) return
    const pngUrl = await svgToPng(el as SVGSVGElement, size.width, size.height)
    const res = await fetch(pngUrl)
    triggerDownload(await res.blob(), `cardmark-${themeId}-${sizeId}.png`)
  }, [size.width, size.height, themeId, sizeId])

  const copyPng = useCallback(async () => {
    try {
      const el = previewRef.current?.querySelector('svg')
      if (!el) return
      const pngUrl = await svgToPng(el as SVGSVGElement, size.width, size.height)
      const blob = await (await fetch(pngUrl)).blob()
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setCopied('png')
      setTimeout(() => setCopied('none'), 1600)
    } catch {
      // clipboard image not supported; fall back silently
      await copyText(svg)
      setCopied('svg')
      setTimeout(() => setCopied('none'), 1600)
    }
  }, [size.width, size.height, svg])

  const copySvgText = useCallback(async () => {
    await copyText(svg)
    setCopied('svg')
    setTimeout(() => setCopied('none'), 1600)
  }, [svg])

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="logo" aria-hidden /> CardMark
          <span className="tagline">markdown → beautiful cards</span>
        </div>
        <div className="links">
          <a href="https://github.com/FrankFu916/cardmark" target="_blank" rel="noreferrer">
            GitHub ★
          </a>
          <a href="https://www.npmjs.com/package/cardmark" target="_blank" rel="noreferrer">
            npm
          </a>
        </div>
      </header>

      <div className="controls">
        <div className="control-group" role="radiogroup" aria-label="Theme">
          {THEME_IDS.map((id) => (
            <button
              key={id}
              role="radio"
              aria-checked={themeId === id}
              className={`chip ${themeId === id ? 'active' : ''}`}
              onClick={() => setThemeId(id)}
            >
              <span
                className="dot"
                style={{ background: THEMES[id].accent }}
                aria-hidden
              />
              {THEMES[id].label}
            </button>
          ))}
        </div>
        <div className="control-group" role="radiogroup" aria-label="Size">
          {SIZE_IDS.map((id) => (
            <button
              key={id}
              role="radio"
              aria-checked={sizeId === id}
              className={`chip ${sizeId === id ? 'active' : ''}`}
              onClick={() => setSizeId(id)}
            >
              {SIZES[id].label}
            </button>
          ))}
        </div>
        <input
          className="byline-input"
          placeholder="@yourhandle (optional)"
          value={byline}
          maxLength={40}
          onChange={(e) => setByline(e.target.value)}
        />
      </div>

      <main className="workspace">
        <section className="editor-pane">
          <div className="pane-header">
            <span>Markdown</span>
            <button className="ghost" onClick={() => setMd(DEFAULT_MD)}>
              reset
            </button>
          </div>
          <textarea
            aria-label="Markdown source"
            value={md}
            onChange={(e) => setMd(e.target.value)}
            spellCheck={false}
          />
        </section>

        <section className="preview-pane">
          <div className="pane-header">
            <span>Preview · {size.width}×{size.height}</span>
            <div className="actions">
              <button onClick={copyPng}>{copied === 'png' ? '✓ copied' : 'Copy PNG'}</button>
              <button onClick={downloadPng}>PNG</button>
              <button onClick={downloadSvg}>SVG</button>
              <button className="ghost" onClick={copySvgText}>
                {copied === 'svg' ? '✓ copied' : '<> src'}
              </button>
            </div>
          </div>
          <div className="canvas" ref={previewRef}>
            {error ? (
              <div className="error">{error}</div>
            ) : (
              <div
                className="card-holder"
                style={{ width: size.width * scale, height: size.height * scale }}
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            )}
          </div>
        </section>
      </main>

      <footer className="foot">
        Open source under MIT · built with satori + resvg · no tracking, no signup
      </footer>
    </div>
  )
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

async function copyText(text: string) {
  await navigator.clipboard.writeText(text)
}

async function svgToPng(el: SVGSVGElement, w: number, h: number): Promise<string> {
  const xml = new XMLSerializer().serializeToString(el)
  const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)
  const img = new Image()
  await new Promise<void>((res, rej) => {
    img.onload = () => res()
    img.onerror = () => rej(new Error('svg load failed'))
    img.src = url
  })
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, w, h)
  URL.revokeObjectURL(url)
  return canvas.toDataURL('image/png')
}
