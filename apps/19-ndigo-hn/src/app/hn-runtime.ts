/**
 * The composition root: boots the context and wires the browser runtime.
 *
 * This is the only module that knows the app is a browser app. Lifecycle
 * preset (AD-90): `createWebApplication` builds the container
 * (`WebAutoConfiguration` + {@link HnConfiguration}), then wires the three
 * pieces routes flow through — the `HashRouter`, the `BrowserDispatcher`, and
 * the DOM view target — and navigates to the route the URL already addresses,
 * so a reload of `#/item/123` restores that item.
 */
import { createWebApplication } from '@ndigo/platform-web';
import type { WebApplication } from '@ndigo/platform-web';
import { HnConfiguration } from './hn-configuration';

/**
 * Boots the reader and returns the wired runtime.
 *
 * @returns The booted application — context, dispatcher, router, view target.
 */
export async function composeHnRuntime(): Promise<WebApplication> {
    return createWebApplication([HnConfiguration]);
}
