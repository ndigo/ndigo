#!/usr/bin/env node
/**
 * Cold start and memory for the four HTTP benchmark apps.
 *
 * For each target: start the app, measure time-to-listen, issue warm-up
 * requests, then read the listening process's RSS from `/proc`. Each target is
 * measured `--runs` times; the median and p95 are reported.
 *
 * Usage:
 *   node benchmarks/startup/run.mjs [--runs=3] [--requests=200]
 */
import { spawn, execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { connect } from 'node:net';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const RESULTS_DIR = join(ROOT, 'benchmarks', 'results');
const argv = process.argv.slice(2);
const runs = Number(argv.find((arg) => arg.startsWith('--runs='))?.split('=')[1] ?? 3);
const requests = Number(argv.find((arg) => arg.startsWith('--requests='))?.split('=')[1] ?? 200);

// oxlint-disable no-await-in-loop -- startup runs must be sequential.

if (!existsSync(join(ROOT, 'packages', 'ndigo-platform-node', 'lib', 'index.js'))) {
    console.error('bench:start: built packages are missing — run `pnpm build` first');
    process.exit(1);
}

const targets = [
    { name: 'ndigo', port: 4313, command: 'pnpm', args: ['exec', 'tsx', 'benchmarks/http/ndigo-app.ts'] },
    { name: 'fastify', port: 4310, command: 'node', args: ['benchmarks/http/fastify.mjs'] },
    { name: 'express', port: 4311, command: 'node', args: ['benchmarks/http/express.mjs'] },
    { name: 'hono', port: 4312, command: 'node', args: ['benchmarks/http/hono.mjs'] },
];

function waitForPort(port, timeoutMs = 30_000) {
    const started = Date.now();
    const deadline = started + timeoutMs;
    return new Promise((resolvePromise, reject) => {
        const attempt = () => {
            const socket = connect({ port, host: '127.0.0.1' });
            socket.once('connect', () => {
                socket.destroy();
                resolvePromise(Date.now() - started);
            });
            socket.once('error', () => {
                socket.destroy();
                if (Date.now() >= deadline) reject(new Error(`timed out waiting for port ${port}`));
                else setTimeout(attempt, 25);
            });
        };
        attempt();
    });
}

/** Finds the pid listening on a port via `ss -ltnp`. */
function listeningPid(port) {
    try {
        const out = execSync('ss -ltnp', { encoding: 'utf8' });
        const line = out.split('\n').find((line2) => line2.includes(`:${port} `));
        return line?.match(/pid=(\d+)/)?.[1] ?? null;
    } catch {
        return null;
    }
}

function rssKb(pid) {
    try {
        const status = readFileSync(`/proc/${pid}/status`, 'utf8');
        return Number(/VmRSS:\s+(\d+) kB/.exec(status)?.[1] ?? 0);
    } catch {
        return null;
    }
}

/** Issues `requests` sequential fetches; returns the elapsed ms. */
async function warmup(base, count) {
    const started = Date.now();
    for (let i = 0; i < count; i++) await fetch(`${base}/json`);
    return Date.now() - started;
}

function stop(child) {
    return new Promise((resolvePromise) => {
        if (child.exitCode !== null || child.signalCode !== null) return resolvePromise();
        child.once('exit', () => resolvePromise());
        const signal = (name) => {
            try {
                process.kill(-child.pid, name);
            } catch {
                child.kill(name);
            }
        };
        signal('SIGTERM');
        setTimeout(() => {
            if (child.exitCode === null && child.signalCode === null) signal('SIGKILL');
        }, 2_000).unref();
    });
}

function median(values) {
    const sorted = [...values].sort((left, right) => left - right);
    return sorted[Math.floor(sorted.length / 2)] ?? sorted[0];
}

mkdirSync(RESULTS_DIR, { recursive: true });
const startedAt = new Date().toISOString();
const results = [];

for (const target of targets) {
    const samples = [];
    for (let run = 0; run < runs; run++) {
        const child = spawn(target.command, target.args, {
            cwd: ROOT,
            env: { ...process.env, PORT: String(target.port), NODE_ENV: 'production' },
            stdio: ['ignore', 'ignore', 'pipe'],
            detached: true,
        });
        let stderr = '';
        child.stderr.on('data', (chunk) => {
            stderr += chunk;
        });
        const base = `http://127.0.0.1:${target.port}`;
        try {
            const timeToListen = await waitForPort(target.port);
            await warmup(base, requests);
            const pid = listeningPid(target.port);
            const rss = pid ? rssKb(pid) : null;
            samples.push({ timeToListen, rssKb: rss, pid });
        } catch (error) {
            console.error(`${target.name}: ${error instanceof Error ? error.message : String(error)}`);
            if (stderr) console.error(stderr.trim().split('\n').slice(-6).join('\n'));
            process.exitCode = 1;
        } finally {
            await stop(child);
        }
    }
    if (samples.length > 0) {
        const entry = {
            target: target.name,
            timeToListenMs: median(samples.map((sample) => sample.timeToListen)),
            rssKb: median(samples.filter((sample) => sample.rssKb).map((sample) => sample.rssKb)),
            runs: samples.length,
            samples,
        };
        results.push(entry);
        console.log(
            `${entry.target.padEnd(8)} time-to-listen ${entry.timeToListenMs.toFixed(0).padStart(5)} ms  ` +
                `RSS ${entry.rssKb ? `${(entry.rssKb / 1024).toFixed(0)} MB` : 'unknown'}  (${runs} runs)`
        );
    }
}

const artifact = {
    schemaVersion: 1,
    startedAt,
    runs,
    requestsPerRun: requests,
    connectionMode: 'close',
    results,
};
const stamp = startedAt.replaceAll(':', '-').replace(/\..+$/, '');
const path = join(RESULTS_DIR, `startup-${stamp}.json`);
writeFileSync(path, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`bench:start: wrote ${relative(ROOT, path)}`);
