// @vitest-environment jsdom

import { beforeEach, describe, expect, test } from 'vitest';
import '../src/todo-app-view';

describe('todo-app view filtering', () => {
    let element: any;

    beforeEach(() => {
        document.body.innerHTML = '';
        element = document.createElement('todo-app');
        document.body.appendChild(element);
    });

    test('shows all items by default and highlights All filter', async () => {
        element.model = {
            items: [
                { text: 'a', checked: false },
                { text: 'b', checked: true },
            ],
            filter: 'all',
        };

        await Promise.resolve();

        const items = element.querySelectorAll('todo-item');
        expect(items.length).toBe(2);

        const allLink = element.querySelector('a[href="#/"]');
        const activeLink = element.querySelector('a[href="#/active"]');
        expect(allLink.classList.contains('selected')).toBe(true);
        expect(activeLink.classList.contains('selected')).toBe(false);
    });

    test('filters active/completed and preserves existing list on filter-only model', async () => {
        element.model = {
            items: [
                { text: 'a', checked: false },
                { text: 'b', checked: true },
                { text: 'c', checked: false },
            ],
            filter: 'all',
        };

        await Promise.resolve();

        element.model = { filter: 'active' };
        await Promise.resolve();
        expect(element.querySelectorAll('todo-item').length).toBe(2);

        element.model = { filter: 'completed' };
        await Promise.resolve();
        expect(element.querySelectorAll('todo-item').length).toBe(1);
    });
});
