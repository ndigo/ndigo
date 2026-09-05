import { describe, it, expect, vi, beforeAll } from 'vitest';
import { Route } from '@blue/router';
import { WebComponentView } from '../src/view';
import { DOMElementViewTarget, WebComponentViewEngine, likeDOMViewTarget } from '../src/engine';
import { TagMapping } from '../src/tag-mapping';
import { ViewMapping } from '../src/view-mapping';

const mockRoute = { path: '/test' } as Route;

// ── TagMapping Decorator ─────────────────────────────────────────

describe('TagMapping', () => {
    it('stores tag name in constructor metadata', () => {
        @TagMapping('my-element')
        class MyElement extends HTMLElement {}

        expect(TagMapping.get(MyElement)).toBe('my-element');
        expect(TagMapping.has(MyElement)).toBe(true);
    });

    it('deletes tag mapping from metadata', () => {
        @TagMapping('temp-element')
        class TempElement extends HTMLElement {}

        TagMapping.delete(TempElement);
        expect(TagMapping.get(TempElement)).toBeUndefined();
        expect(TagMapping.has(TempElement)).toBe(false);
    });

    it('returns undefined for classes without tag mapping', () => {
        class PlainElement extends HTMLElement {}
        expect(TagMapping.get(PlainElement)).toBeUndefined();
        expect(TagMapping.has(PlainElement)).toBe(false);
    });

    it('TagMapping.has returns true for decorated class', () => {
        @TagMapping('has-element')
        class HasElement extends HTMLElement {}

        expect(TagMapping.has(HasElement)).toBe(true);
    });

    it('setting tag mapping via define stores on the constructor', () => {
        class DynamicElement extends HTMLElement {}
        TagMapping.define('dynamic-element', DynamicElement);
        expect(TagMapping.get(DynamicElement)).toBe('dynamic-element');

        TagMapping.delete(DynamicElement);
    });

    it('defines the custom element in the browser registry', () => {
        const tagName = 'test-registry-element';

        expect(() => customElements.define(tagName, class extends HTMLElement {})).not.toThrow();
    });
});

// ── ViewMapping Decorator ─────────────────────────────────────────

describe('ViewMapping', () => {
    it('stores view name in constructor metadata', () => {
        @ViewMapping('myView')
        class MyView {}

        expect(ViewMapping.get(MyView)).toBe('myView');
        expect(ViewMapping.has(MyView)).toBe(true);
    });

    it('deletes view mapping from metadata', () => {
        @ViewMapping('tempView')
        class TempView {}

        ViewMapping.delete(TempView);
        expect(ViewMapping.get(TempView)).toBeUndefined();
        expect(ViewMapping.has(TempView)).toBe(false);
    });

    it('returns undefined for classes without view mapping', () => {
        class PlainClass {}
        expect(ViewMapping.get(PlainClass)).toBeUndefined();
        expect(ViewMapping.has(PlainClass)).toBe(false);
    });

    it('setting view mapping via define stores on the constructor', () => {
        class DynamicClass {}
        ViewMapping.define('dynamicView', DynamicClass);
        expect(ViewMapping.get(DynamicClass)).toBe('dynamicView');

        ViewMapping.delete(DynamicClass);
    });
});

// ── DOMElementViewTarget ──────────────────────────────────────────

