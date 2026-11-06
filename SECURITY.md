# Security Policy

## Reporting

Use this repository's **Security > Report a vulnerability** feature (`https://github.com/SudhirDevOps1/snapcode/security/advisories/new`) if private reporting is enabled. Otherwise, contact the repository maintainer (`@SudhirDevOps1`) through a private contact method on their profile. Do not publish vulnerable snippets, secrets, or exploit details in public issues.

Operators must configure and publish a real security contact before offering public support. This project does not invent a monitored inbox or promise response SLAs.

## Trust Boundaries

- Pasted code is data, never executed. Highlight.js escapes code before token markup is inserted. Unit and browser tests cover script and image-event payloads.
- Code, imported files, clipboard output, and generated images are not uploaded. Runtime fonts are local data URLs. There are no analytics or external APIs.
- Local storage contains only validated style preferences. Unknown identifiers, non-finite numbers, out-of-range values, and invalid colors are rejected or clamped.
- Storage failures do not break startup. Import limits are checked before rendering; binary and oversized files are rejected without truncation.
- Export checks pixel count and dimensions before allocating a canvas. These are practical bounds, not a guarantee against all browser memory pressure.
- Sharing is explicit and uses a second user gesture after rendering, preserving native API activation requirements. Clipboard errors have a download fallback.

## Production Hardening

`npm run build` computes SHA-256 hashes of inline production scripts and writes a CSP to the HTML and deployment headers. Production script policy does not allow `unsafe-inline` or `unsafe-eval`. Inline **styles** remain allowed because the editor and renderer require dynamic styling.

The dev server has a looser policy for HMR. Never expose the development server as a production service.

Generated Netlify/Cloudflare and nginx response policies include CSP `frame-ancestors 'none'`, `X-Frame-Options`, `nosniff`, restrictive permissions, COOP, and a no-referrer policy. Vercel uses the strict CSP in generated HTML and HTTP `X-Frame-Options` for framing protection. Configure HTTPS and HSTS at the hosting layer after reviewing your domain policy.

The service worker only handles same-origin GET requests, bounds its cache to known assets, and deletes only Snapcode-owned cache names. Updates wait for existing tabs to close so unsaved code is not forcibly reloaded.

The container runs as an unprivileged user. Its build and smoke-test job checks headers and the health endpoint. Running CI or a container locally is not the same as auditing a deployed environment.

## Dependencies

Use `npm ci`, review lockfile changes, and run both `npm audit --omit=dev` and `npm audit`. CI blocks high/critical production findings. Development advisories still require triage; they are not automatically harmless. Do not use `npm audit fix --force` without understanding and testing breaking changes.

The lockfile uses a `minimatch` 11.0.5+ override to address GHSA-g3hv-75wg-m249 in the lint toolchain. The patched package supports the project's Node versions and both module formats. Lint, typecheck, unit, build, and browser checks must pass whenever this override changes; remove it once upstream dependency ranges include the fixed release.

GitHub Actions use maintained major-version references and Dependabot updates. Organizations requiring immutable action versions should pin reviewed commit SHAs under their own supply-chain policy.

## Operator Checklist

- Require CI, browser checks, human review, and protected release tags.
- Enable private vulnerability reporting, dependency alerts, and secret scanning.
- Verify headers, MIME types, HTTPS, offline reload, PNG export, and rollback in the deployed environment.
- Do not inject telemetry or error-reporting tools that collect editor contents without explicit consent and an updated privacy policy.
- Restrict build credentials and give releases write permissions only in the publishing job.

No claim of SOC 2, ISO 27001, HIPAA, GDPR certification, or third-party penetration testing is made.
