# Deployment

## Build Contract

Use Node 22 LTS and the committed lockfile:

```sh
npm ci
npm run build
```

Deploy every file from `dist/` atomically. Do not run `vite build` directly: npm's prebuild and postbuild hooks generate icons, script-hash CSP, cache versions, and asset checks.

Serve at the **domain root** over HTTPS. A localhost preview is permitted for browser testing. Root paths in the manifest, worker, and HTML mean repository-subfolder hosting is not supported without coordinated changes.

## Static Hosts

### Netlify / Cloudflare Pages

Build command: `npm run build`. Output: `dist`. The generated `_headers` file has a release-specific CSP and no-cache revalidation policy. Verify that your host applies it; proxying or advanced platform routes can change header behavior.

### Vercel

The checked-in `vercel.json` configures Vite and security response headers. The release-specific script-hash CSP lives in the generated HTML meta tag. HTTP `X-Frame-Options: DENY` supplies framing protection, which a meta CSP cannot provide.

### Docker / nginx

```sh
docker build -t snapcode:local .
docker run --rm -p 8080:8080 snapcode:local
curl -f http://localhost:8080/healthz
curl -I http://localhost:8080/index.html
```

The multi-stage build uses Node 22 and unprivileged nginx on port 8080. A generated security include contains the exact script hashes; it is used at server scope so cache rules do not accidentally discard inherited security headers. `/healthz` returns `ok`. Missing static assets return 404 rather than an HTML app shell.

Terminate TLS at your ingress or load balancer. Configure HSTS there only after confirming the domain's HTTPS policy. If using a read-only container filesystem, supply writable tmpfs mounts for nginx runtime directories and validate with your orchestrator.

### Other Servers

Apply the generated `_headers` or nginx policy equivalently. Keep HTML and `sw.js` revalidating; content is also cached locally by the worker. Set MIME types correctly, especially for JS, icons, and the web manifest. Do not cache 404 responses as app assets.

## CSP

Production scripts are allowed by SHA-256 hash. Styles use `unsafe-inline` for dynamic editor styles; fonts use `data:` and images use `data:`/`blob:` for PNG rendering. Runtime network access is restricted to the same origin. Neither remote fonts nor eval are needed.

Do not inject inline analytics scripts or CDN HTML rewriting after a build. They will be blocked or invalidate the content hashes. Rebuild for any JavaScript change.

## Subpaths

The distributed configuration assumes `/`. If a subpath is required, coordinate Vite's base, asset references, service worker registration and scope, its precache paths, and manifest URLs. Then rerun all offline and export tests at the actual path. Changing only Vite's base is insufficient.

## Launch Gate

- Check deployment-level HTTPS, CSP hashes, framing protection, and MIME types.
- Verify PNG download, transparent export, and font changes on a real phone.
- Load once online, wait for "Offline ready", disconnect, reload, and export.
- Verify install prompts on the intended browser and OS.
- Run the container and GitHub workflows in your own environment; configuration files alone are not proof of successful deployment.
- Store the previous complete artifact for rollback. See [operations](OPERATIONS.md).
