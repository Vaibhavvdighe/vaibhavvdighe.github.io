import home from './pages/home.html?raw';
import work from './pages/work.html?raw';
import visualizations from './pages/visualizations.html?raw';
import about from './pages/about.html?raw';
import wastetide from './pages/wastetide.html?raw';
import thermogel from './pages/thermogel.html?raw';
import serviceRequest from './pages/service-request.html?raw';
import plantDisease from './pages/plant-disease.html?raw';
import zaq from './pages/zaq.html?raw';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

export const sitePath = path => `${basePath}${path}`;
const withBase = html => html.replace(/(href|src)="\/(?!\/)/g, `$1="${basePath}/`);

export const pages = {
  '/index.html': { type: 'home', title: 'Vaibhav Dighe — Analytics, Strategy & Software', content: withBase(home) },
  '/work.html': { type: 'work', title: 'Work — Vaibhav Dighe', content: withBase(work) },
  '/visualizations.html': { type: 'visualizations', title: 'Visualizations — Vaibhav Dighe', content: withBase(visualizations) },
  '/about.html': { type: 'about', title: 'About — Vaibhav Dighe', content: withBase(about) },
  '/cases/wastetide.html': { type: 'case', title: 'Wastetide — Vaibhav Dighe', content: withBase(wastetide) },
  '/cases/thermogel.html': { type: 'case', title: 'ThermoGel — Vaibhav Dighe', content: withBase(thermogel) },
  '/cases/service-request.html': { type: 'case', title: 'Service Request Manager — Vaibhav Dighe', content: withBase(serviceRequest) },
  '/cases/plant-disease.html': { type: 'case', title: 'Plant Disease Detection — Vaibhav Dighe', content: withBase(plantDisease) },
  '/cases/zaq.html': { type: 'case', title: 'ZAQ Actuaries — Vaibhav Dighe', content: withBase(zaq) },
};

export const canonicalPath = path => {
  const relative = basePath && path.startsWith(`${basePath}/`) ? path.slice(basePath.length) : path;
  return relative === '/' ? '/index.html' : relative;
};
