# Changelog

Notable changes are recorded here. Version tags follow Semantic Versioning.

## Unreleased

### Added in studio v1.3

- **Export line ranges:** export the entire snippet, only highlighted / diff lines, or a custom line range (e.g., `2, 5-7`) for focused social cards and documentation snippets.
- **Brand mark / logo:** upload a small PNG, JPEG, or WebP logo (resized on-device and stored as a compact data URL) and place it `top-right` or `bottom-right` on the image.
- **Headline overlay:** add an optional bold headline above the code window, with light or dark tone for dark or light backgrounds.
- **Print / Save as PDF:** a print-optimized view that outputs only the export canvas.
- **Coalesced undo history:** drags and repeated line clicks now count as single undo steps, keeping the history useful during long editing sessions.
- **Copy code** button in the Code tab, and updated limits and help text to reflect **500,000-character** snippets and **5 MB** files.

### Added in studio v1.2

- **Interactive Line Highlighting:** click any line in the live preview to toggle highlight, `Shift+Click` for a range, or `Alt+Click` to cycle highlight / `+` added / `-` removed / off.
- **Line Highlight Controls in Style Tab & 5 Highlight Colors:** Violet, Amber, Cyan, Emerald, and Rose accent tints with `Dim` or `Blur` unfocused line modes.
- **Higher Code Capacity:** raised input limits to **500,000 characters** and **5 MB** files with safe syntax-highlight chunking and row bounding so large files stay fast.
- **32 Themes & 17 Fonts:** added Ayu Dark, Material Palenight, Shades of Purple, Cobalt2, Horizon Dark, Modus Operandi, and PaperColor Light (all WCAG AA contrast verified), plus Anonymous Pro and Overpass Mono (SIL OFL-1.1).
- **Undo / Redo & Smart Shuffle:** `Ctrl/Cmd + Z` and `Ctrl/Cmd + Shift + Z` history stack, plus harmonious theme + background + font randomization across the full catalog.
- **Pattern Background Tab, Window Width Presets & Custom Watermark:** 1-click pattern swatches (`Starfield`, `Blueprint`, `Studio Grid`, `Diagonal`, `Polka Dots`, `Crosshatch`), window width options (`Auto`, `540px`, `760px`, `960px`), and customizable watermark text.

### Added in studio v1.1

- Export as PNG, JPEG (quality slider), WebP (quality slider, with PNG fallback), and vector SVG with fonts embedded.
- Social frames: Wide 16:9, Square 1:1, Portrait 4:5, Social card 1200 × 630, and Story 1080 × 1920. The code auto-fits inside each frame.
- Share links in the URL fragment (gzip and base64url, 60 KB cap, 400 KB decompression limit), with a Copy link action.
- Local library of up to 30 snippets, with explicit save, delete, and delete-all.
- Focus mode with context lines, added and removed markers, tab width 2/4/8, wrap long lines, letter spacing, and line height.
- Photo backgrounds processed on-device (EXIF metadata removed), with dim and blur. Mesh gradients, grain texture, and five window styles.
- Nine more languages (Scala, Haskell, Elixir, R, PowerShell, Perl, SCSS, Nginx, Makefile), five more themes, and four more fonts (Geist Mono, Red Hat Mono, Azeret Mono, DM Mono).
- `/.well-known/security.txt`, a `connect-src 'self' blob:` CSP for the photo export, OpenSSF Scorecard and dependency review workflows, build-provenance attestation on release, and a container smoke test in CI.
- Docs: roadmap with research and decisions, STRIDE-lite threat model, and CODEOWNERS.

### Changed

- Settings saved by v1.0 still load. New fields fall back to safe defaults.
- Release workflow now verifies the tag against `package.json`, runs the full browser suite, and attests build provenance.

### Added

- **Dark & Light Studio Mode:** toggle the entire workspace between light and dark themes with full WCAG AA contrast.
- **20 Editor Themes:** 13 dark themes (including Catppuccin Mocha, Nord, One Dark Pro, Night Owl, Gruvbox Dark, Kanagawa Wave, SynthWave '84, Vesper) and 7 light themes (including Catppuccin Latte, Gruvbox Light, One Light, Ayu Light).
- **11 Bundled Monospace Fonts:** added Cascadia Code, Source Code Pro, Victor Mono, Martian Mono, and Inconsolata locally with zero external requests.
- **25 Languages:** added Kotlin, Dart, GraphQL, TOML/INI, Dockerfile, Lua, Markdown, and Diff.
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
