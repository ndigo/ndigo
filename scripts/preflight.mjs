#!/usr/bin/env node
/**
 * Local stand-in for the CI quality lane (issue #276).
 *
 * GitHub-hosted minutes are a hard budget (2,000/month on the free tier), so a
 * push carries its own proof: this runs the same gates as `ci.yml` + `docs.yml`
 * in fail-fast order and refuses the push when one fails. The weekly sweep and
 * the self-hosted runner are the backstop, not the first line of defence.
 *
 * `--fast` keeps the sub-minute gates only (format, lint, links, typecheck) and
 * is what a WIP branch wants before a throwaway push.
 */

import { spawnSync } from 'node:child_process';

const FAST = process.argv.includes('--fast');
const LIST = process.argv.includes('--list');

/** Ordered fast-to-slow, mirroring the lane order in `.github/workflows/ci.yml` (MIN-1). */
const FULL_STEPS = [
    { label: 'maintained-file formatting', script: 'format:check' },
    { label: 'lint (zero warnings)', script: 'lint' },
    { label: 'root-tooling lane', script: 'test:tooling' },
    { label: 'internal lint rules', script: 'test:internal' },
    { label: 'docs relative links', script: 'docs:links' },
    { label: 'guide contract', script: 'guides:check' },
    { label: 'migration schema freshness', script: 'db:schema:check' },
    { label: 'manifest conformance', script: 'manifest:check' },
    { label: 'agent config integrity', script: 'agents:check' },
    { label: 'build libraries', script: 'build' },
    { label: 'example apps boot + probe', script: 'apps:smoke' },
    { label: 'strict type-check', script: 'typecheck' },
    { label: 'unit + integration tests', script: 'test' },
    { label: 'TSDoc coverage', script: 'doc:coverage' },
    { label: 'TSDoc examples', script: 'doc:examples' },
    { label: 'API docs freshness', script: 'doc:check' },
    { label: 'production dependency audit', bin: 'pnpm', args: ['audit', '--prod'] },
];

const FAST_SCRIPTS = new Set(['format:check', 'lint', 'docs:links', 'typecheck']);

const steps = FAST ? FULL_STEPS.filter((step) => FAST_SCRIPTS.has(step.script)) : FULL_STEPS;

if (LIST) {
    for (const step of steps) {
        console.log(`${step.script ?? step.args.join(' ')}  — ${step.label}`);
    }
    process.exit(0);
}

function run(step) {
    const [command, args] = step.script ? ['pnpm', ['run', '--silent', step.script]] : [step.bin, step.args];
    return spawnSync(command, args, { stdio: 'inherit', shell: process.platform === 'win32' }).status ?? 1;
}

const started = Date.now();
const failures = [];

steps.forEach((step, index) => {
    const position = `${index + 1}/${steps.length}`;
    console.log(`\n\u001b[36m[${position}]\u001b[0m ${step.script ?? step.args.join(' ')} — ${step.label}`);
    const status = run(step);
    if (status !== 0) {
        failures.push(step.label);
        console.error(`\n\u001b[31m✗ ${step.label} failed (exit ${status})\u001b[0m`);
    }
});

const minutes = ((Date.now() - started) / 60000).toFixed(1);

if (failures.length > 0) {
    console.error(`\npreflight: ${failures.length} gate(s) failed in ${minutes} min`);
    for (const failure of failures) console.error(`  - ${failure}`);
    console.error('\nFix these before pushing; CI is a backstop, not the first run (issue #276).');
    process.exit(1);
}

console.log(`\n\u001b[32mpreflight: all ${steps.length} gates passed in ${minutes} min\u001b[0m`);
