import './telemetry-setup';
import { composeTodoRuntime } from './shell-composition';
import { createTodoContext } from './todo-context';
import './account-app-view';
import './feature-metrics-panel-view';
import './shell-nav-view';
import './todo-app-view';
import './todo-input-view';
import './todo-item-view';
import './login-view';
import './profile-view';
import './admin-view';
import './forbidden-view';
import './signals-counter-view';

const composition = composeTodoRuntime(createTodoContext());
const { routes } = composition;
const metricsPanel = document.createElement('feature-metrics-panel') as HTMLElement & {
    aggregator?: unknown;
    refresh?: () => void;
    routeHandledRateAlertThreshold?: number;
};

metricsPanel.aggregator = composition.featureMetrics;
metricsPanel.routeHandledRateAlertThreshold = 5;
document.body.appendChild(metricsPanel);

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
            updateAuthNav();
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
updateAuthNav();

// Re-check auth state on route changes
composition.shellRouter.addInterceptor({
    async postHandle() {
        updateAuthNav();
    },
});

location.hash = routes.todoAll.href();
