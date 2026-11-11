#!/usr/bin/env node
/**
 * Runs the benchmark suite serially and writes one machine-readable artifact.
 *
 * Each benchmark file runs in its own Vitest process with the benchmark config
 * and the JSON reporter. The runner then merges the per-file results with an
 * environment fingerprint, normalizes batch latency to `ns/op`, and optionally
 * compares the run against the committed reference baseline.
 *
 * Usage:
 *   node scripts/bench-run.mjs [--quick] [--update-baseline] [--no-compare] [file ...]
 */
import {
    globSync,
    existsSync,
    mkdtempSync,
    mkdirSync,
    readFileSync,
    rmSync,
    writeFileSync,
    copyFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { arch, cpus, loadavg, platform, release, totalmem } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RESULTS_DIR = join(ROOT, 'benchmarks', 'results');
const BASELINE = join(ROOT, 'benchmarks', 'baselines', 'reference.json');
const VITEST = join(ROOT, 'node_modules', 'vitest', 'vitest.mjs');

const argv = process.argv.slice(2);
const quick = argv.includes('--quick');
const updateBaseline = argv.includes('--update-baseline');
const noCompare = argv.includes('--no-compare');
const explicitFiles = argv.filter((arg) => !arg.startsWith('--'));

/** Runs a command and returns stdout, or null when it fails. */
function tryExec(command, args, options = {}) {
    try {
        return execFileSync(command, args, { cwd: ROOT, encoding: 'utf8', ...options }).trim();
    } catch {
        return null;
    }
}

/** Reads a one-line sysfs value, or null when the file is absent. */
function readOptional(path) {
    try {
        return readFileSync(path, 'utf8').trim();
    } catch {
        return null;
    }
}

/** Collects the environment fingerprint recorded with every artifact. */
function environment() {
    const gitStatus = tryExec('git', ['status', '--porcelain']) ?? '';
    return {
        commit: tryExec('git', ['rev-parse', 'HEAD']),
        dirty: gitStatus.length > 0,
        date: new Date().toISOString(),
        node: process.version,
        pnpm: tryExec('pnpm', ['--version']),
        platform: platform(),
        release: release(),
        arch: arch(),
        cpu: cpus()[0]?.model ?? 'unknown',
        cores: cpus().length,
        memoryGb: Math.round(totalmem() / 1024 ** 3),
        governor: readOptional('/sys/devices/system/cpu/cpu0/cpufreq/scaling_governor'),
        loadAverage: loadavg().map((value) => Number(value.toFixed(2))),
    };
}

/** Discovers benchmark files in stable order. */
function discoverFiles() {
    if (explicitFiles.length > 0) {
        return explicitFiles.map((file) => resolve(ROOT, file));
    }
    const patterns = [
        'packages/*/bench/**/*.bench.ts',
        'packages/*/test/benchmarks/**/*.bench.ts',
        'benchmarks/**/*.bench.ts',
    ];
    const found = new Set();
    for (const pattern of patterns) {
        for (const file of globSync(pattern, { cwd: ROOT })) {
            if (file.includes('/node_modules/') || file.includes('/lib/') || file.includes('/dist/')) continue;
            found.add(resolve(ROOT, file));
        }
    }
    return [...found].sort((left, right) => left.localeCompare(right));
}

/** Splits an `@ops=N` suffix from a benchmark name. */
function splitOps(name) {
    const match = /^(.*?)(?:\s+@ops=(\d+))?$/.exec(name);
    return { name: match?.[1] ?? name, ops: Number(match?.[2] ?? 1) };
}

/** Extracts the fields we keep from a tinybench task result. */
function taskResult(task, suite, file) {
    const { name, ops } = splitOps(task.name);
    const latency = task.latency ?? {};
    const throughput = task.throughput ?? {};
    const nsPerOp = Number.isFinite(latency.mean) && ops > 0 ? (latency.mean * 1e6) / ops : null;
    return {
        file: relative(ROOT, file),
        suite,
        name,
        opsPerIteration: ops,
        nsPerOp,
        opsPerSecond: nsPerOp === null ? null : 1e9 / nsPerOp,
        latency: {
            mean: latency.mean,
            min: latency.min,
            max: latency.max,
            p50: latency.p50,
            p75: latency.p75,
            p99: latency.p99,
            p999: latency.p999,
            rme: latency.rme,
            samples: latency.samplesCount,
        },
        throughput: {
            mean: throughput.mean,
            p99: throughput.p99,
            rme: throughput.rme,
        },
        rank: task.rank,
    };
}

/** Runs one benchmark file and returns normalized scenarios. */
function runFile(file, tmpDir) {
    const outputFile = join(tmpDir, `${relative(ROOT, file).replaceAll('/', '_')}.json`);
    const result = spawnSync(
        process.execPath,
        [
            VITEST,
            'bench',
            '--run',
            '--config',
            'vitest.bench.config.ts',
            file,
            '--reporter=json',
            `--outputFile=${outputFile}`,
        ],
        { cwd: ROOT, stdio: 'inherit', env: { ...process.env, CI: 'true' } }
    );
    if (result.status !== 0) {
        throw new Error(`benchmark file failed: ${relative(ROOT, file)}`);
    }
    if (!existsSync(outputFile)) {
        throw new Error(`benchmark file produced no JSON: ${relative(ROOT, file)}`);
    }
    const report = JSON.parse(readFileSync(outputFile, 'utf8'));
    const scenarios = [];
    for (const testResult of report.testResults ?? []) {
        for (const assertion of testResult.assertionResults ?? []) {
            for (const benchmark of assertion.benchmarks ?? []) {
                for (const task of benchmark.tasks ?? []) {
                    if (task.latency?.mean === undefined) continue;
                    scenarios.push(taskResult(task, assertion.fullName ?? assertion.title ?? 'benchmark', file));
                }
            }
        }
    }
    return scenarios;
}

const files = discoverFiles();
if (files.length === 0) {
    console.error('bench: no benchmark files found');
    process.exit(1);
}

mkdirSync(RESULTS_DIR, { recursive: true });
const tmpDir = mkdtempSync(join(tmpdir(), 'ndigo-bench-'));
const startedAt = Date.now();
const scenarios = [];
const fileSummaries = [];

try {
    for (const file of files) {
        const fileStartedAt = Date.now();
        const fileScenarios = runFile(file, tmpDir);
        scenarios.push(...fileScenarios);
        fileSummaries.push({
            file: relative(ROOT, file),
            scenarios: fileScenarios.length,
            durationMs: Date.now() - fileStartedAt,
        });
        console.log(`bench: ${relative(ROOT, file)} — ${fileScenarios.length} scenarios`);
    }
} finally {
    rmSync(tmpDir, { recursive: true, force: true });
}

const artifact = {
    schemaVersion: 1,
    environment: environment(),
    durationMs: Date.now() - startedAt,
    quick,
    files: fileSummaries,
    scenarios,
};

const stamp = artifact.environment.date.replaceAll(':', '-').replace(/\..+$/, '');
const commit = (artifact.environment.commit ?? 'unknown').slice(0, 12);
const artifactPath = join(RESULTS_DIR, `${stamp}-${commit}.json`);
writeFileSync(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(
    `bench: wrote ${relative(ROOT, artifactPath)} (${scenarios.length} scenarios, ${Math.round(artifact.durationMs / 1000)}s)`
);

const highRme = scenarios.filter((scenario) => (scenario.latency.rme ?? 0) > 2);
if (highRme.length > 0) {
    console.warn(`bench: ${highRme.length} scenario(s) exceed 2% RME; treat their comparisons as inconclusive`);
}

if (updateBaseline) {
    mkdirSync(dirname(BASELINE), { recursive: true });
    copyFileSync(artifactPath, BASELINE);
    console.log(`bench: updated baseline ${relative(ROOT, BASELINE)}`);
} else if (!quick && !noCompare && existsSync(BASELINE)) {
    const compare = spawnSync(process.execPath, [join(ROOT, 'scripts', 'bench-compare.mjs'), artifactPath], {
        cwd: ROOT,
        stdio: 'inherit',
    });
    if (compare.status !== 0) {
        process.exitCode = compare.status ?? 1;
    }
} else if (!quick && !noCompare) {
    console.log('bench: no reference baseline yet; run with --update-baseline to create one');
}
