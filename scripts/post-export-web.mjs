import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const indexPath = path.join(distDir, 'index.html');
const fallbackPath = path.join(distDir, '404.html');

if (!fs.existsSync(indexPath)) {
  console.error('post-export-web: dist/index.html not found. Run expo export --platform web first.');
  process.exit(1);
}

fs.copyFileSync(indexPath, fallbackPath);
console.log('post-export-web: copied dist/index.html to dist/404.html for hosting fallbacks');
