'use strict';
(() => {
  const screen = document.getElementById('loading-screen');
  const logo = document.getElementById('loading-logo');
  const app = document.querySelector('.app');
  app.classList.add('is-loading');
  app.inert = true;
  app.setAttribute('aria-busy', 'true');
  const animationReady = logo.complete ? Promise.resolve() : new Promise(resolve => {
    logo.addEventListener('load', resolve, {once: true});
    logo.addEventListener('error', resolve, {once: true});
  });
  const minimumPlayback = animationReady.then(() => new Promise(resolve => setTimeout(resolve, 1200)));
  const appReady = new Promise(resolve => {
    const fallback = setTimeout(resolve, 15000);
    window.addEventListener('banana-ready', () => {clearTimeout(fallback); resolve();}, {once: true});
  });
  Promise.race([Promise.all([minimumPlayback, appReady]), new Promise(resolve => setTimeout(resolve, 15000))]).then(() => {
    app.classList.remove('is-loading');
    screen.classList.add('is-leaving');
    const fadeDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 600;
    setTimeout(() => {
      screen.hidden = true;
      app.inert = false;
      app.removeAttribute('aria-busy');
    }, fadeDuration);
  });
})();
