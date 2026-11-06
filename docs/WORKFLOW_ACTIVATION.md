# Activating GitHub Actions workflows

The application and documentation are already on `main`. Workflow files are maintained in `.github/workflows/` in the project source. A reviewed mirror is also kept in `docs/workflows/` so the definitions remain available if a token cannot push the protected directory. The activation script copies only missing templates; it never overwrites an existing workflow. If your GitHub token cannot push that directory, GitHub returns:

> refusing to allow a Personal Access Token to create or update workflow ... without `workflow` scope

This is a GitHub permission boundary, not an application failure.

## Owner setup (one time)

1. **Rotate the token that was pasted into chat.** Treat it as compromised. Do not reuse it.
2. Create a new fine-grained token for only `SudhirDevOps1/snapcode` with:
   - **Contents: Read and write**
   - **Workflows: Read and write** (required for `.github/workflows/**`)
   - **Actions: Read** (optional, for inspecting runs)
   - **Pull requests: Read and write** (optional, for opening PRs)
3. Keep it in your password manager or GitHub secret storage. Never put it in `README.md`, source code, `.git/config`, shell history, or CI logs.
4. In the repository, enable Actions, Dependabot alerts, secret scanning, and private vulnerability reporting. CodeQL and dependency review may require GitHub Code Security on private repositories.

## Push the workflow commit

From the project root, after reviewing the workflow files:

```bash
git add .github/workflows
git commit -m "ci: enable Snapcode quality, security, and release workflows"
git push origin main
```

If the token still lacks the Workflows permission, use a browser or a token with that permission. Do not bypass the restriction by changing workflow permissions or using an untrusted credential.

## Required checks after activation

- `CI / Quality (Node 22)` and `CI / Quality (Node 24)`
- `CI / Browser tests (desktop and mobile)`
- `CI / Production dependency audit`
- `CI / Container build and smoke test`
- `CodeQL / Analyze JavaScript and TypeScript`
- `Dependency review / Review dependency changes` on pull requests

The release workflow runs only for tags named `vX.Y.Z` and verifies that the tag matches `package.json` before publishing a ZIP, CycloneDX SBOM, checksums, and provenance attestation.

## Least-privilege operating rules

- Keep workflow-level permissions at `contents: read` unless a job needs more.
- Only the release publish job gets `contents: write`, `id-token: write`, and `attestations: write`.
- Do not add personal access tokens to workflow files. Use `GITHUB_TOKEN` or repository secrets with the smallest scope.
- Pin third-party actions to reviewed commit SHAs if your organization requires immutable action references.
- Review action upgrades and run the full local check suite before merging them.
