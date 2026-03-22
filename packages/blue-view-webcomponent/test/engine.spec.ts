import { beforeEach, describe, expect, test, vi } from 'vitest';
import { DOMElementViewTarget, WebComponentViewEngine } from '../src/engine';
import { WebComponentView } from '../src/view';

describe('DOMElementViewTarget', () => {
    test('it should expose container element', () => {
        const element = document.createElement('div');
        const target = new DOMElementViewTarget(element);

        expect(target.container).toBe(element);
    });

    test('it should clear target element on prepare', () => {
        const element = document.createElement('div');
        element.innerHTML = '<span>old</span>';
        const target = new DOMElementViewTarget(element);

        target.prepare({ path: '/index' } as any);

        expect(element.innerHTML).toBe('');
    });

    test('it should remove listeners during prepare', () => {
        const element = document.createElement('div');
        const target = new DOMElementViewTarget(element) as DOMElementViewTarget & {
            setEventMap(eventMap: Record<string, string>): void;
            setApplicationContext(applicationContext: { emit(type: string, ...data: any[]): boolean }): void;
        };
        const applicationContext = {
            emit: vi.fn(() => true),
        };
        target.setApplicationContext(applicationContext);
        target.setEventMap({ onSubmit: 'user:todo:created' });

        const output = document.createElement('todo-app');
        target.commit(output, {}, { path: '/index' } as any);
        target.prepare({ path: '/active' } as any);

        const child = document.createElement('todo-input');
        output.appendChild(child);
        child.dispatchEvent(new CustomEvent('onSubmit', { detail: 'new item', bubbles: true }));

        expect(applicationContext.emit).not.toHaveBeenCalled();
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

    test('it should forward mapped custom events to application context', () => {
        const element = document.createElement('div');
        const target = new DOMElementViewTarget(element) as DOMElementViewTarget & {
            setEventMap(eventMap: Record<string, string>): void;
            setApplicationContext(applicationContext: { emit(type: string, ...data: any[]): boolean }): void;
        };
        const applicationContext = {
            emit: vi.fn(() => true),
        };
        target.setApplicationContext(applicationContext);
        target.setEventMap({ onSubmit: 'user:todo:created' });

        const output = document.createElement('todo-app');
        target.commit(output, {}, { path: '/index' } as any);

        const child = document.createElement('todo-input');
        output.appendChild(child);
        child.dispatchEvent(new CustomEvent('onSubmit', { detail: 'new item', bubbles: true }));

        expect(applicationContext.emit).toHaveBeenCalledWith('user:todo:created', 'new item');
    });

    test('it should not forward unmapped custom events', () => {
        const element = document.createElement('div');
        const target = new DOMElementViewTarget(element) as DOMElementViewTarget & {
            setEventMap(eventMap: Record<string, string>): void;
            setApplicationContext(applicationContext: { emit(type: string, ...data: any[]): boolean }): void;
        };
        const applicationContext = {
            emit: vi.fn(() => true),
        };
        target.setApplicationContext(applicationContext);
        target.setEventMap({ onSubmit: 'user:todo:created' });

        const output = document.createElement('todo-app');
        target.commit(output, {}, { path: '/index' } as any);

        const child = document.createElement('todo-input');
        output.appendChild(child);
        child.dispatchEvent(new CustomEvent('onRemove', { detail: 0, bubbles: true }));

        expect(applicationContext.emit).not.toHaveBeenCalled();
    });

    test('it should unlisten and stop forwarding events', () => {
        const element = document.createElement('div');
        const target = new DOMElementViewTarget(element) as DOMElementViewTarget & {
            setEventMap(eventMap: Record<string, string>): void;
            setApplicationContext(applicationContext: { emit(type: string, ...data: any[]): boolean }): void;
            unlisten(): void;
        };
        const applicationContext = {
            emit: vi.fn(() => true),
        };
        target.setApplicationContext(applicationContext);
        target.setEventMap({ onToggle: 'user:todo:toggled' });

        const output = document.createElement('todo-app');
        target.commit(output, {}, { path: '/index' } as any);
        target.unlisten();

        const child = document.createElement('todo-item');
        output.appendChild(child);
        child.dispatchEvent(new CustomEvent('onToggle', { detail: 1, bubbles: true }));

        expect(applicationContext.emit).not.toHaveBeenCalled();
    });

    test('it should clear listeners on clear', () => {
        const element = document.createElement('div');
        const target = new DOMElementViewTarget(element) as DOMElementViewTarget & {
            setEventMap(eventMap: Record<string, string>): void;
            setApplicationContext(applicationContext: { emit(type: string, ...data: any[]): boolean }): void;
        };
        const applicationContext = {
            emit: vi.fn(() => true),
        };
        target.setApplicationContext(applicationContext);
        target.setEventMap({ onSubmit: 'user:todo:created' });

        const output = document.createElement('todo-app');
        target.commit(output, {}, { path: '/index' } as any);
        target.clear();

        const child = document.createElement('todo-input');
        output.appendChild(child);
        child.dispatchEvent(new CustomEvent('onSubmit', { detail: 'new item', bubbles: true }));

        expect(applicationContext.emit).not.toHaveBeenCalled();
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

    test('it should reuse existing element and only update model', async () => {
        const view = new WebComponentView('todo-app');
        const model = { items: [{ text: 'b', checked: true }] };
        const route = { path: '/active' } as any;

        const root = document.createElement('div');
        const existing = document.createElement('todo-app') as any;
        existing.model = { items: [] };
        root.appendChild(existing);

        const target = new DOMElementViewTarget(root);
        const prepareSpy = vi.spyOn(target, 'prepare');
        const commitSpy = vi.spyOn(target, 'commit');

        await engine.render(view, model, target, route);

        expect(prepareSpy).not.toHaveBeenCalled();
        expect(commitSpy).not.toHaveBeenCalled();
        expect(root.children).toHaveLength(1);
        expect(root.firstElementChild).toBe(existing);
        expect((existing as any).model).toEqual(model);
    });

    test('it should replace existing element when tag name differs', async () => {
        const view = new WebComponentView('todo-app');
        const model = { items: [{ text: 'c', checked: false }] };
        const route = { path: '/completed' } as any;

        const root = document.createElement('div');
        root.appendChild(document.createElement('other-view'));

        const target = new DOMElementViewTarget(root);
        const prepareSpy = vi.spyOn(target, 'prepare');
        const commitSpy = vi.spyOn(target, 'commit');

        await engine.render(view, model, target, route);

        expect(prepareSpy).toHaveBeenCalledWith(route);
        expect(commitSpy).toHaveBeenCalledTimes(1);
        expect(root.children).toHaveLength(1);
        expect(root.firstElementChild?.tagName.toLowerCase()).toBe('todo-app');
        expect((root.firstElementChild as any).model).toEqual(model);
    });

    test('it should replace when target contains multiple children', async () => {
        const view = new WebComponentView('todo-app');
        const model = { items: [{ text: 'd', checked: false }] };
        const route = { path: '/index' } as any;

        const root = document.createElement('div');
        root.appendChild(document.createElement('todo-app'));
        root.appendChild(document.createElement('div'));

        const target = new DOMElementViewTarget(root);
        const prepareSpy = vi.spyOn(target, 'prepare');
        const commitSpy = vi.spyOn(target, 'commit');

        await engine.render(view, model, target, route);

        expect(prepareSpy).toHaveBeenCalledWith(route);
        expect(commitSpy).toHaveBeenCalledTimes(1);
        expect(root.children).toHaveLength(1);
        expect(root.firstElementChild?.tagName.toLowerCase()).toBe('todo-app');
        expect((root.firstElementChild as any).model).toEqual(model);
    });
});
