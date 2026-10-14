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

Internet time is fetched from TimeAPI's UTC endpoint through the local server on startup, every minute, on reconnection, and when the page becomes visible again. Network delay is compensated, with estimated uncertainty shown in the time-source tooltip. Successfully synchronized time advances using a monotonic clock, so changing the PC clock does not change the online countdown. Offline, failed synchronization, or samples older than three minutes fall back to the PC clock. The clock source is available in the timer tooltip. This does not change the computer's system clock.

Chinese text is stored in this browser's local storage. Pinyin and dictionary lookup operate locally. The optional Translate button sends text to MyMemory; it is limited to 3,000 characters and subject to that service's quotas. Font files are fetched from Google Fonts; system fonts are used if unavailable. Speech availability and whether a voice runs locally depend on the browser/device. Documents are not synchronized between devices.

## Attribution

CC-CEDICT by its contributing authors, distributed by MDBG under Creative Commons Attribution-ShareAlike 4.0. Dictionary source and original attribution are retained in `cedict.txt.gz` and `DICTIONARY-LICENSE.txt`; the derived `dictionary.json` remains under that license. pinyin-pro by zh-lx, MIT; see `PINYIN-LICENSE.txt`.

## Development and hosting

Run npm test and npm run check before publishing changes. The repository includes AGENTS.md so Codex can follow the project preferences.

The Node server is required for the internet-time endpoint. GitHub stores the source; GitHub Pages alone cannot run this server. Deploying to a static host requires adapting time synchronization.