describe('DOMElementViewTarget', () => {
    it('throws TypeError when created with null element', () => {
        expect(() => new DOMElementViewTarget(null)).toThrow(TypeError);
    });

    it('throws TypeError when created with undefined element', () => {
        expect(() => new DOMElementViewTarget(undefined as any)).toThrow(TypeError);
    });

    it('creates target with element and exposes container', () => {
        const el = document.createElement('div');
        const target = new DOMElementViewTarget(el);

        expect(target.container).toBe(el);
        expect(target.container.innerHTML).toBe('');
    });

    it('prepare clears innerHTML and resets for render', () => {
        const el = document.createElement('div');
        el.innerHTML = '<span>old</span>';
        const target = new DOMElementViewTarget(el);

        target.prepare(mockRoute);
        expect(el.innerHTML).toBe('');
    });

    it('commit appends output element to container', () => {
        const el = document.createElement('div');
        const target = new DOMElementViewTarget(el);

        const output = document.createElement('my-view');
        target.commit(output, { test: true }, mockRoute);

        expect(el.children.length).toBe(1);
        expect(el.children[0].tagName.toLowerCase()).toBe('my-view');
    });

    it('clear empties container without destroying', () => {
        const el = document.createElement('div');
        const target = new DOMElementViewTarget(el);

        const output = document.createElement('span');
        target.commit(output, {}, mockRoute);
        expect(el.children.length).toBe(1);

        target.clear();
        expect(el.innerHTML).toBe('');
        expect((target as any).destroyed).toBe(false);
    });

    it('destroy permanently disables the target', () => {
        const el = document.createElement('div');
        const target = new DOMElementViewTarget(el);

        target.destroy();
        expect((target as any).destroyed).toBe(true);

        expect(() => target.prepare(mockRoute)).toThrow();
        expect(() => target.commit(document.createElement('div'), {}, mockRoute)).toThrow();
        expect(target.clear()).toBeUndefined();
    });

    it('prepare throws after destroy', () => {
        const el = document.createElement('div');
        const target = new DOMElementViewTarget(el);

        target.destroy();
        expect(() => target.prepare(mockRoute)).toThrow('destroyed');
    });

    it('commit throws after destroy', () => {
        const el = document.createElement('div');
        const target = new DOMElementViewTarget(el);

        target.destroy();
        expect(() => target.commit(document.createElement('div'), {}, mockRoute)).toThrow('destroyed');
    });

    it('likeDOMViewTarget detects valid target', () => {
        const el = document.createElement('div');
        const target = new DOMElementViewTarget(el);

        expect(likeDOMViewTarget(target)).toBe(true);
    });

    it('likeDOMViewTarget rejects null', () => {
        expect(likeDOMViewTarget(null)).toBe(false);
    });

    it('likeDOMViewTarget rejects plain objects', () => {
        expect(likeDOMViewTarget({})).toBe(false);
    });
});

// ── WebComponentViewEngine ────────────────────────────────────────

describe('WebComponentViewEngine', () => {
    let engine: WebComponentViewEngine;
    let container: HTMLElement;
    let target: DOMElementViewTarget;

    beforeEach(() => {
        engine = new WebComponentViewEngine();
        container = document.createElement('div');
        target = new DOMElementViewTarget(container);
    });

    it('renders a WebComponentView by creating a new element', async () => {
        const view = new WebComponentView('test-component');
        view.name = 'testComponent';

        await engine.render(view, { name: 'World' }, target, mockRoute);

        expect(container.children.length).toBe(1);
        expect(container.children[0].tagName.toLowerCase()).toBe('test-component');
    });

    it('sets model on the rendered element', async () => {
        const view = new WebComponentView('model-component');
        view.name = 'modelComponent';
        const model = { data: 'test' };

        await engine.render(view, model, target, mockRoute);

        const rendered = container.children[0] as any;
        expect(rendered.model).toEqual(model);
    });

    it('reuses existing element when tagName matches', async () => {
        container.innerHTML = '<existing-el></existing-el>';
        const existing = container.firstElementChild!;

        const view = new WebComponentView('existing-el');
        view.name = 'existingEl';

        await engine.render(view, { updated: true }, target, mockRoute);

        expect(container.children.length).toBe(1);
        expect(container.firstElementChild).toBe(existing);
        expect((existing as any).model).toEqual({ updated: true });
    });

    it('creates new element when tagName does not match existing', async () => {
        container.innerHTML = '<other-el></other-el>';

        const view = new WebComponentView('new-el');
        view.name = 'newEl';

        await engine.render(view, {}, target, mockRoute);

        expect(container.children.length).toBe(1);
        expect(container.children[0].tagName.toLowerCase()).toBe('new-el');
    });

    it('throws TypeError when view is not a WebComponentView', async () => {
        const fakeView = { name: 'fake' } as any;

        await expect(engine.render(fakeView, {}, target, mockRoute)).rejects.toThrow(TypeError);
    });

    it('prepares target and commits output for new elements', async () => {
        const prepareSpy = vi.spyOn(target, 'prepare');
        const commitSpy = vi.spyOn(target, 'commit');

        const view = new WebComponentView('fresh-component');
        view.name = 'freshComponent';

        await engine.render(view, { value: 42 }, target, mockRoute);

        expect(prepareSpy).toHaveBeenCalledOnce();
        expect(commitSpy).toHaveBeenCalledOnce();
    });
});

// ── WebComponentView ──────────────────────────────────────────────

describe('WebComponentView', () => {
    it('creates a view with tag name', () => {
        const view = new WebComponentView('my-component');
        expect(view.tagName).toBe('my-component');
    });

    it('creates a template from the tag name', () => {
        const view = new WebComponentView('custom-el');
        expect(view.template).toBe('<custom-el>');
    });
});
