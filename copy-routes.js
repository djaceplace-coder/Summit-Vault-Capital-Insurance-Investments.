import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('dist/index.html does not exist. Run vite build first.');
  process.exit(1);
}

const htmlContent = fs.readFileSync(indexPath, 'utf-8');

// Always write 404.html as a duplicate of index.html for static host fallbacks
fs.writeFileSync(path.join(distDir, '404.html'), htmlContent);
console.log('Created dist/404.html');

// Create physical directories and fallback HTML files for direct URL navigation
const routes = [
  'admin',
  'admin/agents',
  'admin/balances',
  'admin/chats',
  'admin/dashboard',
  'admin/settings',
  'dashboard',
  'dashboard/insurance',
  'portfolio',
  'transactions',
  'messages',
  'settings',
  'login',
  'signup',
  'products',
  'products/stocks',
  'products/digital-assets',
  'products/insurance-linked',
  'products/coins',
  'products/managed',
  'products/compare',
  'insurance',
  'insurance/quote',
  'insurance/life',
  'insurance/health',
  'insurance/property',
  'agents',
  'agents/apply',
  'agents/login',
  'agents/portal',
  'learn',
  'learn/glossary',
  'about',
  'for-business',
];

for (const route of routes) {
  const routeDir = path.join(distDir, route);
  fs.mkdirSync(routeDir, { recursive: true });
  fs.writeFileSync(path.join(routeDir, 'index.html'), htmlContent);
  
  // Also create flat .html for hosts with cleanUrls
  const flatFile = path.join(distDir, `${route.replace(/\//g, '_')}.html`);
  if (!route.includes('/')) {
    fs.writeFileSync(path.join(distDir, `${route}.html`), htmlContent);
  }
}

console.log(`Successfully generated static entrypoints for ${routes.length} SPA routes.`);
