# Banana — Product specification and functional audit

Audit date: 30 October 2026 (Asia/Singapore)
Website: https://sebastiankoh1996.github.io/banana/
Source revision: 1fe833b6f6d9b74f8a4cf8baae7ae4a2a865d416
Status: documentation of the implemented product, not a promise of planned features.

## Purpose and users

Banana is Sebastian’s browser-based Chinese reading assistant. It helps a reader turn typed, pasted, or image-extracted Chinese into an editable passage with word-level pinyin, English dictionary meanings, and Mandarin speech. A secondary utility counts down to noon and 6pm in Singapore. There is no account, subscription, document library, or cloud document synchronization.

## Primary workflow

1. Type Chinese directly, paste plain text, or import an image.
2. Read the passage with generated pinyin; adjust text size or hide pinyin.
3. Enable English on hover to inspect a word and optionally hear it.
4. Play the document or a selected passage in Mandarin.
5. Optionally request an online English translation.
6. Continue editing; the document is saved in this browser.

## Functional inventory

### Editor and pinyin

- One editable document in a contenteditable textbox; starts blank when no saved text exists.
- Restores text from localStorage key `banana.text`.
- Uses browser `Intl.Segmenter` with Chinese word granularity. Segments containing Han characters become focusable word spans.
- Vendored pinyin-pro generates pronunciation locally; CSS displays it above each segment.
- Preserves non-Han text and punctuation as text nodes. Does not validate linguistic accuracy or let the reader manually correct pronunciation independently of the text.
- Rebuilds word markup after a 180ms input debounce, on composition completion, and on blur. Handles Chinese input composition without rendering mid-composition.
- Attempts to preserve cursor position during a rebuild.
- Collapses three or more consecutive newlines to two in normal editing.
- Copy exports plain document text without pinyin. Paste Chinese requests clipboard text and inserts at the editor selection; clipboard denial gives keyboard-paste guidance.
- Direct editor paste uses plain text, excluding rich formatting.
- Undo keeps up to 100 in-memory prior document snapshots. Button and Ctrl/Cmd+Z invoke it. Undo history does not survive reload; there is no app redo.
- A character count is calculated excluding whitespace, but its element is hidden.
- No document naming, multi-document management, find/replace, export file, sharing, or print-specific workflow is implemented.

### Reading preferences

- Show pinyin switch hides/shows the visual annotation via an editor class. Starts on each load; annotations remain in accessibility labels when visually hidden.
- English on hover starts off. The control gates dictionary popup behavior for pointer hover, word click, and keyboard focus.
- Text size buttons select Small, Medium, or Large, reflected through aria-pressed and editor data attributes.
- Desktop sizes: 23px, 28px, 36px. At the existing narrow mobile breakpoint, Medium is 26px and Large is 32px.
- Text size, pinyin visibility, and hover preference are not persisted.
- Night mode changes the page theme. It is saved separately in localStorage as `banana-night-mode`; the control displays the action available next, Day mode or Night mode.
- Night mode defaults to day when unset; it does not automatically follow the operating system theme.

### Dictionary lookup

- Downloads bundled dictionary.json on startup with a 10-second timeout.
- Exact-word entries display their definitions. If unavailable, falls back to per-character entries with up to two definitions per character, or an explicit no-entry message.
- Popup contains Chinese text, generated pinyin, English meaning, and a listen button.
- Positions the popup within viewport bounds where possible. Hides on window scroll, resize, Escape from the editor, or after leaving the word/popup.
- Word speech uses browser synthesis in zh-CN and cancels ongoing speech. It resets document playback controls to idle.
- Dictionary failure leaves pinyin available and asks the user to reload for meanings.

### Mandarin audio

- Play Audio reads the last tracked nonempty editor selection, otherwise the document.
- Selection label reports Entire Document or selection character count.
- Prefers a zh-CN voice, then any Chinese voice, then the device default with a notice.
- Play changes to Resume Audio after Pause. Stop cancels synthesis and resets internal progress and elapsed time.
- Playback completion and errors return controls to idle. Leaving the page cancels speech.
- Voice availability and pronunciation depend on the browser/device. No recorded audio or downloadable audio is produced.
- Internal progress uses speech boundary events and character position; elapsed time also depends on those events.
- Current interface hides the progress, elapsed-time, and speed elements. Speed has one option, 1.0x. There is no seek, visible timeline, voice picker, adjustable speed, volume slider, or word-follow highlighting.
- The generated design concept shows additional audio controls; those should not be described as shipped functionality.

### Full-document translation

