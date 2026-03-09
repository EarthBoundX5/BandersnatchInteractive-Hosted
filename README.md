# Bandersnatch Interactive Player — IIS Hosting Guide

This is a modified version of [mehotkhan/BandersnatchInteractive](https://github.com/mehotkhan/BandersnatchInteractive)
patched to **auto-play a hosted video** instead of requiring drag-and-drop.

---

## Folder Structure

After setup your site folder should look like this:

```
BandersnatchInteractive/
├── index.html              ← main page (modified)
├── web.config              ← IIS configuration (MIME types, range requests)
├── assets/
│   ├── scripts.js          ← player logic (modified — set HOSTED_VIDEO_URL here)
│   ├── bandersnatch.js     ← segment/choice data  ← download from original repo
│   └── styles.css          ← player styles        ← download from original repo
├── subtitle/               ← subtitle VTT files   ← download from original repo
│   ├── Black.Mirror.Bandersnatch.2018.720p.WEB-DL.x264.DUAL.en.vtt
│   └── ... (other languages)
└── video/
    └── bandersnatch.mkv    ← YOUR VIDEO FILE goes here
```

---

## Step-by-Step Setup

### 1. Download the original repo files

Go to https://github.com/mehotkhan/BandersnatchInteractive and download:

- `assets/bandersnatch.js` → save to `assets/bandersnatch.js`
- `assets/styles.css` → save to `assets/styles.css`
- The entire `subtitle/` folder → save to `subtitle/`

> **Do NOT copy** the original `assets/scripts.js` or `index.html` —
> use the modified versions provided here instead.

### 2. Place your video file

Create a `video/` folder and copy your Bandersnatch MKV into it:

```
video/bandersnatch.mkv
```

The video must be the full 5:12:14 version.

### 3. Set the video path in scripts.js

Open `assets/scripts.js` and find line 1 of the configuration block at the top:

```javascript
var HOSTED_VIDEO_URL = 'video/bandersnatch.mkv';
```

Change the path if your file has a different name or location, for example:

```javascript
var HOSTED_VIDEO_URL = 'video/Black.Mirror.Bandersnatch.2018.720p.WEB-DL.x264.DUAL.mkv';
```

### 4. Configure IIS

1. Open **IIS Manager**.
2. Create a new site (or use Default Web Site).
3. Set the **Physical Path** to your `BandersnatchInteractive/` folder.
4. Set the **port** (e.g. 8080 or 80).
5. Make sure the `web.config` file is in the root of the site.

The `web.config` already handles:
- MKV / MP4 / WebM MIME types (IIS blocks unknown MIME types by default).
- VTT subtitle MIME type.
- HTTP byte-range request headers (needed for video seeking).
- Lifted upload/request size limits.

### 5. Verify IIS has Static Content enabled

In **Server Manager → Add Roles and Features → Web Server (IIS)**,
make sure **Static Content** is checked under `Web Server > Common HTTP Features`.

### 6. Browse to the page

Open Chrome (the player only works in Chrome/Chromium) and navigate to:

```
http://localhost:8080/
```

The video will start playing automatically. No drag-and-drop required.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Black screen, no video | Check the browser console (F12). Likely the video path in `HOSTED_VIDEO_URL` is wrong, or IIS is not serving MKV (check `web.config` is present). |
| 404 on the video file | Make sure the `video/` folder and file exist. Open `http://localhost:8080/video/bandersnatch.mkv` directly — if you get 404, the path is wrong or IIS permissions are missing. |
| Video loads but can't seek | Byte-range requests may not be working. Confirm `web.config` is in the site root and IIS Static Content module is installed. |
| Choices don't appear | The `assets/bandersnatch.js` file from the original repo must be present. Download it from https://github.com/mehotkhan/BandersnatchInteractive/blob/master/assets/bandersnatch.js |
| Works locally but not on network | Check Windows Firewall allows inbound on the IIS port. |

---

## Optional: Keep drag-and-drop as a fallback

In `assets/scripts.js`, change:

```javascript
var SHOW_FILE_SELECTOR_FALLBACK = false;
```

to:

```javascript
var SHOW_FILE_SELECTOR_FALLBACK = true;
```

This shows the file-picker UI alongside the hosted video, so users can optionally override the video with a local file.

---

## Credits

- Original concept: [joric](https://github.com/joric/bandersnatch)
- Web page & subtitles: [Mehotkhan](https://github.com/mehotkhan)
- Fixes & improvements: [CyberShadow](https://github.com/CyberShadow)
- IIS hosting patch: this repo
