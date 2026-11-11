#!/usr/bin/env node
/**
 * Renders a benchmark artifact as a Markdown table.
 *
 * Usage:
 *   node scripts/bench-report.mjs [artifact] [--out=path]
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RESULTS_DIR = join(ROOT, 'benchmarks', 'results');
const argv = process.argv.slice(2);
const outArg = argv.find((arg) => arg.startsWith('--out='));
const explicit = argv.find((arg) => !arg.startsWith('--'));

/** Returns the newest result artifact. */
function latestArtifact() {
    const files = readdirSync(RESULTS_DIR)
        .filter((file) => file.endsWith('.json'))
        .map((file) => join(RESULTS_DIR, file))
        .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
    return files[0];
}

/** Formats a nanosecond value for a results table. */
function formatNs(value) {
    if (!Number.isFinite(value)) return '—';
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)} ms`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)} µs`;
    return `${value.toFixed(2)} ns`;
}

const artifactPath = resolve(ROOT, explicit ?? latestArtifact() ?? '');
if (!existsSync(artifactPath)) {
    console.error(`bench:report: artifact not found: ${artifactPath || '(none)'}`);
    process.exit(2);
}
const artifact = JSON.parse(readFileSync(artifactPath, 'utf8'));

const lines = [
    `# Benchmark results — ${artifact.environment.date}`,
    '',
    `Commit: \`${artifact.environment.commit}\`${artifact.environment.dirty ? ' (dirty)' : ''} · ` +
        `Node ${artifact.environment.node} · pnpm ${artifact.environment.pnpm} · ` +
        `${artifact.environment.cpu} · ${artifact.environment.cores} threads · ` +
        `governor ${artifact.environment.governor ?? 'unknown'}`,
    '',
    '| File | Scenario | ops/iter | ns/op | RME | samples |',
    '| :--- | :--- | ---: | ---: | ---: | ---: |',
];
for (const scenario of artifact.scenarios) {
    lines.push(
        `| \`${scenario.file}\` | ${scenario.name} | ${scenario.opsPerIteration} | ${formatNs(scenario.nsPerOp)} | ` +
            `${(scenario.latency.rme ?? 0).toFixed(2)}% | ${scenario.latency.samples ?? '—'} |`
    );
}
lines.push('');
lines.push(`Artifact: \`${relative(ROOT, artifactPath)}\``);
lines.push('');

const markdown = lines.join('\n');
if (outArg) {
    const outPath = resolve(ROOT, outArg.slice('--out='.length));
    writeFileSync(outPath, markdown);
    console.log(`bench:report: wrote ${relative(ROOT, outPath)}`);
} else {
    console.log(markdown);
}
