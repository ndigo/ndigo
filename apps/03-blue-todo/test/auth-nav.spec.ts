/**
 * @module blue-todo
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment jsdom
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { renderAuthNav } from '../src/auth-nav';

/**
 * The auth nav renders the principal's display name, which comes from the
 * identity provider. It must be built with `textContent`, never interpolated
 * into `innerHTML` (APP-N12): a hostile display name must not become markup.
 */
describe('renderAuthNav', () => {
    let container: HTMLElement;

    beforeEach(() => {
        document.body.innerHTML = '';
        container = document.createElement('div');
        container.id = 'auth-nav';
        document.body.appendChild(container);
    });

    test('renders login/profile/admin links when signed out', () => {
        renderAuthNav(container, { isAuthenticated: false }, () => {});

        const hrefs = [...container.querySelectorAll('a')].map((anchor) => anchor.getAttribute('href'));
        expect(hrefs).toEqual(['#/auth/login', '#/auth/profile', '#/auth/admin']);
        expect(container.querySelector('.auth-name')).toBeNull();
    });

    test('renders the identity and a logout button when signed in', () => {
        const onLogout = vi.fn();
        renderAuthNav(container, { isAuthenticated: true, name: 'alice' }, onLogout);

        expect(container.querySelector('.auth-name')?.textContent).toBe('alice');
        const logout = container.querySelector<HTMLButtonElement>('#auth-logout-btn');
        expect(logout?.textContent).toBe('Logout');

        logout?.click();
        expect(onLogout).toHaveBeenCalledTimes(1);
    });

    test('treats a hostile display name as text, not markup', () => {
        renderAuthNav(container, { isAuthenticated: true, name: '<img src=x onerror=alert(1)>' }, () => {});

        expect(container.querySelector('img')).toBeNull();
        expect(container.querySelector('.auth-name')?.textContent).toBe('<img src=x onerror=alert(1)>');
    });
});
