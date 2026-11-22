/**
 * Boot helpers for `@ndigo/test` — boot a Ndigo application context and wire a.
 */
import { MetadataConfigApplicationContext, ApplicationContext } from '@ndigo/context';
import { getSymbolMetadata } from '@ndigo/core';
import type { EntryProcessor } from '@ndigo/factory';
import { isFunction } from '@ndigo/util/types';
import { HANDLER_MAPPING, DISPATCHER } from '@ndigo/dispatcher';
import { NodeDispatcher, NodeAutoConfiguration } from '@ndigo/platform-node';

/**
 * A booted application ready for MockHTTP dispatch.
 */
export interface NdigoTestApp {
    /** The application context (real DI graph + auto-configs). */
    context: ApplicationContext;
    /** The configured node dispatcher. */
    dispatcher: NodeDispatcher;
    /** Close the context and release resources. */
    close(): void;
}

/**
 * Options for {@link bootNodeApp}.
 */
export interface BootNodeAppOptions {
    /**
     * Entry processors applied to every entry the context creates, before and
     * after initialization — registering the advice weaver here mirrors what
     * `ApplicationBuilder.processors(...)` does for a real application.
     */
    readonly processors?: readonly EntryProcessor[];
}

/**
 * Boot a Ndigo application from configuration/controller classes and wire the
 * dispatcher.
 *
 * Each source is registered into a `MetadataConfigApplicationContext`:
 * a `configuration` class is handed to `context.register`; a plain
 * `@getMapping` controller class is instantiated and stored by its class name,
 * which the handler mapping discovers during `init`.
 *
 * @param sources - Application configuration and/or controller classes.
 * @param options - Optional entry processors, applied to every entry the
 *   context creates during `refresh` — the test-side equivalent of
 *   `ApplicationBuilder.processors(...)`.
 * @returns A booted app exposing the context and configured dispatcher.
 *
 * @example
 * ```ts
 * const app = bootNodeApp([HelloConfiguration], { processors: [interception(rules)] });
 * const mockHTTP = new MockHTTP(app);
 * const res = await mockHTTP.get('/').exec();
 * ```
 */
export function bootNodeApp(sources: Function[], options: BootNodeAppOptions = {}): NdigoTestApp {
    const context = new MetadataConfigApplicationContext('ndigo-test-app');
    for (const processor of options.processors ?? []) {
        context.addProcessor(processor);
    }

    context.register(NodeAutoConfiguration);
    for (const source of sources) {
        if (isConfiguration(source)) {
            context.register(source);
        } else {
            // Plain controller class → instance stored by class name.
            const ctor = source as { new (): object };
            context.setValue(source.name, new ctor());
        }
    }
    context.refresh();

    // The handler mapping entry from NodeAutoConfiguration. Bind it to the
    // context and re-init so it detects concrete controller methods.
    const handlerMapping = context.getValue(HANDLER_MAPPING);
    handlerMapping.setApplicationContext(context);
    handlerMapping.init();

    const dispatcher = context.getValue(DISPATCHER) as NodeDispatcher;
    dispatcher.initStrategies(context);
    dispatcher.applicationContext = context;

    return {
        context,
        dispatcher,
        close() {
            context.close();
        },
    };
}

/**
 * Heuristic: a class is a `configuration` (constructor-registered) rather than
 * a plain controller when its `configuration` decorator set the constructor
 * marker in the class's `Symbol.metadata` (`config:constructor`).
 */
function isConfiguration(source: Function): boolean {
    if (!isFunction(source)) {
        return false;
    }
    return getSymbolMetadata(source)['config:constructor'] === true;
}

// Per-module cache: multiple suites in the same worker that boot the same
// sources share one app. Vitest isolates module state per file by default, so
// this is safe *within* a file (and across files only when isolate: false).
const cachedApps = new Map<string, { app: NdigoTestApp; refs: number; rawClose: () => void }>();

/**
 * Cache key for {@link cachedBootNodeApp}: the source names plus how many
 * processors were supplied. An advised app must never be shared with an
 * unadvised one, and the count is enough to keep those apart without trying to
 * compare processor identities.
 *
 * @param sources - The sources the app is booted with.
 * @param options - The boot options.
 * @returns A stable key for the module-scoped cache.
 */
function appKey(sources: Function[], options: BootNodeAppOptions): string {
    return `${sources.map((s) => s.name).join(',')}|${options.processors?.length ?? 0}`;
}

/**
 * Boots (or reuses a cached) application for the given sources.
 *
 * Within a vitest worker, calling `cachedBootNodeApp` twice with the same sources
 * returns the SAME app — the context is booted once, not per suite. Each call
 * increments a reference; release one with {@link releaseCachedNodeApp} (or by
 * closing the app). The app is closed when the last reference is released.
 *
 * NOTE: Vitest isolates modules per file by default, so the cache is scoped to
 * one worker/file. To share one context across multiple spec files, disable
 * per-file isolation (e.g. `isolate: false` in the pool config) — a deliberate
 * safety trade-off: shared mutable context means suites can interfere.
 *
 * Callers that need distinct advice sets should use {@link bootNodeApp}
 * directly: the cache distinguishes an advised app from an unadvised one, but
 * not two different processor lists of the same length.
 *
 * @param sources - Application configuration and/or controller classes.
 * @param options - Optional entry processors, as for {@link bootNodeApp}.
 * @returns A booted app.
 *
 * @example
 * ```ts
 * const app = cachedBootNodeApp([TodoConfiguration]); // boots once
 * const app2 = cachedBootNodeApp([TodoConfiguration]); // reuses app
 * expect(app2).toBe(app); // same context
 * ```
 */
export function cachedBootNodeApp(sources: Function[], options: BootNodeAppOptions = {}): NdigoTestApp {
    const key = appKey(sources, options);
    const existing = cachedApps.get(key);
    if (existing) {
        existing.refs += 1;
        return existing.app;
    }

    const app = bootNodeApp(sources, options);
    const rawClose = app.close.bind(app);
    cachedApps.set(key, { app, refs: 1, rawClose });

    // Closing the app releases one cache reference (and closes on last).
    app.close = () => {
        releaseCachedNodeApp(sources, options);
    };

    return app;
}

/**
 * Releases one cached-app reference for the given sources, closing the app
 * when the last reference is released.
 *
 * @param sources - The sources the app was booted with.
 * @param options - The boot options the app was created with.
 *
 * @example
 * ```ts
 * const app = bootNodeApp([AppConfiguration]);
 * releaseCachedNodeApp([AppConfiguration]);
 * ```
 */
export function releaseCachedNodeApp(sources: Function[], options: BootNodeAppOptions = {}): void {
    const key = appKey(sources, options);
    const entry = cachedApps.get(key);
    if (!entry) {
        return;
    }
    entry.refs -= 1;
    if (entry.refs <= 0) {
        entry.rawClose();
        cachedApps.delete(key);
    }
}
