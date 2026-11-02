# Banana — Open canvas

Approved desktop Open canvas and revised paste-first mobile, 2 November 2026. Deployment authorized by the owner on 2 November 2026. PRODUCT.md owns behavior.

Desktop: compact identity/timer/theme row; Paste/Import and Copy/Undo action band; visible pinyin/hover/translation switches and sizes; centered borderless passage (maximum832px); requested English below; standalone in-flow audio dock (maximum672px). No side rail or editor card.

Mobile up to700px: brand/countdown header, one row containing Paste Chinese and Tools, then the text box. Tools opens a native modal bottom sheet containing the existing Import, Copy, Undo, switches, sizes and Appearance controls. Only one set of controls exists: theme.js relocates their existing nodes and preserves handlers/state. Escape/Close returns focus, Import closes Tools before opening OCR, and successful OCR insertion keeps editor focus. Resizing to desktop closes the sheet and restores controls.

Medium28px desktop /26px mobile; Small23px; Large36px desktop /32px mobile. Sans-serif interface; existing CJK reading stack. Day paper#F8F7F3, text#18282F, secondary#52636B, accent#006B65. Night paper#111B22, text#EFF4F4, secondary#B3C4CC, accent#77D9CA. Small banana mark may retain yellow. Rectangular actions use4px corners.

Preserve existing IDs, one editor, storage keys banana.text / banana-night-mode, loading GIF, dictionary/pinyin licenses and all behavior owners. redesign.css remains the legacy base; workbench.css overrides presentation. Keep exact hidden/live/busy states. Do not add audio seeking, duration estimates, volume or speed controls. Never inject sample text into saved documents.

Timer growth reserves a separate row on narrow screens during warning/alarm. Existing glows/wiggle and reduced-motion behavior remain. Audio stays in document flow rather than covering text.
