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

Preserve the dark charcoal/brass interface, header title, responsive timer beside the header text, and English panel below the editor. The Translate button shares the English heading row and fills its remaining width. Keep the UI concise. Do not reintroduce the removed logo, footer slogan, audio headings, translation explanations, dismiss button, or timer preview overrides.

The timer's schedule is 12pm and 6pm in Asia/Singapore. During the last ten minutes it glows and grows to twice its normal size; at zero it wiggles for ten minutes, then automatically counts down to the next scheduled time. Prefer synchronized internet time; fall back to the PC clock when offline or synchronization fails. Never change the user's system clock.

Browser text stays in local storage. Translation occurs only when the user clicks Translate. Keep private credentials out of browser files and repository commits. Publishing to GitHub Pages requires adapting the server-side `/api/time` endpoint; uploading this repository alone does not deploy that endpoint.
