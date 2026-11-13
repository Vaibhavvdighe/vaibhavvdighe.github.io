import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
import React, { act } from 'react';

const dom = new JSDOM(readFileSync('index.html', 'utf8'), {
  url: 'http://portfolio.test/index.html',
  pretendToBeVisual: true,
});
const { window } = dom;
window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
window.scrollTo = () => {};
Object.assign(globalThis, {
  window,
  document: window.document,
  location: window.location,
  history: window.history,
  HTMLElement: window.HTMLElement,
  Node: window.Node,
  MutationObserver: window.MutationObserver,
  requestAnimationFrame: window.requestAnimationFrame.bind(window),
  cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
  IS_REACT_ACT_ENVIRONMENT: true,
});

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const click = selector => {
  const element = document.querySelector(selector);
  assert.ok(element, `Missing ${selector}`);
  element.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
};

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
let root;
try {
  const { default: App } = await vite.ssrLoadModule('/src/App.jsx');
  const { createRoot } = await import('react-dom/client');
  root = createRoot(document.getElementById('root'));
  await act(async () => root.render(React.createElement(App)));

  const originalDocument = document;
  const originalHeader = document.querySelector('header');
  const originalMain = document.querySelector('main');
  assert.equal(originalMain.querySelector('.hero-intro').textContent, "Hi, I'm Vaibhav Dighe.");
  assert.equal(originalMain.querySelector('h1').getAttribute('aria-label'), 'I make the complex clear.');
  assert.equal(document.querySelectorAll('.hero-explore a').length, 3);
  await act(async () => click('.theme-toggle'));
  assert.equal(document.documentElement.dataset.theme, 'light');
  await act(async () => click('.theme-toggle'));
  assert.equal(document.documentElement.dataset.theme, 'dark');

  await act(async () => click('.hero-explore a[href="/work.html"]'));
  assert.equal(document.documentElement.dataset.exitTransition, 'depth');
  await act(async () => delay(430));
  assert.equal(location.pathname, '/work.html');
  assert.equal(document, originalDocument);
  assert.equal(document.querySelector('header'), originalHeader);
  assert.notEqual(document.querySelector('main'), originalMain);
  assert.match(document.querySelector('main').textContent, /Ideas made useful/);

  await delay(700);
  await act(async () => click('main a[href="/cases/thermogel.html"]'));
  assert.equal(document.documentElement.dataset.exitTransition, 'editorial');
  await act(async () => delay(490));
  assert.equal(location.pathname, '/cases/thermogel.html');
  assert.match(document.querySelector('main').textContent, /From research to a market path/);
  assert.equal(document.querySelector('header'), originalHeader);
  assert.match(document.querySelector('[data-step-panel] strong').textContent, /Listen to stakeholders/);
  await act(async () => click('[data-stepper] button:nth-of-type(2)'));
  assert.match(document.querySelector('[data-step-panel] strong').textContent, /Frame the opportunity/);
  await act(async () => click('[data-replay-motion]'));

  await delay(700);
  await act(async () => click('nav a[href="/visualizations.html"]'));
  await act(async () => delay(430));
  assert.equal(location.pathname, '/visualizations.html');
  assert.equal(document.getElementById('ba-count').textContent, '1,324');
  const filter = document.getElementById('seat-filter');
  await act(async () => {
    filter.value = 'Business Class';
    filter.dispatchEvent(new window.Event('change', { bubbles: true }));
  });
  assert.equal(document.getElementById('ba-yes-label').textContent, '45%');
  assert.equal(document.getElementById('ba-morph-summary').textContent, '227 of 501 reviews recommended British Airways.');

  for (const route of ['work.html', 'visualizations.html', 'about.html', 'cases/wastetide.html', 'cases/thermogel.html', 'cases/service-request.html', 'cases/plant-disease.html', 'cases/zaq.html']) {
    assert.ok(readFileSync(`dist/${route}`, 'utf8').includes('type="module"'), `Missing direct entry for ${route}`);
  }
  process.stdout.write('React navigation, direct routes, and chart controls passed.\n');
} finally {
  if (root) await act(async () => root.unmount());
  await vite.close();
  dom.window.close();
}
