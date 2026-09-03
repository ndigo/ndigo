// @vitest-environment jsdom

import { beforeEach, describe, expect, test } from 'vitest';

import '../src/account-app-view';

describe('account-app view rendering', () => {
    let element: any;

    beforeEach(() => {
        document.body.innerHTML = '';
        element = document.createElement('account-app');
        document.body.appendChild(element);
    });

    test('shows overview by default', async () => {
        element.model = {
            section: 'overview',
            title: 'Account Overview',
        };

        await Promise.resolve();

        expect(element.querySelector('.title').textContent).toBe('Account Overview');
        expect(element.querySelector('.account-content').textContent).toContain('overview');
        const overviewLink = element.querySelector(`a[href="#/account"]`);
        expect(overviewLink).not.toBeNull();
        expect(overviewLink?.classList.contains('selected')).toBe(true);
    });

    test('shows settings and highlights settings link', async () => {
        element.model = {
            section: 'settings',
            title: 'Account Settings',
        };

        await Promise.resolve();

        expect(element.querySelector('.title').textContent).toBe('Account Settings');
        expect(element.querySelector('.account-content').textContent).toContain('settings');
        const settingsLink = element.querySelector(`a[href="#/account/settings"]`);
        expect(settingsLink).not.toBeNull();
        expect(settingsLink?.classList.contains('selected')).toBe(true);
        expect(element.querySelector(`a[href="#/todo"]`)).not.toBeNull();
    });
});
