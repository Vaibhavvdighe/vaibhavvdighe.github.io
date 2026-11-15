import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { canonicalPath, pages } from './pages.js';
import { initVisualizations } from './visualizations.js';

const initialPath = canonicalPath(window.location.pathname);
const motionReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initPageInteractions(scope, page) {
  const revealItems = [...scope.querySelectorAll('.reveal')];
  let observer;
  if (!motionReduced() && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    }, { threshold: .08 });
    revealItems.forEach(item => observer.observe(item));
  } else revealItems.forEach(item => item.classList.add('in-view'));

  const lens = scope.querySelector('[data-lens]');
  if (lens) {
    const stages = [
      { title: 'Find the signal.', copy: 'Start with the question. Notice the patterns worth investigating.' },
      { title: 'Make a structure.', copy: 'Turn scattered inputs into a model people can understand and challenge.' },
      { title: 'Support a decision.', copy: 'Make the next action clear, useful, and honest about its limits.' },
    ];
    const buttons = [...lens.querySelectorAll('[data-lens-stage]')];
    const nodes = [...lens.querySelectorAll('.node')];
    const setStage = index => {
      buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
      nodes.forEach((node, i) => node.classList.toggle('is-active', i === index));
      lens.dataset.stage = String(index);
      lens.querySelector('[data-lens-title]').textContent = stages[index].title;
      lens.querySelector('[data-lens-copy]').textContent = stages[index].copy;
      lens.querySelector('[data-lens-count]').textContent = `0${index + 1} / 03`;
    };
    buttons.forEach((button, i) => button.addEventListener('click', () => setStage(i)));
    setStage(0);
  }

  scope.querySelectorAll('[data-replay-motion]').forEach(button => {
    button.addEventListener('click', () => {
      if (motionReduced()) return;
      const scene = button.closest('[data-motion-scene]');
      if (!scene) return;
      scene.classList.add('motion-reset');
      void scene.offsetWidth;
      scene.classList.remove('motion-reset');
    });
  });

  scope.querySelectorAll('[data-stepper]').forEach(stepper => {
    const steps = JSON.parse(stepper.dataset.steps || '[]');
    const buttons = [...stepper.querySelectorAll('button')];
    const panel = stepper.parentElement.querySelector('[data-step-panel]');
    if (!panel || !steps.length) return;
    const select = index => {
      buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
      panel.querySelector('strong').textContent = steps[index].title;
      panel.querySelector('p').textContent = steps[index].copy;
    };
    buttons.forEach((button, i) => button.addEventListener('click', () => select(i)));
    select(0);
  });

  if (page.type === 'visualizations') initVisualizations(scope);
  return () => observer?.disconnect();
}

