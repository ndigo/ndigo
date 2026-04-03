import { describe, expect, it, vi } from 'vitest';
import { LinkedomDOMProvider } from '@blue/dom';
import { StaticModel } from '@blue/reactive';
import { Link } from '../src/link';
import { Label } from '../src/label';

class TestLink extends Link<void> {
    onClick = vi.fn();
}

describe('Link', () => {
    it('exposes Symbol.toStringTag as Link', () => {
        const link = new TestLink('link');

        expect(Object.prototype.toString.call(link)).toBe('[object Link]');
    });

    it('starts with _element as null', () => {
        const link = new TestLink('link');

        expect(link._element).toBeNull();
    });

    it('renders into an Element container and uses the container directly', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('a');
        const link = new TestLink('link');

        link.renderComponent(dom, container);

        expect(link._element).toBe(container);
        expect(container.tagName).toBe('A');
    });

    it('renders into a DocumentFragment by creating an anchor with href="#"', () => {
        const dom = new LinkedomDOMProvider();
        const fragment = dom.createFragment();
        const link = new TestLink('link');

        link.renderComponent(dom, fragment);

        const anchor = fragment.firstChild as Element | null;
        expect(anchor?.tagName).toBe('A');
        expect(anchor?.getAttribute('href')).toBe('#');
        expect(link._element).toBe(anchor);
    });

    it('renders children into the link element', () => {
        const dom = new LinkedomDOMProvider();
        const fragment = dom.createFragment();
        const link = new TestLink('link', new StaticModel(undefined));
        const child = new Label('child', new StaticModel('child-text'));
        link.addChild(child);

        link.renderComponent(dom, fragment);

        const anchor = fragment.firstChild as Element | null;
        expect(anchor?.textContent).toBe('child-text');
        expect(child._element).toBe(anchor);
    });

    it('cannot be instantiated directly because it is abstract', () => {
        // @ts-expect-error Cannot create an instance of an abstract class.
        const instance = new Link('link');
        void instance;
        expect(true).toBe(true);
    });
});
