/**
 * Renders every built story in Chromium and fails when one is blank, throws, or
 * trips an accessibility rule.
 *
 * Usage: node test/smoke-stories.mjs [--dir storybook-static] [--only ui-button]
 *        [--theme dark|light|both] [--no-axe]
 *
 * Exists because `storybook build` only proves the bundle compiles: four
 * components shipped stories that rendered nothing. jsdom axe cannot catch
 * that, nor contrast, so the checks run against the real preview iframe.
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { chromium } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.map': 'application/json; charset=utf-8',
    '.webmanifest': 'application/manifest+json',
};

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const FAIL_IMPACTS = new Set(['serious', 'critical']);

/**
 * Accepted violations, keyed by story id. Every entry needs a reason: an empty
 * allowlist is the goal, and a new entry is a decision, not a fix.
 */
const AXE_ALLOWLIST = {};

const args = process.argv.slice(2);
const option = (name, fallback) => {
    const index = args.indexOf(`--${name}`);
    return index === -1 ? fallback : args[index + 1];
};
const outputDir = resolve(option('dir', 'storybook-static'));
const only = option('only', '');
const themeArg = option('theme', 'both');
const themes = themeArg === 'both' ? ['dark', 'light'] : [themeArg];
const useAxe = !args.includes('--no-axe');

if (!existsSync(join(outputDir, 'index.json'))) {
    console.error(`No Storybook build at ${outputDir}. Run: pnpm --filter @ndigo/ui-storybook build-storybook`);
    process.exit(1);
}

function serve(dir) {
    const server = createServer((request, response) => {
        const url = new URL(request.url ?? '/', 'http://127.0.0.1');
        let path = join(dir, decodeURIComponent(url.pathname));
        if (!path.startsWith(dir)) {
            response.writeHead(403).end();
            return;
        }
        if (existsSync(path) && statSync(path).isDirectory()) path = join(path, 'index.html');
        if (!existsSync(path)) {
            response.writeHead(404).end('not found');
            return;
        }
        response.writeHead(200, { 'content-type': MIME[extname(path)] ?? 'application/octet-stream' });
        createReadStream(path).pipe(response);
    });
    return new Promise((done) => {
        server.listen(0, '127.0.0.1', () => done({ server, port: server.address().port }));
    });
}

const index = JSON.parse(await readFile(join(outputDir, 'index.json'), 'utf8'));
const stories = Object.values(index.entries).filter(
    (entry) => entry.type === 'story' && (!only || entry.id.includes(only))
);

if (stories.length === 0) {
    console.error(only ? `No stories match "${only}".` : 'The build contains no stories.');
    process.exit(1);
}

const { server, port } = await serve(outputDir);
const browser = await chromium.launch();
const failures = [];
let checks = 0;

// Stories run sequentially on one page so console errors and failures stay
// attributable to a single story; parallel tabs would mix them and multiply
// browser memory across 95 stories.
// oxlint-disable no-await-in-loop -- sequential by design (see above).

for (const theme of themes) {
    // An explicit context: axe's partial-run mode opens a blank helper page
    // through the context, which `browser.newPage()` does not allow. Reduced
    // motion keeps enter animations from mid-flight opacity and blended
    // colors, which otherwise show up as phantom contrast failures.
    const context = await browser.newContext({ viewport: { width: 1024, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('console', (message) => {
        if (message.type() !== 'error') return;
        const text = message.text();
        // Font/CDN fetch failures are environmental, not story defects.
        if (/Failed to load resource|net::ERR_/u.test(text)) return;
        pageErrors.push(text);
    });

    for (const story of stories) {
        checks += 1;
        const url = `http://127.0.0.1:${port}/iframe.html?id=${story.id}&viewMode=story&globals=theme:${theme}`;
        const label = `${story.id} [${theme}]`;
        try {
            await page.goto(url, { waitUntil: 'load', timeout: 30_000 });
            await page.waitForFunction(
                () => {
                    const root = document.getElementById('storybook-root');
                    return root !== null && root.childElementCount > 0;
                },
                { timeout: 10_000 }
            );
            // Theme swaps and enter effects run as transitions. Axe samples
            // computed colors, so an in-flight transition reads as the previous
            // palette and reports contrast failures the settled page does not
            // have. A later style tag wins over Storybook's reduced-motion
            // rules and pins every element to its final value.
            await page.addStyleTag({
                content: '*, *::before, *::after { animation: none !important; transition: none !important; }',
            });
            const renderedHeight = await page.evaluate(() => {
                const root = document.getElementById('storybook-root');
                if (root === null) return 0;
                const own = root.getBoundingClientRect();
                if (own.width > 0 && own.height >= 2) return own.height;
                // Fixed-position stories (toasts, overlays) leave the root at
                // zero height in normal flow; fall back to the rendered child.
                return [...root.querySelectorAll('*')].reduce((tallest, element) => {
                    const rect = element.getBoundingClientRect();
                    return rect.width > 0 && rect.height > 0 ? Math.max(tallest, rect.height) : tallest;
                }, 0);
            });
            if (renderedHeight < 2) {
                failures.push(`${label}: root renders but measures ${renderedHeight}px tall`);
            }
            if (useAxe) {
                const result = await new AxeBuilder({ page }).include('#storybook-root').withTags(TAGS).analyze();
                for (const violation of result.violations) {
                    if (!FAIL_IMPACTS.has(violation.impact ?? '')) continue;
                    const allowed = AXE_ALLOWLIST[story.id] ?? [];
                    if (allowed.includes(violation.id)) continue;
                    failures.push(`${label}: axe ${violation.impact} ${violation.id} — ${violation.help}`);
                }
            }
        } catch (error) {
            failures.push(`${label}: ${error instanceof Error ? error.message.split('\n')[0] : String(error)}`);
        }
        if (pageErrors.length > 0) {
            failures.push(`${label}: console — ${pageErrors[0]}`);
            pageErrors.length = 0;
        }
    }

    await context.close();
}

await browser.close();
server.close();

const storiesChecked = stories.length * themes.length;
if (failures.length > 0) {
    console.error(`\n✗ ${failures.length} failure(s) across ${storiesChecked} story checks\n`);
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
}

console.log(
    `✓ ${storiesChecked} story checks passed (${stories.length} stories × ${themes.length} themes, axe ${useAxe ? 'on' : 'off'})`
);
