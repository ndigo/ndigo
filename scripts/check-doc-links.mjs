#!/usr/bin/env node
/**
 * Docs relative-link integrity checker (zero dependencies).
 *
 * Walks every markdown file under docs/ (recursively) plus root-level
 * markdown files, extracts markdown links, and verifies that every relative
 * target exists and every `#anchor` fragment resolves to a heading
 * (GitHub-style slug). External URLs are skipped (no network).
 *
 * Catches: renamed/moved files, wrong relative depth, wrong link dates,
 * and heading anchors that no longer exist. Run via `pnpm docs:links`.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** GitHub-style heading slug (ASCII headings): punctuation stripped, spaces become single hyphens, runs preserved. */
function slugify(heading) {
    return heading
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // link text
        .replace(/`[^`]*`/g, (m) => m.slice(1, -1)) // inline code
        .toLowerCase()
        .replace(/[^a-z0-9 _-]/g, '')
        .replace(/ /g, '-');
}

/** ATX heading slugs of a markdown file, with GitHub's duplicate suffixing (2nd = `-1`, …). */
function headingSlugs(text) {
    const slugs = new Set();
    const seen = new Map();
    for (const line of text.split('\n')) {
        const m = line.match(/^#{1,6}\s+(.+?)\s*#*\s*$/);
        if (!m) continue;
        const base = slugify(m[1]);
        if (!base) continue;
        const n = seen.get(base) ?? 0;
        seen.set(base, n + 1);
        slugs.add(n === 0 ? base : `${base}-${n}`);
    }
    return slugs;
}

/** Strip fenced code blocks so code samples cannot produce false positives. */
function withoutCodeFences(text) {
    return text.replace(/```[\s\S]*?```/g, '');
}

function collectMarkdownFiles() {
    const files = [];
    const walk = (dir) => {
        for (const entry of readdirSync(dir)) {
            const full = join(dir, entry);
            if (statSync(full).isDirectory()) walk(full);
            else if (entry.endsWith('.md')) files.push(full);
        }
    };
    walk(join(root, 'docs'));
    for (const f of readdirSync(root)) {
        if (f.endsWith('.md')) files.push(join(root, f));
    }
    return files.sort();
}

const files = collectMarkdownFiles();
const broken = [];
let linkCount = 0;

for (const file of files) {
    const raw = readFileSync(file, 'utf8');
    const text = withoutCodeFences(raw);
    // Headings are matched against the raw text: legacy docs contain
    // unbalanced fences (session logs), so a heading inside one is still a
    // real anchor target; link extraction stays fence-stripped to avoid
    // code-sample false positives.
    const ownSlugs = headingSlugs(raw);
    const linkRe = /\[[^\]]*\]\(([^)]+)\)/g;
    for (const m of text.matchAll(linkRe)) {
        let target = m[1].trim();
        // Strip optional title
        target = target.replace(/\s+["'][^"']*["']\s*$/, '');
        if (!target || target === '#' || /^(https?:|mailto:|data:)/i.test(target)) continue;
        linkCount++;
        const [pathPart, fragPart] = target.split('#');
        const fragment = fragPart ? decodeURIComponent(fragPart) : null;
        const resolved = normalize(join(dirname(file), decodeURIComponent(pathPart || '')));
        if (!pathPart) {
            if (fragment && !ownSlugs.has(slugify(fragment))) {
                broken.push(`${file} -> #${fragment}`);
            }
            continue;
        }
        if (!statSync(resolved).isDirectory() && !statSync(resolved).isFile()) {
            broken.push(`${file} -> ${target} (missing)`);
            continue;
        }
        if (fragment) {
            const targetSlugs = pathPart.endsWith('.md') ? headingSlugs(readFileSync(resolved, 'utf8')) : new Set();
            if (!targetSlugs.has(slugify(fragment))) {
                broken.push(`${file} -> ${target} (anchor #${fragment} not found)`);
            }
        }
    }
}

if (broken.length > 0) {
    console.error(`Broken links (${broken.length}):`);
    for (const b of broken) console.error(`  - ${b}`);
    process.exit(1);
}
console.log(`docs link check: ${files.length} files, ${linkCount} relative links — OK`);
