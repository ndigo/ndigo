#!/usr/bin/env node
// agents-check.mjs — verify the generated agent/skill deployment.
//
// The agent configuration is generated from the neutral store
// (development-agents/) into .opencode/ and .omp/ by `gen.mjs`.
// This script validates the committed deployment without needing the store:
//
//   1. every file listed in .agent-gen.json exists and its sha256 matches
//   2. structural invariants: frontmatter present, no model fields in
//      opencode agents, no template-placeholder bugs ("for the.")
//
// Regenerate with `pnpm agents:sync`; edit in the store or agent-local/, never
// in the generated directories. Zero dependencies. Exit 1 on any failure.
//
// Repo-owned deployment files (opencode.json, .opencode/plugins/**, AGENTS.md)
// are also hashed — they are hand-authored in this repo (not gen.mjs output)
// but carry code-execution reach inside the editor, so they sit under the
// same drift gate via `.agent-local.json`. Regenerate that manifest with:
//   node scripts/agents-check.mjs --update
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;

// Repo-owned deployment surface covered by the secondary manifest.
const LOCAL_COVERED = ['opencode.json', '.opencode/plugins', 'AGENTS.md'];

/** Recursively walks `dir`, returning paths relative to it (sorted). */
function walkFiles(dir, prefix = '') {
    const out = [];
    for (const name of readdirSync(dir).sort()) {
        const full = join(dir, name);
        const stat = statSync(full, { throwIfNoEntry: false });
        if (!stat) continue;
        if (stat.isDirectory()) out.push(...walkFiles(full, join(prefix, name)));
        else out.push(join(prefix, name));
    }
    return out;
}

function sha256(text) {
    return createHash('sha256').update(text, 'utf8').digest('hex');
}

const update = process.argv.includes('--update');
const localManifestPath = join(root, '.agent-local.json');

let errors = 0;
const report = (msg) => {
    console.error(`agents:check FAIL: ${msg}`);
    errors++;
};

// 1. Manifest integrity.
const manifestPath = join(root, '.agent-gen.json');
if (!existsSync(manifestPath)) report('missing .agent-gen.json — run `pnpm agents:sync`');
else {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    let checked = 0;
    for (const [rel, expected] of Object.entries(manifest.files)) {
        const path = join(root, rel);
        if (!existsSync(path)) {
            report(`missing generated file ${rel}`);
            continue;
        }
        const actual = createHash('sha256').update(readFileSync(path, 'utf8')).digest('hex');
        if (actual !== expected) {
            report(`drift in ${rel} — edit the neutral store and run \`pnpm agents:sync\`, not this file`);
            continue;
        }
        checked++;
    }
    console.log(`agents:check: ${checked} generated files match .agent-gen.json`);
}

// 2. Structural invariants over the generated tree.
const dirs = ['.opencode/agents', '.omp/agents'];
for (const dir of dirs) {
    const abs = join(root, dir);
    if (!existsSync(abs)) {
        report(`missing generated directory ${dir}`);
        continue;
    }
    for (const file of readdirSync(abs).filter((f) => f.endsWith('.md'))) {
        const text = readFileSync(join(abs, file), 'utf8');
        if (!text.startsWith('---')) report(`${dir}/${file}: missing YAML frontmatter`);
        if (text.includes('for the.')) report(`${dir}/${file}: template placeholder 'for the.'`);
        if (text.includes('${') && text.includes('}')) report(`${dir}/${file}: unexpanded template interpolation`);
    }
}
// Models are not part of the deployment (agents inherit the session model),
// so no deployed agent may pin one.
for (const dir of ['.opencode/agents']) {
    const abs = join(root, dir);
    for (const file of readdirSync(abs).filter((f) => f.endsWith('.md'))) {
        const head = readFileSync(join(abs, file), 'utf8').split('\n---', 1)[0];
        if (head.includes('\nmodel:')) report(`${dir}/${file}: opencode agents must not pin a model`);
    }
}

// 3. Repo-owned deployment manifest (.agent-local.json). Unlike .agent-gen.json
//    (gen.mjs output), these files are authored in-repo — but they execute in
//    the editor (opencode plugin, LSP config, AGENTS.md instructions), so they
//    get the same drift gate. `--update` regenerates the manifest.
const localFiles = [];
for (const entry of LOCAL_COVERED) {
    const abs = join(root, entry);
    if (!existsSync(abs)) continue;
    if (statSync(abs).isDirectory()) {
        for (const rel of walkFiles(abs)) localFiles.push([join(entry, rel), readFileSync(join(abs, rel), 'utf8')]);
    } else {
        localFiles.push([entry, readFileSync(abs, 'utf8')]);
    }
}
localFiles.sort((a, b) => a[0].localeCompare(b[0]));
const expectedLocal =
    JSON.stringify({ files: Object.fromEntries(localFiles.map(([rel, content]) => [rel, sha256(content)])) }, null, 2) +
    '\n';
if (update) {
    writeFileSync(localManifestPath, expectedLocal);
    console.log(`agents:check: wrote ${localFiles.length} repo-owned files to .agent-local.json`);
} else if (!existsSync(localManifestPath) || readFileSync(localManifestPath, 'utf8') !== expectedLocal) {
    report(
        '.agent-local.json out of sync — after changing AGENTS.md, opencode.json, or .opencode/plugins/, run `node scripts/agents-check.mjs --update` and commit the manifest'
    );
} else {
    console.log(`agents:check: ${localFiles.length} repo-owned deployment files match .agent-local.json`);
}

if (errors > 0) process.exit(1);
console.log('agents:check: invariants OK (frontmatter, no leaked models, no placeholders)');
