#!/usr/bin/env node
/**
 * End-to-end HTTP comparison: Ndigo, Fastify, Express, and Hono.
 *
 * Each app serves the same four routes on its own port. The runner starts one
 * app at a time, verifies the responses, discards a warmup run, then measures
 * each scenario with autocannon. Results are written to
 * `benchmarks/results/http-<timestamp>.json`.
 *
 * Connections use `Connection: close`. Ndigo's chunked transfer encoding makes
 * autocannon's keep-alive status counter misclassify responses as 5xx, so the
 * first lane measures connection-per-request throughput on every target. A
 * keep-alive lane needs a load generator verified against chunked responses.
 *
 * Ndigo runs from source through `tsx`; the framework packages are not bundled
 * or minified. This is an application-level comparison, not a claim about a
 * production build. The same Node binary and HTTP/1.1 settings apply to all
 * apps.
 *
 * Usage:
 *   node benchmarks/http/run.mjs [--duration=3] [--connections=50]
 */
// oxlint-disable no-await-in-loop -- measurements must run sequentially; parallel load would contend.
import autocannon from 'autocannon';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { connect } from 'node:net';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

if (!existsSync(join(ROOT, 'packages', 'ndigo-platform-node', 'lib', 'index.js'))) {
    console.error('bench:http: built packages are missing — run `pnpm build` first');
    process.exit(1);
}
const RESULTS_DIR = join(ROOT, 'benchmarks', 'results');
const argv = process.argv.slice(2);
const duration = Number(argv.find((arg) => arg.startsWith('--duration='))?.split('=')[1] ?? 3);
const connections = Number(argv.find((arg) => arg.startsWith('--connections='))?.split('=')[1] ?? 50);
const echoBody = JSON.stringify({ text: 'x'.repeat(1024) });

const targets = [
    { name: 'ndigo', port: 4313, command: 'pnpm', args: ['exec', 'tsx', 'benchmarks/http/ndigo-app.ts'] },
    { name: 'fastify', port: 4310, command: 'node', args: ['benchmarks/http/fastify.mjs'] },
    { name: 'express', port: 4311, command: 'node', args: ['benchmarks/http/express.mjs'] },
    { name: 'hono', port: 4312, command: 'node', args: ['benchmarks/http/hono.mjs'] },
];

const scenarios = [
    { name: 'GET /json', path: '/json', method: 'GET', expectedStatus: 200, expected: { message: 'hello' } },
    { name: 'GET /users/:id', path: '/users/42', method: 'GET', expectedStatus: 200, expected: { id: '42' } },
    {
        name: 'POST /echo (1 KB)',
        path: '/echo',
        method: 'POST',
        body: echoBody,
        headers: { 'content-type': 'application/json' },
        expectedStatus: 200,
        expected: JSON.parse(echoBody),
    },
    { name: 'GET /missing (404)', path: '/missing', method: 'GET', expectedStatus: 404 },
];

/** Waits until a TCP port accepts connections. */
function waitForPort(port, timeoutMs = 30_000) {
    const deadline = Date.now() + timeoutMs;
    return new Promise((resolvePromise, reject) => {
        const attempt = () => {
            const socket = connect({ port, host: '127.0.0.1' });
            socket.once('connect', () => {
                socket.destroy();
                resolvePromise();
            });
            socket.once('error', () => {
                socket.destroy();
                if (Date.now() >= deadline) reject(new Error(`timed out waiting for port ${port}`));
                else setTimeout(attempt, 100);
            });
        };
        attempt();
    });
}

/** Runs one autocannon measurement. */
function measure(base, scenario) {
    return new Promise((resolvePromise, reject) => {
        autocannon(
            {
                url: `${base}${scenario.path}`,
                method: scenario.method,
                body: scenario.body,
                headers: { ...scenario.headers, connection: 'close' },
                connections,
                duration,
                pipelining: 1,
            },
            (error, result) => {
                if (error) reject(error);
                else
                    resolvePromise({
                        requests: result.requests.average,
                        latencyP50: result.latency.p50,
                        latencyP99: result.latency.p99,
                        latencyMean: result.latency.mean ?? result.latency.average ?? 0,
                        latencyMax: result.latency.max ?? 0,
                        non2xx: result.non2xx,
                        errors: result.errors,
                        timeouts: result.timeouts,
                    });
            }
        );
    });
}

/** Verifies one scenario before any load is applied. */
async function verify(base, scenario) {
    const response = await fetch(`${base}${scenario.path}`, {
        method: scenario.method,
        headers: scenario.headers,
        body: scenario.body,
    });
    if (response.status !== scenario.expectedStatus) {
        throw new Error(`${scenario.name}: expected ${scenario.expectedStatus}, received ${response.status}`);
    }
    if (scenario.expected !== undefined) {
        const body = await response.json();
        if (JSON.stringify(body) !== JSON.stringify(scenario.expected)) {
            throw new Error(`${scenario.name}: body mismatch ${JSON.stringify(body)}`);
        }
    }
}

/** Stops a child process, escalating after a grace period. */
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

mkdirSync(RESULTS_DIR, { recursive: true });
const startedAt = new Date().toISOString();
const results = [];

for (const target of targets) {
    const child = spawn(target.command, target.args, {
        cwd: ROOT,
        env: { ...process.env, PORT: String(target.port), NODE_ENV: 'production' },
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: true,
    });
    let stderr = '';
    child.stderr.on('data', (chunk) => {
        stderr += chunk;
    });
    const base = `http://127.0.0.1:${target.port}`;
    try {
        await waitForPort(target.port);
        for (const scenario of scenarios) await verify(base, scenario);
        await measure(base, scenarios[0]); // discarded warmup
        for (const scenario of scenarios) {
            const runs = [];
            for (let run = 0; run < 2; run++) runs.push(await measure(base, scenario));
            const requests = runs.reduce((sum, run) => sum + run.requests, 0) / runs.length;
            const mean = runs.reduce((sum, run) => sum + run.latencyMean, 0) / runs.length;
            const max = Math.max(...runs.map((run) => run.latencyMax));
            const non2xx = runs.reduce((sum, run) => sum + run.non2xx, 0);
            const expectedNon2xx = scenario.expectedStatus >= 400;
            results.push({
                target: target.name,
                scenario: scenario.name,
                requests,
                latencyMean: mean,
                latencyMax: max,
                non2xx,
                expectedNon2xx,
            });
            console.log(
                `${target.name.padEnd(8)} ${scenario.name.padEnd(20)} ${requests.toFixed(0).padStart(8)} req/s  ` +
                    `mean ${mean.toFixed(2)} ms  max ${max.toFixed(1)} ms` +
                    `${non2xx && !expectedNon2xx ? `  non-2xx ${non2xx}` : ''}`
            );
        }
    } catch (error) {
        console.error(`${target.name}: ${error instanceof Error ? error.message : String(error)}`);
        if (stderr) console.error(stderr.trim().split('\n').slice(-8).join('\n'));
        process.exitCode = 1;
    } finally {
        await stop(child);
    }
}

const artifact = {
    schemaVersion: 1,
    startedAt,
    duration,
    connections,
    connectionMode: 'close',
    targets: targets.map((target) => target.name),
    scenarios: scenarios.map((scenario) => scenario.name),
    results,
};
const stamp = startedAt.replaceAll(':', '-').replace(/\..+$/, '');
const path = join(RESULTS_DIR, `http-${stamp}.json`);
writeFileSync(path, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`bench:http: wrote ${relative(ROOT, path)}`);
