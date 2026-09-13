/**
 * Host shell composition — sets up the micro frontend shell, a shared
 * dependency registry, and feature routing for lazy-loaded features.
 *
 * @module
 */

import { createShellContext, DefaultSharedDependencyRegistry, SHARED_DEPENDENCY_REGISTRY_TOKEN } from '@blue/context';
import { HOST_MANAGER_TOKEN, HostManager } from '@blue/host';

/** Feature route prefixes. */
export const CATALOG_PREFIX = '/catalog';
export const CHECKOUT_PREFIX = '/checkout';
export const REPORTS_PREFIX = '/reports';

/**
 * Compose the host runtime: shell context + shared registry + HostManager.
 *
 * @returns A composition with the shell context, host manager, and cart.
 */
export function composeHostRuntime() {
    // ── Shell context with shared dependency registry ──────────────────────
    const shellContext = createShellContext({ name: 'site-shell' });

    // Declare shell-wide shared singletons features can require.
    const sharedRegistry = new DefaultSharedDependencyRegistry();
    sharedRegistry.declare({
        router: { singleton: true, version: '1.0.0' },
        cart: { singleton: true, version: '1.0.0' },
    });
    shellContext.setValue(SHARED_DEPENDENCY_REGISTRY_TOKEN, sharedRegistry);

    // A shell-wide shared cart singleton features may resolve.
    const cart = {
        items: [] as string[],
        add(item: string): void {
            this.items.push(item);
        },
    };
    shellContext.setValue('cart', cart);

    // ── Host manager: one-call registration of the lazy features ───────────
    const host = new HostManager(shellContext, { activationPolicy: 'exclusive' });

    // Lazily-loaded features: each loader dynamic-imports its code chunk, so
    // the feature is only fetched when its route is activated.
    host.registerFeature({
        name: 'catalog',
        prefix: CATALOG_PREFIX,
        loader: () => import('./features/catalog'),
        dependencies: { requires: { router: '^1.0.0' } },
    });
    host.registerFeature({
        name: 'checkout',
        prefix: CHECKOUT_PREFIX,
        loader: () => import('./features/checkout'),
        dependencies: { requires: { router: '^1.0.0', cart: '^1.0.0' } },
    });
    host.registerFeature({
        name: 'reports',
        prefix: REPORTS_PREFIX,
        loader: () => import('./features/reports'),
        dependencies: { requires: { router: '^1.0.0' } },
    });

    shellContext.setValue(HOST_MANAGER_TOKEN, host);

    return { shellContext, host, cart };
}
