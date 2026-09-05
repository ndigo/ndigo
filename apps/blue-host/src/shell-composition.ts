/**
 * Host shell composition — sets up the micro frontend shell, a shared
 * dependency registry, and feature routing for lazy-loaded features.
 *
 * @module
 */

import {
    ApplicationContext,
    FeatureContextMountManager,
    createShellContext,
    DefaultSharedDependencyRegistry,
    SHARED_DEPENDENCY_REGISTRY_TOKEN,
} from '@blue/context';
import { FeatureRoutingRegistry } from '@blue/router';

/** Feature route prefixes. */
export const CATALOG_PREFIX = '/catalog';
export const CHECKOUT_PREFIX = '/checkout';
export const REPORTS_PREFIX = '/reports';

/**
 * Compose the host runtime: shell context + shared registry + lazy features.
 *
 * @returns A composition with the shell context, mount manager, and router.
 */
export async function composeHostRuntime() {
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

    // ── Feature mount manager ──────────────────────────────────────────────
    const mountManager = new FeatureContextMountManager(shellContext);

    // Lazily-loaded features: each loader dynamic-imports its code chunk, so
    // the feature is only fetched when its route is activated.
    mountManager.registerFeature({
        name: 'catalog',
        loader: () => import('./features/catalog'),
        dependencies: { requires: { router: '^1.0.0' } },
    });
    mountManager.registerFeature({
        name: 'checkout',
        loader: () => import('./features/checkout'),
        dependencies: { requires: { router: '^1.0.0', cart: '^1.0.0' } },
    });
    mountManager.registerFeature({
        name: 'reports',
        loader: () => import('./features/reports'),
        dependencies: { requires: { router: '^1.0.0' } },
    });

    // ── Feature routing registry ───────────────────────────────────────────
    const featureRouter = new FeatureRoutingRegistry(undefined, {
        activationPolicy: 'exclusive',
    });

    const mountOnActivate =
        (name: string): (() => void) =>
        () => {
            void mountManager.mountLazy(name);
        };

    featureRouter.registerFeature({
        name: 'catalog',
        prefix: CATALOG_PREFIX,
        onActivate: mountOnActivate('catalog'),
        onDeactivate: () => void mountManager.unmount('catalog'),
        onRoute: () => {},
    });
    featureRouter.registerFeature({
        name: 'checkout',
        prefix: CHECKOUT_PREFIX,
        onActivate: mountOnActivate('checkout'),
        onDeactivate: () => void mountManager.unmount('checkout'),
        onRoute: () => {},
    });
    featureRouter.registerFeature({
        name: 'reports',
        prefix: REPORTS_PREFIX,
        onActivate: mountOnActivate('reports'),
        onDeactivate: () => void mountManager.unmount('reports'),
        onRoute: () => {},
    });

    return { shellContext, mountManager, featureRouter, cart };
}
