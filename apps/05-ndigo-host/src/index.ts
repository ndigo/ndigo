/**
 * Ndigo Micro Frontend Host entry point.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { HashRouter } from '@ndigo/platform-web';
import type { Route } from '@ndigo/router';
import { composeHostRuntime, featureForPath } from './shell-composition';

const $feature = document.getElementById('feature') as HTMLElement;
const $status = document.getElementById('status') as HTMLElement;

async function main() {
    const { host } = composeHostRuntime();

    // ── Router wiring ──────────────────────────────────────────────────────
    const router = new HashRouter((route: Route) => {
        // HashRouter strips the leading slash; mapping patterns need it.
        const path = route.path[0] === '/' ? route.path : `/${route.path}`;
        $status.textContent = `Route: ${path} — activating feature…`;

        // Host manager activates/deactivates features by prefix partition.
        host.navigate(path);

        void renderFeature(featureForPath(path));
    });

    // Navigate to home on load.
    if (location.hash === '#/') {
        router.refresh();
    } else {
        location.hash = '/';
    }

    async function renderFeature(name: string | null): Promise<void> {
        $feature.innerHTML = '';
        if (!name) {
            $status.textContent = '';
            $feature.textContent = 'Home — select a feature from the nav.';
            return;
        }

        // Lazy-load the feature chunk on first navigation, then render its data.
        const composition = await host.mountLazy(name);
        $status.textContent = `Mounted feature: ${name}`;
        $feature.textContent = `[${name}] ${JSON.stringify(composition.context.getValue(featureDataKey(name)))}`;
    }

    function featureDataKey(name: string): string {
        return name === 'catalog' ? 'catalogItems' : name === 'reports' ? 'reportData' : 'checkoutNote';
    }
}

main().catch((err) => {
    $status.textContent = `Host failed to start: ${String(err)}`;
    console.error('[ndigo-host] failed to start:', err);
});
