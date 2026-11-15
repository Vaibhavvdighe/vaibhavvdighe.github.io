import { copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const routes = [
  'work.html', 'visualizations.html', 'about.html',
  'cases/wastetide.html', 'cases/thermogel.html',
  'cases/service-request.html', 'cases/plant-disease.html', 'cases/zaq.html',
  'cases/bluestem.html', 'cases/alumni-relations.html',
];

for (const route of routes) {
  const target = join('dist', route);
  mkdirSync(join(target, '..'), { recursive: true });
  copyFileSync(join('dist', 'index.html'), target);
}
