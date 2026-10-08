/**
 * ClusterRunner lifecycle specs (AD-74): spawn identity, signal relay into
 * graceful drains, bounded-backoff respawns, the fail-closed crash-loop
 * guard, stuck-child force-kill, and the two-signal abort — all through
 * injected spawner/signal-host/clock seams (no real processes here; see
 * `cluster-real.spec.ts` for the real-process lane).
 * @module blue-cluster
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import {
    ClusterRunner,
    runCluster,
    type ClusterChild,
    type ClusterRunnerOptions,
    type ClusterSignalHost,
} from '../src/index';

/** A short real-delay settle point for spawn/respawn queues. */
async function tick(ms: number = 5): Promise<void> {
    await new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
    });
}

/**
 * A scripted child: exit is controlled from the test, signals and kills
 * are recorded.
 */
class ScriptedChild implements ClusterChild {
    static nextPid = 1_000;
    readonly pid = (ScriptedChild.nextPid += 1);
    readonly signaled: NodeJS.Signals[] = [];
    killed = false;
    readonly #resolver: (code: number) => void;
    readonly #exited: Promise<number>;

    constructor() {
        let resolve: (code: number) => void = () => undefined;
        this.#exited = new Promise<number>((next) => {
            resolve = next;
        });
        this.#resolver = resolve;
    }

    signal(signal: NodeJS.Signals): void {
        this.signaled.push(signal);
    }

    kill(): void {
        if (!this.killed) {
            this.killed = true;
            this.#resolver(9);
        }
    }

    waitForExit(): Promise<number> {
        return this.#exited;
    }

    /** The test makes the child exit with `code`. */
    finish(code: number): void {
        this.#resolver(code);
    }
}

/**
 * A harness bundling the three seams.
 */
function harness(options: Partial<ClusterRunnerOptions> & { size: number; command: string[] }) {
    const spawned: { env: Record<string, string> }[] = [];
    const children: ScriptedChild[] = [];
    const hostHandlers = new Map<string, () => void>();
    const signalHost: ClusterSignalHost = {
        on: (signal, handler) => {
            hostHandlers.set(signal, handler);
        },
        removeHandler: (signal, handler) => {
            if (hostHandlers.get(signal) === handler) {
                hostHandlers.delete(signal);
            }
        },
    };
    const runner = new ClusterRunner({
        restartBaseMs: 1,
        restartMaxMs: 5,
        clock: () => 0,
        spawner: (spawnOptions) => {
            spawned.push({ env: spawnOptions.env });
            const child = new ScriptedChild();
            children.push(child);
            return child;
        },
        signalHost,
        log: () => undefined,
        ...options,
    });
    return {
        runner,
        spawned,
        children,
        hostHandlers,
        fire: (signal: string) => {
            hostHandlers.get(signal)?.();
        },
    };
}

