# Changelog

Notable changes are recorded here. Version tags follow Semantic Versioning.

## Unreleased

### Added

- **Dark & Light Studio Mode:** toggle the entire workspace between light and dark themes with full WCAG AA contrast.
- **24 Editor Themes:** 16 dark themes (including Catppuccin Mocha, Nord, One Dark Pro, Night Owl, Gruvbox Dark, Kanagawa Wave, SynthWave '84, Vesper, Everforest Dark, Poimandres, Palenight) and 8 light themes (including Catppuccin Latte, Gruvbox Light, One Light, Ayu Light, Everforest Light) — all WCAG AA contrast verified.
- **13 Bundled Monospace Fonts:** added Cascadia Code, Commit Mono, Source Code Pro, Victor Mono, Martian Mono, Inconsolata, and Anonymous Pro locally with zero external requests.
- **28 Languages:** added Kotlin, Scala, Elixir, Dart, GraphQL, TOML/INI, Dockerfile, Nginx, Lua, Markdown, and Diff.
- **Vector SVG Export & Social Card Framing:** export crisp vector SVGs alongside 2x/3x/4x PNGs, plus `2:1 Social Card` aspect ratio and GitHub Pages deployment workflow.
- **Line Focus & Diff Annotations:** highlight specific lines, mark `+`/`-` diff lines, dim unfocused lines, and configure starting line numbers.
- **Window & Frame Enhancements:** added `macOS Outline` and `Terminal` chrome styles, frame border styles (`Subtle`, `Crisp`, `Glass`, `Glow`), language header badge, `16:9` / `4:5` / `1:1` aspect ratio presets, line height slider, font ligatures toggle, code tidying, and validated style JSON import/export.

- Refined Code / Style / Export studio with responsive canvas, templates, help, fullscreen, actual-size viewing, and keyboard shortcuts.
- Embedded local fonts shared by the preview and PNG renderer, removing third-party runtime requests.
- Solid backgrounds, transparent PNG verification, bounded image output, and explicit native-share preparation.
- Production script-hash CSP, content-derived worker cache versions, reproducible PNG icons, and manifest checks.
- Desktop/mobile Playwright tests for real PNG pixels, offline export, storage, safe imports, keyboard use, and automated accessibility.
- Browser and container smoke-test CI jobs; release ZIPs, SBOM, and checksums; updated operations documentation.

### Fixed

- Missing/mis-sized PWA icons can no longer silently survive a production build.
- Storage property access is protected when browser settings block local storage.
- Import rejects oversize input instead of silently truncating it.
- Worker cleanup is scoped to Snapcode-owned cache names and updates do not force a reload of unsaved code.
- nginx headers are no longer accidentally discarded by location-level cache settings.
- Improved label associations and mobile button names, text contrast, and reduced-motion support.

## 1.0.0

Initial React/Vite code-image app with 17 languages, eight themes, six fonts, high-resolution PNG export, and static deployment tooling.