- Translation runs only when explicitly enabled by the reader, not continuously.
- Sends document text to MyMemory over HTTPS with zh-CN to en language pair.
- Rejects documents whose JavaScript string length exceeds 3,000 (UTF-16 code units, not a precise Unicode-character count).
- Splits into sequential requests of at most 450 UTF-8 bytes; each has a 15-second timeout. Concatenates results without inserting extra separators.
- Shows loading text and disables the control during the request. Displays quota, network, and timeout errors in the output area.
- Switching off hides the English panel. Editing or undo invalidates prior results and hides translation. A version guard prevents stale results from replacing a newer document.
- Translation is subject to third-party quality, availability, quotas, and privacy practices. No translation history is stored by the app.

### Image-to-text import

- Import image opens a modal. Accepts file selection, image paste into the dialog, and drag/drop into the dialog.
- Accepted MIME types: PNG, JPEG, WebP, GIF, BMP. Rejects files larger than 20 MiB (UI says 20 MB).
- Loads Tesseract.js 6.0.1 from jsDelivr on demand. Creates a worker with Simplified and Traditional Chinese models.
- Recognition occurs on the device; recognition libraries/models require network downloads. The app does not upload the source image to an OCR API.
- Shows recognition percentage where supplied by the OCR worker. A 120-second timeout cancels the job.
- Cleanup retains lines containing Han characters, removes Latin letters and other disallowed symbols, and keeps Chinese, numbers, punctuation, and whitespace.
- Flowing text joins wrapped lines while retaining blank-line paragraphs and recognized numbered/list boundaries. Keep line breaks retains cleaned line structure.
- An editable review appears before insertion. Each layout mode retains its own edited draft while switching between modes.
- Add to reading box appends reviewed text after a blank line, or replaces an empty document. It does not insert at the current cursor position.
- Empty review cannot be inserted. Closing cancels processing and terminates the worker; stale job results are ignored.
- Only the first dropped/selected file is processed; there is no batch workflow, crop/rotate, camera capture, OCR confidence display, or image preview.
- Accuracy depends on image quality. This is Chinese-focused extraction, not a faithful mixed-language transcription tool.

### Singapore countdown

- Fixed schedule: 12pm and 6pm, Asia/Singapore, every day.
- Normal countdown displays hours when needed, otherwise minutes and seconds.
- Last ten minutes progressively scale the timer from 1x toward 2x and apply a warning treatment.
- At the target time, visual alarm treatment lasts ten minutes; the next scheduled countdown then starts automatically. Reloading derives the correct current schedule from time.
- The alarm is visual; no alarm sound, notification permission, background notification, or custom schedule is implemented.
- TimeAPI UTC synchronization runs at startup, every minute, on reconnect, and when the document becomes visible.
- Validates UTC date fields; compensates approximately for transport latency. Uses performance.now to advance accepted samples independently of PC clock changes.
- Samples older than three minutes, offline state, or failed sync use the PC clock. Tooltip states the source and estimated network uncertainty.
- Uses 7-second request timeout. Offline/visibility handling resets or refreshes anchoring. Never changes the computer clock.
- Warning/alarm announcements use a polite status region; per-second timer announcements are disabled.

### Loading, accessibility, layout

- Introductory loading GIF with app temporarily inert and aria-busy.
- Minimum animation playback about 1.2 seconds after image readiness; waits for dictionary readiness with a hard 15-second release fallback, then fades out (600ms unless reduced motion).
- Layout provides desktop tools rail and wrapped/grid mobile tools. Reading area stays the primary workspace.
- Controls use buttons with pressed state; editor has textbox/multiline semantics. Modal has a title/status; word spans support keyboard focus. Focus styles and reduced-motion rules exist.
- Status messages are polite live regions. There is no comprehensive screen-reader or touch-device certification from this audit.
- Background video asset and markup remain, but the current workbench stylesheet makes its container transparent. Loading animation remains visible at startup.

## Architecture and external dependencies

- Static HTML/CSS/JavaScript published from the main branch root via GitHub Pages. No build step or application backend required for live use.
- Browser files: index.html, redesign.css plus overriding workbench.css, app.js, theme.js, image-clipboard.js, loading.js, timer.js, synced-clock.js, pinyin-pro.js, dictionary.json, and media.
- Optional Node server binds 127.0.0.1:4173, serves local files, and exposes /api/time. The current browser clock fetches TimeAPI directly; local /api/time is not required by Pages.
- Requires modern browser features including Intl.Segmenter, Unicode regular expressions, dialog, Fetch, AbortSignal.timeout, and CSS features used by the interface. No comprehensive compatibility fallback exists.
- Clipboard APIs depend on browser permissions and a secure context; keyboard paste is a fallback.
- Dictionary and pinyin resources retain their existing CC BY-SA and MIT licensing notices.

