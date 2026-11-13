/**
 * Browser application bootstrap.
 */
import { ApplicationBuilder } from '@ndigo/boot';
import type { ConfigurableApplicationContext } from '@ndigo/context';
import { IllegalStateError } from '@ndigo/core';
import type { JSONObject } from '@ndigo/core';
import { DISPATCHER, VIEW_TARGET } from '@ndigo/dispatcher';
import { ROUTER } from '@ndigo/router';
import type { Route, RouterInterceptor } from '@ndigo/router';
import { getLogger } from '@ndigo/log';
import { getErrorMessage } from '@ndigo/util';
import type { DOMElementViewTarget } from '@ndigo/view-webcomponent';
import type { ViewTargeter } from '@ndigo/view';
import { BrowserDispatcher } from './browser-dispatcher';
import { BrowserEnvironment } from './browser-environment';
import { HashRouter } from './hash-router';
import { WebAutoConfiguration } from './web-auto-configuration';

const logger = getLogger('ndigo-platform-web:web-application');

/** The render root used when no `root` option is given. */
const DEFAULT_ROOT = '#app';

/**
 * The app path the URL currently addresses (`#/item/123` → `/item/123`).
 * Falls back to `/` when the URL carries no hash route.
 */
const currentHashPath = (): string => {
    const hash = globalThis.location?.hash ?? '';
    const path = hash.startsWith('#') ? hash.slice(1) : hash;
    return path.length > 0 ? path : '/';
};

/**
 * Resolves the `root` option (an element or an element id) to a DOM element.
 *
 * @param root - The element, or the id of the element (with or without `#`).
 * @returns The render host element.
 * @throws When the id matches no element.
 */
const resolveRoot = (root: string | Element): Element => {
    if (typeof root !== 'string') return root;
    const id = root.startsWith('#') ? root.slice(1) : root;
    const element = document.getElementById(id);
    if (!element) {
        throw new IllegalStateError(
            `createWebApplication: no element with id "${id}" to render into — add it to the document or pass root: <Element>`
        );
    }
    return element;
};

/**
 * Options for {@link createWebApplication}. Every implicit action has an
 * opt-out; app-specific wiring belongs in the hooks and the returned context.
 */
export interface CreateWebApplicationOptions {
    /** Context name. Defaults to `ndigo-web-application`. */
    name?: string;
    /** Element (or element id, with or without `#`) to render into. Defaults to `#app`. */
    root?: string | Element;
    /** DOM event → application event map bridged by the view target. */
    eventMap?: Record<string, string>;
    /** Router interceptors installed before the first navigation. */
    interceptors?: readonly RouterInterceptor[];
    /**
     * Ordered view targeters, registered before strategy initialization so the
     * dispatcher installs them. First non-`null` target wins; when none
     * matches, output renders into `root`. Empty by default.
     */
    viewTargeters?: readonly ViewTargeter[];
    /** First navigation path. Defaults to the path the URL currently addresses. */
    initialPath?: string;
    /** `true` (default) performs the first navigation. */
    autoNavigate?: boolean;
    /** Runs after the runtime is wired, before the first navigation. */
    beforeNavigate?: (app: WebApplication) => void | Promise<void>;
    /** `true` (default) registers `WebAutoConfiguration`. */
    platform?: boolean;
    /** Active profiles. */
    profiles?: readonly string[];
    /** Extra builder properties, merged above the built-in sources. */
    properties?: JSONObject;
}

/**
 * A booted browser application: the refreshed context, the wired runtime, and
 * a programmatic teardown.
 */
export interface WebApplication {
    /** The refreshed context — every entry stays reachable. */
    readonly context: ConfigurableApplicationContext;
    /** The started browser dispatcher (strategies initialized). */
    readonly dispatcher: BrowserDispatcher;
    /** The hash router driving navigation. */
    readonly router: HashRouter;
    /** The DOM view target routes render into. */
    readonly viewTarget: DOMElementViewTarget;
    /** The installed view-targeter chain (configured plus preset). */
    readonly viewTargeters: readonly ViewTargeter[];
    /** Destroys the router, the view target, and the context. Idempotent. */
    destroy(): void;
}

