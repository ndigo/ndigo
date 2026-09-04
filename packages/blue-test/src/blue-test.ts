/**
 * Boot helpers for `@blue/test` — boot a Blue application context and wire a
 * dispatcher for in-process integration testing.
 *
 * Uses `MetadataConfigApplicationContext` directly (node-pure) rather than
 * `@blue/boot`'s `ApplicationBuilder`, whose index re-exports the browser
 * `web-auto-configuration` (and `@blue/view-webcomponent`, which needs
 * `HTMLElement`). This keeps `@blue/test` free of DOM-coupled imports.
 *
 * @module
 * @since 1.0.0
 */

import { MetadataConfigApplicationContext, ApplicationContext } from '@blue/context';
import { isFunction } from '@blue/util/types';
import { LinearMetadataHandlerMapping } from '@blue/dispatcher';
import { NodeDispatcher, NodeAutoConfiguration } from '@blue/platform-node';

/**
 * A booted application ready for MockMVC dispatch.
 */
export interface BlueTestApp {
    /** The application context (real DI graph + auto-configs). */
    context: ApplicationContext;
    /** The configured node dispatcher. */
    dispatcher: NodeDispatcher;
    /** Close the context and release resources. */
    close(): void;
}

/**
 * Boot a Blue application from configuration/controller classes and wire the
 * dispatcher.
 *
 * Each source is registered into a `MetadataConfigApplicationContext`:
 * a `@configuration` class is handed to `context.register`; a plain
 * `@getMapping` controller class is instantiated and stored by its class name,
 * which the handler mapping discovers during `init`.
 *
 * @param sources - Application configuration and/or controller classes.
 * @returns A booted app exposing the context and configured dispatcher.
 *
 * @example
 * ```ts
 * const app = bootApp([HelloConfiguration]);
 * const mockMVC = new MockMVC(app);
 * const res = await mockMVC.get('/').exec();
 * ```
 */
export function bootApp(sources: Function[]): BlueTestApp {
    const context = new MetadataConfigApplicationContext('blue-test-app');

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
    const handlerMapping = context.getValue<LinearMetadataHandlerMapping>('handlerMapping');
    handlerMapping.setApplicationContext(context);
    handlerMapping.init();

    const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
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
 * Heuristic: a class is a `@configuration` (constructor-registered) rather than
 * a plain controller when its `@configuration` decorator set the constructor
 * marker in the class's `Symbol.metadata` (`config:constructor`).
 */
function isConfiguration(source: Function): boolean {
    if (!isFunction(source)) {
        return false;
    }
    // The class's TC39 Symbol.metadata record, keyed by string/symbol. Not on
    // Function's static type, so read through a record.
    const meta = (source as { [Symbol.metadata]?: Record<string | symbol, unknown> })[
        Symbol.metadata
    ];
    return meta?.['config:constructor'] === true;
}

// Per-module cache: multiple suites in the same worker that boot the same
// sources share one app. Vitest isolates module state per file by default, so
// this is safe *within* a file (and across files only when isolate: false).
const cachedApps = new Map<string, { app: BlueTestApp; refs: number; rawClose: () => void }>();

function sourcesKey(sources: Function[]): string {
    return sources.map((s) => s.name).join(',');
}

/**
 * Boots (or reuses a cached) application for the given sources.
 *
 * Within a vitest worker, calling `cachedBootApp` twice with the same sources
 * returns the SAME app — the context is booted once, not per suite. Each call
 * increments a reference; release one with {@link releaseCachedApp} (or by
 * closing the app). The app is closed when the last reference is released.
 *
 * NOTE: Vitest isolates modules per file by default, so the cache is scoped to
 * one worker/file. To share one context across multiple spec files, disable
 * per-file isolation (e.g. `isolate: false` in the pool config) — a deliberate
 * safety trade-off: shared mutable context means suites can interfere.
 *
 * @param sources - Application configuration and/or controller classes.
 * @returns A booted app.
 *
 * @example
 * ```ts
 * const app = cachedBootApp([TodoConfiguration]); // boots once
 * const app2 = cachedBootApp([TodoConfiguration]); // reuses app
 * expect(app2).toBe(app); // same context
 * ```
 */
export function cachedBootApp(sources: Function[]): BlueTestApp {
    const key = sourcesKey(sources);
    const existing = cachedApps.get(key);
    if (existing) {
        existing.refs += 1;
        return existing.app;
    }

    const app = bootApp(sources);
    const rawClose = app.close.bind(app);
    cachedApps.set(key, { app, refs: 1, rawClose });

    // Closing the app releases one cache reference (and closes on last).
    app.close = () => {
        releaseCachedApp(sources);
    };

    return app;
}

/**
 * Releases one cached-app reference for the given sources, closing the app
 * when the last reference is released.
 *
 * @param sources - The sources the app was booted with.
 */
export function releaseCachedApp(sources: Function[]): void {
    const key = sourcesKey(sources);
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