#!/usr/bin/env node
/**
 * Guide contract check.
 *
 * Verifies the published guides under `docs/guides/` against the standard in
 * the guides README: numbered filename/H1 agreement, audience/prerequisites/
 * reference block, "What you'll learn", "See also", index coverage, existing
 * reference paths, and parseable TypeScript fences. Redirect stubs marked
 * `<!-- guide-redirect -->` are excluded.
 *
 * Usage: `pnpm guides:check` (CI) or `node scripts/check-guides.mjs`.
 */
import { createRequire } from 'node:module';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const GUIDES = join(ROOT, 'docs/guides');
const manifest = JSON.parse(readFileSync(join(GUIDES, 'guides.json'), 'utf8'));
const manifestGuides = [...manifest.groups.flatMap((group) => group.guides), ...(manifest.contributing ?? [])];
const manifestSlugs = new Set(manifestGuides.map((guide) => guide.slug));
const manifestTitles = new Map(manifestGuides.map((guide) => [guide.slug, guide.title]));
const INDEX = join(GUIDES, 'README.md');
const require = createRequire(join(ROOT, 'package.json'));
const ts = require('typescript-6');

const failures = [];
const warnings = [];

/** Replace a bare ellipsis outside comments/strings with an empty block comment. */
function normalizeSnippet(code) {
    let out = '';
    let index = 0;
    let mode = 'code';
    while (index < code.length) {
        const char = code[index];
        const next = code[index + 1];
        if (mode === 'code' && char === '/' && next === '/') {
            mode = 'line';
            out += '//';
            index += 2;
            continue;
        }
        if (mode === 'code' && char === '/' && next === '*') {
            mode = 'block';
            out += '/*';
            index += 2;
            continue;
        }
        if (mode === 'line' && char === '\n') {
            mode = 'code';
            out += char;
            index++;
            continue;
        }
        if (mode === 'block' && char === '*' && next === '/') {
            mode = 'code';
            out += '*/';
            index += 2;
            continue;
        }
        if (mode === 'code' && (char === "'" || char === '"' || char === '`')) {
            const quote = char;
            out += char;
            index++;
            while (index < code.length) {
                const inner = code[index];
                out += inner;
                index++;
                if (inner === '\\') {
                    out += code[index] ?? '';
                    index++;
                    continue;
                }
                if (inner === quote) break;
            }
            continue;
        }
        if (mode === 'code' && char === '…') {
            out += '/* … */';
            index++;
            continue;
        }
        out += char;
        index++;
    }
    return out;
}

