/**
 * Real-process cluster lane (AD-74): `ClusterRunner` over `node:child_process`
 * — slot identity env and PORT derivation reach real children, SIGTERM relay
 * drains them through their own signal handlers, and the children's exit
 * codes decide the cluster's.
 * @module blue-cluster
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect, beforeAll } from 'vitest';
import { mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { ClusterRunner, runCluster } from '../src/index';

let base: string;

beforeAll(() => {
    base = join('/tmp', `blue-cluster-${process.pid}`);
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
writeFileSync(join(dir, process.env.BLUE_CLUSTER_SLOT + '.up'), process.env.PORT ?? 'no-port');
process.on('SIGTERM', () => {
  writeFileSync(join(dir, process.env.BLUE_CLUSTER_SLOT + '.signal'), 'x');
  process.exit(${exitCode});
});
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

        await waitFor(() => existsSync(join(marker, '1.up')));
        expect(readFileSync(join(marker, '0.up'), 'utf8')).toBe('4100');
        expect(readFileSync(join(marker, '1.up'), 'utf8')).toBe('4101');

        await runner.stop();
        const result = await running;

        expect(result.exitCode).toBe(0);
        expect(result.reason).toBe('stopped');
        // Both children observed SIGTERM and ran their own drain.
        expect(existsSync(join(marker, '0.signal'))).toBe(true);
        expect(existsSync(join(marker, '1.signal'))).toBe(true);
    });

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
    });

    test('runCluster validates options without spawning', () => {
        expect(() => {
            void runCluster({ size: 0, command: [process.execPath, '-e', childScript(0)] });
        }).toThrow(TypeError);
    });
});
