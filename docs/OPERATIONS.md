# Operations and Release Checklist

## Ownership

This repository supplies a static application and verification tooling. The deployer owns the domain, hosting policy, support contacts, dependency decisions, incident response, and any contractual guarantees. Configure private security reporting before opening the project to public reports.

## Before Merge

1. Run `npm ci`, `npm run check`, and `npm run test:e2e`.
2. Review browser traces for failed tests and ensure no external code or font requests were introduced.
3. Review `npm audit` separately from the production dependency gate; document decisions on unresolved tooling advisories.
4. Require green CI, CodeQL where available, and human review through branch protection.
5. Keep tokens out of build arguments, client code, and workflow logs. This application needs no runtime secrets.

## Before Release

1. Update `CHANGELOG.md`; bump `package.json` with `npm version` and push its matching tag.
2. The release verification job checks types, formatting, lint, units, real browser exports, and the production audit.
3. Only the publishing job receives repository write permission. It publishes the verified ZIP, CycloneDX SBOM, and SHA-256 checksums.
4. Download the release, verify its checksum, and test on staging before promotion.

Workflows are configuration until they have run successfully in your repository. CodeQL for private repositories can require an additional GitHub subscription. Major action tags are tracked by Dependabot; pin reviewed SHAs if your policy requires immutable references.

## Deployment Checks

- `/healthz` is healthy in the container; the root page and PNG icons return the right MIME types.
- Response headers include the generated script-hash CSP where supported, `nosniff`, and framing protection.
- PNG exports contain the actual code, expected dimensions, correct font, and transparent pixels when requested.
- No horizontal overflow at 320px, 390px, 768px, and desktop sizes; the keyboard can escape the editor.
- Offline reload and font switching work after the first successful online cache installation.
- Native clipboard, share, and installation work on the target browsers; they are explicitly not covered by OS-level automation here.

## Rollback

Redeploy the previous complete release artifact, including its matching HTML, worker, manifest, headers, and icons. Never roll back only the JavaScript or only the worker. Online navigations revalidate the shell; offline users keep the cached release until reconnecting. Existing tabs are not forcibly refreshed.

If a worker cache is corrupted, use the browser's site-data controls to remove that site's storage, reconnect, and reload. This also removes style preferences. Imported code was never stored there.

## Monitoring

Use uptime and HTTP-header probes without collecting editor data. The application has no telemetry. Error screens and local notifications are the only built-in reporting mechanisms. Do not claim an incident SLA until an operator has staffed and published one.

## Manual Browser Matrix

Before launch, validate current Chrome, Edge, Firefox, macOS Safari, iOS Safari, and Android Chrome. Confirm exported glyphs for the languages your audience uses. The checked-in automated suite covers desktop and mobile Chromium, not every browser engine or native OS permission flow.
