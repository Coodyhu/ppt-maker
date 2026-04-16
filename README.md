# ppt-maker

AI-powered slide deck generator with 17 professional visual styles.

Give it a Markdown file → get a PPTX + PDF with AI-generated slide images.

## Features

- **17 style presets** — blueprint, bold-editorial, watercolor, pixel-art, vintage, notion, and more
- **525 style combinations** — mix Texture × Mood × Typography × Density dimensions
- **Auto style detection** — picks the best style based on your content
- **CLI + Web UI** — use from terminal or browser
- **PPTX & PDF output** — ready to present

## Quick Start

```bash
# Install dependencies
bun install

# Generate a slide deck from a Markdown file
bun run cli create my-content.md

# Or with a specific style
bun run cli create my-content.md --style blueprint --lang zh
```

## CLI Usage

```
ppt-maker create <source.md> [options]

Options:
  --style <name>       Visual style preset (default: auto-detect)
  --audience <type>    general | beginners | experts | executives
  --lang <code>        Output language: en, zh, ja, etc. (default: auto-detect)
  --slides <number>    Target slide count (default: auto)
  --outline-only       Generate outline only, no images
  --api-key <key>      Anthropic API key (or set ANTHROPIC_API_KEY env)

Commands:
  ppt-maker styles     List all available styles
  ppt-maker merge <dir> Merge existing images to PPTX/PDF
```

## Web UI

```bash
bun run dev
# Open http://localhost:3000
```

## Setup

```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

Get an API key at [console.anthropic.com](https://console.anthropic.com).

## Style Presets

| Preset | Best For |
|--------|----------|
| `blueprint` | Architecture, system design |
| `bold-editorial` | Product launches, keynotes |
| `chalkboard` | Education, tutorials |
| `corporate` | Business reports |
| `dark-atmospheric` | Creative, dramatic |
| `editorial-infographic` | Data storytelling |
| `fantasy-animation` | Creative, entertainment |
| `hand-drawn-edu` | Workshops, casual |
| `intuition-machine` | AI, tech concepts |
| `minimal` | Clean, modern |
| `notion` | Documentation style |
| `pixel-art` | Gaming, retro |
| `scientific` | Research, academia |
| `sketch-notes` | Visual notes |
| `vector-illustration` | Modern, flat design |
| `vintage` | Classic, editorial |
| `watercolor` | Creative, artistic |

## Tech Stack

- **Runtime**: Bun
- **Language**: TypeScript (strict)
- **Web**: Next.js (App Router)
- **Image generation**: Claude API
- **PPTX**: pptxgenjs
- **PDF**: pdf-lib

## Project Structure

```
packages/
├── core/   # Style system, outline generation, image generation, PPTX/PDF merge
├── cli/    # Command-line interface
└── web/    # Next.js web app
```

## License

MIT
