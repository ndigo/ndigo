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
 *   (AGENTS.md.template is no longer generated here; it lives in the
 *    standalone create-ndigo-app repo and is refreshed manually)
 *   packages/<pkg>/docs/llms.txt                  per-package export index
 *   packages/<pkg>/skills/<id>/SKILL.md           skill fallback for packages
 *                                                 a skill declares via frontmatter
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

import { renderPackageIndex } from './_package-index.mjs';
import { readSkills } from './_skills.mjs';
import {
    capabilityProblems,
    packageFacts,
    readCapabilityCatalog,
    renderCapabilityLine,
    uiItems,
} from './_capabilities.mjs';

const SOURCE = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(dirname(SOURCE));
// The canonical skills live in the sibling `ndigo-skills` repository. This
// copy is pinned by skills.lock.json so builds stay deterministic and offline.
const SKILLS_SOURCE = join(SOURCE, 'skills');
const CHECK = process.argv.includes('--check');
const PACKAGES_ROOT = join(ROOT, 'packages');
const CLI_ASSETS = join(PACKAGES_ROOT, 'ndigo-cli', 'assets', 'agent');
const CAPABILITIES_ASSETS = join(PACKAGES_ROOT, 'ndigo-cli', 'assets', 'capabilities');
// NOTE: AGENTS.md.template for the standalone create-ndigo-app repo is no
// longer generated here. It lives in github.com/ndigo/create-ndigo-app and is
// refreshed manually from tools/agent-content/instructions/bootstrap.md.
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
    const title = lines[index].slice(2).trim();
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
    const manifest = JSON.parse(readFileSync(join(guides, 'guides.json'), 'utf8'));
    const slugs = manifest.groups.flatMap((group) => group.guides.map((guide) => guide.slug));
    return slugs.map((slug) => {
        const { title, summary } = firstParagraph(readFileSync(join(guides, `${slug}.md`), 'utf8'));
        return `- \`${slug}\` — ${title}${summary === '' ? '' : `: ${summary}`}`;
    });
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

/**
 * Reads every workspace package manifest, sorted by package name.
 *
 * @returns `{ dir, root, manifest }` records for the `packages/` tree.
 */
function workspacePackages() {
    return readdirSync(PACKAGES_ROOT)
        .filter((entry) => existsSync(join(PACKAGES_ROOT, entry, 'package.json')))
        .map((entry) => {
            try {
                return {
                    dir: entry,
                    root: join(PACKAGES_ROOT, entry),
                    manifest: JSON.parse(readFileSync(join(PACKAGES_ROOT, entry, 'package.json'), 'utf8')),
                };
            } catch {
                return null;
            }
        })
        .filter((pkg) => typeof pkg?.manifest?.name === 'string')
        .sort((left, right) => left.manifest.name.localeCompare(right.manifest.name));
}

function docsIndex(catalog) {
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
        '## Capabilities',
        '',
        ...catalog.capabilities.map(renderCapabilityLine),
        '',
        '## Packages',
        '',
        ...packagesIndex(),
        '',
    ].join('\n');
}

function jsonFile(value) {
    return `${JSON.stringify(value, null, 2)}\n`;
}

function outputPlan(skills, packages, catalog) {
    const files = new Map();
    files.set(
        repoPath(join(CLI_ASSETS, 'instructions.md')),
        readFileSync(join(SOURCE, 'instructions', 'ndigo.md'), 'utf8')
    );
    files.set(repoPath(join(CLI_ASSETS, 'docs-index.md')), docsIndex(catalog));
    files.set(repoPath(join(CAPABILITIES_ASSETS, 'packages.json')), jsonFile(packageFacts(packages)));
    files.set(repoPath(join(CAPABILITIES_ASSETS, 'items.json')), jsonFile(uiItems(ROOT)));
    for (const { id, content } of skills) {
        files.set(repoPath(join(CLI_ASSETS, 'skills', id, 'SKILL.md')), content);
    }
    for (const pkg of packages) {
        files.set(repoPath(join(pkg.root, 'docs', 'llms.txt')), renderPackageIndex(pkg));
    }
    const byName = new Map(packages.map((pkg) => [pkg.manifest.name, pkg]));
    for (const skill of skills) {
        if (skill.package === undefined) continue;
        const pkg = byName.get(skill.package);
        if (pkg === undefined) {
            throw new Error(
                `skill "${skill.id}" declares package "${skill.package}", which is not a workspace package`
            );
        }
        files.set(repoPath(join(pkg.root, 'skills', skill.id, 'SKILL.md')), skill.content);
    }
    files.set(repoPath(DOCS_INDEX_PATH), docsIndex(catalog));
    return new Map([...files.entries()].sort(([left], [right]) => left.localeCompare(right)));
}

