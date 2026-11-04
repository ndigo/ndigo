/**
 * The cluster supervisor (AD-74): replicated worker slots with signal
 * relay, graceful drains, and bounded-backoff restarts.
 *
 * `@ndigo/cluster` is a **supervisor, not a coordinator** — every slot runs
 * the same application process and lets the existing contracts arbitrate
 * single-executor work (job leases from AD-72, `@scheduled({ lock })` from
 * AD-73). This package owns only the process shell: spawn N children with
 * slot identity env, forward `SIGINT`/`SIGTERM` into each child's **own**
 * graceful shutdown, and respawn crashed slots with exponential backoff
 * inside a fail-closed crash-loop window.
 *
 * The spawner and signal host are injectable so the lifecycle is testable
 * without processes; the default spawner uses `node:child_process` and the
 * default signal host is `process` itself. The default logger is
 * `@ndigo/log` (the `ndigo-cluster:runner` channel).
 *
 * @module ndigo-cluster
 * @since 1.0.0
 * @author Jeff Rose
 */
import { spawn } from 'node:child_process';
import { getLogger } from '@ndigo/log';

const logger = getLogger('ndigo-cluster:runner');

/**
 * A spawned child as the runner sees it. The default spawner wraps
 * `node:child_process`; tests inject a scripted handle.
 */
export interface ClusterChild {
    /** The operating-system process id. */
    readonly pid: number;
    /** Sends a signal (e.g. `SIGTERM`) to the child. */
    signal(signal: NodeJS.Signals): void;
    /** Force-kills the child (`SIGKILL`). */
    kill(): void;
    /** Resolves with the child's exit code once the process terminates. */
    waitForExit(): Promise<number>;
}

/**
 * The spawn seam: a function producing a {@link ClusterChild} from a
 * command and environment. Injectable so restart/signal logic is
 * unit-testable without real processes.
 */
export interface ClusterSpawner {
    (options: { command: string[]; cwd?: string; env: Record<string, string> }): ClusterChild;
}

/**
 * The signal-delivery seam: where the runner registers its OS-signal
 * handlers. Injectable so a test can trigger the relay without signaling
 * the vitest worker. Defaults to `process`.
 */
export interface ClusterSignalHost {
    /** Registers a handler for the signal. */
    on(signal: NodeJS.Signals, handler: () => void): void;
    /** Removes a previously registered handler. */
    removeHandler(signal: NodeJS.Signals, handler: () => void): void;
}

/**
 * Options for {@link ClusterRunner}.
 */
export interface ClusterRunnerOptions {
    /** Number of worker slots (≥ 1). */
    size: number;
    /** The child command (argv), e.g. `['node', 'dist/main.js']`. */
    command: string[];
    /** Working directory for the children; defaults to the parent's cwd. */
    cwd?: string;
    /** Base environment for every child; slot variables are overlaid. */
    env?: Record<string, string>;
    /**
     * Port base: when set, each child gets `PORT = base + slot` (the apps'
     * documented `PORT` env override) unless `ports` pins a value.
     */
    basePort?: number;
    /** Explicit per-slot `PORT` overrides (indexed by slot). */
    ports?: number[];
    /** Signals that trigger a graceful cluster stop (default `SIGINT`, `SIGTERM`). */
    signals?: NodeJS.Signals[];
    /**
     * How long a child may take to exit after the relayed signal before it
     * is force-killed (default 10 000 ms, the `gracefulShutdown` precedent).
     */
    shutdownTimeoutMs?: number;
    /** Respawn backoff base (default 500 ms). */
    restartBaseMs?: number;
    /** Respawn backoff ceiling (default 30 000 ms). */
    restartMaxMs?: number;
    /** Backoff jitter factor (default 0.2). */
    restartJitter?: number;
    /** Crash-loop guard: max respawns per slot per window. */
    maxRestartsPerWindow?: number;
    /** Crash-loop guard window (default 60 000 ms). */
    restartWindowMs?: number;
    /** Injectable epoch-ms clock. */
    clock?: () => number;
    /** Injectable spawner (defaults to `node:child_process`). */
    spawner?: ClusterSpawner;
    /** Injectable signal host (defaults to `process`). */
    signalHost?: ClusterSignalHost;
    /** Log sink; defaults to the `ndigo-cluster:runner` `@ndigo/log` channel. */
    log?: (message: string) => void;
}

