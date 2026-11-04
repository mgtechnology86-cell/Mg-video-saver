# MG VIDEO SAVER
**Save. Organize. Enjoy.** Created by MGCOWBELL.

A no-login, no-payment video saving site. Pure HTML/CSS/JS, no backend, no API keys.

## What it does
- **Home:** validates YouTube links (watch, youtu.be, Shorts), shows title, channel, thumbnail, duration and an embedded YouTube player (IFrame API + oEmbed).
- **YouTube is preview and library only.** YouTube provides no public download, so no download button is offered. DRM and access controls are not bypassed.
- **Video Downloader:** downloads a direct `.mp4` (or other video file) link you own or have permission for, with progress %, success/failure messages, retry, Open file, and Share / Save to Photos (iPhone). Also loads files from your device.
- **My Library:** saves links in `localStorage`; search, category filter, copy link, delete, play.
- **Player:** play/pause, timeline, volume, speed, fullscreen.

## Limits (honest notes)
- Direct downloads run in the browser, so the file host must allow cross-origin requests (CORS). If blocked, use "Open link directly".
- Very large files are held in memory before saving; use smaller files on phones.
- Websites cannot silently place files in a Gallery. Android saves to Downloads (usually visible in Gallery); iPhone users tap Share, then Save Video.
- Duration for YouTube appears after the player loads.

## Run locally
Open `index.html`, or serve it: `python3 -m http.server 8000` then visit http://localhost:8000.

## Publish on GitHub Pages
1. Create a repository on GitHub and upload all files (keep `assets/`).
2. Settings → Pages → Source: `main` branch, `/ (root)` → Save.
3. Your site appears at `https://<username>.github.io/<repo>/`.

## Configure
Set your contact email in `script.js` (`CONFIG.contactEmail`).

## Backend
None required. Do not add one to download content you lack rights to.
