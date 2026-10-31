#!/usr/bin/env node
/**
 * Docs relative-link integrity checker (zero dependencies).
 *
 * Walks every markdown file under docs/ (recursively), root-level markdown
 * files, every package README, and every app markdown file; extracts
 * markdown links and verifies that every relative target exists and every
 * `#anchor` fragment resolves to a heading (GitHub-style slug). External
 * URLs are skipped (no network); generated trees (api/, dist/, lib/,
 * node_modules/) are not walked.
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

/** Generated/installed trees that never contain maintained markdown. */
const SKIP_DIRS = new Set(['node_modules', 'dist', 'lib', 'coverage', 'api', 'test-results', 'playwright-report']);

function collectMarkdownFiles() {
    const files = [];
    const walk = (dir, keep) => {
        for (const entry of readdirSync(dir)) {
            const full = join(dir, entry);
            if (statSync(full).isDirectory()) {
                if (!SKIP_DIRS.has(entry)) walk(full, keep);
            } else if (keep(entry)) {
                files.push(full);
            }
        }
    };
    // Maintained prose end to end, plus the root-level documents.
    walk(join(root, 'docs'), (entry) => entry.endsWith('.md'));
    for (const f of readdirSync(root)) {
        if (f.endsWith('.md')) files.push(join(root, f));
    }
    // Package READMEs and every app document (TO-13 gate widening).
    walk(join(root, 'packages'), (entry) => entry === 'README.md');
    walk(join(root, 'apps'), (entry) => entry.endsWith('.md'));
    return files.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

const files = collectMarkdownFiles();
const broken = [];
let linkCount = 0;

/**
 * Decodes a percent-encoded link segment; malformed input (`%zz`, bare `%`)
 * must not crash the gate — returning the raw value lets it fail (or
 * resolve) like a literal.
 */
function safeDecode(value) {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

/** statSync that reports absence instead of throwing. */
function statOrNull(path) {
    try {
        return statSync(path);
    } catch {
        return null;
    }
}

/**
 * Joins `target` onto `base` and confines the result to the repo root:
 * `%2F`/`%2e%2e`-encoded escapes decode before the join, so a hostile link
 * cannot point the checker outside the repository.
 */
function joinWithinRoot(base, target) {
    const joined = normalize(join(base, target));
    return joined === root || joined.startsWith(`${root}/`) ? joined : null;
}

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
        const fragment = fragPart ? safeDecode(fragPart) : null;
        if (!pathPart) {
            if (fragment && !ownSlugs.has(slugify(fragment))) {
                broken.push(`${file} -> #${fragment}`);
            }
            continue;
        }
        const resolved = joinWithinRoot(dirname(file), safeDecode(pathPart || ''));
        if (resolved === null) {
            broken.push(`${file} -> ${target} (outside repo root)`);
            continue;
        }
        const stat = statOrNull(resolved);
        if (stat === null || (!stat.isDirectory() && !stat.isFile())) {
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
