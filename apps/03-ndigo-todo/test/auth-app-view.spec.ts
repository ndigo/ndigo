/**
 * @module ndigo-todo
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment jsdom
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import '../src/auth-app-view';
import type AuthApp from '../src/auth-app-view';
import { authClient, initAuth, login, logout } from '../src/auth-store';

describe('auth-app view rendering', () => {
    let element: AuthApp;

    beforeAll(() => {
        initAuth();
    });

    beforeEach(async () => {
        sessionStorage.clear();
        await logout();
        location.hash = '/';
        document.body.innerHTML = '';
        element = document.createElement('auth-app') as AuthApp;
        document.body.appendChild(element);
    });

    test('renders the login form', () => {
        element.model = { page: 'login' };

        expect(element.querySelector('h1.title')?.textContent).toBe('Sign in');
        expect(element.querySelector('input#auth-username')).not.toBeNull();
        expect(element.querySelector<HTMLInputElement>('input#auth-password')?.type).toBe('password');
    });

    test('rejects invalid credentials without navigating', async () => {
        element.model = { page: 'login' };
        const username = element.querySelector<HTMLInputElement>('input#auth-username');
        const password = element.querySelector<HTMLInputElement>('input#auth-password');
        if (!username || !password) throw new Error('expected login inputs');

        username.value = 'alice';
        password.value = 'wrong';
        element.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
        await vi.waitFor(() => expect(element.querySelector('.error')?.textContent).toContain('Invalid'));

        expect(location.hash).toBe('#/');
        expect(authClient.isAuthenticated).toBe(false);
    });

    test('signs in with the demo credentials and navigates to the profile', async () => {
        element.model = { page: 'login' };
        const username = element.querySelector<HTMLInputElement>('input#auth-username');
        const password = element.querySelector<HTMLInputElement>('input#auth-password');
        if (!username || !password) throw new Error('expected login inputs');

        username.value = 'admin';
        password.value = 'demo';
        element.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
        await vi.waitFor(() => expect(location.hash).toBe('#/auth/profile'));

        expect(authClient.isAuthenticated).toBe(true);
        expect(authClient.principal?.name).toBe('admin');
    });

    test('renders the profile for the signed-in principal', async () => {
        await login('alice', 'demo');

        element.model = { page: 'profile' };

        expect(element.querySelector('.profile-info')?.textContent).toContain('alice');
        expect(element.querySelector('.profile-info')?.textContent).toContain('user');
    });

    test('renders the admin and forbidden pages', () => {
        element.model = { page: 'admin' };
        expect(element.querySelector('h1.title')?.textContent).toBe('Admin Panel');
        expect(element.querySelector('.admin-container')).not.toBeNull();

        element.model = { page: 'forbidden' };
        expect(element.querySelector('h1.title')?.textContent).toBe('Forbidden');
        expect(element.querySelector('.forbidden-container .error')).not.toBeNull();
    });
});
