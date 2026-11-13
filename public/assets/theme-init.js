(() => {
  let theme = 'dark';
  try {
    if (localStorage.getItem('vd-portfolio-theme') === 'light') theme = 'light';
  } catch (_) {}
  document.documentElement.dataset.theme = theme;
  const arrival = new URL(window.location.href);
  const transition = arrival.searchParams.get('vd-transition');
  if (transition) {
    arrival.searchParams.delete('vd-transition');
    history.replaceState(history.state, '', arrival.href);
    if ((transition === 'depth' || transition === 'editorial') && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.dataset.enterTransition = transition;
    }
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'dark' ? '#141516' : '#f1f0eb';
})();
