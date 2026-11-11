#!/usr/bin/env node
/**
 * Compares a benchmark artifact against the committed reference baseline.
 *
 * A regression fails the command only when both runs are statistically usable
 * (`latency.rme <= 2`). Noisy pairs are reported as inconclusive instead of
 * producing a false failure. Scenario renames are reported explicitly.
 *
 * Usage:
 *   node scripts/bench-compare.mjs [artifact] [--threshold=0.10]
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RESULTS_DIR = join(ROOT, 'benchmarks', 'results');
const BASELINE = join(ROOT, 'benchmarks', 'baselines', 'reference.json');
const argv = process.argv.slice(2);
const thresholdArg = argv.find((arg) => arg.startsWith('--threshold='));
const threshold = thresholdArg ? Number(thresholdArg.split('=')[1]) : 0.1;
const explicit = argv.find((arg) => !arg.startsWith('--'));

/** Returns the newest result artifact. */
function latestArtifact() {
    const files = readdirSync(RESULTS_DIR)
        .filter((file) => file.endsWith('.json'))
        .map((file) => join(RESULTS_DIR, file))
        .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
    return files[0];
}

/** Indexes scenarios by their stable identity. */
function indexScenarios(artifact) {
    return new Map(
        artifact.scenarios.map((scenario) => [`${scenario.file}|${scenario.suite}|${scenario.name}`, scenario])
    );
}

/** Formats a nanosecond value compactly. */
function formatNs(value) {
    if (!Number.isFinite(value)) return '—';
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)} ms`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)} µs`;
    return `${value.toFixed(2)} ns`;
}

const candidatePath = resolve(ROOT, explicit ?? latestArtifact() ?? '');
if (!existsSync(candidatePath)) {
    console.error(`bench:compare: artifact not found: ${candidatePath || '(none)'}`);
    process.exit(2);
}
if (!existsSync(BASELINE)) {
    console.error(`bench:compare: no baseline at ${relative(ROOT, BASELINE)}`);
    process.exit(2);
}

const candidate = JSON.parse(readFileSync(candidatePath, 'utf8'));
const baseline = JSON.parse(readFileSync(BASELINE, 'utf8'));
const candidateIndex = indexScenarios(candidate);
const baselineIndex = indexScenarios(baseline);

if (candidate.environment.cpu !== baseline.environment.cpu) {
    console.warn(
        `bench:compare: CPU class differs (baseline: ${baseline.environment.cpu}; candidate: ${candidate.environment.cpu})`
    );
}

const rows = [];
const missing = [];
for (const [key, before] of baselineIndex) {
    const after = candidateIndex.get(key);
    if (!after) {
        missing.push(key);
        continue;
    }
    const change = before.nsPerOp && after.nsPerOp ? (after.nsPerOp - before.nsPerOp) / before.nsPerOp : null;
    const usable =
        (before.latency.rme ?? Number.POSITIVE_INFINITY) <= 2 && (after.latency.rme ?? Number.POSITIVE_INFINITY) <= 2;
    rows.push({ key, before, after, change, usable });
}
const added = [...candidateIndex.keys()].filter((key) => !baselineIndex.has(key));

rows.sort((a, b) => (b.change ?? 0) - (a.change ?? 0));

console.log(`bench:compare: ${relative(ROOT, candidatePath)} vs ${relative(ROOT, BASELINE)}`);
console.log(`threshold: +${(threshold * 100).toFixed(0)}% slower; RME gate: 2%\n`);
const header = ['Scenario', 'Before', 'After', 'Change', 'RME', 'Verdict'];
const table = rows.map((row) => {
    const changeText = row.change === null ? '—' : `${row.change >= 0 ? '+' : ''}${(row.change * 100).toFixed(1)}%`;
    const rmeText = `${(row.before.latency.rme ?? 0).toFixed(2)}/${(row.after.latency.rme ?? 0).toFixed(2)}%`;
    const verdict = !row.usable ? 'inconclusive' : (row.change ?? 0) > threshold ? 'REGRESSION' : 'ok';
    return [
        `${row.after.file} :: ${row.after.name}`,
        formatNs(row.before.nsPerOp),
        formatNs(row.after.nsPerOp),
        changeText,
        rmeText,
        verdict,
    ];
});
const widths = header.map((label, index) => Math.max(label.length, ...table.map((row) => row[index].length)));
const line = (row) => row.map((cell, index) => cell.padEnd(widths[index])).join('  ');
console.log(line(header));
console.log(line(widths.map((width) => '-'.repeat(width))));
for (const row of table) console.log(line(row));

if (missing.length > 0) {
    console.warn(`\nbench:compare: ${missing.length} baseline scenario(s) missing from the candidate:`);
    for (const key of missing) console.warn(`  - ${key}`);
}
if (added.length > 0) {
    console.log(`\nbench:compare: ${added.length} new scenario(s) not in the baseline:`);
    for (const key of added) console.log(`  + ${key}`);
}

const regressions = table.filter((row) => row[5] === 'REGRESSION');
if (regressions.length > 0) {
    console.error(
        `\nbench:compare: ${regressions.length} regression(s) over the ${(threshold * 100).toFixed(0)}% threshold`
    );
    process.exit(1);
}
console.log('\nbench:compare: no regressions over the threshold');
