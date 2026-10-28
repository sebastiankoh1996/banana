# Banana project

This is Sebastian's Chinese reading assistant, implemented with browser HTML/CSS/JavaScript and a small Node.js server. No framework or package installation is required.

## Main files

- `index.html`, `style.css`, `app.js`: interface, editor, dictionary lookup, speech, translation, and clock integration.
- `timer.js`: daily Singapore-time schedule; noon and 6pm alarms last ten minutes and reset automatically.
- `synced-clock.js`, `internet-time.cjs`, `server.cjs`: internet clock with PC-clock fallback and a local `/api/time` endpoint.
- `dictionary.json`, `pinyin-pro.js`: vendored language resources. Preserve the accompanying licenses.

## Validation

Run `npm test` and `npm run check`. Start locally with `npm start` and open http://127.0.0.1:4173/ . Check changed UI at both desktop and mobile sizes.

## Product preferences

Match the user-approved October 28 screenshot: nearly black header and background, navy editor, compact outlined buttons above a full-width editor, text size at the right, audio controls above the editor, and timer beside the title. Header title is Sebastian's Banana Assistant. Hover and Translate are explicit OFF/ON toggles. Keep the tip below the editor. Do not reintroduce the pastel dashboard, sidebar, logo, avatar, cards, audio heading, or permanent English panel.

The timer's schedule is 12pm and 6pm in Asia/Singapore. During the last ten minutes it glows and grows to twice its normal size; at zero it wiggles for ten minutes, then automatically counts down to the next scheduled time. Prefer synchronized internet time; fall back to the PC clock when offline or synchronization fails. Never change the user's system clock.

Browser text stays in local storage. Translation occurs only when the user clicks Translate. Keep private credentials out of browser files and repository commits. The browser fetches TimeAPI UTC directly for GitHub Pages; preserve CORS-compatible clock synchronization and the offline fallback. The Node `/api/time` endpoint is optional for local use and is not deployed by Pages.

Preserve the loading animation and timeout fallback, video background, and browser-based TimeAPI synchronization for GitHub Pages. On mobile, wrap the same compact controls without horizontal scrolling.