/**
 * A snapshot of one slot's state.
 */
export interface ClusterSlotSnapshot {
    /** 0-based slot index. */
    readonly slot: number;
    /** The current child pid, `null` between respawns. */
    readonly pid: number | null;
    /** Lifecycle status. */
    readonly status: 'starting' | 'running' | 'stopping' | 'exited';
    /** Exit code of the most recent run, `null` while first starting. */
    readonly exitCode: number | null;
    /** How many times this slot has been respawned. */
    readonly restarts: number;
}

/**
 * Why the cluster stopped.
 */
export type ClusterStopReason = 'stopped' | 'aborted' | 'crash-loop';

/**
 * The cluster outcome.
 */
export interface ClusterRunResult {
    /** Process exit code: `0` after a clean stop, `1` otherwise. */
    readonly exitCode: number;
    /** Why the cluster stopped. */
    readonly reason: ClusterStopReason;
    /** Final slot states. */
    readonly slots: readonly ClusterSlotSnapshot[];
}

/**
 * Renders an unknown error for supervision logs without throwing on a
 * malformed value (`null`, a bare string, or an object without `message`).
 */
function describeError(error: unknown): string {
    if (typeof error === 'string') {
        return error;
    }
    if (error instanceof Error && typeof error.message === 'string' && error.message.length > 0) {
        return error.message;
    }
    return String(error);
}

/** Shared process-signal host (the runner's default). */
const PROCESS_SIGNAL_HOST: ClusterSignalHost = {
    on: (signalName, handler) => {
        process.on(signalName, handler);
    },
    removeHandler: (signalName, handler) => {
        process.off(signalName, handler);
    },
};

/**
 * Default spawner — `node:child_process` with inherited stdio (children
 * share the parent console) and the process id as the child handle.
 */
const PROCESS_SPAWNER: ClusterSpawner = (options) => {
    const child = spawn(options.command[0] ?? '', options.command.slice(1), {
        cwd: options.cwd,
        env: { ...process.env, ...options.env },
        stdio: 'inherit',
    });
    return {
        pid: child.pid ?? 0,
        signal: (signalName) => child.kill(signalName),
        kill: () => child.kill('SIGKILL'),
        waitForExit: () =>
            new Promise<number>((resolve) => {
                child.once('exit', resolve);
            }),
    };
};

/**
 * Each slot's supervisor state.
 */
interface SlotState {
    readonly slot: number;
    child: ClusterChild | null;
    status: 'starting' | 'running' | 'stopping' | 'exited';
    exitCode: number | null;
    restarts: number;
    /** Clock timestamps of this slot's respawns within the current window. */
    restartTimes: number[];
    /** The supervised lifecycle loop; resolved when the slot settles. */
    readonly loop: Promise<void>;
}

/**
 * The cluster supervisor (AD-74 D-1..D-5). Construct with
 * {@link ClusterRunnerOptions}, then `await run()`; the returned result
 * carries the resolved exit code and per-slot snapshots.
 */
export class ClusterRunner {
    readonly #options: Required<
        Pick<ClusterRunnerOptions, 'shutdownTimeoutMs' | 'restartBaseMs' | 'restartMaxMs' | 'restartJitter'>
    > & {
        size: number;
        command: string[];
        cwd?: string;
        env?: Record<string, string>;
        basePort?: number;
        ports?: number[];
        signals: NodeJS.Signals[];
        maxRestartsPerWindow: number;
        restartWindowMs: number;
    };
    readonly #clock: () => number;
    readonly #spawner: ClusterSpawner;
    readonly #signalHost: ClusterSignalHost;
    readonly #log: (message: string) => void;

    readonly #slots: SlotState[] = [];
    #stopping = false;
    #aborted = false;
    #reason: ClusterStopReason = 'stopped';
    #exitCode = 0;

