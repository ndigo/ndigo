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
