/**
 * @module ndigo-todo
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment jsdom

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { installSynchronousAnimationFrames } from '@ndigo/test';
import { toAccountShellRoute, toTodoShellRoute } from '../src/shell-composition';
import '../src/todo-app-view';
import type MyTodoApp from '../src/todo-app-view';
import '../src/todo-input-view';
import '../src/todo-item-view';

/**
 * requestAnimationFrame runs synchronously so AbstractWebComponent.requestUpdate()
 * (which renders on a frame tick) completes — jsdom never fires frames.
 */
installSynchronousAnimationFrames();

describe('todo-app view filtering', () => {
    let element: MyTodoApp;

    beforeEach(() => {
        document.body.innerHTML = '';
        element = document.createElement('todo-app') as MyTodoApp;
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

        // requestAnimationFrame mock calls render synchronously
        const items = element.querySelectorAll('todo-item');
        expect(items.length).toBe(2);

        const allLink = element.querySelector(`a[href="#${toTodoShellRoute('/')}"]`);
        const activeLink = element.querySelector(`a[href="#${toTodoShellRoute('/active')}"]`);
        const accountLink = element.querySelector(`a[href="#${toAccountShellRoute('/')}"]`);
        expect(allLink?.classList.contains('selected')).toBe(true);
        expect(activeLink?.classList.contains('selected')).toBe(false);
        expect(accountLink).not.toBeNull();
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

        // Initial render
        expect(element.querySelectorAll('todo-item').length).toBe(3);

        // Switch to active filter
        element.model = { filter: 'active' };
        expect(element.querySelectorAll('todo-item').length).toBe(2);

        // Switch to completed filter
        element.model = { filter: 'completed' };
        expect(element.querySelectorAll('todo-item').length).toBe(1);
    });

    test('todo child events bubble to parent host', async () => {
        const submitSpy = vi.fn();
        const removeSpy = vi.fn();
        const toggleSpy = vi.fn();

        element.addEventListener('onSubmit', submitSpy);
        element.addEventListener('onRemove', removeSpy);
        element.addEventListener('onToggle', toggleSpy);

        element.model = {
            items: [{ text: 'a', checked: false }],
            filter: 'all',
        };

        // Wait for render via RAF
        await Promise.resolve();

        const input = element.querySelector('todo-input');
        const item = element.querySelector('todo-item');
        expect(input).not.toBeNull();
        expect(item).not.toBeNull();

        input?.dispatchEvent(new CustomEvent('onSubmit', { detail: 'new item', bubbles: true }));
        item?.dispatchEvent(new CustomEvent('onRemove', { detail: 0, bubbles: true }));
        item?.dispatchEvent(new CustomEvent('onToggle', { detail: 0, bubbles: true }));

        expect(submitSpy).toHaveBeenCalledTimes(1);
        expect(removeSpy).toHaveBeenCalledTimes(1);
        expect(toggleSpy).toHaveBeenCalledTimes(1);
    });
});

describe('todo-item checked property (AP-11)', () => {
    test('get reflects the last set value and render syncs the inner checkbox', () => {
        const item = document.createElement('todo-item') as HTMLElement & { checked: boolean };
        document.body.appendChild(item);

        expect(item.checked).toBe(false);

        item.checked = true;
        expect(item.checked).toBe(true);
        const toggle = item.querySelector('.toggle') as HTMLInputElement;
        expect(toggle.hasAttribute('checked')).toBe(true);

        item.checked = false;
        expect(item.checked).toBe(false);
        expect(toggle.hasAttribute('checked')).toBe(false);
    });
});
