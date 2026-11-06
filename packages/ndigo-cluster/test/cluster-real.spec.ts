/**
 * Real-process cluster lane (AD-74): `ClusterRunner` over `node:child_process`
 * — slot identity env and PORT derivation reach real children, SIGTERM relay
 * drains them through their own signal handlers, and the children's exit
 * codes decide the cluster's.
 */
// @vitest-environment node
import { describe, test, expect, beforeAll } from 'vitest';
import { mkdirSync, readFileSync, existsSync } from 'node:fs';
import { kill } from 'node:process';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { ClusterRunner, runCluster } from '../src/index';

let base: string;

beforeAll(() => {
    base = join('/tmp', `ndigo-cluster-${process.pid}`);
    mkdirSync(base, { recursive: true });
});

async function waitFor(predicate: () => boolean | Promise<boolean>): Promise<void> {
    for (let attempt = 0; attempt < 400; attempt += 1) {
        // oxlint-disable-next-line no-await-in-loop -- deterministic polling: each check must observe the previous state
        if (await predicate()) {
            return;
        }
        // oxlint-disable-next-line no-await-in-loop -- deterministic polling interval
        await delay(5);
    }
    throw new Error('waitFor: condition not reached in time');
}

/**
 * A per-test marker directory (tests must never collide on slot files).
 */
function freshMarker(name: string): string {
    const dir = join(base, name);
    mkdirSync(dir, { recursive: true });
    return dir;
}

/**
 * A child script: records its slot identity + PORT, then idles until
 * SIGTERM, where it writes a marker and exits (cleanly or with a code).
 */
function childScript(exitCode: number): string {
    return `
const { writeFileSync } = require('node:fs');
const { join } = require('node:path');
const dir = process.env.CLUSTER_MARKER_DIR;
process.on('SIGTERM', () => {
  writeFileSync(join(dir, process.env.NDIGO_CLUSTER_SLOT + '.signal'), 'x');
  process.exit(${exitCode});
});
// The .up marker must mean "armed": tests may race stop() against startup,
// and an unhandled SIGTERM would kill the child by default disposition —
// exit code null, cluster stays at its default 0 (CI flake 2026-10-30).
writeFileSync(join(dir, process.env.NDIGO_CLUSTER_SLOT + '.up'), process.env.PORT ?? 'no-port');
setTimeout(() => {}, 60_000);
`;
}

describe('ClusterRunner (real processes)', () => {
    test('spawns real children with slot env and relays SIGTERM into their graceful exit', async () => {
        const marker = freshMarker('relay');
        const runner = new ClusterRunner({
            size: 2,
            command: [process.execPath, '-e', childScript(0)],
            basePort: 4100,
            env: { CLUSTER_MARKER_DIR: marker },
            log: () => undefined,
        });
        const running = runner.run();

        // Wait on EVERY marker before reading anything: the children write
        // slot files in parallel, so 1.up existing does not mean 0.up is
        // readable yet (ENOENT under load, 2026-10-08).
        await waitFor(() => existsSync(join(marker, '0.up')) && existsSync(join(marker, '1.up')));
        expect(readFileSync(join(marker, '0.up'), 'utf8')).toBe('4100');
        expect(readFileSync(join(marker, '1.up'), 'utf8')).toBe('4101');

        await runner.stop();
        const result = await running;

        expect(result.exitCode).toBe(0);
        expect(result.reason).toBe('stopped');
        // Both children observed SIGTERM and ran their own drain.
        await waitFor(() => existsSync(join(marker, '0.signal')) && existsSync(join(marker, '1.signal')));
        expect(existsSync(join(marker, '0.signal'))).toBe(true);
        expect(existsSync(join(marker, '1.signal'))).toBe(true);
    }, 20_000);

    test('a child that fails during drain decides the cluster exit code', async () => {
        const marker = freshMarker('drain-fail');
        const runner = new ClusterRunner({
            size: 1,
            command: [process.execPath, '-e', childScript(3)],
            basePort: 4200,
            env: { CLUSTER_MARKER_DIR: marker },
            log: () => undefined,
        });
        const running = runner.run();
        await waitFor(() => existsSync(join(marker, '0.up')));

        await runner.stop();
        const result = await running;
        expect(result.exitCode).toBe(3);
        expect(result.reason).toBe('stopped');
    }, 20_000);

    test('a crash-looping slot trips the cluster and no sibling survives', async () => {
        const marker = freshMarker('crash-loop');
        // Slot 0 exits immediately (no signal handler → unexpected crash);
        // slot 1 idles. Three slot-0 deaths trip the guard, which must tear
        // down slot 1 too — the supervisor must not linger with live
        // children (BLK-1 regression: run() hung forever, sibling alive).
        const script = `
const { writeFileSync } = require('node:fs');
const { join } = require('node:path');
const dir = process.env.CLUSTER_MARKER_DIR;
const slot = process.env.NDIGO_CLUSTER_SLOT;
writeFileSync(join(dir, slot + '.up'), String(process.pid));
if (slot !== '0') {
  setTimeout(() => {}, 60_000);
}
`;
        const runner = new ClusterRunner({
            size: 2,
            command: [process.execPath, '-e', script],
            basePort: 4300,
            env: { CLUSTER_MARKER_DIR: marker },
            maxRestartsPerWindow: 2,
            restartWindowMs: 60_000,
            restartBaseMs: 10,
            restartMaxMs: 20,
            log: () => undefined,
        });
        const running = runner.run();
        await waitFor(() => existsSync(join(marker, '1.up')));

        const result = await running;
        expect(result.reason).toBe('crash-loop');
        expect(result.exitCode).toBe(1);
        // Slot 1's child must be reaped — the snapshot carries no pid and
        // the OS process is gone (BLK-1 survivor assertion).
        expect(result.slots[1]?.status).toBe('exited');
        expect(result.slots[1]?.pid).toBeNull();
        const pid1 = Number(readFileSync(join(marker, '1.up'), 'utf8'));
        let alive = true;
        try {
            kill(pid1, 0);
        } catch {
            alive = false;
        }
        expect(alive).toBe(false);
    }, 20_000);

    test('runCluster validates options without spawning', () => {
        expect(() => {
            void runCluster({ size: 0, command: [process.execPath, '-e', childScript(0)] });
        }).toThrow(TypeError);
    });
});
