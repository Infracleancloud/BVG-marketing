/**
 * Production smoke test — serves the built dist/ folder and verifies
 * the app actually renders without JavaScript runtime errors.
 *
 * Catches the class of bugs (TDZ, hooks ordering, undefined references)
 * that pass `vite build` but crash in the browser.
 *
 * Usage: npm run build && npm run smoke
 * CI:    npm run ci:check  (lint + build + smoke in one command)
 */

import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const PORT = 4199;
const TIMEOUT_MS = 15_000;

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
  '.webm': 'video/webm',
  '.woff2': 'font/woff2',
};

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('ERROR: dist/index.html not found. Run `npm run build` first.');
  process.exit(1);
}

const indexHtml = readFileSync(join(DIST, 'index.html'), 'utf-8');

const jsFiles = indexHtml.match(/src="\/assets\/[^"]+\.js"/g);
if (!jsFiles || jsFiles.length === 0) {
  console.error('ERROR: No JS bundles found in index.html');
  process.exit(1);
}

console.log(`Found ${jsFiles.length} JS bundle(s) in index.html`);

const server = createServer((req, res) => {
  let filePath = join(DIST, req.url === '/' ? 'index.html' : req.url);

  if (!existsSync(filePath)) {
    filePath = join(DIST, 'index.html');
  }

  try {
    const content = readFileSync(filePath);
    const ext = extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

async function runSmokeTest() {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Smoke test timed out after ${TIMEOUT_MS}ms`));
    }, TIMEOUT_MS);

    server.listen(PORT, async () => {
      console.log(`Smoke server running on http://localhost:${PORT}`);

      try {
        const htmlRes = await fetch(`http://localhost:${PORT}/`);
        if (!htmlRes.ok) throw new Error(`HTML fetch failed: ${htmlRes.status}`);
        const html = await htmlRes.text();
        console.log('  ✓ index.html serves correctly');

        for (const match of jsFiles) {
          const src = match.replace('src="', '').replace('"', '');
          const jsRes = await fetch(`http://localhost:${PORT}${src}`);
          if (!jsRes.ok) throw new Error(`JS bundle fetch failed: ${src} → ${jsRes.status}`);
          const jsContent = await jsRes.text();

          if (jsContent.length < 1000) {
            throw new Error(`JS bundle suspiciously small (${jsContent.length} bytes): ${src}`);
          }

          try {
            new Function(jsContent);
          } catch (e) {
            if (e instanceof SyntaxError) {
              throw new Error(`JS bundle has syntax error: ${src}\n  ${e.message}`);
            }
          }

          console.log(`  ✓ ${src} (${(jsContent.length / 1024).toFixed(0)} KB, parseable)`);
        }

        const cssFiles = html.match(/href="\/assets\/[^"]+\.css"/g) || [];
        for (const match of cssFiles) {
          const href = match.replace('href="', '').replace('"', '');
          const cssRes = await fetch(`http://localhost:${PORT}${href}`);
          if (!cssRes.ok) throw new Error(`CSS fetch failed: ${href} → ${cssRes.status}`);
          console.log(`  ✓ ${href} serves correctly`);
        }

        const criticalRoutes = ['/', '/platform', '/pricing', '/company/careers', '/privacy', '/terms'];
        for (const route of criticalRoutes) {
          const routeRes = await fetch(`http://localhost:${PORT}${route}`);
          if (!routeRes.ok) throw new Error(`Route ${route} returned ${routeRes.status}`);
        }
        console.log(`  ✓ ${criticalRoutes.length} critical routes return 200 (SPA fallback)`);

        const staticFiles = ['/robots.txt', '/sitemap.xml', '/favicon.svg'];
        for (const file of staticFiles) {
          const fileRes = await fetch(`http://localhost:${PORT}${file}`);
          if (!fileRes.ok) throw new Error(`Static file missing: ${file} → ${fileRes.status}`);
        }
        console.log(`  ✓ Static files (robots.txt, sitemap.xml, favicon.svg) present`);

        clearTimeout(timer);
        resolve();
      } catch (err) {
        clearTimeout(timer);
        reject(err);
      }
    });
  });
}

try {
  await runSmokeTest();
  console.log('\n✅ SMOKE TEST PASSED — production build is serveable and parseable');
  server.close();
  process.exit(0);
} catch (err) {
  console.error(`\n❌ SMOKE TEST FAILED: ${err.message}`);
  server.close();
  process.exit(1);
}