export default function App() {
  const [path, setPath] = useState(pages[initialPath] ? initialPath : '/index.html');
  const [theme, setTheme] = useState(document.documentElement.dataset.theme || 'dark');
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(window.scrollY > 12);
  const [progress, setProgress] = useState(0);
  const pathRef = useRef(path);
  const transitioning = useRef(false);
  const pendingAnchor = useRef(null);
  const mainRef = useRef(null);
  const page = pages[path];

  const navigate = useCallback((destination, push) => {
    const nextPath = canonicalPath(destination.pathname);
    if (!pages[nextPath] || transitioning.current || nextPath === pathRef.current) return;
    transitioning.current = true;
    const currentType = pages[pathRef.current].type;
    const kind = nextPath.startsWith('/cases/') && (currentType === 'home' || currentType === 'work') ? 'editorial' : 'depth';
    const reduced = motionReduced();
    const finish = () => {
      if (push) history.pushState(null, '', destination.pathname + destination.search + destination.hash);
      document.documentElement.dataset.page = pages[nextPath].type;
      delete document.documentElement.dataset.exitTransition;
      if (!reduced) document.documentElement.dataset.enterTransition = kind;
      pathRef.current = nextPath;
      pendingAnchor.current = destination.hash;
      setPath(nextPath);
      setMenuOpen(false);
      window.setTimeout(() => {
        delete document.documentElement.dataset.enterTransition;
        transitioning.current = false;
      }, reduced ? 0 : 650);
    };
    if (reduced) finish();
    else {
      document.documentElement.dataset.exitTransition = kind;
      window.setTimeout(finish, kind === 'editorial' ? 420 : 360);
    }
  }, []);

  useEffect(() => {
    const onPopState = () => {
      if (canonicalPath(window.location.pathname) === pathRef.current) {
        if (window.location.hash) document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView();
        else window.scrollTo(0, 0);
      } else navigate(new URL(window.location.href), false);
    };
    window.addEventListener('popstate', onPopState);
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    return () => {
      window.removeEventListener('popstate', onPopState);
      history.scrollRestoration = previousRestoration;
    };
  }, [navigate]);

  useLayoutEffect(() => {
    if (pendingAnchor.current === null) return;
    const hash = pendingAnchor.current;
    pendingAnchor.current = null;
    window.scrollTo(0, 0);
    if (hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
    mainRef.current?.focus({ preventScroll: true });
  }, [path]);

  useEffect(() => {
    const updateScroll = () => {
      setHeaderScrolled(window.scrollY > 12);
      const available = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(available > 0 ? window.scrollY / available : 0);
    };
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll);
    return () => {
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
    };
  }, []);

  useEffect(() => {
    document.title = page.title;
    document.documentElement.dataset.page = page.type;
    const cleanup = initPageInteractions(mainRef.current, page);
    return cleanup;
  }, [path, page]);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = next === 'light' ? '#f1f0eb' : '#141516';
    try { localStorage.setItem('vd-portfolio-theme', next); } catch (_) {}
  };

  const handleLink = event => {
    const link = event.target.closest?.('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin || !pages[canonicalPath(destination.pathname)]) return;
    if (canonicalPath(destination.pathname) === pathRef.current) {
      if (destination.pathname !== window.location.pathname) {
        event.preventDefault();
        history.pushState(null, '', destination.pathname + destination.search + destination.hash);
        if (destination.hash) document.getElementById(decodeURIComponent(destination.hash.slice(1)))?.scrollIntoView();
      }
      setMenuOpen(false);
      return;
    }
    event.preventDefault();
    navigate(destination, true);
  };

  const navLinks = [
    ['Work', '/work.html', page.type === 'work' || page.type === 'case'],
    ['Visualizations', '/visualizations.html', page.type === 'visualizations'],
    ['About', '/about.html', page.type === 'about'],
    ['Contact', '/index.html#contact', false],
  ];

  return <div className="app-shell" onClickCapture={handleLink}>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className={`site-header${headerScrolled ? ' is-scrolled' : ''}`} data-site-header>
      <div className="shell nav-shell">
        <a className="brand" href="/index.html" aria-label="Vaibhav Dighe, home"><span className="brand-mark">VD</span><span className="brand-name">Vaibhav Dighe</span></a>
        <button className="menu-button" type="button" aria-expanded={menuOpen} aria-controls="primary-nav" onClick={() => setMenuOpen(open => !open)}>Menu ☰</button>
        <nav className={`nav-links${menuOpen ? ' open' : ''}`} id="primary-nav" aria-label="Main navigation">
          {navLinks.map(([label, href, current]) => <a key={label} href={href} className={label === 'Contact' ? 'nav-contact' : undefined} aria-current={current ? 'page' : undefined}>{label}</a>)}
        </nav>
        <button className="theme-toggle" type="button" aria-pressed={theme === 'light'} aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'} title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'} onClick={toggleTheme}>{theme === 'light' ? <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.3 15.7A8.5 8.5 0 0 1 8.3 3.7 8.5 8.5 0 1 0 20.3 15.7Z" /></svg> : <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>}</button>
      </div>
    </header>
    <main key={path} id="main" ref={mainRef} tabIndex={-1} dangerouslySetInnerHTML={{ __html: page.content }} />
    <footer className="footer" id="contact" data-site-footer>
      <div className="shell"><div className="footer-main"><div><span className="eyebrow" style={{ color: '#cce5d3' }}>Let's talk</span><h2>Have a complex question?<br /><span className="serif">Let's make it clearer.</span></h2><p>I'm interested in project, product, and program work that connects business needs, technology, and execution.</p></div><a className="button" href="mailto:vaibhavdighe02@gmail.com">Start a conversation ↗</a></div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Vaibhav Dighe</span><nav aria-label="Footer"><a href="/work.html">Work</a><a href="/visualizations.html">Visualizations</a><a href="/about.html">About</a><a href="https://www.linkedin.com/in/vaibhavdighe" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><a href="https://github.com/Vaibhavvdighe" target="_blank" rel="noopener noreferrer">GitHub ↗</a></nav></div></div>
    </footer>
    <div className="scroll-progress" aria-hidden="true" style={{ transform: `scaleX(${progress})` }} />
  </div>;
}
