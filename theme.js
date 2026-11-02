(() => {
  const button = document.getElementById('night-mode');
  let night = false;
  try { night = localStorage.getItem('banana-night-mode') === 'true'; } catch {}
  function render() {
    document.documentElement.dataset.theme = night ? 'night' : 'day';
    button.setAttribute('aria-pressed', String(night));
    button.setAttribute('aria-label', night ? 'Switch to day mode' : 'Switch to night mode');
    button.title = night ? 'Switch to day mode' : 'Switch to night mode';
    button.innerHTML = '<span class="mode-day">Day</span><span class="mode-night">Night</span>';
  }
  button.addEventListener('click', () => {
    night = !night;
    try { localStorage.setItem('banana-night-mode', String(night)); } catch {}
    render();
  });
  render();
  const pinyinToggle = document.getElementById('pinyin-toggle');
  pinyinToggle.onclick = () => {
    const on = pinyinToggle.getAttribute('aria-pressed') !== 'true';
    pinyinToggle.setAttribute('aria-pressed', String(on));
    document.getElementById('editor').classList.toggle('hide-pinyin', !on);
  };

  // Move the existing controls, not copies, so their handlers and state survive resizing.
  const sheet = document.getElementById('tools-dialog');
  const opener = document.getElementById('tools-open');
  const mobile = window.matchMedia('(max-width: 700px)');
  const items = Array.from(document.querySelectorAll('[data-tools-item]')).map(element => {
    const anchor = document.createComment('tools home');
    element.before(anchor);
    return {element, anchor};
  }).sort((a, b) => Number(a.element.classList.contains('appearance')) - Number(b.element.classList.contains('appearance')));
  function closeTools() {
    if (sheet.open) sheet.close();
    opener.setAttribute('aria-expanded', 'false');
  }
  function placeControls() {
    const focused = document.activeElement;
    const focusWasInSheet = sheet.contains(focused);
    if (!mobile.matches) closeTools();
    for (const {element, anchor} of items) {
      if (mobile.matches) {
        document.getElementById('tools-' + element.dataset.toolsItem).append(element);
      } else {
        anchor.after(element);
      }
    }
    if (!mobile.matches && (focused === opener || focusWasInSheet)) {
      document.getElementById('paste').focus({preventScroll: true});
    }
  }
  opener.addEventListener('click', () => {
    if (!mobile.matches || sheet.open) return;
    sheet.showModal();
    opener.setAttribute('aria-expanded', 'true');
  });
  document.getElementById('tools-close').addEventListener('click', closeTools);
  sheet.addEventListener('close', () => {
    // Ignore a delayed close event if the sheet has already been opened again.
    if (sheet.open) return;
    opener.setAttribute('aria-expanded', 'false');
    if (!document.getElementById('image-dialog').open) {
      (mobile.matches ? opener : document.getElementById('paste')).focus({preventScroll: true});
    }
  });
  // Close Tools before the existing OCR dialog handler opens its modal.
  document.getElementById('image').addEventListener('click', closeTools, {capture: true});
  document.getElementById('translate').addEventListener('click', closeTools, {capture: true});
  document.getElementById('image-dialog').addEventListener('close', () => {
    // Import's original button is in the closed sheet on mobile.
    if (mobile.matches && document.activeElement !== document.getElementById('editor')) {
      opener.focus({preventScroll: true});
    }
  });
  mobile.addEventListener('change', placeControls);
  placeControls();
})();
