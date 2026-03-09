# Bandersnatch Interactive Player — IIS Hosted Edition

This is a modified version of [mehotkhan/BandersnatchInteractive](https://github.com/mehotkhan/BandersnatchInteractive), itself based on [joric/bandersnatch](https://github.com/joric/bandersnatch).

The original project required users to drag and drop a local copy of the video file onto the page each time. This fork is intended for self-hosted deployments — specifically IIS on Windows — where the video file lives on the server. Users simply click Play and the film begins.

---

## What Changed From the Original

- The video is served directly from the server. No drag-and-drop required.
- The landing page has been cleaned up: drag-and-drop instructions and the language translation selector have been removed.
- A **Click to Play** button is embedded in the landing page. Clicking it satisfies Chrome's autoplay policy and begins buffering.
- The video file is not fetched at all until the user clicks Play, keeping the landing page lightweight.
- After clicking Play, a full-screen buffering overlay appears and fades out automatically once the video is ready.
- A `robots.txt` is included to discourage search engine indexing.
- A `web.config` is included to register the MKV MIME type and configure IIS for large file serving.

---

## Requirements

- **Windows Server or Windows 10/11** with IIS installed
- **Google Chrome or Chromium** (the player does not work in Firefox due to codec limitations)
- The full Bandersnatch video file (duration **5:12:14**)
  - Tested with `Black.Mirror.Bandersnatch.2018.720p.WEB-DL.x264.DUAL.mkv`
  - Also works with the 1080p and 720p MULTi NF WEB-DL variants

---

## Folder Structure

```
BandersnatchInteractive/
├── index.html                  ← main page (modified)
├── web.config                  ← IIS MIME type and request size configuration
├── .htaccess                   ← Apache equivalent of web.config
├── robots.txt                  ← discourages search engine indexing
├── assets/
│   ├── scripts.js              ← player logic (modified)
│   ├── bandersnatch.js         ← Netflix segment/moment data  [from original repo]
│   ├── SegmentMap.js           ← segment timing map           [from original repo]
│   ├── styles.css              ← player styles                [from original repo]
│   └── choices/
│       ├── en.js               ← English choice text          [from original repo]
│       ├── ru.js               ← Russian choice text          [from original repo]
│       └── fr.js               ← French choice text           [from original repo]
├── subtitle/                   ← VTT subtitle files           [from original repo]
│   └── *.vtt
└── video/
    └── bandersnatch.mkv        ← YOUR VIDEO FILE goes here
```

Files marked `[from original repo]` must be downloaded separately — they are not included here.

---

## Setup

### 1. Get the original repo files

Download the following from [mehotkhan/BandersnatchInteractive](https://github.com/mehotkhan/BandersnatchInteractive):

- `assets/bandersnatch.js`
- `assets/SegmentMap.js`
- `assets/styles.css`
- `assets/choices/en.js`
- `assets/choices/ru.js`
- `assets/choices/fr.js`
- The entire `subtitle/` folder

> **Do not** copy the original `index.html` or `assets/scripts.js` — use the modified versions from this repo instead.

### 2. Place your video file

Create a `video/` subfolder and put your MKV inside it:

```
video/bandersnatch.mkv
```

If your file has a different name, update the `data-src` attribute on the `<source>` element in `index.html`:

```html
<source id="video-source" data-src="video/your-filename-here.mkv">
```

### 3. Configure your web server

**If using IIS:**

1. Open **IIS Manager**.
2. Create a new site (or use an existing one).
3. Set the **Physical Path** to your `BandersnatchInteractive/` folder.
4. Assign a port (e.g. `8080` for local use, `80` for standard HTTP).
5. Ensure `web.config` is in the site root — it registers the `.mkv` MIME type and removes the default request size cap so large byte-range video requests are served correctly.
6. In **Server Manager → Add Roles and Features → Web Server (IIS)**, confirm that **Static Content** is checked under `Web Server > Common HTTP Features`. Without this, IIS will not serve `.html`, `.js`, `.css`, or video files.

**If using Apache:**

1. Place `.htaccess` in the site root alongside `index.html`.
2. Ensure `mod_mime` and `mod_headers` are enabled (`a2enmod mime headers` on Debian/Ubuntu).
3. Ensure `AllowOverride All` (or at minimum `AllowOverride FileInfo Options`) is set for your site's directory in your Apache virtual host config or `httpd.conf`. Without this, Apache ignores `.htaccess` entirely.
4. Restart Apache (`sudo systemctl restart apache2` or `sudo service httpd restart`).

### 4. Open in Chrome

Navigate to your site in Google Chrome:

```
http://localhost:8080/
```

Click the **Click to Play** button. A buffering overlay will appear while the video loads from the server, then fade out when playback begins.

---

## Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| Page loads but video never starts | Open the browser console (F12 → Console) and check for errors. |
| 404 on the video file | Confirm the file exists at `video/bandersnatch.mkv`. Try opening `http://localhost:8080/video/bandersnatch.mkv` directly in the browser. |
| IIS returns 404 for the MKV | The `web.config` is missing or not in the site root. IIS does not serve `.mkv` files without a registered MIME type. |
| Video loads but seeking doesn't work | Confirm the IIS Static Content feature is installed — it handles byte-range requests natively. |
| Buffering overlay never disappears | Chrome could not decode the video. Confirm you are using a supported x264 MKV encode. |
| Choice buttons don't appear | `assets/bandersnatch.js` or `assets/SegmentMap.js` is missing. Both must be present from the original repo. |
| Page works locally but not over the network | Check that Windows Firewall allows inbound TCP on the IIS port. |

---

## Keyboard Controls

| Key | Action |
|---|---|
| `F` | Toggle fullscreen |
| `R` | Restart video from the beginning |
| `→` | Jump to next segment or interaction zone |
| `←` | Jump to previous segment |
| `↑` / `↓` | Speed up / slow down playback |
| `Space` | Toggle play / pause |

---

## Credits

- Original interactive player concept — [joric](https://github.com/joric/bandersnatch)
- Web page, subtitles, and repo — [Mehotkhan](https://github.com/mehotkhan)
- Many fixes and improvements — [CyberShadow](https://github.com/CyberShadow)
- Modified for IIS hosted play — [EarthBoundX5](https://github.com/EarthBoundX5) with assistance of Claude Sonnet 4.6
