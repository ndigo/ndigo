/**
 * The composition root: boots the context and wires the browser runtime.
 *
 * This is the only module that knows the app is a browser app. It builds the
 * container (`ApplicationBuilder` + {@link ConduitWebConfiguration}), then wires
 * the four pieces routes flow through — the `HashRouter`, the
 * `BrowserDispatcher`, the DOM view target with its event bridge, and the auth
 * guard — and finally restores the persisted session before navigating to the
 * URL's route.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { MetadataConfigApplicationContext, type ApplicationContext } from '@ndigo/context';
import { IllegalStateError } from '@ndigo/core';
import { BrowserDispatcher, HashRouter, WebAutoConfiguration } from '@ndigo/platform-web';
import { DOMElementViewTarget } from '@ndigo/view-webcomponent';
import type { Route } from '@ndigo/router';
import { AuthRouterInterceptor } from './auth-router-interceptor';
import { ConduitWebConfiguration } from './conduit-configuration';
import { CONDUIT_EVENT_MAP } from './conduit-events';
import { wireConduitActions } from './conduit-actions';
import type { ConduitServices } from './conduit-services';
import { CONDUIT_SERVICES, DISPATCHER, ROUTER, VIEW_TARGET } from './conduit-tokens';

/** The element rendered routes are committed into. */
const APP_ELEMENT_ID = 'app';

/** A booted context and the graph it registered. */
export interface ConduitContext {
    context: ApplicationContext;
    services: ConduitServices;
}

/** The wired browser runtime. */
export interface ConduitRuntime {
    context: ApplicationContext;
    services: ConduitServices;
    dispatcher: BrowserDispatcher;
    router: HashRouter;
}

/**
 * Boots the application context (browser auto-configuration + this app's
 * configuration).
 *
 * Deliberately *not* `@ndigo/boot`'s `ApplicationBuilder`: its
 * `Application._configureProfiles` reads `process.env` unguarded, so booting
 * through it in a browser throws `ReferenceError: process is not defined`
 * (framework defect, reported — `@ndigo/boot` `lib/application.js`
 * `_configureProfiles`). `MetadataConfigApplicationContext` is the
 * browser-safe path the other client apps (`01-ndigo-hello`, `07-ndigo-views`)
 * already use: register the sources, then refresh.
 *
 * @returns The booted context and its service graph.
 */
export async function createConduitContext(): Promise<ConduitContext> {
    const context = new MetadataConfigApplicationContext('ndigo-conduit-web');
    context.register(WebAutoConfiguration);
    context.register(ConduitWebConfiguration);
    context.refresh();
    return { context, services: context.getValue(CONDUIT_SERVICES) };
}

/**
 * Wires the browser runtime onto a booted context and navigates to the URL's
 * route.
 *
 * Order matters: the view target must be in the context *before* the first
 * dispatch (the dispatcher resolves it per render), the router must be
 * registered before any service mutation can refresh, and the session is
 * restored before the first navigation so the guard and the models see it.
 *
 * @param booted - The booted context and services.
 * @returns The wired runtime.
 */
export async function composeConduitRuntime(booted: ConduitContext): Promise<ConduitRuntime> {
    const { context, services } = booted;

    const container = document.getElementById(APP_ELEMENT_ID);
    if (!container) {
        throw new IllegalStateError(`The app requires a #${APP_ELEMENT_ID} element to render into.`);
    }

    const dispatcher = new BrowserDispatcher();
    dispatcher.initStrategies(context);
    dispatcher.applicationContext = context;

    // The DOM target renders each view and bridges the mapped view events onto
    // the context. The bridge only listens once the target has an event
    // emitter, so the context is attached explicitly — the dispatcher injects
    // *views*, not targets.
    const viewTarget = new DOMElementViewTarget(container);
    viewTarget.setEventMap(CONDUIT_EVENT_MAP);
    viewTarget.setApplicationContext(context);

    const router = new HashRouter((route: Route) => void dispatcher.dispatch(route));
    router.addInterceptor(new AuthRouterInterceptor(() => services.session.isAuthenticated));

    context.setValue(VIEW_TARGET, viewTarget);
    context.setValue(DISPATCHER, dispatcher);
    context.setValue(ROUTER, router);

    wireConduitActions(context, services);
    await services.session.restore();

    const runtime: ConduitRuntime = { context, services, dispatcher, router };
    await router.navigate(currentPath());
    return runtime;
}

/**
 * The app path the URL currently addresses (`#/editor/x` → `/editor/x`).
 *
 * @returns The hash route, or `/` when the URL carries no route.
 */
export function currentPath(): string {
    const hash = globalThis.location?.hash ?? '';
    const path = hash.startsWith('#') ? hash.slice(1) : hash;
    return path.length > 0 ? path : '/';
}
