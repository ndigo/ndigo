/**
 * The composition root: boots the context and wires the browser runtime.
 *
 * This is the only module that knows the app is a browser app. It builds the
 * container (`MetadataConfigApplicationContext` + {@link HnConfiguration}),
 * then wires the three pieces routes flow through — the `HashRouter`, the
 * `BrowserDispatcher`, and the DOM view target — and navigates to the route the
 * URL already addresses, so a reload of `#/item/123` restores that item.
 *
 * Boot deliberately does not use `@blue/boot`'s `ApplicationBuilder`: its
 * `_configureProfiles` reads `process.env` unguarded and throws in a browser.
 * `MetadataConfigApplicationContext` is the browser-safe path the other client
 * apps use.
 *
 * @module blue-hn
 * @since 1.0.0
 * @author Jeff Rose
 */
import { MetadataConfigApplicationContext, type ApplicationContext } from '@blue/context';
import { IllegalStateError } from '@blue/core';
import { BrowserDispatcher, HashRouter, WebAutoConfiguration } from '@blue/platform-web';
import { DOMElementViewTarget } from '@blue/view-webcomponent';
import type { Route } from '@blue/router';
import { HnConfiguration } from './hn-configuration';
import { DISPATCHER, ROUTER, VIEW_TARGET } from './hn-tokens';

/** The element rendered routes are committed into. */
const APP_ELEMENT_ID = 'app';

/** A booted context. */
export interface HnContext {
    context: ApplicationContext;
}

/** The wired browser runtime. */
export interface HnRuntime {
    context: ApplicationContext;
    dispatcher: BrowserDispatcher;
    router: HashRouter;
}

/**
 * Boots the application context (browser auto-configuration + this app's
 * configuration).
 *
 * @returns The booted context.
 */
export async function createHnContext(): Promise<HnContext> {
    const context = new MetadataConfigApplicationContext('blue-hn');
    context.register(WebAutoConfiguration);
    context.register(HnConfiguration);
    context.refresh();
    return { context };
}

/**
 * The app path the URL currently addresses (`#/item/123` → `/item/123`).
 *
 * @returns The hash route, or `/` when the URL carries no route.
 */
export function currentPath(): string {
    const hash = globalThis.location?.hash ?? '';
    const path = hash.startsWith('#') ? hash.slice(1) : hash;
    return path.length > 0 ? path : '/';
}

/**
 * Wires the browser runtime onto a booted context and navigates to the URL's
 * route.
 *
 * @param booted - The booted context.
 * @returns The wired runtime.
 */
export async function composeHnRuntime(booted: HnContext): Promise<HnRuntime> {
    const { context } = booted;

    const container = document.getElementById(APP_ELEMENT_ID);
    if (!container) {
        throw new IllegalStateError(`The app requires a #${APP_ELEMENT_ID} element to render into.`);
    }

    const dispatcher = new BrowserDispatcher();
    dispatcher.initStrategies(context);
    dispatcher.applicationContext = context;

    const viewTarget = new DOMElementViewTarget(container);
    viewTarget.setApplicationContext(context);

    const router = new HashRouter((route: Route) => void dispatcher.dispatch(route));

    context.setValue(VIEW_TARGET, viewTarget);
    context.setValue(DISPATCHER, dispatcher);
    context.setValue(ROUTER, router);

    const runtime: HnRuntime = { context, dispatcher, router };
    await router.navigate(currentPath());
    return runtime;
}
