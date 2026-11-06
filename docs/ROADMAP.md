# Roadmap, research, and decisions

This document records what shipped in the v1.1 studio, the research behind it, how it was verified, and what is deliberately deferred.

## What shipped in v1.1

| Area        | Delivered                                                                                                                                                                              | Verification                                                                                                |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Languages   | 34 explicit languages plus auto-detect. Added Scala, Haskell, Elixir, R, PowerShell, Perl, SCSS, Nginx, and Makefile. Auto-detect skips the ambiguous ones (R, Perl, Makefile, Nginx). | Unit: every language has a sample, grammar, and default file name.                                          |
| Themes      | 25 editor themes: 18 dark and 7 light. Added Catppuccin Frappé, Catppuccin Macchiato, Rosé Pine Moon, Everforest Dark, and Solarized Dark.                                             | Unit: every token in every theme meets WCAG AA contrast (4.5:1) against its background.                     |
| Fonts       | 15 bundled monospace fonts, all SIL OFL-1.1. Added Geist Mono, Red Hat Mono, Azeret Mono, and DM Mono.                                                                                 | Build: embedded WOFF2. E2E: offline export.                                                                 |
| Backgrounds | 19 gradient and mesh backgrounds (3 mesh added), 4 patterns, custom gradient, solid, transparent, and photo (dim and blur, processed on-device).                                       | E2E: photo export, with no CSP violations or page errors.                                                   |
| Frames      | Auto-fit, Wide 16:9, Square 1:1, Portrait 4:5, Social card 1200 × 630, and Story 1080 × 1920. The code scales down to fit.                                                             | E2E: the social card exports at 2400 × 1260 and the code stays inside the frame.                            |
| Export      | PNG (2x to 4x), JPEG and WebP with quality, and SVG with fonts embedded. WebP falls back to PNG when the browser cannot encode it.                                                     | E2E: JPEG, WebP, and SVG downloads checked by file format.                                                  |
| Code tools  | Tab width 2, 4, or 8; wrap long lines; focus mode with context lines; added and removed markers; starting line; letter spacing; line height; ligatures.                                | Unit: row builder and focus gaps. E2E: focus mode.                                                          |
| Sharing     | Share link in the URL fragment: gzip, then base64url, capped at 60 KB, with a 400 KB decompression limit.                                                                              | Unit: round trip, tampered input, zip bomb, oversized input. E2E: copy link, then open it in a new session. |
| Library     | Up to 30 snippets saved in this browser. Explicit save, per-item delete, and delete-all.                                                                                               | Unit: sanitization and quota handling. E2E: save, reload, load.                                             |
| Settings    | Validation covers every new field. Settings saved by v1.0 still load.                                                                                                                  | Unit: 16 settings tests.                                                                                    |
| Security    | Production CSP allows `connect-src 'self' blob:` (needed for photo export). `/.well-known/security.txt` is served, and the dotfile block is scoped so it stays reachable.              | Build assertion, nginx location order, container smoke test in CI.                                          |

**Verification snapshot for this build:** 105 unit tests. 19 E2E scenarios on desktop and mobile Chromium (38 runs). axe WCAG 2.0 and 2.1 AA checks on the default view, the Code and Export tabs, and dark studio mode. Production audit: 0 vulnerabilities. Format, typecheck, lint, and production build all pass.

## Research

### Competitive scan

- **Carbon** (public descriptions): PNG and SVG export, clipboard copy, shareable links, macOS-style window controls, and many syntax themes. Theme counts differ between sources (29 in one comparison, 150+ in another), so this project makes no theme-count claim.
  - Sources: https://nologin.tools/tool/carbon-now-sh · https://www.screenshot-studio.com/compare/carbon · https://www.kromastudio.in/carbon-alternative
- **Gap analysis.** Snapcode differentiates on: on-device photo backgrounds with metadata stripping; social and story frames with auto-fit; focus mode with context; a local-only library; share links that never touch a server; and offline export with bundled fonts.

### Colour and font sources

- **Catppuccin Frappé and Macchiato:** official palette JSON, version 1.8.0. https://raw.githubusercontent.com/catppuccin/palette/main/palette.json
- **Rosé Pine Moon:** official palette values, as used in the Helix runtime theme and the rose-pine xresources palette. https://github.com/helix-editor/helix/blob/master/runtime/themes/rose_pine_moon.toml · https://github.com/rose-pine/xresources/issues/2
- **Everforest Dark (medium):** palette from everforest-nix, with `bg_dim` from the xcode themes. https://codeberg.org/fwinter/everforest-nix · https://github.com/agisilaos/everforest-xcode-themes. Another reference lists a different medium `bg0`. We kept the values from the upstream-derived references above.
- **Solarized Dark:** canonical Solarized tones. Tones that failed WCAG AA (comments, line numbers, and several accents) were lightened by a deterministic adjustment until they reached at least 4.6:1. **Verify the base palette against the upstream specification before using the name in marketing.**
- **Fonts:** Geist Mono, Red Hat Mono, Azeret Mono, and DM Mono are published as `@fontsource` packages under SIL OFL-1.1. Checked with `npm view` on the registry. Each Latin 400 WOFF2 file is 10 to 15 KB.

