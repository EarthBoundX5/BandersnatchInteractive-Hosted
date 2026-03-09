# Changelog

All notable changes to this fork of [mehotkhan/BandersnatchInteractive](https://github.com/mehotkhan/BandersnatchInteractive) are documented here.

---

## [1.0.0] — 2026-03-09

Initial release of the IIS Hosted Edition, modified by [EarthBoundX5](https://github.com/EarthBoundX5) with assistance of Claude Sonnet 4.6.

### Added

- **`web.config`** — IIS configuration file that registers the `.mkv` MIME type (`video/x-matroska`), adds MIME types for `.mp4`, `.webm`, `.vtt`, `.js`, and `.css`, sets `index.html` as the default document, and removes the default IIS request size limit to allow large byte-range video requests to be served correctly.

- **`.htaccess`** — Apache equivalent of `web.config`. Registers the same MIME types, sets `index.html` as the default document, disables directory listing, and adds `Accept-Ranges`, `X-Content-Type-Options`, `X-Frame-Options`, and `X-Robots-Tag` response headers via `mod_headers`. Requires `mod_mime` and `mod_headers` to be enabled, and `AllowOverride All` in the Apache virtual host config.

- **`robots.txt`** — Instructs all well-behaved web crawlers and search engines not to index the site. Includes explicit rules for Googlebot, Bingbot, DuckDuckBot, GPTBot, CCBot, and others.

- **Embedded Click to Play button** (`index.html`) — A styled play button (dark circle with white triangle) embedded directly in the landing page. Replaces the need for any overlay and satisfies Chrome's user gesture requirement for `video.play()`.

- **Full-screen buffering overlay** (`assets/scripts.js`) — After clicking Play, a dark full-screen overlay with a spinning indicator and status text appears while the video buffers. It fades out automatically once the browser fires the `canplay` event.

- **Deferred video loading** (`index.html`, `assets/scripts.js`) — The video file path is stored in a `data-src` attribute instead of `src` on the `<source>` element. The browser makes no network request to the video until the user clicks Play, keeping the landing page fast and the server load minimal until intentionally triggered.

- **`pointer-events: none` on `#wrapper-video`** (`index.html`, `assets/scripts.js`) — The video wrapper element is `position: fixed` and covers the full viewport, which was silently blocking all mouse clicks on links in the `.contact` bar at the bottom of the page. It is initialized with `pointer-events: none` and restored to `auto` by `hostedPlay()` once the user clicks Play.

### Changed

- **`index.html`** — Removed the drag-and-drop file selector UI, including the `<input type="file">` overlay (which was also blocking clicks), the file tips bullet list (tested filenames, drag-and-drop instructions, subtitle change instructions), and the language translation `<select>` element and its associated `change` event listener `<script>` block.

- **`index.html`** — Retained two bullets from the original file tips: "This player is known to work only on Google Chrome or Chromium" and the note about not using the browser's built-in fullscreen button when Show Controls is enabled.

- **`index.html`** — Added the hosted video credit line to the authors paragraph: `Modified for Hosted Play by EarthBoundX5 with assistance of Claude Sonnet 4.6`.

- **`assets/scripts.js`** — `window.onload` block updated: the `getAttribute("src")` check is now `getAttribute("data-src")` to match the deferred loading approach. The `hostedPlay()` function is registered as a global on `window` so the inline `onclick` in `index.html` can call it.

- **`assets/scripts.js`** — The `fileinput` change event listener is retained for completeness but the input element is hidden, so drag-and-drop is effectively disabled without breaking the underlying script logic.

### Unchanged

- `assets/bandersnatch.js` — original, unmodified.
- `assets/SegmentMap.js` — original, unmodified.
- `assets/styles.css` — original, unmodified.
- `assets/choices/en.js`, `ru.js`, `fr.js` — original, unmodified.
- `subtitle/*.vtt` — original, unmodified.
- All interactive game logic in `assets/scripts.js` (segment navigation, choice handling, state persistence, keyboard controls, fullscreen, breadcrumbs) — original, unmodified.

---

## Upstream base

This fork is based on the `master` branch of [mehotkhan/BandersnatchInteractive](https://github.com/mehotkhan/BandersnatchInteractive) as of early 2026, which itself incorporates contributions from [CyberShadow](https://github.com/CyberShadow) and is based on the original work by [joric](https://github.com/joric/bandersnatch).
