(() => {
  const button = document.getElementById('night-mode');
  const sun = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>';
  const moon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 15a9 9 0 0 1-11-11 9 9 0 1 0 11 11Z"/></svg>';
  let night = false;
  try { night = localStorage.getItem('banana-night-mode') === 'true'; } catch {}
  function render() {
    document.documentElement.dataset.theme = night ? 'night' : 'day';
    button.setAttribute('aria-pressed', String(night));
    button.setAttribute('aria-label', night ? 'Switch to day mode' : 'Switch to night mode');
    button.title = night ? 'Switch to day mode' : 'Switch to night mode';
    button.innerHTML = '<span class="mode-icon mode-day">' + sun + '</span><span class="mode-icon mode-night">' + moon + '</span>';
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
})();