describe('ClusterRunner', () => {
    test('spawns size slots with slot identity and port derivation', async () => {
        const h = harness({ size: 2, command: ['node', 'main.js'], basePort: 3000 });
        const running = h.runner.run();

        await tick();

        expect(h.spawned).toHaveLength(2);
        expect(h.spawned[0]?.env.BLUE_CLUSTER_SLOT).toBe('0');
        expect(h.spawned[0]?.env.BLUE_CLUSTER_SIZE).toBe('2');
        expect(h.spawned[0]?.env.PORT).toBe('3000');
        expect(h.spawned[1]?.env.BLUE_CLUSTER_SLOT).toBe('1');
        expect(h.spawned[1]?.env.PORT).toBe('3001');

        h.fire('SIGTERM');
        h.children[0]?.finish(0);
        h.children[1]?.finish(0);
        const result = await running;
        expect(result.exitCode).toBe(0);
        expect(result.reason).toBe('stopped');
    });

    test('relays the first signal to children and never respawns after it', async () => {
        const h = harness({ size: 2, command: ['node', 'main.js'] });
        const running = h.runner.run();
        await tick();

        h.fire('SIGTERM');
        expect(h.children[0]?.signaled).toEqual(['SIGTERM']);
        expect(h.children[1]?.signaled).toEqual(['SIGTERM']);

        h.children[0]?.finish(0);
        h.children[1]?.finish(0);
        const result = await running;

        expect(h.spawned).toHaveLength(2); // no respawn after a deliberate stop
        expect(result.reason).toBe('stopped');
        expect(result.exitCode).toBe(0);
    });

    test('the relay observes the children’s exit codes', async () => {
        const h = harness({ size: 1, command: ['node', 'main.js'] });
        const running = h.runner.run();
        await tick();

        h.fire('SIGTERM');
        h.children[0]?.finish(7);
        const result = await running;
        expect(result.exitCode).toBe(7);
    });

    test('a crashed slot respawns with backoff and the cluster stays up', async () => {
        const h = harness({ size: 2, command: ['node', 'main.js'] });
        const running = h.runner.run();
        await Promise.resolve();
        await Promise.resolve();

        h.children[0]?.finish(1); // unexpected crash — slot 0 only
        await tick(10);

        expect(h.spawned.length).toBe(3); // one respawn (backoff 1ms)

        h.fire('SIGTERM');
        for (const child of h.children) {
            child.finish(0);
        }
        const result = await running;
        expect(result.reason).toBe('stopped');
        expect(result.slots[0]?.restarts).toBe(1);
    });

    test('the crash-loop guard trips the cluster, fail-closed', async () => {
        const h = harness({
            size: 1,
            command: ['node', 'main.js'],
            maxRestartsPerWindow: 2,
            restartWindowMs: 60_000,
        });
        const running = h.runner.run();
        await tick();

        // The window budget is 2 respawns: the slot may die twice and come back,
        // the THIRD death trips the guard (fail-closed, no churn).
        h.children[0]?.finish(1);
        await tick(100);
        h.children[1]?.finish(1);
        await tick(100);
        h.children[2]?.finish(1);

        const result = await running;
        expect(result.reason).toBe('crash-loop');
        expect(result.exitCode).toBe(1);
        expect(h.spawned.length).toBeLessThanOrEqual(3);
    });

    test('a crash-loop trip tears down healthy siblings — no slot outlives it', async () => {
        const h = harness({
            size: 2,
            command: ['node', 'main.js'],
            maxRestartsPerWindow: 2,
            restartWindowMs: 60_000,
        });
        const running = h.runner.run();
        // Spawn order is slot order: children[0] = slot 0, children[1] = slot 1.
        await tick();

        // Slot 0 crash-loops (3 deaths trip the guard); slot 1's child stays
        // healthy and MUST be killed with it — the bug left slot 1 running
        // forever and hung run()'s Promise.all.
        h.children[0]?.finish(1);
        await tick(50);
        h.children[2]?.finish(1); // slot 0 respawn #1
        await tick(50);
        h.children[3]?.finish(1); // slot 0 respawn #2 → trip

        const result = await running;
        expect(result.reason).toBe('crash-loop');
        expect(result.exitCode).toBe(1);
        expect(h.children[1]?.killed).toBe(true); // slot 1's healthy child forced down
        expect(h.spawned.length).toBeLessThanOrEqual(4);
    });

    test('a spawn failure aborts fail-closed — siblings are not orphaned', async () => {
        // Slot 0 spawns normally; the SECOND spawn throws (a missing binary
        // at respawn time). The cluster must settle and the healthy sibling
        // must be torn down with it instead of being orphaned.
        const children: ScriptedChild[] = [];
        const runner = new ClusterRunner({
            size: 2,
            command: ['node', 'main.js'],
            restartBaseMs: 1,
            restartMaxMs: 5,
            clock: () => 0,
            signalHost: {
                on: () => undefined,
                removeHandler: () => undefined,
            },
            log: () => undefined,
            spawner: (options) => {
                if (options.env.BLUE_CLUSTER_SLOT === '1') {
                    throw new Error('boom: binary missing');
                }
                const child = new ScriptedChild();
                children.push(child);
                return child;
            },
        });
        const running = runner.run();
        await tick();

        expect(children).toHaveLength(1); // slot 0 spawned; slot 1's spawn failed
        const result = await running; // must settle — never hang on the sibling
        expect(result.reason).toBe('aborted');
        expect(result.exitCode).toBe(1);
        expect(children[0]?.killed).toBe(true); // slot 0 torn down, not orphaned
    });

    test('the worst sibling exit code survives a crash-loop trip (floor 1)', async () => {
        const h = harness({
            size: 2,
            command: ['node', 'main.js'],
            maxRestartsPerWindow: 2,
            restartWindowMs: 60_000,
        });
        const running = h.runner.run();
        await tick();

        // Slot 1 fails for real (exit 7); slot 0 then crash-loops. The trip
        // must not overwrite slot 1's meaningful code with a bare 1.
        h.children[1]?.finish(7); // slot 1 → respawns (children[2])
        await tick(50);
        h.children[0]?.finish(1); // slot 0 → respawn #1 (children[3])
        await tick(50);
        h.children[3]?.finish(1); // slot 0 → respawn #2 (children[4])
        await tick(50);
        h.children[4]?.finish(1); // slot 0 3rd death → trip

        const result = await running;
        expect(result.reason).toBe('crash-loop');
        expect(result.exitCode).toBe(7);
        expect(h.children[2]?.killed).toBe(true); // slot 1's respawn torn down too
    });

    test('stop() after an abort is a no-op — the abort outcome stands', async () => {
        const h = harness({ size: 1, command: ['node', 'main.js'] });
        const running = h.runner.run();
        await tick();

        await h.runner.abort();
        // The abort already set #stopping; a trailing stop() must not relay
        // signals, respawn, or override the outcome.
        await h.runner.stop();

        const result = await running;
        expect(result.reason).toBe('aborted');
        expect(result.exitCode).toBe(1);
        expect(h.children[0]?.killed).toBe(true);
        expect(h.children[0]?.signaled).toEqual([]);
    });

    test('a child that ignores the signal is force-killed', async () => {
        const h = harness({ size: 1, command: ['node', 'main.js'], shutdownTimeoutMs: 10 });
        const running = h.runner.run();
        await tick();

        h.fire('SIGTERM');
        // The child never finishes — the deadline elapses…
        await new Promise<void>((resolve) => {
            setTimeout(resolve, 25);
        });
        // …and the runner force-kills it.
        expect(h.children[0]?.killed).toBe(true);
        const result = await running;
        expect(result.reason).toBe('stopped');
    });

    test('a second signal aborts immediately with exit code 1', async () => {
        const h = harness({ size: 2, command: ['node', 'main.js'] });
        const running = h.runner.run();
        await tick();

        h.fire('SIGTERM'); // first: graceful relay
        h.fire('SIGINT'); // second: abort

        expect(h.children[0]?.killed).toBe(true);
        expect(h.children[1]?.killed).toBe(true);
        const result = await running;
        expect(result.reason).toBe('aborted');
        expect(result.exitCode).toBe(1);
    });

    test('runCluster validates its options loudly', () => {
        expect(() => runCluster({ size: 0, command: ['node'] })).toThrow(TypeError);
        expect(() => runCluster({ size: 2, command: [] })).toThrow(TypeError);
        expect(() => runCluster({ size: 2, command: ['node'], ports: [1] })).toThrow(TypeError);
    });
});
