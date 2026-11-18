#!/usr/bin/env node
/**
 * Build the consumer agent content from the authored store:
 *
 *   instructions/ndigo.md   the managed AGENTS.md block body
 *   instructions/bootstrap.md  the scaffold pointer
 *   skills/<id>/SKILL.md    vendored snapshot of the `ndigo-skills` repo
 *   docs-index.md           generated compressed index (committed output)
 *
 * Outputs:
 *   packages/ndigo-cli/assets/agent/**            version-matched runtime assets
 *   packages/create-ndigo-app/templates/*\/AGENTS.md.template
 *   .agent-content.json                           sha256 manifest (CI gate)
 *
 * The skill snapshot is pinned by `skills.lock.json`; refresh it with
 * `node tools/agent-content/sync-skills.mjs` — never by editing the snapshot.
 *
 * Usage:
 *   node tools/agent-content/build.mjs          # write outputs
 *   node tools/agent-content/build.mjs --check  # verify without writing
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { readSkills } from './_skills.mjs';

const SOURCE = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(dirname(SOURCE));
// The canonical skills live in the sibling `ndigo-skills` repository. This
// copy is pinned by skills.lock.json so builds stay deterministic and offline.
const SKILLS_SOURCE = join(SOURCE, 'skills');
const CHECK = process.argv.includes('--check');
const CLI_ASSETS = join(ROOT, 'packages', 'ndigo-cli', 'assets', 'agent');
const CNA_TEMPLATES = join(ROOT, 'packages', 'create-ndigo-app', 'templates');
const MANIFEST_PATH = join(SOURCE, '.agent-content.json');
const DOCS_INDEX_PATH = join(SOURCE, 'docs-index.md');
const SKILLS_LOCK_PATH = join(SOURCE, 'skills.lock.json');

/** Repository-relative path with forward slashes. */
const repoPath = (absolute) => relative(ROOT, absolute).split('\\').join('/');
const sha256 = (text) => createHash('sha256').update(text, 'utf8').digest('hex');

/** Fails when the vendored snapshot no longer matches its provenance lock. */
function verifySkillsLock(skills) {
    if (!existsSync(SKILLS_LOCK_PATH)) {
        throw new Error(`missing ${repoPath(SKILLS_LOCK_PATH)}; run \`pnpm agent-content:sync\``);
    }
    const lock = JSON.parse(readFileSync(SKILLS_LOCK_PATH, 'utf8'));
    const problems = [];
    for (const { id, content } of skills) {
        if (lock.files?.[`${id}/SKILL.md`] !== sha256(content)) problems.push(`${id}/SKILL.md`);
    }
    for (const file of Object.keys(lock.files ?? {})) {
        const id = file.split('/')[0];
        if (!skills.some((skill) => skill.id === id)) problems.push(`${file} (absent from snapshot)`);
    }
    if (problems.length > 0) {
        process.stderr.write(`✗ agent-content: skills snapshot drifted (${problems.join(', ')})\n`);
        process.stderr.write('run `pnpm agent-content:sync` and commit the snapshot\n');
        process.exit(1);
    }
    return lock;
}

function firstParagraph(text) {
    const lines = text.split('\n');
    let index = lines.findIndex((line) => line.startsWith('# '));
    if (index === -1) return { title: '', summary: '' };
    const title = lines[index]
        .slice(2)
        .trim()
        .replace(/^Guide\s+\d+\s+—\s+/u, '');
    index += 1;
    while (index < lines.length) {
        const line = lines[index].trim();
        if (line === '' || line.startsWith('**') || line.startsWith('>') || line === '---') {
            index += 1;
            continue;
        }
        break;
    }
    const paragraph = [];
    while (index < lines.length && lines[index].trim() !== '') {
        paragraph.push(lines[index].trim());
        index += 1;
    }
    const summary = paragraph.join(' ').replace(/[*_`]/gu, '').slice(0, 200).trim();
    return { title, summary };
}

function guidesIndex() {
    const guides = join(ROOT, 'docs', 'guides');
    return readdirSync(guides)
        .filter((entry) => entry.endsWith('.md') && entry !== 'README.md')
        .sort()
        .map((entry) => {
            const { title, summary } = firstParagraph(readFileSync(join(guides, entry), 'utf8'));
            // Renumbering redirects point at another guide; index the target only.
            if (summary.startsWith('This guide is now ')) return null;
            const slug = entry.slice(0, -'.md'.length);
            return `- \`${slug}\` — ${title}${summary === '' ? '' : `: ${summary}`}`;
        })
        .filter((line) => line !== null);
}

