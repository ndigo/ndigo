/**
 * OS-signal-driven graceful shutdown for Node.js platform applications.
 */
import type { ApplicationContext } from '@ndigo/context';

/**
 * A resource with a closeable lifecycle, e.g. an {@link "http-server".HTTPServer | HTTPServer}.
 */
export interface Closable {
    /** Close the resource. May be async; it is awaited during shutdown. */
    close(): Promise<void> | void;
}

/**
 * Options for {@link gracefulShutdown}.
 */
export interface GracefulShutdownOptions {
    /**
     * Signals to listen for.
     * @defaultValue ['SIGINT', 'SIGTERM']
     */
    signals?: NodeJS.Signals[];
    /**
     * Extra resources to close, in order, before the context. Typically the
     * application's {@link "http-server".HTTPServer | HTTPServer}.
     * @defaultValue []
     */
    resources?: ReadonlyArray<Closable>;
    /**
     * Force-exit deadline (ms) for the whole teardown. Guards against a close
     * that never completes (e.g. in-flight connections that never drain).
     * @defaultValue 10_000
     */
    timeoutMs?: number;
    /**
     * Process exit code after a clean shutdown.
     * @defaultValue 0
     */
    exitCode?: number;
    /**
     * Process exit code when shutdown is aborted (second signal, a close that
     * throws, or the deadline elapsing).
     * @defaultValue 1
     */
    abortExitCode?: number;
}

/**
 * Wire OS signals to a graceful shutdown of the given context and resources.
 *
 * On the first matching signal the handler closes each resource in order, then
 * closes the context, then exits with {@link GracefulShutdownOptions.exitCode}.
 * A second signal while shutting down — or a teardown that exceeds
 * `timeoutMs` — force-exits with {@link GracefulShutdownOptions.abortExitCode}.
 *
 * The handler is idempotent per process: the first signal wins; later signals
 * only escalate to a force-exit.
 *
 * @param context - The application context to close on shutdown.
 * @param options - Shutdown configuration.
 * @returns A function that unregisters the signal listeners.
 */
export function gracefulShutdown(context: ApplicationContext, options: GracefulShutdownOptions = {}): () => void {
    const signals = options.signals ?? ['SIGINT', 'SIGTERM'];
    const resources = options.resources ?? [];
    const timeoutMs = options.timeoutMs ?? 10_000;
    const exitCode = options.exitCode ?? 0;
    const abortExitCode = options.abortExitCode ?? 1;

    let shuttingDown = false;

    const shutdown = (signal: NodeJS.Signals): void => {
        if (shuttingDown) {
            // A second signal while tearing down: the user is asking to stop
            // now, so do not wait for a possibly-hung close to finish.
            process.exit(abortExitCode);
            return;
        }
        shuttingDown = true;

        const deadline = setTimeout(() => process.exit(abortExitCode), timeoutMs);
        deadline.unref?.();

        const finish = (code: number): void => {
            clearTimeout(deadline);
            process.exit(code);
        };

        void (async () => {
            try {
                for (const resource of resources) {
                    // eslint-disable-next-line no-await-in-loop -- sequential teardown is intentional: resources must close in order (e.g. stop the server before the context destroys its entries)
                    await resource.close();
                }
                context.close();
            } catch {
                finish(abortExitCode);
                return;
            }
            finish(exitCode);
        })();
    };

    for (const signal of signals) {
        process.on(signal, shutdown);
    }

    return (): void => {
        for (const signal of signals) {
            process.off(signal, shutdown);
        }
    };
}
