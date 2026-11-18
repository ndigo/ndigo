#!/usr/bin/env node
/**
 * Refresh the vendored skill snapshot from the canonical `ndigo-skills` repo.
 *
 * The monorepo bundles skills for offline `ndigo ai init`, so it keeps a
 * pinned copy instead of fetching at runtime. This script records the source
 * commit and per-file hashes in `skills.lock.json`; `build.mjs` refuses to
 * emit assets while the snapshot drifts from that lock.
 *
 * The source defaults to the sibling checkout `../ndigo-skills`; override it
 * with `NDIGO_SKILLS_DIR`. The source must be clean so the recorded commit
 * identifies the content exactly.
 *
 * Usage:
 *   node tools/agent-content/sync-skills.mjs
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { readSkills } from './_skills.mjs';

const SOURCE = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(dirname(SOURCE));
const TARGET = join(SOURCE, 'skills');
const LOCK_PATH = join(SOURCE, 'skills.lock.json');
const SKILLS_REPO = process.env.NDIGO_SKILLS_DIR ?? join(dirname(ROOT), 'ndigo-skills');
const CHECK = process.argv.includes('--check');

/** Runs git in the skills checkout and returns trimmed stdout. */
function git(...args) {
    return execFileSync('git', ['-C', SKILLS_REPO, ...args], { encoding: 'utf8' }).trim();
}

/** Rewrites an SSH remote to its HTTPS equivalent for portable provenance. */
function normalizeRemote(url) {
    const ssh = /^git@([^:]+):(.+)$/u.exec(url);
    return ssh === null ? url : `https://${ssh[1]}/${ssh[2]}`;
}

const sha256 = (text) => createHash('sha256').update(text, 'utf8').digest('hex');

if (!existsSync(join(SKILLS_REPO, 'package.json'))) {
    throw new Error(`skills repo not found at ${SKILLS_REPO} (set NDIGO_SKILLS_DIR)`);
}
if (git('status', '--porcelain') !== '') {
    throw new Error(`${SKILLS_REPO} has uncommitted changes; commit them before syncing`);
}

const skills = readSkills(SKILLS_REPO);
const manifest = JSON.parse(readFileSync(join(SKILLS_REPO, 'package.json'), 'utf8'));
const lock = {
    source: normalizeRemote(git('remote', 'get-url', 'origin')),
    version: typeof manifest.version === 'string' ? manifest.version : null,
    commit: git('rev-parse', 'HEAD'),
    files: Object.fromEntries(skills.map(({ id, content }) => [`${id}/SKILL.md`, sha256(content)])),
};
const lockText = `${JSON.stringify(lock, null, 2)}\n`;

const expected = new Set(skills.map(({ id }) => id));
const stale = existsSync(TARGET)
    ? readdirSync(TARGET).filter((entry) => statSync(join(TARGET, entry)).isDirectory() && !expected.has(entry))
    : [];

if (CHECK) {
    const problems = [];
    for (const { id, content } of skills) {
        const file = join(TARGET, id, 'SKILL.md');
        if (!existsSync(file)) problems.push(`missing ${id}/SKILL.md`);
        else if (readFileSync(file, 'utf8') !== content) problems.push(`changed ${id}/SKILL.md`);
    }
    for (const entry of stale) problems.push(`stale ${entry}`);
    if (!existsSync(LOCK_PATH) || readFileSync(LOCK_PATH, 'utf8') !== lockText)
        problems.push('changed skills.lock.json');
    if (problems.length > 0) {
        for (const problem of problems) process.stderr.write(`✗ skills snapshot: ${problem}\n`);
        process.stderr.write('run `pnpm agent-content:sync` and commit the snapshot\n');
        process.exitCode = 1;
    } else {
        console.log(`skills snapshot: ${skills.length} skills current (${lock.source}@${lock.commit.slice(0, 7)})`);
    }
} else {
    for (const entry of stale) {
        rmSync(join(TARGET, entry), { recursive: true, force: true });
        console.log(`removed stale skill ${entry}`);
    }
    for (const { id, content } of skills) {
        const file = join(TARGET, id, 'SKILL.md');
        if (existsSync(file) && readFileSync(file, 'utf8') === content) continue;
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, content, 'utf8');
        console.log(`wrote ${id}/SKILL.md`);
    }
    writeFileSync(LOCK_PATH, lockText, 'utf8');
    console.log(`skills snapshot: ${skills.length} skills synced from ${lock.source}@${lock.commit.slice(0, 7)}`);
}
