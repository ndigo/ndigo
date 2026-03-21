import { beforeEach, describe, expect, test, vi } from 'vitest';
import { DOMElementViewTarget, WebComponentViewEngine } from '../src/engine';
import { WebComponentView } from '../src/view';

describe('DOMElementViewTarget', () => {
    test('it should clear target element on prepare', () => {
        const element = document.createElement('div');
        element.innerHTML = '<span>old</span>';
        const target = new DOMElementViewTarget(element);

        target.prepare({ path: '/index' } as any);

        expect(element.innerHTML).toBe('');
    });

    test('it should append output on commit', () => {
        const element = document.createElement('div');
        const output = document.createElement('todo-app');
        const target = new DOMElementViewTarget(element);

        target.commit(output, {}, { path: '/index' } as any);

        expect(element.children).toHaveLength(1);
        expect(element.children[0]).toBe(output);
    });

    test('it should clear target element on clear', () => {
        const element = document.createElement('div');
        element.innerHTML = '<span>old</span>';
        const target = new DOMElementViewTarget(element);

        target.clear();

        expect(element.innerHTML).toBe('');
    });
});

describe('WebComponentViewEngine', () => {
    let engine: WebComponentViewEngine;

    beforeEach(() => {
        engine = new WebComponentViewEngine();
    });

    test('it should throw for non-web-component views', async () => {
        await expect(
            engine.render(
                {} as any,
                {},
                { prepare: vi.fn(), commit: vi.fn(), clear: vi.fn() } as any,
                { path: '/a' } as any
            )
        ).rejects.toThrow('WebComponentViewEngine can only render WebComponentView instances.');
    });

    test('it should prepare and commit rendered element', async () => {
        const view = new WebComponentView('todo-app');
        const model = { items: [{ text: 'a', checked: false }] };
        const route = { path: '/index' } as any;

        const prepare = vi.fn();
        const commit = vi.fn();
        const target = { prepare, commit, clear: vi.fn() };

        await engine.render(view, model, target as any, route);

        expect(prepare).toHaveBeenCalledWith(route);
        expect(commit).toHaveBeenCalledTimes(1);

        const [output, committedModel, committedRoute] = commit.mock.calls[0];
        expect(output.tagName.toLowerCase()).toBe('todo-app');
        expect((output as any).model).toEqual(model);
        expect(committedModel).toEqual(model);
        expect(committedRoute).toBe(route);
    });
});
