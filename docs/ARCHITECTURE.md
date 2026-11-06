# Architecture

Snapcode is a client-side application. No server API or code execution is involved.

## Flow

`ControlPanel -> App state -> CodePreview -> html-to-image -> PNG / clipboard / share sheet`

- `App.tsx` owns code, language, title, styling, notifications, and export locking.
- `ControlPanel.tsx` presents controlled Code, Style, and Export tabs.
- `CodePreview.tsx` is memoized and renders the exact exportable DOM.
- `StudioDialog.tsx` uses native modal dialogs for focus containment and Escape handling.
- `ErrorBoundary.tsx` provides a last-resort recovery screen.

## Rendering

Highlight.js registers only the supported grammars. Token HTML is memoized by code and language. Theme changes update CSS variables without re-highlighting. React's deferred value keeps the editor responsive while the preview catches up. Automatic detection samples up to 16,000 characters; explicit language selection is recommended for ambiguous code.

The actual canvas is rendered at its native CSS size. `ResizeObserver` measures it and the available preview area. A transform on its parent fits the display without changing output pixels. Actual-size mode permits scrolling. Export dimensions are calculated from the untransformed node.

## Fonts and Export

`lib/fonts.ts` imports WOFF2 files as data URLs. The same font-face definitions are installed in the page and passed explicitly through `fontEmbedCSS` to html-to-image. Export never depends on fetching or scraping a remote stylesheet, and it does not silently switch fonts when offline.

Before capturing, the app waits for fonts and validates dimensions. The renderer captures at 2x, 3x, or 4x; automatic downscaling is disabled. The checkerboard is excluded with a data-attribute filter. A Blob is downloaded through a temporary object URL that is later revoked.

An immediate ref-based lock prevents duplicate exports before React state updates. Controls are disabled during rendering. Clipboard receives a Blob promise in the same gesture. Native sharing is prepared first, then submitted from a second button click so asynchronous rendering cannot expire the required activation.

## Persistence and Privacy

Only style preferences are persisted, after a short debounce. `sanitizeSettings()` guards every load and change. Access to the storage property itself is inside a try/catch, covering blocked storage environments. Code and imported file contents live only in memory and are lost when the tab reloads or closes.

## Build

1. `generate-icons.mjs` creates 192px and 512px icons from the tracked SVG and copies downloadable docs.
2. The existing Vite single-file plugin embeds JS/CSS. Fonts are already inline data URLs.
3. `finalize-build.mjs` derives CSP hashes, versions the worker cache from the generated HTML, writes deployment policies, and verifies every manifest icon.

The script/CSP/cache version form one release artifact. Do not transform or minify generated HTML after this step without regenerating its hashes.

## Tests

Unit tests cover grammar registration, escaping, catalog integrity, settings validation, file rejection, output limits, and filenames. Browser tests run against the production build, not a development-only mock, and inspect actual PNG dimensions and alpha pixels. Desktop and mobile Chromium are covered; native platform sheets and other browser engines require manual checks.