function parses(code) {
    const file = ts.createSourceFile('guide-snippet.ts', code, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
    return !(file.parseDiagnostics ?? []).length;
}

/**
 * Guide snippets are deliberately fragments (method bodies, decorators without
 * their class, object literals). Try the shapes a reader would paste them into.
 */
function snippetParses(raw) {
    const code = normalizeSnippet(raw);
    const body = code
        .split('\n')
        .filter((line) => !/^\s*import\b/.test(line))
        .join('\n');
    const candidates = [
        code,
        `class __GuideSnippet {\n${body}\n}`,
        `class __GuideSnippet {\n${body}\n__guide() {}\n}`,
        `function __guideSnippet() {\n${body}\n}`,
        `const __guideSnippet = (\n${body}\n);`,
        `class __GuideSnippet { constructor() {\n${body}\n} }`,
    ];
    return candidates.some(parses);
}

function fenceFailures(text) {
    const found = [];
    const fence = /```ts\n([\s\S]*?)```/g;
    let match;
    while ((match = fence.exec(text))) {
        if (!snippetParses(match[1])) {
            found.push(text.slice(0, match.index).split('\n').length);
        }
    }
    return found;
}

function fenceStructureFailures(text) {
    const lines = text.split('\n');
    const found = [];
    const stack = [];
    for (let i = 0; i < lines.length; i++) {
        const m = lines[i].match(/^(\s*)(`{3,})(.*)$/);
        if (!m) continue;
        const ticks = m[2];
        const info = m[3].trim();
        if (stack.length > 0) {
            const opener = stack[stack.length - 1];
            // A closing fence has no info string and at least as many backticks.
            if (info === '' && ticks.length >= opener.ticks) {
                if (ticks.length !== opener.ticks) {
                    found.push(
                        `${opener.line}: opening fence has ${opener.ticks} backticks but closing fence has ${ticks.length}`
                    );
                }
                stack.pop();
                continue;
            }
        }
        // An opening fence: indented, or carries an info string, or deeper than
        // the current opener. Treat any line that looks like a fence as an opener
        // when no closer matches.
        if (info !== '' || stack.length === 0 || ticks.length > stack[stack.length - 1].ticks) {
            stack.push({ line: i + 1, ticks: ticks.length });
        }
    }
    for (const opener of stack) {
        found.push(`${opener.line}: unclosed code fence (${opener.ticks} backticks)`);
    }
    return found;
}

const files = readdirSync(GUIDES)
    .filter((file) => file.endsWith('.md') && file !== 'README.md' && file !== 'coverage.md')
    .sort();

// Collect guide titles for cross-reference label checks.
const titleMap = {};
for (const guide of manifestGuides) {
    titleMap[guide.slug] = guide.title.replace(/`/g, '');
}

const guideFiles = [];

for (const file of files) {
    const path = join(GUIDES, file);
    const text = readFileSync(path, 'utf8');

    if (!manifestSlugs.has(file.replace(/\.md$/, ''))) {
        failures.push(`${file}: not listed in docs/guides/guides.json`);
    }
    guideFiles.push(file);

    const heading = /^# (.+)$/m.exec(text);
    if (!heading) {
        failures.push(`${file}: missing H1`);
    }

    const slug = file.replace(/\.md$/, '');
    const expectedTitle = manifestTitles.get(slug);
    if (heading && expectedTitle) {
        const titleText = heading[1].trim().replace(/`/g, '');
        if (titleText !== expectedTitle.replace(/`/g, '')) {
            failures.push(`${file}: H1 "${titleText}" does not match manifest title "${expectedTitle}"`);
        }
    }

    // Title rules: no module names, no backticks, max 30 chars.
    if (heading) {
        const titleText = heading[1].trim().replace(/`/g, '');
        if (/@ndigo\//.test(titleText)) failures.push(`${file}: title contains a module name`);
        if (/`/.test(heading[1])) failures.push(`${file}: title contains backticks`);
        if (titleText.length > 30 && file !== 'capabilities-for-authoring-agents.md') {
            failures.push(`${file}: title is ${titleText.length} chars (max 30)`);
        }
        if (titleText.length > 30 && file === 'capabilities-for-authoring-agents.md') {
            warnings.push(`${file}: title is ${titleText.length} chars (temporary exception; rename to shorten)`);
        }
    }

    for (const label of ['Audience', 'Prerequisites']) {
        if (!new RegExp(`\\*\\*${label}:\\*\\*`).test(text)) {
            failures.push(`${file}: missing **${label}:** block`);
        }
    }
    if (!/\*\*Reference (app|package):\*\*/.test(text)) {
        failures.push(`${file}: missing **Reference app:** (or **Reference package:**) block`);
    }

    // Opening paragraph must not contain package or decorator names.
    const audienceMatch = text.match(/\*\*Audience:\*\*/);
    const beforeAudience = audienceMatch ? text.slice(0, audienceMatch.index) : text;
    const h1End = heading ? heading.index + heading[0].length : 0;
    const introSection = beforeAudience.slice(h1End);
    const introParas = introSection
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
    const firstPara = introParas.find(
        (p) => !p.startsWith('<') && !p.startsWith('**Use for') && !p.startsWith('**Not for')
    );
    if (firstPara) {
        if (/@ndigo\//.test(firstPara) || /`@[^`]+`/.test(firstPara)) {
            failures.push(`${file}: opening paragraph contains a package or decorator name`);
        }
        if (/^How .* in Ndigo/i.test(firstPara)) {
            failures.push(`${file}: opening paragraph starts with "How ... in Ndigo"`);
        }
    }

    // Use for / Not for lines (warning until all guides are migrated).
    if (!/\*\*Use for:\*\*/.test(text)) {
        failures.push(`${file}: missing **Use for:** line`);
    }
    if (!/\*\*Not for:\*\*/.test(text)) {
        failures.push(`${file}: missing **Not for:** line`);
    }

    if (!/^## What you'll learn$/m.test(text)) failures.push(`${file}: missing "## What you'll learn"`);
    if (!/^## See also$/m.test(text)) failures.push(`${file}: missing "## See also"`);

    const referenceLine = /\*\*Reference (?:app|package):\*\*(.+)/.exec(text);
    if (referenceLine) {
        for (const reference of referenceLine[1].matchAll(/`((?:apps|packages)\/[^`]+)`/g)) {
            if (!existsSync(join(ROOT, reference[1]))) {
                failures.push(`${file}: reference path does not exist: ${reference[1]}`);
            }
        }
    }

    for (const line of fenceFailures(text)) {
        failures.push(`${file}:${line}: TypeScript fence does not parse`);
    }

    for (const failure of fenceStructureFailures(text)) {
        failures.push(`${file}: ${failure}`);
    }

    // Cross-guide links should use the target guide's title as the label.
    for (const match of text.matchAll(/\[([^`\]]+)\]\(([^)]+)\)/g)) {
        const label = match[1].trim().replace(/`/g, '');
        const target = match[2].split('#')[0].split('/').pop() ?? '';
        const targetSlug = target.replace(/\.md$/, '');
        if (titleMap[targetSlug] && (/Guide/i.test(label) || /\d/.test(label))) {
            const expected = titleMap[targetSlug];
            const normalized = label.replace(/\s*§\s*\d+.*$/, '').trim();
            if (normalized !== expected && label !== expected) {
                warnings.push(`${file}: link label "${label}" does not match target title "${expected}" (${match[2]})`);
            }
        }
    }

    // Plain "Guide NN" citations must be Markdown links. Skip the H1, code
    // fences, inline code, and link text (already linked).
    let inFence = false;
    text.split('\n').forEach((line, index) => {
        if (line.trimStart().startsWith('```')) {
            inFence = !inFence;
            return;
        }
        if (inFence || /^#\s+/.test(line)) return;
        const plain = line
            .replace(/\[[^\]]*\]\([^)]*\)/g, '')
            .replace(/\[[^\]]*\]\[[^\]]*\]/g, '')
            .replace(/`[^`]*`/g, '');
        for (const match of plain.matchAll(/Guides? \d/g)) {
            failures.push(`${file}:${index + 1}: plain guide citation "${match[0]}" — link it`);
        }
    });

    const lines = text.split('\n').length;
    if (lines > 400) warnings.push(`${file}: ${lines} lines (contract target is ~300, hard review at 400)`);
}

for (const guide of manifestGuides) {
    if (!existsSync(join(GUIDES, `${guide.slug}.md`))) {
        failures.push(`docs/guides/guides.json: missing guide file ${guide.slug}.md`);
    }
}

const index = readFileSync(INDEX, 'utf8');
const indexed = new Set();
for (const match of index.matchAll(/\]\(([a-z0-9-]+)\.md\)/g)) indexed.add(`${match[1]}.md`);

for (const file of guideFiles) {
    if (!indexed.has(file)) failures.push(`${file}: not linked from docs/guides/README.md`);
}
for (const file of indexed) {
    if (file === 'README.md' || file === 'coverage.md') continue;
    if (!guideFiles.includes(file)) failures.push(`docs/guides/README.md: links non-guide file ${file}`);
}

// README index labels must match the guide titles.
for (const match of index.matchAll(/\[([^\]]+)\]\(([a-z0-9-]+)\.md\)/g)) {
    const label = match[1].trim().replace(/`/g, '');
    const slug = match[2];
    if (titleMap[slug] && label !== titleMap[slug] && /Guide|\d/.test(label)) {
        failures.push(`docs/guides/README.md: index label "${label}" does not match guide title "${titleMap[slug]}"`);
    }
}

for (const warning of warnings) console.warn(`warning: ${warning}`);

// Every public package must have a documentation decision in the coverage matrix.
const coveragePath = join(GUIDES, 'coverage.md');
if (existsSync(coveragePath)) {
    const coverage = readFileSync(coveragePath, 'utf8');
    for (const entry of readdirSync(join(ROOT, 'packages'))) {
        const pkgManifest = join(ROOT, 'packages', entry, 'package.json');
        if (!existsSync(pkgManifest)) continue;
        const { name } = JSON.parse(readFileSync(pkgManifest, 'utf8'));
        if (!coverage.includes(`\`${name}\``)) {
            failures.push(`docs/guides/coverage.md: missing package ${name}`);
        }
    }
}

for (const failure of failures) console.error(`✗ ${failure}`);
if (failures.length) {
    console.error(`\n✗ ${failures.length} guide contract failure(s)`);
    process.exit(1);
}
console.log(`✓ ${guideFiles.length} guides match the contract (${warnings.length} warning(s))`);