## Data and privacy

| Data | Location or destination | Persistence |
|---|---|---|
| Chinese document | Browser localStorage, banana.text | Until replaced or browser storage cleared |
| Night preference | Browser localStorage, banana-night-mode | Across reloads |
| Undo, selected text, lookup popup, OCR drafts | Page memory | Current page lifetime |
| Translation text | MyMemory request query parameters | App does not retain history; provider policy is external |
| OCR image | Browser OCR worker | Not uploaded by app code |
| Time synchronization | TimeAPI | Periodic network requests, not document content |
| OCR engine/models | External library/model hosts | Downloaded on demand; browser caching may apply |

There is no service worker/offline installation workflow. Locally computed features can work once their required resources are available, but a reliable offline reload is not guaranteed. Browser speech may use local or remote voices depending on the device. No analytics integration or user-account code was identified in the reviewed application files.

## Functional audit findings

These findings are code-derived unless explicitly identified as tested. They are not fixes made during this audit.

| Priority | Finding | Evidence / implication | Suggested acceptance condition |
|---|---|---|---|
| High | Selection for speech can become stale | selectionchange updates selected only while both ends remain inside editor; edits/undo do not clear it | After edits or selection removal, Play reads the current intended scope and label agrees |
| Medium | Fast page close may miss pending text | Input is saved after a debounce or blur; pagehide only cancels speech | Flush pending composition-safe edits on lifecycle transitions; verify latest input after reload |
| Medium | OCR removes English and non-Chinese-only lines | chineseImageText filters characters and lines | State this limitation before import, or preserve mixed-language text under a deliberate policy |
| Medium | Translation has no inline pre-request privacy disclosure | Enabling sends the entire document to an external service | Place a concise disclosure by the control before the first request |
| Medium | Pinyin, hover, and size settings reset | Only theme and document have localStorage writes | Decide which reading preferences should persist; test refresh behavior |
| Medium | Translation chunks may break phrases | Byte-boundary splitting followed by direct concatenation | Prefer sentence-aware chunks while retaining request size limits |
| Low | Hidden audio functionality differs from concept | Progress/elapsed/speed elements are hidden, with only one speed option | Align product UI and specification; do not imply seeking exists |
| Low | Pinyin-off still exposes pinyin in word labels | Toggle only removes visual pseudo-element | Decide whether screen-reader pronunciation should follow the toggle |
| Low | Translation switch cannot cancel a pending request | Control is disabled while sequential requests run | Provide cancellation or document loading behavior clearly |
| Low | Size limit copy is approximate | 20 MiB binary threshold; UI says MB | Use consistent units |

## Verification and boundaries

- Source reviewed at the revision above; origin fetched and local worktree inspected.
- Automated suites run and passed: timer schedule/alarms; clock anchoring/fallback/validation; mocked speech controls/progress; OCR cleanup/flowing paragraphs.
- JavaScript syntax checks passed for the top-level .js application files.
- Prior live UI inspection confirmed the switches, labels, layout, and persisted night mode. This audit did not perform a new end-to-end browser run.
- Real device Mandarin voice output, live MyMemory response/quotas, OCR model downloads and real image accuracy, cross-browser accessibility, mobile interaction, offline reload, and alarm-time visual appearance were not end-to-end verified in this audit.
- Existing speech tests are simulated; OCR tests exercise cleanup/formatting, not the recognition engine. Passing these tests does not establish all integrations work on every device.

## Product constraints for future design

Preserve editable Chinese, accurate word-level annotations, plain-text copy, undo, image review before insertion, optional external translation, selection-aware audio, noon/6pm Singapore schedule, and browser-local document persistence. Keep Medium reading text at current compact size. Retain visible reading switches and night mode. Do not add Your text as a heading. Generated mockups are proposals, not proof of implemented functions. Changes to functionality or publication should remain explicit tasks separate from this documentation audit.


## Approved UI revamp — 30 October 2026

The day/night visual revamp changes index.html, workbench.css and theme.js presentation. It preserves the existing document storage keys and reading/OCR/audio/translation/timer logic. Headings and controls are now sans-serif, night colors are neutral charcoal, the reading sheet contains its audio footer, and the empty state provides guidance. Medium is 28px desktop and 26px up to 700px. Day/night uses icon segments with an accessible action label. The rest of this document records the functional baseline; its earlier code revision remains the audit provenance.