/**
 * Creates a browser application: builds the context (`WebAutoConfiguration`
 * and `BrowserEnvironment` by default), then wires the runtime routes flow
 * through — a `DOMElementViewTarget` for the render root, a
 * `BrowserDispatcher` for handler dispatch, and a `HashRouter` for hash
 * navigation — and performs the first navigation.
 *
 * Composes the existing pieces rather than replacing them — the returned
 * context is the same container `ApplicationBuilder` would have produced, so
 * every entry stays reachable and full manual control remains one
 * `ApplicationBuilder` away. Startup failures are logged, the context is
 * torn down, and the error is rethrown.
 *
 * @example
 * ```ts
 * const app = await createWebApplication([AppConfiguration]);
 * // app.context   — the refreshed DI container
 * // app.dispatcher / app.router / app.viewTarget — the runtime
 * // app.destroy() — teardown
 * ```
 *
 * @param sources - Application source classes (configurations, controllers, …).
 * @param options - Preset options; every implicit action has an opt-out.
 * @returns The booted application.
 */
export async function createWebApplication(
    sources: readonly Function[],
    options: CreateWebApplicationOptions = {}
): Promise<WebApplication> {
    const builder = new ApplicationBuilder([
        ...((options.platform ?? true) ? [WebAutoConfiguration] : []),
        ...sources,
    ]).environment(new BrowserEnvironment());
    builder.application.setName(options.name ?? 'ndigo-web-application');

    if (options.profiles?.length) {
        builder.profiles(...options.profiles);
    }
    if (options.properties && Object.keys(options.properties).length > 0) {
        builder.properties({ ...options.properties });
    }

    const context = await builder.run();

    let dispatcher: BrowserDispatcher;
    let viewTarget: DOMElementViewTarget;
    let router: HashRouter;
    let viewEngine: typeof import('@ndigo/view-webcomponent') | undefined;
    let destroyed = false;
    const destroy = (): void => {
        if (destroyed) return;
        destroyed = true;
        router.destroy();
        viewTarget.destroy();
        // Cached DOM targets hold event listeners; release them with the app.
        viewEngine?.destroyViewTargeters(dispatcher?.viewTargeters);
        context.close();
    };

    try {
        const root = resolveRoot(options.root ?? DEFAULT_ROOT);

        dispatcher = new BrowserDispatcher();
        // Register the chain before strategy init so the dispatcher installs
        // it; a context value set afterwards would be invisible.
        if (options.viewTargeters?.length) {
            context.setValue('viewTargeters', [...options.viewTargeters]);
        }
        dispatcher.initStrategies(context);
        dispatcher.applicationContext = context;

        // PWB-REV-001: `@ndigo/view-webcomponent` declares custom-element base
        // classes that extend `HTMLElement` at module load, so a static import
        // would make the barrel unimportable outside a DOM. The preset only
        // runs in a DOM; the engine loads on first use.
        viewEngine = await import('@ndigo/view-webcomponent');
        viewTarget = new viewEngine.DOMElementViewTarget(root, { eventMap: options.eventMap ?? {} });
        viewTarget.setApplicationContext(context);

        router = new HashRouter((route: Route) => void dispatcher.dispatch(route));
        for (const interceptor of options.interceptors ?? []) {
            router.addInterceptor(interceptor);
        }

        context.setValue(VIEW_TARGET, viewTarget);
        context.setValue(DISPATCHER, dispatcher);
        context.setValue(ROUTER, router);
    } catch (error) {
        logger.error(`Startup failed: ${getErrorMessage(error)}`);
        context.close();
        throw error;
    }

    const app: WebApplication = {
        context,
        dispatcher,
        router,
        viewTarget,
        viewTargeters: dispatcher.viewTargeters ?? [],
        destroy,
    };

    try {
        await options.beforeNavigate?.(app);
    } catch (error) {
        logger.error(`Startup failed: ${getErrorMessage(error)}`);
        destroy();
        throw error;
    }

    if (options.autoNavigate ?? true) {
        try {
            await router.navigate(options.initialPath ?? currentHashPath());
        } catch (error) {
            logger.error(`Startup failed: ${getErrorMessage(error)}`);
            destroy();
            throw error;
        }
    }

    return app;
}
