# Third-Party Notices

Snapcode's own code is MIT licensed. Dependencies retain their original copyrights and license terms.

- React, React DOM, Vite, Tailwind CSS, html-to-image, clsx, and tailwind-merge: MIT-family open-source licenses; consult each installed package's license.
- Highlight.js: BSD-3-Clause.
- Lucide: ISC.
- gifenc (animated GIF encoding): MIT.
- Inter, JetBrains Mono, Fira Code, Cascadia Code, IBM Plex Mono, Source Code Pro, Victor Mono, Martian Mono, Inconsolata, Space Mono, Roboto Mono, Geist Mono, Red Hat Mono, Azeret Mono, DM Mono, Anonymous Pro, and Overpass Mono: SIL Open Font License 1.1. Fontsource packages include their upstream font license files.
- Ubuntu Mono: Ubuntu Font License. Review its distinct terms before redistributing a modified font.

Local font files are bundled without modification. Keep upstream font licenses with redistributed source and deployment artifacts. The icon/documentation generation script copies installed font license text into `public/licenses/` for distribution.

The release workflow generates a CycloneDX SBOM from installed production dependencies. A dependency scan and this summary do not replace a legal review for your organization's use.
