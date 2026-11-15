import home from './pages/home.html?raw';
import work from './pages/work.html?raw';
import visualizations from './pages/visualizations.html?raw';
import about from './pages/about.html?raw';
import wastetide from './pages/wastetide.html?raw';
import thermogel from './pages/thermogel.html?raw';
import serviceRequest from './pages/service-request.html?raw';
import plantDisease from './pages/plant-disease.html?raw';
import zaq from './pages/zaq.html?raw';
import bluestem from './pages/bluestem.html?raw';
import alumniRelations from './pages/alumni-relations.html?raw';

export const pages = {
  '/index.html': { type: 'home', title: 'Vaibhav Dighe — Business, Product & Project Work', content: home },
  '/work.html': { type: 'work', title: 'Work — Vaibhav Dighe', content: work },
  '/visualizations.html': { type: 'visualizations', title: 'Visualizations — Vaibhav Dighe', content: visualizations },
  '/about.html': { type: 'about', title: 'About — Vaibhav Dighe', content: about },
  '/cases/wastetide.html': { type: 'case', title: 'Wastetide — Vaibhav Dighe', content: wastetide },
  '/cases/thermogel.html': { type: 'case', title: 'ThermoGel — Vaibhav Dighe', content: thermogel },
  '/cases/service-request.html': { type: 'case', title: 'Service Request Manager — Vaibhav Dighe', content: serviceRequest },
  '/cases/plant-disease.html': { type: 'case', title: 'Plant Disease Detection — Vaibhav Dighe', content: plantDisease },
  '/cases/zaq.html': { type: 'case', title: 'ZAQ Actuaries — Vaibhav Dighe', content: zaq },
  '/cases/bluestem.html': { type: 'case', title: 'Bluestem AI Governance — Vaibhav Dighe', content: bluestem },
  '/cases/alumni-relations.html': { type: 'case', title: 'Alumni Relations — Vaibhav Dighe', content: alumniRelations },
};

export const canonicalPath = path => path === '/' ? '/index.html' : path;