function manifestFor(files) {
    const entries = [...files.entries()].map(([file, content]) => [file, sha256(content)]);
    return `${JSON.stringify({ files: Object.fromEntries(entries) }, null, 2)}\n`;
}

function staleSkillDirectories(files, packages) {
    const roots = [join(CLI_ASSETS, 'skills'), ...packages.map((pkg) => join(pkg.root, 'skills'))];
    const stale = [];
    for (const root of roots) {
        if (!existsSync(root)) continue;
        const prefix = repoPath(root) + '/';
        const expected = new Set(
            [...files.keys()]
                .filter((file) => file.startsWith(prefix))
                .map((file) => file.slice(prefix.length).split('/')[0])
        );
        for (const entry of readdirSync(root)) {
            if (statSync(join(root, entry)).isDirectory() && !expected.has(entry)) {
                stale.push(repoPath(join(root, entry)));
            }
        }
    }
    return stale;
}

/**
 * Asserts that every emitted per-package artifact is covered by the package's
 * publishable `files` list — a missing entry would silently drop the docs or
 * skill from the npm tarball.
 *
 * @param files - The expected repo-relative output files.
 * @param packages - The workspace packages.
 * @returns Human-readable violation strings, empty when consistent.
 */
function packageFilesProblems(files, packages) {
    const problems = [];
    for (const pkg of packages) {
        const declared = Array.isArray(pkg.manifest.files) ? pkg.manifest.files : [];
        const docs = repoPath(join(pkg.root, 'docs', 'llms.txt'));
        const skillsPrefix = repoPath(join(pkg.root, 'skills')) + '/';
        if (files.has(docs) && !declared.includes('docs')) {
            problems.push(`${repoPath(join(pkg.root, 'package.json'))} files must include "docs"`);
        }
        if ([...files.keys()].some((file) => file.startsWith(skillsPrefix)) && !declared.includes('skills')) {
            problems.push(`${repoPath(join(pkg.root, 'package.json'))} files must include "skills"`);
        }
    }
    const cli = packages.find((pkg) => pkg.manifest.name === '@ndigo/cli');
    const assetsPrefix = repoPath(join(PACKAGES_ROOT, 'ndigo-cli', 'assets')) + '/';
    const cliDeclared = Array.isArray(cli?.manifest.files) ? cli.manifest.files : [];
    if ([...files.keys()].some((file) => file.startsWith(assetsPrefix)) && !cliDeclared.includes('assets')) {
        problems.push('packages/ndigo-cli/package.json files must include "assets"');
    }
    return problems;
}

function check(files, manifest, lock, packages) {
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
    for (const stale of staleSkillDirectories(files, packages)) problems.push(`stale ${stale}`);
    for (const problem of packageFilesProblems(files, packages)) problems.push(problem);
    if (problems.length > 0) {
        for (const problem of problems) process.stderr.write(`✗ agent-content: ${problem}\n`);
        process.stderr.write('run `pnpm agent-content:build` and commit the output\n');
        process.exitCode = 1;
        return;
    }
    console.log(`agent-content: ${files.size} files current (skills @ ${lock.commit.slice(0, 7)})`);
}

function write(files, manifest, lock, packages) {
    for (const [file, content] of files) {
        const absolute = join(ROOT, file);
        if (existsSync(absolute) && readFileSync(absolute, 'utf8') === content) continue;
        mkdirSync(dirname(absolute), { recursive: true });
        writeFileSync(absolute, content, 'utf8');
        console.log(`wrote ${file}`);
    }
    for (const stale of staleSkillDirectories(files, packages)) {
        rmSync(stale, { recursive: true, force: true });
        console.log(`removed ${stale}`);
    }
    writeFileSync(MANIFEST_PATH, manifest, 'utf8');
    console.log(`agent-content: ${files.size} files written (skills @ ${lock.commit.slice(0, 7)})`);
}

const skills = readSkills(SKILLS_SOURCE);
const catalog = readCapabilityCatalog(CAPABILITIES_ASSETS);
const packages = workspacePackages();
const problems = capabilityProblems({ root: ROOT, catalogDir: CAPABILITIES_ASSETS, catalog, packages, skills });
if (problems.length > 0) {
    for (const problem of problems) process.stderr.write(`✗ agent-content: ${problem}\n`);
    process.stderr.write('fix the capability catalog or its references, then re-run\n');
    process.exit(1);
}
const packagesWithCapabilities = packages.map((pkg) => ({
    ...pkg,
    capabilities: catalog.capabilities.filter((capability) => capability.packages.includes(pkg.manifest.name)),
}));
const lock = verifySkillsLock(skills);
const files = outputPlan(skills, packagesWithCapabilities, catalog);
const manifest = manifestFor(files);
if (CHECK) check(files, manifest, lock, packagesWithCapabilities);
else write(files, manifest, lock, packagesWithCapabilities);
