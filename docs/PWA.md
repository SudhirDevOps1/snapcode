# Installable and Offline

## First Visit

In a production build, `src/main.tsx` registers `/sw.js` after page load. The worker pre-caches the HTML shell, manifest, and icons. All code and font files are embedded in the HTML, so a successful cache installation includes every font option.

The footer displays **Offline ready** only after `navigator.serviceWorker.ready` resolves. No ready label is promised when a browser blocks registration or storage.

## Requests

| Request                          | Behavior                                                     |
| -------------------------------- | ------------------------------------------------------------ |
| Navigation                       | Network-first; cached app shell on network or server failure |
| Known static PWA assets          | Cache-first within the current version                       |
| Other same-origin resources      | Normal browser networking                                    |
| Cross-origin or non-GET requests | Never intercepted                                            |

There are no cross-origin runtime font requests. Cache names use the `snapcode-` prefix, and activation never deletes another application's caches.

## Updates

Postbuild derives the cache version from the production HTML. Changed code, styles, or embedded fonts automatically produce a new cache version. New workers install in the background but wait until existing tabs close; they do not force a reload that could discard code.

Serve the worker with `Cache-Control: no-cache`. On a new online navigation, HTML can refresh immediately. Existing fully offline tabs continue using their cached release until they reconnect.

## Installation

- Chrome/Edge: the header button triggers a deferred browser prompt when available, otherwise it opens instructions.
- iOS Safari: Share, then Add to Home Screen.
- Other browsers: installation and native shortcuts depend on platform support.

An actual home-screen installation requires supported browser/OS behavior and HTTPS. Desktop/mobile Chromium emulation does not certify installation on real devices.

## Verification

```sh
npm run build
npm run preview
```

Wait for **Offline ready**, switch DevTools to offline, reload, change font, and export. The Playwright suite automates that sequence against production output. Test a first-load failure and storage denial manually as part of deployment review.

Code is not persisted by the worker. Reloading the tab restores an example and your style settings, not your previous snippet.
