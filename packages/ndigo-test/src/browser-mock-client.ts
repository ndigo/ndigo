/**
 * BrowserMockClient — drive `BrowserDispatcher` with a DOM-free capture target.
 *
 * Mirrors `MockHTTP` for the client side: boots a browser application context
 * (`WebAutoConfiguration` + user configs), registers a {@link MemoryViewTarget}
 * as `viewTarget`, and dispatches routes through the real handler-mapping /
 * interceptor / view pipeline. The rendered output is captured for assertions,
 * with no real DOM container required (jsdom is sufficient).
 */

import { MetadataConfigApplicationContext, ApplicationContext } from '@ndigo/context';
import { isFunction } from '@ndigo/util/types';
import { HANDLER_MAPPING } from '@ndigo/dispatcher';
import type { BrowserDispatcher as BrowserDispatcherType } from '@ndigo/platform-web/browser-dispatcher';
import { Route } from '@ndigo/router';
import { MemoryViewTarget, CapturedRender } from './memory-view-target';

/**
 * A browser application booted for in-process dispatch.
 */
export interface BrowserTestApp {
    /** The browser application context. */
    context: ApplicationContext;
    /** The configured browser dispatcher. */
    dispatcher: BrowserDispatcherType;
    /** The capture view target. */
    viewTarget: MemoryViewTarget;
    /** Close the context. */
    close(): void;
}

interface WebAutoConfigurationLike {
    new (): object;
}

/**
 * Lazy-load `@ndigo/platform-web`'s `WebAutoConfiguration`. Imported
 * dynamically so `@ndigo/test`'s static module graph stays node-pure; only the
 * browser path pays that cost.
 */
async function loadWebAutoConfiguration(): Promise<WebAutoConfigurationLike> {
    const web = await import('@ndigo/platform-web');
    return (web as { WebAutoConfiguration: WebAutoConfigurationLike }).WebAutoConfiguration;
}

/**
 * Boot a browser application from configuration/controller classes, wiring the
 * browser dispatcher and a {@link MemoryViewTarget}. Requires a DOM (jsdom).
 *
 * @param sources - Application configuration and/or controller classes.
 * @returns A booted browser app exposing the context, dispatcher, and capture target.
 *
 * @example
 * ```ts
 * const app = await bootWebApp([ToDoconfiguration]);
 * const browser = new BrowserMockClient(app);
 * await browser.dispatch('/account');
 * expect(app.viewTarget.lastRender?.model).toEqual({ section: 'overview' });
 * ```
 */
export async function bootWebApp(sources: Function[]): Promise<BrowserTestApp> {
    const context = new MetadataConfigApplicationContext('ndigo-test-browser');

    const WebAutoConfiguration = await loadWebAutoConfiguration();
    context.register(WebAutoConfiguration as never);

    const viewTarget = new MemoryViewTarget();
    context.setValue('viewTarget', viewTarget);

    for (const source of sources) {
        if (isConfiguration(source)) {
            context.register(source);
        } else {
            const ctor = source as { new (): object };
            context.setValue(source.name, new ctor());
        }
    }
    context.refresh();

    // Bind the handler mapping to the context and detect controller methods.
    const handlerMapping = context.getValue(HANDLER_MAPPING);
    handlerMapping.setApplicationContext(context);
    handlerMapping.init();

    // WebAutoConfiguration provides the mapping/resolvers but not a dispatcher
    // entry — create and wire a BrowserDispatcher (the app does this manually).
    const { BrowserDispatcher } = await import('@ndigo/platform-web/browser-dispatcher');
    const dispatcher = new BrowserDispatcher();
    dispatcher.initStrategies(context);
    dispatcher.applicationContext = context;
    context.setValue('dispatcher', dispatcher);

    return {
        context,
        dispatcher,
        viewTarget,
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
    const meta = (source as { [Symbol.metadata]?: Record<string | symbol, unknown> })[Symbol.metadata];
    return meta?.['config:constructor'] === true;
}

/**
 * Socket-free mock MVC client for browser applications. Dispatches routes
 * through the real `BrowserDispatcher` and captures the rendered view.
 */
export class BrowserMockClient {
    #app: BrowserTestApp;

    /**
     * Creates a client around a booted browser app.
     *
     * @param app - A booted browser app.
     */
    constructor(app: BrowserTestApp) {
        this.#app = app;
    }

    /**
     * Dispatches a route through the browser pipeline.
     *
     * @param path - The route path, e.g. `/account/settings`.
     * @returns The captured render (output element + model).
     */
    async dispatch(path: string): Promise<CapturedRender> {
        const route: Route = {
            length: 0,
            id: crypto.randomUUID(),
            path,
            raw: path,
            data: {},
            params: null,
            attributes: {},
        } as unknown as Route;

        await this.#app.dispatcher.dispatch(route);
        const render = this.#app.viewTarget.lastRender;
        if (!render) {
            throw new Error(`No view was rendered for route '${path}'. Check the handler match and argument binding.`);
        }
        return render;
    }

    /**
     * The captured render from the last dispatch.
     */
    get lastRender(): CapturedRender | null {
        return this.#app.viewTarget.lastRender;
    }
}
