# Banana

A local Chinese reading companion with word-level pinyin, English dictionary lookup, selection-aware Mandarin playback, editable text, undo, copy/paste, adjustable type, a daily noon and 6pm countdown, and optional online document translation.

## Run

With Node.js 22 or newer installed, open a terminal in this folder and run:

```text
node server.cjs
```

Then open http://127.0.0.1:4173/ . No package installation or build is required. `Start Banana.cmd` also uses the existing bundled Node runtime when available.

## Files

- `index.html`, `style.css`, `app.js`: editable application source.
- `pinyin-pro.js`: bundled pinyin library (MIT).
- `dictionary.json`: generated CC-CEDICT English lookup data (CC BY-SA 4.0).
- `prepare-dictionary.cjs`, `cedict.txt.gz`: dictionary regeneration and source.
- `server.cjs`: local static server, bound to loopback only.
- `timer.js`, `synced-clock.js`, `internet-time.cjs`: schedule and clock synchronization.

## Network and data

The timer follows Singapore time: noon and 6pm daily. It glows and grows during the final ten minutes, wiggles at 00:00 for ten minutes, then automatically starts the next countdown. No dismissal is needed. A refresh during an alarm preserves the correct alarm window.

Internet time is fetched directly from TimeAPI's UTC endpoint by the browser on startup, every minute, on reconnection, and when the page becomes visible again. No backend is needed on GitHub Pages. Network delay is compensated, with estimated uncertainty shown in the time-source tooltip. Successfully synchronized time advances using a monotonic clock, so changing the PC clock does not change the online countdown. Offline, failed synchronization, or samples older than three minutes fall back to the PC clock. The clock source is available in the timer tooltip. This does not change the computer's system clock.

Chinese text is stored in this browser's local storage. Pinyin and dictionary lookup operate locally. The optional Translate button sends text to MyMemory; it is limited to 3,000 characters and subject to that service's quotas. Font files are fetched from Google Fonts; system fonts are used if unavailable. Speech availability and whether a voice runs locally depend on the browser/device. Documents are not synchronized between devices.

## Attribution

CC-CEDICT by its contributing authors, distributed by MDBG under Creative Commons Attribution-ShareAlike 4.0. Dictionary source and original attribution are retained in `cedict.txt.gz` and `DICTIONARY-LICENSE.txt`; the derived `dictionary.json` remains under that license. pinyin-pro by zh-lx, MIT; see `PINYIN-LICENSE.txt`.

## Development and hosting

Run npm test and npm run check before publishing changes. The repository includes AGENTS.md so Codex can follow the project preferences.

The public website is https://sebastiankoh1996.github.io/banana/ . GitHub Pages serves the browser files directly from the root of the main branch. The Node server remains an optional local preview; the published website does not need it. Speech depends on the visitor's device, and online translation remains subject to MyMemory's service availability and quotas.



The interface includes the Sebastian wordmark, an introductory loading animation, a muted looping video background, and a compact Tools menu at widths up to 1100px. New workspaces start blank; saved reading text is retained.

## Read Chinese from an image

Click **Image**, then paste a copied image (Ctrl+V / Command+V), drag an image into the window, or choose a file. Simplified and Traditional Chinese are recognized on your device, then shown in an editable review. Flowing text joins image-wrapped lines, removes stray spaces, and preserves blank-line paragraphs and numbered lists. Choose Keep line breaks for poems or lists. Click Add to reading box to append the reviewed text with pinyin; nothing is inserted until you confirm. Undo removes the insertion. Recognition needs an internet connection to download Tesseract.js and Chinese language files on first use; images are not uploaded. Clear printed text works best. Close the window to cancel processing.
