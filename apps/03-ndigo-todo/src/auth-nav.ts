/**
 * @module ndigo-todo
 * @since 1.0.0
 * @author Jeff Rose
 */
export interface AuthNavState {
    isAuthenticated: boolean;
    name?: string;
}

const NAV_LINKS = [
    ['#/auth/login', 'Login'],
    ['#/auth/profile', 'Profile'],
    ['#/auth/admin', 'Admin'],
] as const;

function link(href: string, label: string): HTMLAnchorElement {
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.textContent = label;
    return anchor;
}

/**
 * Renders the auth navigation into `container`.
 *
 * Builds nodes with `textContent` only: the principal name comes from the
 * identity provider, so it MUST NOT be interpolated into `innerHTML` (an
 * XSS sink for a hostile display name).
 *
 * @param container - The `#auth-nav` element to populate.
 * @param state - The current authentication state.
 * @param onLogout - Click handler for the logout button.
 */
export function renderAuthNav(container: HTMLElement, state: AuthNavState, onLogout: () => void): void {
    const nodes: Node[] = [];

    if (state.isAuthenticated) {
        const label = document.createElement('span');
        label.className = 'auth-label';
        label.textContent = 'Logged in as:';

        const name = document.createElement('span');
        name.className = 'auth-name';
        name.textContent = state.name ?? '';
        nodes.push(label, name, link('#/auth/profile', 'Profile'), link('#/auth/admin', 'Admin'));

        const logout = document.createElement('button');
        logout.id = 'auth-logout-btn';
        logout.type = 'button';
        logout.textContent = 'Logout';
        logout.addEventListener('click', onLogout);
        nodes.push(logout);
    } else {
        for (const [href, label] of NAV_LINKS) {
            nodes.push(link(href, label));
        }
    }

    container.replaceChildren(...nodes);
}
