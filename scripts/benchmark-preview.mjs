#!/usr/bin/env node
/**
 * Runs the todomvc benchmark behind a short-lived `vite preview` server.
 *
 * Replaces the former inline root script
 * (`pnpm --filter @ndigo/todomvc run preview & sleep 5 && …`), which raced the
 * server's startup and leaked the backgrounded preview process on every run
 * (2026-10-06 review, TO-9). This wrapper waits for the preview port to accept
 * connections, fails fast when the server dies, and reaps it in a `finally`
 * (plus signal handlers) so no preview survives the benchmark.
 *
 * Usage:
 *   node scripts/benchmark-preview.mjs
 */
import { spawn } from 'node:child_process';
import { connect } from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Matches `@ndigo/todomvc`'s preview script (`vite preview --port 3001`). */
const PREVIEW_PORT = 3001;
const PORT_TIMEOUT_MS = 60_000;
const POLL_INTERVAL_MS = 200;
const SHUTDOWN_GRACE_MS = 5_000;

/**
 * Resolves once `127.0.0.1:port` accepts a TCP connection.
 *
 * @param {number} port - Port the preview server binds.
 * @param {number} timeoutMs - Overall deadline in milliseconds.
 * @param {() => boolean} isServerAlive - Fail fast when the server has exited.
 * @returns {Promise<void>}
 */
function waitForPort(port, timeoutMs, isServerAlive) {
    const deadline = Date.now() + timeoutMs;
    return new Promise((resolve, reject) => {
        const attempt = () => {
            if (!isServerAlive()) {
                reject(new Error('benchmark preview exited before its port was ready'));
                return;
            }
            const socket = connect({ port, host: '127.0.0.1' });
            socket.once('connect', () => {
                socket.destroy();
                resolve();
            });
            socket.once('error', () => {
                socket.destroy();
                if (Date.now() >= deadline) {
                    reject(new Error(`timed out after ${timeoutMs} ms waiting for port ${port}`));
                } else {
                    setTimeout(attempt, POLL_INTERVAL_MS);
                }
            });
        };
        attempt();
    });
}

/** Runs a command to completion; resolves with its exit code (1 on signal). */
function run(command, args) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, { cwd: ROOT, stdio: 'inherit' });
        child.once('error', reject);
        child.once('exit', (code, signal) => resolve(code ?? (signal ? 1 : 0)));
    });
}

const preview = spawn('pnpm', ['--filter', '@ndigo/todomvc', 'run', 'preview'], {
    cwd: ROOT,
    stdio: 'inherit',
});
const previewExited = new Promise((resolve) => preview.once('exit', resolve));
let previewErrored = false;
preview.once('error', (error) => {
    previewErrored = true;
    console.error(`benchmark preview failed to start: ${error.message}`);
});

let reaped = false;
/** Terminates the preview server (SIGTERM, then SIGKILL after a grace period). */
async function reapPreview() {
    if (reaped) return;
    reaped = true;
    if (previewErrored || preview.exitCode !== null || preview.signalCode !== null) return;
    preview.kill('SIGTERM');
    const exited = await Promise.race([
        previewExited.then(() => true),
        new Promise((resolve) => setTimeout(resolve, SHUTDOWN_GRACE_MS, false)),
    ]);
    if (!exited) preview.kill('SIGKILL');
}

for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
        void reapPreview().finally(() => process.exit(signal === 'SIGINT' ? 130 : 143));
    });
}

let exitCode = 0;
try {
    await waitForPort(
        PREVIEW_PORT,
        PORT_TIMEOUT_MS,
        () => !previewErrored && preview.exitCode === null && preview.signalCode === null
    );
    console.log(`benchmark preview ready on http://127.0.0.1:${PREVIEW_PORT}`);
    exitCode = await run('pnpm', ['exec', 'tsx', '../todomvc/examples/ndigo/benchmark-runner.ts']);
} catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    exitCode = 1;
} finally {
    await reapPreview();
}
process.exit(exitCode);
