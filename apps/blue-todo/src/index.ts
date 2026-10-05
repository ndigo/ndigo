/**
 * @module blue-todo
 * @since 1.0.0
 * @author Jeff Rose
 */
// TodoMVC common base (css class + style tweaks). Bundled through the entry
// because vite only processes module scripts in index.html — a classic
// <script src="node_modules/..."> survives the build, 404s under preview,
// and the SPA-fallback HTML then executes as JS (breaks e2e).
import 'todomvc-common/base.js';
import './telemetry-setup';
import { composeTodoRuntime } from './shell-composition';
import { createTodoContext } from './todo-context';
import './account-app-view';
import './feature-metrics-panel-view';
import './locale-switcher-view';
import './shell-nav-view';
import './todo-app-view';
import './todo-input-view';
import './todo-item-view';
import './signals-counter-view';

const composition = composeTodoRuntime(await createTodoContext());
const { routes } = composition;
const metricsPanel = document.createElement('feature-metrics-panel') as HTMLElement & {
    aggregator?: unknown;
    refresh?: () => void;
    routeHandledRateAlertThreshold?: number;
};

metricsPanel.aggregator = composition.featureMetrics;
metricsPanel.routeHandledRateAlertThreshold = 5;
document.body.appendChild(metricsPanel);

// ── Reactive locale switcher (AD-19 demo): changeLocale → cookie + signal ──
const localeSwitcher = document.createElement('locale-switcher') as HTMLElement & {
    messages?: unknown;
};
localeSwitcher.messages = composition.shellContext;
document.body.appendChild(localeSwitcher);

window.setInterval(() => {
    metricsPanel.refresh?.();
}, 250);

// ── Update auth navigation based on auth state ──────────────────────────────
async function updateAuthNav(): Promise<void> {
    const authNav = document.getElementById('auth-nav');
    if (!authNav) return;

    const { authClient, logout } = await import('./auth-store');

    if (authClient.isAuthenticated && authClient.principal) {
        authNav.innerHTML = `
            <span class="auth-label">Logged in as:</span>
            <span class="auth-name">${authClient.principal.name}</span>
            <a href="#/auth/profile">Profile</a>
            <a href="#/auth/admin">Admin</a>
            <button id="auth-logout-btn">Logout</button>
        `;
        authNav.querySelector('#auth-logout-btn')?.addEventListener('click', async () => {
            await logout();
            await updateAuthNav();
        });
    } else {
        authNav.innerHTML = `
            <a href="#/auth/login">Login</a>
            <a href="#/auth/profile">Profile</a>
            <a href="#/auth/admin">Admin</a>
        `;
    }
}

// Initial auth nav update
void updateAuthNav();

// Re-check auth state on route changes
composition.shellRouter.addInterceptor({
    async postHandle() {
        await updateAuthNav();
    },
});

location.hash = routes.todoAll.href();
