# Threat model (STRIDE-lite)

**Scope:** a static, client-side web app. It has no backend, no accounts, and no runtime third-party requests.

## Assets

| Asset                         | Where it lives                                  | Sensitivity                  |
| ----------------------------- | ----------------------------------------------- | ---------------------------- |
| Pasted or opened code         | Browser memory, for this tab only               | High                         |
| Saved snippets (library)      | `localStorage`, only after explicit save        | High                         |
| Style preferences             | `localStorage`                                  | Low                          |
| Photo backgrounds             | Browser memory, re-encoded on-device            | Medium                       |
| Share links                   | URL fragment, held by whoever receives the link | High (they contain the code) |
| Exported files                | The user's downloads folder                     | Depends on the user          |
| Repository and CI credentials | GitHub, not in the application                  | High                         |

## Trust boundaries

1. **User input to application:** pasted text, opened files, dropped files, photos, URL fragments, and `localStorage` values are all untrusted.
2. **Application to browser APIs:** clipboard, Web Share, canvas, `CompressionStream`, and `createImageBitmap`.
3. **Application to network:** none at runtime. Enforced by CSP and by an offline end-to-end test.
4. **Contributors to CI:** GitHub Actions permissions, tokens, and third-party actions.

## Threats and mitigations

| ID  | Threat                                                | Mitigation                                                                                                                                                                                                                 | Verification                                                                                      |
| --- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| T1  | XSS through pasted code rendered as HTML              | highlight.js escapes its output. Plain-text fallback is escaped. Production CSP allows only hashed scripts. No `eval`.                                                                                                     | Unit tests with script and image-event payloads. E2E: markup stays inert and CSP reports nothing. |
| T2  | Malicious share link: oversized, bomb, or malformed   | Token charset and length checks. Decompression output capped at 400 KB. Code capped at 100,000 characters. Settings sanitized. Language allow-list. Version check.                                                         | 10 unit tests, including a zip-bomb case and a size-limit case.                                   |
| T3  | CSS injection through settings or imported style JSON | Enum allow-lists, numeric clamps, strict hex colours. Imported JSON capped at 8 KB.                                                                                                                                        | Settings unit tests.                                                                              |
| T4  | Tampered `localStorage` for the library or settings   | Sanitized on every load. Per-item validation. Maximum of 30 items. Corrupt data is ignored, not thrown.                                                                                                                    | Library and settings unit tests.                                                                  |
| T5  | Malicious image as a background                       | 8 MB cap. MIME allow-list. Decoded through `createImageBitmap`. Downscaled to 2400 px. Re-encoded as JPEG, which strips metadata. Object URLs revoked.                                                                     | E2E photo test: no CSP violations or page errors.                                                 |
| T6  | Memory exhaustion during export                       | 16,384 px per edge and 32 megapixels maximum. Export lock. Controls disabled while rendering.                                                                                                                              | Unit tests for `exportDimensions`.                                                                |
| T7  | Data leaking to third parties                         | Fonts embedded. No analytics. `connect-src 'self' blob:`.                                                                                                                                                                  | Offline E2E test asserts zero external requests.                                                  |
| T8  | Clickjacking                                          | `frame-ancestors 'none'` and `X-Frame-Options: DENY` in the generated headers. A `<meta>` tag cannot set `frame-ancestors`.                                                                                                | Security headers generated at build. Container smoke test in CI.                                  |
| T9  | Compromised dependency or action                      | Lockfile with `npm ci`. Production audit gate at high severity. Dependency review on pull requests. Dependabot. CodeQL. Scorecard. SBOM and build-provenance attestation on release. Least-privilege workflow permissions. | CI jobs and release workflow.                                                                     |
| T10 | Secret exposure in the repository, logs, or chat      | No secrets in code. Environment files ignored. Use short-lived, minimally scoped tokens. Rotate any token that has been shared in chat or logs.                                                                            | Process and review. Secret scanning with push protection (repository setting).                    |
| T11 | Spoofed titles or names in the UI                     | Titles limited to 100 characters and names to 60. All text rendered by React, which escapes it.                                                                                                                            | Code review and unit tests.                                                                       |

## Residual risks

- **`style-src 'unsafe-inline'`** remains, because the canvas uses dynamic inline styles. A future change could move these to CSSOM-only updates.
- **Pasted code stays in memory** until the tab closes. A share link is as sensitive as the code it contains.
- **Clipboard and Web Share behaviour** varies by browser, and users can deny permission.
- **Hosting assumption:** HSTS and the generated headers must be applied at the edge. The repository ships the configuration, but deployment is outside its control.

## Review cadence

Review this model whenever a new input path, storage key, network call, or CI permission is added.
