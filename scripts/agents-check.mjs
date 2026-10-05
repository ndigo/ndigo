#!/usr/bin/env node
// agents-check.mjs — verify the generated agent/skill deployment.
//
// The agent configuration is generated from the neutral store
// (development-agents/) into .opencode/, .claude/, and .omp/ by `gen.mjs`.
// This script validates the committed deployment without needing the store:
//
//   1. every file listed in .agent-gen.json exists and its sha256 matches
//   2. structural invariants: frontmatter present, no model fields in
//      opencode/claude agents, no template-placeholder bugs ("for the.")
//
// Regenerate with `pnpm agents:sync`; edit in the store or agent-local/, never
// in the generated directories. Zero dependencies. Exit 1 on any failure.
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;

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
const dirs = ['.opencode/agents', '.claude/agents', '.omp/agents'];
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
// Models are stamped into OMP agents only.
for (const dir of ['.opencode/agents', '.claude/agents']) {
  const abs = join(root, dir);
  for (const file of readdirSync(abs).filter((f) => f.endsWith('.md'))) {
    const head = readFileSync(join(abs, file), 'utf8').split('\n---', 1)[0];
    if (head.includes('\nmodel:')) report(`${dir}/${file}: model field must not appear outside OMP`);
  }
}
const ompAgents = join(root, '.omp/agents');
for (const file of readdirSync(ompAgents).filter((f) => f.endsWith('.md'))) {
  const head = readFileSync(join(ompAgents, file), 'utf8').split('\n---', 1)[0];
  if (!head.includes('\nmodel:')) report(`.omp/agents/${file}: missing stamped model (check .agent-models.json)`);
}

if (errors > 0) process.exit(1);
console.log('agents:check: invariants OK (frontmatter, no leaked models, no placeholders)');