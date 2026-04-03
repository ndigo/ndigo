import { describe, expect, it, vi } from 'vitest';
import { IllegalStateError } from '@blue/core';
import type { DOMProvider } from '@blue/dom';
import { LinkedomDOMProvider } from '@blue/dom';
import { ComponentPhase, WicketComponent } from '../src/component';
import { WicketContainer } from '../src/container';

class TestLeaf extends WicketComponent<string> {
    rendered = false;

    protected render(dom: unknown, container: unknown): void {
        this.rendered = true;
        if (container && typeof (container as Element).appendChild === 'function') {
            const provider = dom as DOMProvider;
            const el = provider.createElement('span');
            el.textContent = this.id;
            (container as Element).appendChild(el);
        }
    }
}

class TestContainer extends WicketContainer<string> {
    initialized = false;
    configured = false;
    detached = false;

    protected onInitialize(): void {
        this.initialized = true;
    }

    protected onConfigure(): void {
        this.configured = true;
    }

    protected onDetach(): void {
        this.detached = true;
    }
}

describe('WicketContainer', () => {
    it('sets id in constructor', () => {
        const container = new WicketContainer('root');

        expect(container.id).toBe('root');
    });

    it('starts with empty children', () => {
        const container = new WicketContainer('root');

        expect(container.children.size).toBe(0);
    });

    it('template defaults to null and can be updated', () => {
        const container = new WicketContainer('root');

        expect(container.template).toBeNull();

        container.template = '<div></div>';

        expect(container.template).toBe('<div></div>');
    });

    it('adds a child component', () => {
        const container = new WicketContainer('root');
        const child = new TestLeaf('child');

        container.addChild(child);

        expect(container.children.get('child')).toBe(child);
        expect(child.parent).toBe(container);
    });

    it('throws for duplicate child ids', () => {
        const container = new WicketContainer('root');
        const first = new TestLeaf('child');
        const second = new TestLeaf('child');

        container.addChild(first);

        expect(() => container.addChild(second)).toThrow(IllegalStateError);
    });

    it('initializes child when container already initialized', () => {
        const container = new TestContainer('root');
        container.initialize();
        const child = new TestLeaf('child');
        const initializeSpy = vi.spyOn(child, 'initialize');

        container.addChild(child);

        expect(initializeSpy).toHaveBeenCalledTimes(1);
    });

    it('removes a child by id and calls remove', () => {
        const container = new WicketContainer('root');
        const child = new TestLeaf('child');
        const removeSpy = vi.spyOn(child, 'remove');

        container.addChild(child);

        const removed = container.removeChild('child');

        expect(removed).toBe(child);
        expect(container.children.size).toBe(0);
        expect(removeSpy).toHaveBeenCalledTimes(1);
    });

    it('returns null when removing unknown child', () => {
        const container = new WicketContainer('root');

        expect(container.removeChild('missing')).toBeNull();
    });

    it('returns child via getChild', () => {
        const container = new WicketContainer('root');
        const child = new TestLeaf('child');

        container.addChild(child);

        expect(container.getChild('child')).toBe(child);
        expect(container.getChild('missing')).toBeNull();
    });

    it('finds child by single segment path', () => {
        const container = new WicketContainer('root');
        const child = new TestLeaf('child');
        container.addChild(child);

        expect(container.findChild('child')).toBe(child);
    });

    it('finds nested child by colon path', () => {
        const root = new WicketContainer('root');
        const panel = new WicketContainer('panel');
        const leaf = new TestLeaf('leaf');

        root.addChild(panel);
        panel.addChild(leaf);

        expect(root.findChild('panel:leaf')).toBe(leaf);
    });

    it('returns null for non-existent path', () => {
        const root = new WicketContainer('root');
        const panel = new WicketContainer('panel');
        root.addChild(panel);

        expect(root.findChild('panel:missing')).toBeNull();
    });

    it('initializes all children', () => {
        const container = new WicketContainer('root');
        const child = new TestLeaf('child');
        const initializeSpy = vi.spyOn(child, 'initialize');
        container.addChild(child);

        container.initialize();

        expect(initializeSpy).toHaveBeenCalledTimes(1);
        expect(container.phase).toBe(ComponentPhase.Initialized);
    });

    it('configures all children', () => {
        const container = new WicketContainer('root');
        const child = new TestLeaf('child');
        const configureSpy = vi.spyOn(child, 'configure');
        container.addChild(child);

        container.configure();

        expect(configureSpy).toHaveBeenCalledTimes(1);
        expect(container.phase).toBe(ComponentPhase.Configured);
    });

    it('detaches all children', () => {
        const container = new WicketContainer('root');
        const child = new TestLeaf('child');
        const detachSpy = vi.spyOn(child, 'detach');
        container.addChild(child);

        container.detach();

        expect(detachSpy).toHaveBeenCalledTimes(1);
        expect(container.phase).toBe(ComponentPhase.Detached);
    });

    it('removes all children', () => {
        const container = new WicketContainer('root');
        const child = new TestLeaf('child');
        const removeSpy = vi.spyOn(child, 'remove');
        container.addChild(child);

        container.remove();

        expect(container.children.size).toBe(0);
        expect(removeSpy).toHaveBeenCalledTimes(1);
        expect(container.phase).toBe(ComponentPhase.Removed);
    });

    it('renders children directly when no template', () => {
        const dom = new LinkedomDOMProvider();
        const container = new WicketContainer('root');
        const child = new TestLeaf('child');
        const renderSpy = vi.spyOn(child, 'renderComponent');
        const host = dom.createElement('div');
        container.addChild(child);

        container.renderComponent(dom, host);

        expect(renderSpy).toHaveBeenCalledWith(dom, host);
    });

    it('renders children into template slots', () => {
        const dom = new LinkedomDOMProvider();
        const container = new WicketContainer('root');
        container.template = '<html><body><div><div data-w-id="child"></div></div></body></html>';
        const child = new TestLeaf('child');
        container.addChild(child);
        const host = dom.createElement('div');

        container.renderComponent(dom, host);

        const renderedSpan = host.querySelector('span');
        expect(renderedSpan?.textContent).toBe('child');
    });

    it('exposes Symbol.toStringTag', () => {
        const container = new WicketContainer('root');

        expect(Object.prototype.toString.call(container)).toBe('[object WicketContainer]');
    });
});
