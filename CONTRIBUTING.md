# Contributing

Keep Snapcode small, private, accessible, and reliable. Discuss large changes before implementing them, and follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Setup

```sh
nvm use
npm ci
npm run dev
```

Use Node 22 LTS. No secrets or environment configuration are required. Runtime network requests must not transmit user code, and fonts must remain local.

## Workflow

1. Create a focused branch, such as `feat/kotlin` or `fix/transparent-export`.
2. Add unit tests for logic and browser tests for visible behavior.
3. Format, then run the complete local verification sequence:

```sh
npm run format
npm run check
npx playwright install --with-deps chromium
npm run test:e2e
```

4. Update the relevant documentation and the Unreleased section of `CHANGELOG.md`.
5. Open a pull request with screenshots for UI changes and an explanation of any privacy, security, dependency, or output-size impact.

CI additionally checks supported Node versions, production dependency advisories, and the Docker runtime. Local `check` does not execute those hosted jobs.

## Code Guidelines

- TypeScript strict mode; keep pure logic in `src/lib`.
- Use actual buttons, explicit labels, focus-visible states, and reduced-motion behavior.
- Never execute pasted code or put unescaped user text into HTML.
- Do not silently truncate imports, change a user's code when applying a preset, or persist code without consent.
- Keep the preview and exported image consistent, including fonts and transparency.
- Check keyboard navigation and a 320px-wide viewport.

Use Conventional Commit messages where practical: `feat:`, `fix:`, `docs:`, or `chore:`.

## Where to Work

| Change                           | Location                                           |
| -------------------------------- | -------------------------------------------------- |
| Languages, themes, and presets   | `src/lib/data.ts`, `src/lib/highlight.ts`          |
| Fonts and glyph coverage         | `src/lib/fonts.ts`                                 |
| Styling and interaction controls | `src/components/ControlPanel.tsx`, `src/index.css` |
| Image capture and limits         | `src/lib/export.ts`                                |
| Safe file import                 | `src/lib/files.ts`                                 |
| Offline behavior                 | `public/sw.js`, `scripts/finalize-build.mjs`       |
| Browser tests                    | `e2e/studio.spec.ts`                               |

Read [customization](docs/CUSTOMIZATION.md) and [architecture](docs/ARCHITECTURE.md) before extending the catalogs. Follow [operations](docs/OPERATIONS.md) for releases.

Security issues belong in a private report, not a public issue. See [SECURITY.md](SECURITY.md).
