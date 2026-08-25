#!/usr/bin/env node
import { parseArgs } from 'node:util'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { renderCard, renderPng, loadFont } from './render.js'
import { splitCards } from './parse.js'
import { THEMES, SIZES } from './themes.js'
import { FONT_SETS, FONT_SET_LABELS } from './fonts.js'
import { VERSION } from './version.js'

const args = process.argv.slice(2)

function usage(): string {
  return `CardMark v${VERSION} — turn Markdown into beautiful shareable cards.

USAGE
  cardmark [options] [input.md]
  echo "# hello" | cardmark > card.svg

OPTIONS
  -t, --theme <name>     ${Object.keys(THEMES).join(' | ')}          (default: aurora)
  -s, --size <preset>    ${Object.keys(SIZES).join(' | ')} or 1200x675  (default: x)
  -f, --format <fmt>     svg | png                        (default: svg)
  -b, --byline <text>    footer text, e.g. "@yourhandle"
  -o, --out <path>       output file (default: stdout for svg; required for png)
      --split            split on --- into multiple cards (adds -1, -2... suffix)
  -p, --padding <level>  sm | md | lg | xl                (default: md)
  -F, --font <file>      font file to embed (repeatable: regular first, then bold)
      --font-set <name>  ${Object.keys(FONT_SETS).join(' | ')}
                         (default: from theme; overrides it)
  --list-themes          list built-in themes and exit
  --list-sizes           list size presets and exit
  --list-font-sets       list font sets and exit
  -h, --help             show this help
  -v, --version          show version

EXAMPLES
  cardmark note.md --theme matcha --size og -o card.png
  cat README.md | cardmark --split --size story --out slides/
  curl -sL raw.md | cardmark -t noir --byline "@me" > card.svg
  cardmark japanese.md --font-set japanese -f png -o card.png
`
}

async function main(): Promise<number> {
  let opts
  let positionals: string[] = []
  try {
    const parsed = parseArgs({
      args,
      options: {
        theme: { type: 'string', short: 't', default: 'aurora' },
        size: { type: 'string', short: 's', default: 'x' },
        format: { type: 'string', short: 'f', default: 'svg' },
        byline: { type: 'string', short: 'b' },
        out: { type: 'string', short: 'o' },
        split: { type: 'boolean', default: false },
        padding: { type: 'string', short: 'p', default: 'md' },
        font: { type: 'string', short: 'F', multiple: true },
        'font-set': { type: 'string' },
        'list-themes': { type: 'boolean', default: false },
        'list-sizes': { type: 'boolean', default: false },
        'list-font-sets': { type: 'boolean', default: false },
        help: { type: 'boolean', short: 'h', default: false },
        version: { type: 'boolean', short: 'v', default: false },
      },
      allowPositionals: true,
    })
    opts = parsed.values
    positionals = parsed.positionals
  } catch (err: any) {
    process.stderr.write(`${err.message}\n\n${usage()}`)
    return 2
  }

  if (opts.help) {
    process.stdout.write(usage())
    return 0
  }
  if (opts.version) {
    process.stdout.write(`cardmark v${VERSION}\n`)
    return 0
  }
  if (opts['list-themes']) {
    for (const t of Object.values(THEMES)) {
      process.stdout.write(`${t.id.padEnd(12)} ${t.label} (${t.appearance})\n`)
    }
    return 0
  }
  if (opts['list-sizes']) {
    for (const s of Object.values(SIZES)) {
      process.stdout.write(`${s.id.padEnd(12)} ${s.width}x${s.height}  ${s.label}\n`)
    }
    return 0
  }
  if (opts['list-font-sets']) {
    for (const [id, label] of Object.entries(FONT_SET_LABELS)) {
      process.stdout.write(`${id.padEnd(16)} ${label}\n`)
    }
    return 0
  }

  // Read input: file arg or stdin
  let input = ''
  const file = positionals?.[0]
  if (file) {
    input = readFileSync(resolve(file), 'utf8')
  } else if (!process.stdin.isTTY) {
    input = await readStdin()
  } else {
    process.stderr.write(usage())
    return 2
  }
  if (!input.trim()) {
    process.stderr.write('error: empty input\n')
    return 1
  }

  const fonts = []
  for (const f of opts.font ?? []) {
    fonts.push(await loadFont(f))
  }
  let fontSet: string | undefined
  if (opts['font-set']) {
    if (!FONT_SETS[opts['font-set']]) {
      process.stderr.write(`error: unknown font set "${opts['font-set']}" (see --list-font-sets)\n`)
      return 2
    }
    fontSet = opts['font-set']
  }

  const format = opts.format!.toLowerCase()
  if (format !== 'svg' && format !== 'png') {
    process.stderr.write(`error: unknown format "${format}" (use svg or png)\n`)
    return 2
  }

  const sources = opts.split ? splitCards(input) : [input]
  const out = opts.out ? resolve(opts.out) : null

  for (let i = 0; i < sources.length; i++) {
    const md = sources[i]
    const renderOpts = {
      theme: opts.theme!,
      size: opts.size!,
      byline: opts.byline,
      padding: (opts.padding as any) ?? 'md',
      fonts: fonts.length > 0 ? fonts : undefined,
      fontSet,
    }
    let data: string | Buffer
    if (format === 'png') {
      data = await renderPng(md, renderOpts)
    } else {
      data = (await renderCard(md, renderOpts)).svg
    }

    if (out) {
      const target =
        sources.length > 1
          ? out.replace(/(\.[a-z0-9]+)?$/i, `-${i + 1}$1`) || `${out}-${i + 1}`
          : out
      mkdirSync(dirname(target), { recursive: true })
      writeFileSync(target, data)
      process.stderr.write(`✓ ${target} (${Buffer.byteLength(data as any)} bytes)\n`)
    } else if (format === 'svg') {
      process.stdout.write(data as string)
    } else {
      process.stderr.write('error: png output requires -o/--out\n')
      return 2
    }
  }
  return 0
}

function readStdin(): Promise<string> {
  return new Promise((res, rej) => {
    let buf = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (d) => (buf += d))
    process.stdin.on('end', () => res(buf))
    process.stdin.on('error', rej)
  })
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    process.stderr.write(`cardmark: ${err instanceof Error ? err.message : String(err)}\n`)
    process.exit(1)
  })
