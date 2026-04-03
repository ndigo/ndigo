import { describe, expect, it } from 'vitest';
import { LinkedomDOMProvider } from '@blue/dom';
import { StaticModel } from '@blue/reactive';
import { Label } from '../src/label';

describe('Label', () => {
    it('exposes Symbol.toStringTag as Label', () => {
        const label = new Label('label');

        expect(Object.prototype.toString.call(label)).toBe('[object Label]');
    });

    it('starts with _element as null', () => {
        const label = new Label('label');

        expect(label._element).toBeNull();
    });

    it('renders model string value as textContent into an Element container', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('div');
        const label = new Label('label', new StaticModel('Hello'));

        label.renderComponent(dom, container);

        expect(container.textContent).toBe('Hello');
        expect(label._element).toBe(container);
    });

    it('renders model string value into a DocumentFragment by creating a span', () => {
        const dom = new LinkedomDOMProvider();
        const fragment = dom.createFragment();
        const label = new Label('label', new StaticModel('Hello'));

        label.renderComponent(dom, fragment);

        const span = fragment.firstChild as Element | null;
        expect(span?.tagName).toBe('SPAN');
        expect(span?.textContent).toBe('Hello');
        expect(label._element).toBe(span);
    });

    it('renders null model value as an empty string', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('div');
        const label = new Label('label', new StaticModel<string | null>(null));

        label.renderComponent(dom, container);

        expect(container.textContent).toBe('');
    });

    it('renders undefined model value as an empty string', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('div');
        const label = new Label('label', new StaticModel<string | undefined>(undefined));

        label.renderComponent(dom, container);

        expect(container.textContent).toBe('');
    });

    it('renders numeric model value as a string', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('div');
        const label = new Label('label', new StaticModel(42));

        label.renderComponent(dom, container);

        expect(container.textContent).toBe('42');
    });
});