### Platform and standards

- **CompressionStream** (MDN): used for share links. Availability is feature-detected, and an unsupported browser gets a clear message instead of a failure. https://developer.mozilla.org/en-US/docs/Web/API/CompressionStream
- **html-to-image** (README): `toCanvas`, `toSvg`, `fontEmbedCSS`, `skipAutoScale`, and `backgroundColor`. https://github.com/bubkoo/html-to-image
- **WebP encoding** depends on the browser, so export falls back to PNG rather than failing.

### GitHub platform

- **Latest major Action releases,** from the GitHub REST API (`releases/latest`): `actions/checkout` v7.0.1, `actions/setup-node` v7.1.0, `actions/upload-artifact` v7.0.2, `actions/download-artifact` v8.0.2, `github/codeql-action` v4, `actions/dependency-review-action` v5.0.0 (needs runner v2.327.1 or newer), `ossf/scorecard-action` v2.5.0, `actions/attest` v4 (`attest-build-provenance` v4.2.2 now wraps it), `docker/build-push-action` v7.4.0, and `docker/setup-buildx-action` v4.4.1.
- **Fine-grained tokens:** pushes that change `.github/workflows/**` need _Workflows: Read and write_. Without it GitHub rejects the push. Sources: https://konadu.dev/github-actions-checkout-token-workflow-files-permission-denied · https://github.com/doomtickle/ai-code-factory/pull/24 · https://github.com/berenddeboer/ready-for-agent/issues/1163
- **Existing remote history:** `origin/main` already held two commits from 2026-11-06. Nothing was force-pushed. The previous tip is preserved on `backup/remote-main-2026-11-06`.

## Decisions

| Decision                                                    | Reason                                                    | Trade-off                                                                                                       |
| ----------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Keep the single-file build                                  | Offline-first PWA, and the existing hosting configuration | `index.html` is about 917 KB (about 461 KB gzipped) because fonts and grammars are inlined.                     |
| Share links live in the URL fragment                        | Browsers do not send fragments to servers                 | Anyone with the link can read the code. The UI says so.                                                         |
| Re-encode photos as JPEG on-device                          | Removes EXIF metadata such as GPS and bounds memory       | Photos lose transparency, which is acceptable for backgrounds.                                                  |
| Library uses localStorage with explicit save                | User control, no account, no server                       | Subject to browser storage limits and cleared with site data.                                                   |
| Merge `origin/main` with `-s ours` instead of force-pushing | Keeps the remote history intact                           | Files that exist only on the remote are removed from main's tree. They remain in the backup branch and history. |

## v1.2 additions

- Undo/redo for style settings (`src/lib/history.ts`, 8 unit tests, 1 E2E scenario).
- Themes researched from upstream sources: Poimandres (https://github.com/ajaxdude/opencode-ai-poimandres-theme lists the original palette), Material Palenight (https://github.com/seansmoove27/palenight-exact-theme, Shiki values), Ayu Mirage (`ayu` npm package 8.0.1, background #242936; its translucent comment colour was flattened to an opaque tone that passes WCAG AA).
- Fonts verified on the registry as OFL-1.1: Intel One Mono, Commit Mono, Fragment Mono.
- **Workflow delivery:** GitHub rejected `.github/workflows` pushes because the publishing token lacked the `workflow` permission. Templates now live in `docs/workflows/` with an activation script.
- **Toolchain:** TypeScript is pinned to 6.0.3 because typescript-eslint does not support TypeScript 7.0. `.npmrc` sets `legacy-peer-deps` until peer ranges align.

## Deferred

- A multi-file build, so fonts and grammars load on demand and first load shrinks.
- A custom theme editor with per-token colours and contrast warnings.
- Localisation (including Hindi UI strings) and right-to-left checks.
- WebKit (Safari) and Firefox end-to-end projects, plus visual regression snapshots.
- Verification of the container and hosted CI in your own environment. Docker is not available in the development sandbox.
- Pinning third-party Actions to commit SHAs, if your organisation's policy requires it.

## Known gaps

- `docs/ARCHITECTURE.md` and `docs/CUSTOMIZATION.md` still describe v1.0 in places. Update them the next time those areas change.