function packagesIndex() {
    const packages = join(ROOT, 'packages');
    return readdirSync(packages)
        .filter((entry) => existsSync(join(packages, entry, 'package.json')))
        .map((entry) => {
            try {
                return JSON.parse(readFileSync(join(packages, entry, 'package.json'), 'utf8'));
            } catch {
                return null;
            }
        })
        .filter((manifest) => typeof manifest?.name === 'string' && typeof manifest?.description === 'string')
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((manifest) => `- \`${manifest.name}\` — ${manifest.description}`);
}

function docsIndex() {
    return [
        '<!-- Generated by tools/agent-content/build.mjs — do not edit. -->',
        '# Ndigo docs index',
        '',
        'Version-matched index of the framework documentation. Read the guide that',
        'matches the task; do not guess APIs from memory.',
        '',
        '## Guides',
        '',
        ...guidesIndex(),
        '',
        '## Packages',
        '',
        ...packagesIndex(),
        '',
    ].join('\n');
}

function outputPlan(skills) {
    const files = new Map();
    files.set(
        repoPath(join(CLI_ASSETS, 'instructions.md')),
        readFileSync(join(SOURCE, 'instructions', 'ndigo.md'), 'utf8')
    );
    files.set(repoPath(join(CLI_ASSETS, 'docs-index.md')), docsIndex());
    for (const { id, content } of skills) {
        files.set(repoPath(join(CLI_ASSETS, 'skills', id, 'SKILL.md')), content);
    }
    const bootstrap = readFileSync(join(SOURCE, 'instructions', 'bootstrap.md'), 'utf8');
    for (const kind of ['browser', 'node']) {
        files.set(repoPath(join(CNA_TEMPLATES, kind, 'AGENTS.md.template')), bootstrap);
    }
    files.set(repoPath(DOCS_INDEX_PATH), docsIndex());
    return new Map([...files.entries()].sort(([left], [right]) => left.localeCompare(right)));
}

function manifestFor(files) {
    const entries = [...files.entries()].map(([file, content]) => [file, sha256(content)]);
    return `${JSON.stringify({ files: Object.fromEntries(entries) }, null, 2)}\n`;
}

function staleSkillDirectories(files) {
    const root = join(CLI_ASSETS, 'skills');
    if (!existsSync(root)) return [];
    const prefix = repoPath(root) + '/';
    const expected = new Set(
        [...files.keys()]
            .filter((file) => file.startsWith(prefix))
            .map((file) => file.slice(prefix.length).split('/')[0])
    );
    return readdirSync(root)
        .filter((entry) => statSync(join(root, entry)).isDirectory() && !expected.has(entry))
        .map((entry) => repoPath(join(root, entry)));
}

function check(files, manifest, lock) {
    const problems = [];
    for (const [file, content] of files) {
        const absolute = join(ROOT, file);
        if (!existsSync(absolute)) {
            problems.push(`missing ${file}`);
            continue;
        }
        if (readFileSync(absolute, 'utf8') !== content) problems.push(`changed ${file}`);
    }
    if (!existsSync(MANIFEST_PATH) || readFileSync(MANIFEST_PATH, 'utf8') !== manifest) {
        problems.push('changed ' + repoPath(MANIFEST_PATH));
    }
    for (const stale of staleSkillDirectories(files)) problems.push(`stale ${stale}`);
    if (problems.length > 0) {
        for (const problem of problems) process.stderr.write(`✗ agent-content: ${problem}\n`);
        process.stderr.write('run `pnpm agent-content:build` and commit the output\n');
        process.exitCode = 1;
        return;
    }
    console.log(`agent-content: ${files.size} files current (skills @ ${lock.commit.slice(0, 7)})`);
}

function write(files, manifest, lock) {
    for (const [file, content] of files) {
        const absolute = join(ROOT, file);
        if (existsSync(absolute) && readFileSync(absolute, 'utf8') === content) continue;
        mkdirSync(dirname(absolute), { recursive: true });
        writeFileSync(absolute, content, 'utf8');
        console.log(`wrote ${file}`);
    }
    for (const stale of staleSkillDirectories(files)) {
        rmSync(stale, { recursive: true, force: true });
        console.log(`removed ${stale}`);
    }
    writeFileSync(MANIFEST_PATH, manifest, 'utf8');
    console.log(`agent-content: ${files.size} files written (skills @ ${lock.commit.slice(0, 7)})`);
}

const skills = readSkills(SKILLS_SOURCE);
const lock = verifySkillsLock(skills);
const files = outputPlan(skills);
const manifest = manifestFor(files);
if (CHECK) check(files, manifest, lock);
else write(files, manifest, lock);
