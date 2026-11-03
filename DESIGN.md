# Banana — Open canvas

Approved desktop Open canvas and revised paste-first mobile, 2 November 2026. Deployment authorized by the owner on 2 November 2026. PRODUCT.md owns behavior.

Desktop: compact identity/timer/theme row; Paste/Import and Copy/Undo action band; visible pinyin/hover/translation switches and sizes; full-width passage aligned to the action-row rule with a 1px theme-colored outline; requested English below; standalone in-flow audio dock (maximum672px). No side rail or editor card.

Mobile up to700px: brand/countdown header, one row containing Paste Chinese and Tools, then the text box. Tools opens a native modal bottom sheet containing the existing Import, Copy, Undo, switches, sizes and Appearance controls. Only one set of controls exists: theme.js relocates their existing nodes and preserves handlers/state. Escape/Close returns focus, Import closes Tools before opening OCR, and successful OCR insertion keeps editor focus. Resizing to desktop closes the sheet and restores controls.

Local November 3 revision: Small19px, Medium23px (the former Small size), Large28px on desktop and mobile. Sans-serif interface; existing CJK reading stack. Day paper#F8F7F3, text#18282F, secondary#52636B, accent#006B65. Night paper#111B22, text#EFF4F4, secondary#B3C4CC, accent#77D9CA. Small banana mark may retain yellow. Rectangular actions use4px corners.

Preserve existing IDs, one editor, storage keys banana.text / banana-night-mode, loading GIF, dictionary/pinyin licenses and all behavior owners. redesign.css remains the legacy base; workbench.css overrides presentation. Keep exact hidden/live/busy states. Do not add audio seeking, duration estimates, volume or speed controls. Never inject sample text into saved documents.

Timer growth reserves a separate row on narrow screens during warning/alarm. Existing glows/wiggle and reduced-motion behavior remain. Audio stays in document flow rather than covering text.

November 3 local refinement: editor width equals the toolbar rule; 1px outline and inset text padding indicate the editable region. Current changes are local-only until separately approved for publication.

November 3 local branding: the header banana icon/wordmark is replaced by the supplied animated Sebastian GIF (sebastian-header.gif). Use a140x44px desktop /112x38px mobile display slot, centered with object-fit:cover to contain the black background and keep the lettering readable. Preserve the actual GIF animation; loading behavior is unchanged. Not published.

November 3 local timer refinement: during the final ten minutes, the badge uses a red surface and pulsing red halo (1.6-second cycle) while retaining progressive growth. At noon/6pm, the badge and glow remain red; the halo is steady while the existing wiggle and ten-minute automatic-reset behavior remain. Reduced-motion rules stop pulsing/wiggle. No schedule or clock logic changes; not published.

November 3: background video playback was removed at the owner’s request. Timer warning and alarm effects remain.

November 3 local warning visibility correction: final10-minute badge uses bright red (#C81020–#E31627) pulsing every1.2seconds, persistent white bold timer text, and a stronger red halo. Do not fade the timer text. The existing zero-time alarm styling/schedule and reduced-motion behavior remain. Not published.


November 3 approved luxury reference redesign: framed rounded workspace, graphite/ivory day and night surfaces, blue ambient background gradient, champagne metallic controls, static white Sebastian wordmark with aligned subtitle, integrated audio footer, helper sentence removed, and timer contents enlarged 10%. Existing reading sizes and application logic/storage are preserved. Owner authorized publication of this revision.


November 3: owner approved publishing the supplied ambient video as a muted, autoplaying, continuously looping full-viewport background, with no playback controls. The reading panel remains opaque for readability; the gradient is the loading/playback-failure fallback. This background has no timer linkage.
