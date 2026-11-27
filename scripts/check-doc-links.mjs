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
 * and heading anchors that no longer exist. On every published markdown file
 * and package source file it also rejects internal decision-record IDs; the
 * pages published as the site's Concepts section additionally reject internal
 * security IDs and links into the internal record trees — readers there cannot
 * resolve repository bookkeeping. Root-relative targets
 * (`/reference/…`, `/guides/…`, …) are site routes on the published docs
 * site, not repository paths — the checker cannot resolve them without the
 * site's route table, so it counts and skips them. Run via `pnpm docs:links`.
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

/**
 * Local-only, gitignored trees: plans, audits, and references are working
 * notes, not maintained prose, so a stale link there must not fail the gate.
 */
const LOCAL_ONLY_DIRS = new Set(['plans', 'audits', 'reference'].map((name) => join(root, 'docs', name)));

function collectMarkdownFiles() {
    const files = [];
    const walk = (dir, keep) => {
        for (const entry of readdirSync(dir)) {
            const full = join(dir, entry);
            if (statSync(full).isDirectory()) {
                if (!SKIP_DIRS.has(entry) && !LOCAL_ONLY_DIRS.has(full)) walk(full, keep);
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
let siteRouteCount = 0;

/**
 * Root-relative targets are routes on the published documentation site, not
 * repository paths. `/reference/api/…` exists only after `doc:api` renders;
 * the rest are site sections. Resolution needs the site's route table, which
 * does not live in this repository, so these links are counted and skipped.
 */
const SITE_ROUTE_PREFIXES = ['/reference/', '/guides/', '/concepts/', '/ui/'];

/**
 * Pages published as the documentation site's Concepts section. Readers of
 * these pages cannot resolve repository bookkeeping, so internal record IDs
 * and links into the internal record trees are rejected.
 */
function isConceptPage(file) {
    const rel = file.slice(root.length + 1);
    return (
        rel === 'ARCHITECTURE.md' ||
        rel === 'STYLE_GUIDE.md' ||
        (rel.startsWith('docs/architecture/') && rel.endsWith('.md'))
    );
}

/**
 * Internal-only trees and the maintainer contract are not published prose:
 * decision records keep their IDs, and plans, audits, and references are
 * local-only. Everywhere else, an ADR ID is a reader-facing defect.
 */
function isInternalDoc(file) {
    const rel = file.slice(root.length + 1);
    return (
        rel === 'AGENTS.md' ||
        rel.startsWith(`docs/decisions/`) ||
        rel.startsWith(`docs/plans/`) ||
        rel.startsWith(`docs/audits/`) ||
        rel.startsWith(`docs/reference/`)
    );
}

const PUBLISHED_DOC_VIOLATIONS = [{ pattern: /\bAD-\d+\b/, label: 'decision-record ID' }];

const CONCEPT_VIOLATIONS = [
    ...PUBLISHED_DOC_VIOLATIONS,
    { pattern: /\bSEC-\d+\b/, label: 'internal security ID' },
    { pattern: /\]\([^)]*docs\/(?:decisions|plans|audits|reference)\//, label: 'link into internal records' },
];

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
        if (SITE_ROUTE_PREFIXES.some((prefix) => target.startsWith(prefix))) {
            siteRouteCount++;
            continue;
        }
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

const internalRefs = [];
let publishedDocCount = 0;
let conceptPageCount = 0;
for (const file of files) {
    if (isInternalDoc(file)) continue;
    publishedDocCount++;
    const concept = isConceptPage(file);
    if (concept) conceptPageCount++;
    const rules = concept ? CONCEPT_VIOLATIONS : PUBLISHED_DOC_VIOLATIONS;
    const lines = readFileSync(file, 'utf8').split('\n');
    for (const [index, line] of lines.entries()) {
        const hit = rules.find(({ pattern }) => pattern.test(line));
        if (hit) internalRefs.push(`${file}:${index + 1} -> ${hit.label}: ${line.trim()}`);
    }
}

/**
 * Package source reaches readers through the generated API reference, so
 * public TSDoc must not cite decision records either. Tests and app code are
 * not published as API and stay out of scope.
 */
function collectPackageSourceFiles() {
    const sources = [];
    const walk = (dir) => {
        for (const entry of readdirSync(dir)) {
            const full = join(dir, entry);
            if (statSync(full).isDirectory()) walk(full);
            else if (/\.(?:ts|tsx|mts|cts)$/.test(entry)) sources.push(full);
        }
    };
    for (const pkg of readdirSync(join(root, 'packages'))) {
        const src = join(root, 'packages', pkg, 'src');
        const stat = statOrNull(src);
        if (stat?.isDirectory()) walk(src);
    }
    return sources;
}

const sourceFiles = collectPackageSourceFiles();
for (const file of sourceFiles) {
    const lines = readFileSync(file, 'utf8').split('\n');
    for (const [index, line] of lines.entries()) {
        if (/\bAD-\d+\b/.test(line)) {
            internalRefs.push(`${file}:${index + 1} -> decision-record ID: ${line.trim()}`);
        }
    }
}

if (broken.length > 0 || internalRefs.length > 0) {
    if (broken.length > 0) {
        console.error(`Broken links (${broken.length}):`);
        for (const b of broken) console.error(`  - ${b}`);
    }
    if (internalRefs.length > 0) {
        console.error(`Internal references in published docs and package source (${internalRefs.length}):`);
        for (const ref of internalRefs) console.error(`  - ${ref}`);
        console.error('Use prose or a public guide link; decision records stay in docs/decisions/.');
    }
    process.exit(1);
}
console.log(
    `docs link check: ${files.length} files, ${linkCount} relative links, ${siteRouteCount} site routes; ` +
        `${publishedDocCount} published docs (${conceptPageCount} concepts) and ${sourceFiles.length} package sources ` +
        `free of internal record IDs — OK`
);
