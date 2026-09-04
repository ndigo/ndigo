/**
 * Blue Micro Frontend Host entry point.
 *
 * Composes the shell, wires a hash router to the feature routing registry, and
 * mounts lazy-loaded feature contexts into the page on navigation.
 *
 * @module
 */

import { HashRouter } from '@blue/platform-web';
import type { Route } from '@blue/router';
import { composeHostRuntime } from './shell-composition';

const $feature = document.getElementById('feature') as HTMLElement;
const $status = document.getElementById('status') as HTMLElement;

async function main() {
    const { mountManager, featureRouter } = await composeHostRuntime();

    // ── Router wiring ──────────────────────────────────────────────────────
    const router = new HashRouter((route: Route) => {
        // HashRouter strips the leading slash; mapping patterns need it.
        const path = route.path[0] === '/' ? route.path : `/${route.path}`;
        $status.textContent = `Route: ${path} — activating feature…`;

        // Feature routing registry activates/deactivates features by prefix.
        featureRouter.navigate(path);

        void renderFeature(currentFeatureFor(path));
    });

    // Navigate to home on load.
    if (location.hash === '#/') {
        router.refresh();
    } else {
        location.hash = '/';
    }

    function currentFeatureFor(path: string): string | null {
        if (path.startsWith('/catalog')) return 'catalog';
        if (path.startsWith('/checkout')) return 'checkout';
        if (path.startsWith('/reports')) return 'reports';
        return null;
    }

    async function renderFeature(name: string | null): Promise<void> {
        $feature.innerHTML = '';
        if (!name) {
            $feature.textContent = 'Home — select a feature from the nav.';
            return;
        }

        // Lazy-load the feature chunk on first navigation, then render its data.
        const composition = await mountManager.mountLazy(name);
        $status.textContent = `Mounted feature: ${name}`;
        $feature.textContent = `[${name}] ${JSON.stringify(composition.context.getValue(featureDataKey(name)))}`;
    }

    function featureDataKey(name: string): string {
        return name === 'catalog' ? 'catalogItems' : name === 'reports' ? 'reportData' : 'checkoutNote';
    }
}

main().catch((err) => {
    $status.textContent = `Host failed to start: ${String(err)}`;
    // eslint-disable-next-line no-console
    console.error('[blue-host] failed to start:', err);
});