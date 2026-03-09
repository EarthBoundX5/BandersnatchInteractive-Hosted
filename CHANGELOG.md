# Changelog

All notable changes to this fork of [mehotkhan/BandersnatchInteractive](https://github.com/mehotkhan/BandersnatchInteractive) are documented here.

Modified by [EarthBoundX5](https://github.com/EarthBoundX5) with assistance of Claude Sonnet 4.6.

---

## [1.2.0] — 2026-03-09

### Added
- **`.htaccess`** — Apache equivalent of `web.config`. Registers the same MIME types as `web.config`, sets `index.html` as the default document, disables directory listing, and adds `Accept-Ranges`, `X-Content-Type-Options`, `X-Frame-Options`, and `X-Robots-Tag` response headers via `mod_headers`. Requires `mod_mime` and `mod_headers` to be enabled, and `AllowOverride All` set in the Apache virtual host config.

### Changed
- **`README.md`** — Added `.htaccess` to the folder structure. Expanded the server configuration section to cover both IIS and Apache setup steps side by side.
- **`CHANGELOG.md`** — Added `.htaccess` entry to the 1.0.0 Added section.

---

## [1.1.0] — 2026-03-09

### Added
- **`README.md`** — Rewrote from scratch to reflect the actual state of the project: what changed from the original, correct folder structure (including `SegmentMap.js` and `choices/`), accurate setup steps using `data-src`, updated troubleshooting table, and keyboard controls reference.
- **`LICENSE`** — Original MIT license text preserved verbatim. Added an addendum noting that modifications in this fork are contributed under the same MIT terms, and clarifying the relationship with the Unlicense carried by the original `scripts.js` and `index.html`.
- **`CHANGELOG.md`** — Created. Documented all changes made across the session as a single 1.0.0 entry.
- **`robots.txt`** — Instructs all well-behaved crawlers not to index the site. Includes explicit rules for Googlebot, Bingbot, DuckDuckBot, Slurp, Baiduspider, YandexBot, facebookexternalhit, Twitterbot, GPTBot, Claude-Web, and CCBot.

---

## [1.0.0] — 2026-03-09

This is the version confirmed working as expected. All items below represent the complete set of changes from the original upstream repo to this release.

### Added
- **`web.config`** — IIS configuration file. Registers the `.mkv` MIME type (`video/x-matroska`), adds MIME types for `.mp4`, `.webm`, `.vtt`, `.js`, and `.css`, sets `index.html` as the default document, disables directory browsing, and removes the default IIS 30 MB request size limit to allow large byte-range video requests to be served correctly.
- **Embedded Click to Play button** (`index.html`) — A play button styled as a dark circle with a white triangle and descriptive text, embedded directly in the landing page. Satisfies Chrome's requirement that `video.play()` must be called from a user gesture.
- **Full-screen buffering overlay** (`assets/scripts.js`) — After clicking Play, a dark full-screen overlay with a CSS spinner and status message appears while the video buffers from the server. Fades out automatically once the `canplay` event fires.
- **Deferred video loading** (`index.html`, `assets/scripts.js`) — The video file path is stored in a `data-src` attribute on the `<source>` element instead of `src`. The browser makes no network request to the video file until the user clicks Play.
- **`pointer-events: none` on `#wrapper-video`** (`index.html`) — The video wrapper is `position: fixed; width: 100%; height: 100%` and was silently intercepting all mouse clicks across the full page, making the Reset all link and authors links unclickable. Initialized as `pointer-events: none` and restored to `auto` inside `hostedPlay()` once the user clicks Play.

### Changed
- **`index.html`** — `<source>` element `src` attribute changed to `data-src` to implement deferred video loading.
- **`index.html`** — `<input type="file">` hidden via `style="display:none;"` to prevent the invisible full-page file input overlay from blocking mouse clicks.
- **`index.html`** — Removed the drag-and-drop file tips block (tested filenames, drag-and-drop instructions, subtitle change instructions, Chrome-only notice from the tips list).
- **`index.html`** — Removed the language translation `<select>` element and its associated `change` event listener `<script>` block at the bottom of the page.
- **`index.html`** — Retained two bullets from the original file tips: "This player is known to work only on Google Chrome or Chromium" and "Note: do not use the full screen button in the video player if you enable Show Controls." Both are grouped together below the play button.
- **`index.html`** — Added the hosted video credit to the authors line: `Modified for Hosted Play by EarthBoundX5 with assistance of Claude Sonnet 4.6`.
- **`assets/scripts.js`** — `getAttribute("src") == ''` check in `window.onload` changed to `getAttribute("data-src")` to match the deferred loading approach.
- **`assets/scripts.js`** — Added `window.hostedPlay()` function. Called by the Play button's `onclick`. Hides the play button, injects the buffering overlay into the DOM, sets `video.src` from `data-src` and calls `video.load()` (triggering the first network request to the video), restores `pointer-events: auto` on `#wrapper-video`, registers `canplay`/`playing` listeners to fade and remove the overlay, then calls `startPlayback()`.

### Unchanged
- `assets/bandersnatch.js` — original, unmodified.
- `assets/SegmentMap.js` — original, unmodified.
- `assets/styles.css` — original, unmodified.
- `assets/choices/en.js`, `ru.js`, `fr.js` — original, unmodified.
- `subtitle/*.vtt` — original, unmodified.
- All interactive game logic in `assets/scripts.js` (segment navigation, choice handling, state persistence, keyboard controls, fullscreen, breadcrumbs) — original, unmodified.

---

## [0.5.0] — 2026-03-09 — Play button text and layout polish

### Changed
- **`index.html`** — Play button circle and text color changed from white (`#fff`) to black (`#000`) to suit the light background of the landing page.
- **`index.html`** — Chrome-only bullet moved from above the play button to below it, grouped with the fullscreen note bullet in a single list.
- **`index.html`** — `<input type="file">` hidden (`display:none`) — identified as the cause of links being unclickable (it was an invisible full-page overlay).
- **`assets/scripts.js`** — Buffering state changed from an inline status message below the play button to a proper full-screen dark overlay with a CSS spinner, consistent with the appearance of the original drag-and-drop overlay. Overlay fades out on `canplay`.

---

## [0.4.0] — 2026-03-09 — Landing page polish

### Changed
- **`index.html`** — Removed language translation `<select>` and its `change` event `<script>` block.
- **`index.html`** — Removed all highlighted/drag-and-drop content from the file tips block, retaining only the Chrome-only bullet and the fullscreen note bullet.
- **`index.html`** — Play button restyled to match the original overlay appearance: dark semi-transparent circle (`rgba(0,0,0,0.75)`), white border, white triangle, title text "Bandersnatch Interactive Player", and subtitle text describing the hosted setup and buffering expectation.
- **`index.html`** — Added `pointer-events: none` to `#wrapper-video` to fix links being unclickable (partial fix; file input issue identified separately in 0.5.0).
- **`assets/scripts.js`** — Updated `hostedPlay()` to restore `pointer-events: auto` on `#wrapper-video` when Play is clicked.
- **`assets/scripts.js`** — Buffering message text updated to: "It may take some time to buffer depending on your connection."

---

## [0.3.0] — 2026-03-09 — Embedded play button

### Changed
- **`index.html`** — Full-screen play overlay replaced with an embedded play button inside the landing page `file-dummy` div, positioned where the file tips content was. The landing page menu, keyboard controls, Reset all link, and authors line remain visible around it.
- **`assets/scripts.js`** — `hostedPlay()` refactored: instead of removing a full-screen overlay, it hides the embedded play button, shows a buffering status message with an inline spinner in `#hosted-status`, and calls `startPlayback()`.

---

## [0.2.0] — 2026-03-09 — Chrome autoplay fix

### Problem
Chrome's autoplay policy blocks `video.play()` when called programmatically on page load without a prior user gesture. The page loaded the menu briefly, navigated to `/#1A`, then went black with `NotAllowedError: play() failed because the user didn't interact with the document first`.

### Changed
- **`assets/scripts.js`** — Instead of calling `startPlayback()` directly in `window.onload`, a full-screen dark overlay is injected into the DOM. Clicking the overlay counts as a user gesture, satisfying Chrome's autoplay policy. The overlay then calls `startPlayback()` and transitions to a buffering spinner that disappears once `canplay` fires.

---

## [0.1.0] — 2026-03-09 — Initial hosted video support

### Problem
The original player showed a drag-and-drop file selector on every page load. For a self-hosted IIS deployment where the video already lives on the server, this was unnecessary friction.

### Root cause (discovered during iteration)
- First attempt used a fully rewritten `scripts.js` that did not match the data structures in `bandersnatch.js`, causing `Cannot read properties of undefined (reading '0')` at `playSegment`.
- Second attempt used the correct original `scripts.js` but with a reconstructed `index.html` that had wrong element IDs, causing `SegmentMap is not defined` because the scripts were not loading in the correct context.
- Third attempt (this version) uses the original `scripts.js` and `index.html` verbatim from the upstream repo, with the single targeted change described below.

### Changed
- **`index.html`** — `<source id="video-source" src="">` changed to `<source id="video-source" src="video/bandersnatch.mkv">`. The existing `window.onload` logic in `scripts.js` already checks `if (video_source_selector.getAttribute("src") == '')` and calls `startPlayback()` when the src is non-empty, bypassing the file selector automatically.
- **`web.config`** — Created. Registers `.mkv` MIME type and other required IIS settings.

---

## Upstream base

This fork is based on the `master` branch of [mehotkhan/BandersnatchInteractive](https://github.com/mehotkhan/BandersnatchInteractive) as of early 2026, which itself incorporates contributions from [CyberShadow](https://github.com/CyberShadow) and is based on the original work by [joric](https://github.com/joric/bandersnatch).
