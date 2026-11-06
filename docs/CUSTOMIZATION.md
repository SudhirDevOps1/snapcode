# Customization

## Languages

Register a grammar in `src/lib/highlight.ts` and add its id to `HLJS_LANGS`. Add matching entries to `LANGUAGES`, `SAMPLES`, `DEFAULT_TITLES`, and `EXT_TO_LANG` in `src/lib/data.ts`. The file picker accepts any file; content and size are validated independently of the extension.

Run `npm test`: catalog tests catch missing samples, unregistered grammars, invalid mappings, and duplicate ids. Update the README language list.

## Themes and Backgrounds

Every theme in `THEMES` provides all token colors required by `EditorTheme`. New themes automatically appear in the selector. Check text contrast and exported colors, not just thumbnail aesthetics.

`BACKGROUNDS` supplies CSS for the canvas and a swatch preview. The compact strip shows the first sixteen curated gradient entries; pattern presets (`Starfield`, `Blueprint`, `Studio Grid`, `Diagonal`) are available through More options. Custom gradients, solid colors, and transparency are managed in validated settings.

Style presets reference existing theme, background, font, and shadow ids. Integrity tests check those references. Applying a preset must never change the user's code.

## Fonts

Fonts are already self-hosted. Import an appropriate licensed WOFF2 file with Vite's `?inline` suffix in `src/lib/fonts.ts`. Add its family and id to `FONTS`, register the face in the `faces` collection, and update third-party notices.

Both the UI and export CSS derive from that collection. Do not introduce a Google Fonts stylesheet: it would weaken privacy and offline guarantees. Add extra Unicode subsets if your audience needs them, and verify glyph output in PNGs.

## Branding

- Logo: `src/components/Brand.tsx` and `public/icon.svg`.
- App name, description, and icons: `index.html` and `public/manifest.webmanifest`.
- Colors and spacing: `src/index.css`.
- Canvas watermark: `CodePreview.tsx`.

Run `npm run icons` or `npm run build` after changing the SVG. Never edit generated PNG icons by hand.

## Limits

`MAX_FILE_BYTES` and `MAX_CODE_CHARS` live in `data.ts`; pixel limits live in `export.ts`. Settings ranges are validated in `settings.ts`. If you raise a limit, update corresponding controls, tests, documentation, and memory testing on low-end mobile devices.
