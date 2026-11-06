#!/usr/bin/env sh
# Review and commit workflow files without storing credentials in git config.
# Usage: GH_TOKEN='your-token-with-workflows-scope' sh scripts/activate-workflows.sh
set -eu

if [ -z "${GH_TOKEN:-}" ]; then
  echo "Set GH_TOKEN to a token with Contents and Workflows: Read and write." >&2
  exit 2
fi
if ! git rev-parse --show-toplevel >/dev/null 2>&1; then
  echo "Run this script from a git checkout of Snapcode." >&2
  exit 2
fi

git diff --check
# The reviewed templates are mirrored in docs/workflows so they remain available even
# when a token without Workflows scope cannot push .github/workflows directly.
if [ -d docs/workflows ]; then
  mkdir -p .github/workflows
  for template in docs/workflows/*.yml; do
    [ -f "$template" ] || continue
    target=".github/workflows/$(basename "$template")"
    if [ ! -e "$target" ]; then
      cp "$template" "$target"
    fi
  done
fi
git add .github/workflows
if git diff --cached --quiet; then
  echo "No workflow changes to commit."
  exit 0
fi
git commit -m "ci: enable Snapcode quality, security, and release workflows"
# The token is passed only to this process and is never written to the remote URL.
AUTH="$(printf '%s' "x-access-token:${GH_TOKEN}" | base64 | tr -d '\n')"
git -c "http.https://github.com/.extraheader=AUTHORIZATION: basic ${AUTH}" push origin HEAD:main
unset AUTH GH_TOKEN
