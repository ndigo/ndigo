/**
 * @module blue-todo
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment jsdom

import { beforeEach, describe, expect, test } from 'vitest';
import '../src/shell-nav-view';

interface ShellNavTestElement extends HTMLElement {
    model: unknown;
}

describe('shell-nav view rendering', () => {
    let element: ShellNavTestElement;

    beforeEach(() => {
        document.body.innerHTML = '';
        element = document.createElement('shell-nav') as ShellNavTestElement;
        document.body.appendChild(element);
    });

    test('renders inline navigation and selected link', async () => {
        element.model = {
            containerClass: 'account-nav',
            items: [
                {
                    href: '#/account',
                    label: 'Overview',
                    selected: true,
                },
                {
                    href: '#/account/settings',
                    label: 'Settings',
                },
            ],
            mode: 'inline',
        };

        await Promise.resolve();

        const nav = element.querySelector('nav.account-nav');
        const links = element.querySelectorAll('a');

        expect(nav).not.toBeNull();
        expect(links.length).toBe(2);
        expect(links[0]?.classList.contains('selected')).toBe(true);
        expect(links[1]?.classList.contains('selected')).toBe(false);
    });

    test('renders list navigation for filter links', async () => {
        element.model = {
            containerClass: 'filters',
            items: [
                {
                    href: '#/todo',
                    label: 'All',
                    selected: true,
                },
                {
                    href: '#/todo/active',
                    label: 'Active',
                },
            ],
            mode: 'list',
        };

        await Promise.resolve();

        const list = element.querySelector('ul.filters');
        const items = element.querySelectorAll('ul.filters > li');
        const selected = element.querySelector('a.selected');

        expect(list).not.toBeNull();
        expect(items.length).toBe(2);
        expect(selected?.textContent).toBe('All');
    });
});
