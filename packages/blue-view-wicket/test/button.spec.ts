import { describe, expect, it } from 'vitest';
import { LinkedomDOMProvider } from '@blue/dom';
import { StaticModel } from '@blue/reactive';
import { Button } from '../src/button';

describe('Button', () => {
    it('exposes Symbol.toStringTag as Button', () => {
        const button = new Button('submit');

        expect(Object.prototype.toString.call(button)).toBe('[object Button]');
    });

    it('starts with _element as null', () => {
        const button = new Button('submit');

        expect(button._element).toBeNull();
    });

    it('renders into an Element container directly', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('button');
        const button = new Button('submit', new StaticModel('Send'));

        button.renderComponent(dom, container);

        expect(container.textContent).toBe('Send');
        expect(button._element).toBe(container);
    });

    it('renders into a DocumentFragment by creating a button element', () => {
        const dom = new LinkedomDOMProvider();
        const fragment = dom.createFragment();
        const button = new Button('submit', new StaticModel('Send'));

        button.renderComponent(dom, fragment);

        const element = fragment.firstChild as Element | null;
        expect(element?.tagName).toBe('BUTTON');
        expect(element?.textContent).toBe('Send');
        expect(button._element).toBe(element);
    });

    it('sets textContent from the model value', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('button');
        const button = new Button('submit', new StaticModel('Save'));

        button.renderComponent(dom, container);

        expect(container.textContent).toBe('Save');
    });

    it('sets the type attribute to "button"', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('button');
        const button = new Button('submit', new StaticModel('Send'));

        button.renderComponent(dom, container);

        expect(container.getAttribute('type')).toBe('button');
    });

    it('sets the disabled attribute when not enabled', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('button');
        const button = new Button('submit', new StaticModel('Send'));
        button.enabled = false;

        button.renderComponent(dom, container);

        expect(container.getAttribute('disabled')).toBe('disabled');
    });

    it('does not set the disabled attribute when enabled', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('button');
        const button = new Button('submit', new StaticModel('Send'));

        button.renderComponent(dom, container);

        expect(container.hasAttribute('disabled')).toBe(false);
    });

    it('renders null model value as an empty string', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('button');
        const button = new Button('submit', new StaticModel<string | null>(null));

        button.renderComponent(dom, container);

        expect(container.textContent).toBe('');
    });

    it('onSubmit can be called as a no-op', () => {
        const button = new Button('submit');

        expect(() => button.onSubmit()).not.toThrow();
    });

    it('onError can be called as a no-op', () => {
        const button = new Button('submit');

        expect(() => button.onError()).not.toThrow();
    });

    it('onSubmit and onError can be overridden in subclasses', () => {
        class TrackingButton extends Button {
            submitted = false;
            failed = false;

            override onSubmit(): void {
                this.submitted = true;
            }

            override onError(): void {
                this.failed = true;
            }
        }

        const button = new TrackingButton('submit');

        button.onSubmit();
        button.onError();

        expect(button.submitted).toBe(true);
        expect(button.failed).toBe(true);
    });
});