    /**
     * @param options - Cluster sizing, command, and tuning.
     * @throws {TypeError} On invalid size or an empty command.
     */
    constructor(options: ClusterRunnerOptions) {
        if (options === null || typeof options !== 'object') {
            throw new TypeError('ClusterRunner: options are required');
        }
        if (!Number.isInteger(options.size) || options.size < 1) {
            throw new TypeError(`ClusterRunner: size must be a positive integer, got ${String(options.size)}`);
        }
        if (!Array.isArray(options.command) || options.command.length === 0 || typeof options.command[0] !== 'string') {
            throw new TypeError('ClusterRunner: command must be a non-empty argv array');
        }
        if (options.ports !== undefined && options.ports.length !== options.size) {
            throw new TypeError(`ClusterRunner: ports (${options.ports.length}) must match size (${options.size})`);
        }
        this.#options = {
            size: options.size,
            command: [...options.command],
            cwd: options.cwd,
            env: options.env === undefined ? undefined : { ...options.env },
            basePort: options.basePort,
            ports: options.ports,
            signals: options.signals ?? ['SIGINT', 'SIGTERM'],
            shutdownTimeoutMs: options.shutdownTimeoutMs ?? 10_000,
            restartBaseMs: options.restartBaseMs ?? 500,
            restartMaxMs: options.restartMaxMs ?? 30_000,
            restartJitter: options.restartJitter ?? 0.2,
            maxRestartsPerWindow: options.maxRestartsPerWindow ?? 5,
            restartWindowMs: options.restartWindowMs ?? 60_000,
        };
        this.#clock = options.clock ?? Date.now;
        this.#spawner = options.spawner ?? PROCESS_SPAWNER;
        this.#signalHost = options.signalHost ?? PROCESS_SIGNAL_HOST;
        this.#log = options.log ?? ((message: string) => logger.info(message));
    }

    /**
     * Runs the cluster: installs the signal handlers, spawns every slot,
     * and resolves when the cluster stops (signal, {@link ClusterRunner.stop},
     * {@link ClusterRunner.abort}, or a crash-loop trip). Each slot's
     * supervise loop is bound to a per-slot {@link ClusterChild} handle.
     *
     * @returns The cluster outcome.
     */
    async run(): Promise<ClusterRunResult> {
        let received = 0;
        const handlers: { signal: NodeJS.Signals; handler: () => void }[] = [];
        for (const signal of this.#options.signals) {
            const handler = (): void => {
                received += 1;
                if (received === 1) {
                    void this.stop();
                } else {
                    this.#log(`second signal — immediate abort`);
                    void this.abort();
                }
            };
            this.#signalHost.on(signal, handler);
            handlers.push({ signal, handler });
        }

        for (let slot = 0; slot < this.#options.size; slot += 1) {
            this.#slots.push(this.#newSlot(slot));
        }
        try {
            await Promise.all(this.#slots.map((state) => state.loop));
            // The worst child exit code decides a CLEAN stop (0 unless a
            // child failed while draining). An abort or crash-loop outcome
            // pins its own exit code (1) — child kill codes never override it.
            if (this.#reason === 'stopped') {
                for (const state of this.#slots) {
                    if (state.exitCode !== null && state.exitCode > this.#exitCode) {
                        this.#exitCode = state.exitCode;
                    }
                }
            }
        } finally {
            for (const { signal, handler } of handlers) {
                this.#signalHost.removeHandler(signal, handler);
            }
        }
        return {
            exitCode: this.#exitCode,
            reason: this.#reason,
            slots: this.#slots.map((state) => ({
                slot: state.slot,
                pid: state.child === null ? null : state.child.pid,
                status: state.status,
                exitCode: state.exitCode,
                restarts: state.restarts,
            })),
        };
    }

    /**
     * Deliberate graceful stop — the programmatic equivalent of the first
     * relayed signal. Every child receives `SIGTERM`; a child that does not
     * exit within the shutdown deadline is force-killed. Never respawns.
     */
    async stop(): Promise<void> {
        if (this.#stopping) {
            return;
        }
        this.#stopping = true;
        this.#reason = 'stopped';
        const children = this.#slots.map((state) => state.child).filter((child) => child !== null) as ClusterChild[];
        for (const child of children) {
            child.signal('SIGTERM');
        }
        // Track which children actually exit within the deadline; the rest
        // are force-killed. (The supervise loops settle on their own exit
        // observation; `run()` aggregates exit codes once they do.)
        const exited = new Set<ClusterChild>();
        const deadline = this.#clock() + this.#options.shutdownTimeoutMs;
        // Timers created by the losing branch of a race still hold the
        // process open — every race timer is collected and cleared once the
        // drain settles (a 10 s residual timer would otherwise keep a
        // supervisor process alive after a clean stop).
        const raceTimers: NodeJS.Timeout[] = [];
        try {
            for (const child of children) {
                const remaining = deadline - this.#clock();
                if (remaining <= 0) {
                    break;
                }
                // oxlint-disable-next-line no-await-in-loop -- children drain sequentially against the shared deadline; the remaining budget informs each next wait
                await Promise.race([
                    child.waitForExit().then(() => {
                        exited.add(child);
                    }),
                    new Promise<void>((resolve) => {
                        raceTimers.push(setTimeout(resolve, remaining));
                    }),
                ]);
                const armed = raceTimers.pop();
                if (armed !== undefined) {
                    clearTimeout(armed); // the armed timer is done either way
                }
            }
        } finally {
            for (const timer of raceTimers) {
                clearTimeout(timer);
            }
        }
        for (const child of children) {
            if (!exited.has(child)) {
                this.#log('child did not exit in time — SIGKILL');
                child.kill();
            }
        }
    }

    /**
     * Immediate abort — the programmatic equivalent of a second signal:
     * all children are force-killed and the result carries exit code `1`.
     */
    async abort(): Promise<void> {
        this.#teardown('aborted', 1);
    }

    /**
     * Fail-closed teardown shared by the operator abort, the crash-loop
     * guard and a spawn failure: every slot's current child is killed so
     * no sibling can keep the cluster alive, `#stopping`/`#aborted` are
     * set (never respawn), and the reason + exit code are pinned. The
     * first teardown wins; a later one (e.g. a second abort call) is a
     * no-op. The settle of every supervise loop is guaranteed: a killed
     * child resolves its `waitForExit`, and a slot mid-backoff observes
     * `#aborted` on its next poll, so `run()`'s `Promise.all` never hangs
     * on a tripped cluster.
     */
    #teardown(reason: ClusterStopReason, exitCode: number, message?: string): void {
        if (this.#aborted) {
            return;
        }
        this.#aborted = true;
        this.#stopping = true;
        this.#reason = reason;
        this.#exitCode = exitCode;
        if (message !== undefined) {
            this.#log(message);
        }
        for (const state of this.#slots) {
            const child = state.child;
            if (child !== null) {
                child.kill();
            }
        }
    }

    #newSlot(slot: number): SlotState {
        const state: SlotState = {
            slot,
            child: null,
            status: 'starting',
            exitCode: null,
            restarts: 0,
            restartTimes: [],
            loop: Promise.resolve().then(() => this.#supervise(state)),
        };
        return state;
    }

    /**
     * The per-slot lifecycle: spawn → await exit → respawn with backoff
     * (unless stopping) → settle.
     */
    async #supervise(state: SlotState): Promise<void> {
        for (;;) {
            if (this.#stopping || this.#aborted) {
                state.status = 'exited';
                return;
            }
            let child: ClusterChild;
            try {
                child = this.#spawnSlot(state);
            } catch (error) {
                // A spawning failure (e.g. a missing binary) is fail-closed:
                // the cluster cannot run, and siblings must not be orphaned.
                // oxlint-disable-next-line no-await-in-loop -- the supervise loop settles after a terminal spawn failure
                this.#teardown(
                    'aborted',
                    1,
                    `slot ${state.slot}: spawn failed — ${describeError(error)}; aborting the cluster`
                );
                return;
            }
            state.child = child;
            state.status = 'running';
            // oxlint-disable-next-line no-await-in-loop -- the supervise loop is inherently sequential: a slot's lifecycle waits on its child
            const code = await child.waitForExit();
            state.exitCode = code;
            state.child = null;
            state.status = 'exited';
            if (this.#stopping || this.#aborted) {
                return; // deliberate — never respawn
            }
            if (code > this.#exitCode) {
                this.#exitCode = code;
            }
            // oxlint-disable-next-line no-await-in-loop -- same per-slot lifecycle: the restart decision must follow the exit
            if (!(await this.#scheduleRestart(state))) {
                // Fail-closed: the crash-loop guard trips the WHOLE cluster
                // — siblings are killed so they cannot outlive the trip (the
                // previous code merely set #aborted, hanging `run()` forever),
                // and the highest observed child code survives (floor 1) so a
                // sibling's real failure is not masked by the trip code.
                this.#teardown(
                    'crash-loop',
                    Math.max(1, this.#exitCode),
                    `slot ${state.slot} exceeded ${this.#options.maxRestartsPerWindow} restarts per ` +
                        `${this.#options.restartWindowMs}ms — crash-loop guard trips the cluster`
                );
                return;
            }
        }
    }

    /**
     * Respawn control: consume the slot's restart window and wait the
     * backoff for attempt N. Returns `false` when the window budget is
     * exhausted (fail-closed: no churn, the cluster trips).
     */
    async #scheduleRestart(state: SlotState): Promise<boolean> {
        const now = this.#clock();
        const windowStart = now - this.#options.restartWindowMs;
        state.restartTimes = state.restartTimes.filter((at) => at > windowStart);
        if (state.restartTimes.length >= this.#options.maxRestartsPerWindow) {
            // The trip message is logged once by #teardown in #supervise.
            return false;
        }
        state.restartTimes.push(now);
        state.restarts += 1;
        const backoff = this.#backoff(state.restarts - 1);
        // Cancellable: an in-progress backoff must not delay a stop (a 30 s
        // respawn timer would otherwise hold the supervisor process open).
        // Polled in ≤100 ms chunks so the lifecycle state is re-checked.
        let remaining = backoff;
        while (remaining > 0 && !this.#stopping && !this.#aborted) {
            const step = Math.min(100, remaining);
            // oxlint-disable-next-line no-await-in-loop -- the chunked backoff must observe the lifecycle between waits
            await this.#delay(step);
            remaining -= step;
        }
        return true;
    }

    /**
     * Exponential backoff with jitter, mirroring the reconnect policy
     * (`base × 2^attempt`, clamped, jittered within the cap).
     *
     * @param attempt - Zero-based respawn attempt for this slot.
     * @returns The wait in milliseconds.
     */
    #backoff(attempt: number): number {
        const base = this.#options.restartBaseMs;
        const max = this.#options.restartMaxMs;
        const jitter = this.#options.restartJitter;
        const exponential = Math.min(base * Math.pow(2, attempt), max);
        return Math.min(max, exponential * (1 - jitter + Math.random() * 2 * jitter));
    }

    #spawnSlot(state: SlotState): ClusterChild {
        const env: Record<string, string> = { ...this.#options.env };
        env.NDIGO_CLUSTER_SLOT = String(state.slot);
        env.NDIGO_CLUSTER_SIZE = String(this.#options.size);
        if (this.#options.basePort !== undefined || this.#options.ports !== undefined) {
            const ports = this.#options.ports;
            const port = ports?.[state.slot] ?? (this.#options.basePort ?? 0) + state.slot;
            env.PORT = String(port);
        }
        this.#log(`slot ${state.slot}: spawning pid via ${this.#options.command[0]}…`);
        return this.#spawner({
            command: this.#options.command,
            cwd: this.#options.cwd,
            env,
        });
    }

    async #delay(ms: number): Promise<void> {
        if (ms <= 0) {
            return;
        }
        await new Promise<void>((resolve) => {
            setTimeout(resolve, ms);
        });
    }
}

/**
 * Runs a cluster to completion and returns the outcome — the top-level
 * entry for applications that have nothing else after the cluster (the
 * GAP-6 CLI's `serve --cluster <n>` will invoke this).
 *
 * @param options - Cluster sizing, command, and tuning.
 * @returns The cluster outcome.
 */
export function runCluster(options: ClusterRunnerOptions): Promise<ClusterRunResult> {
    return new ClusterRunner(options).run();
}
