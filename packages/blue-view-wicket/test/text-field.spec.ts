import { describe, expect, it } from 'vitest';
import { LinkedomDOMProvider } from '@blue/dom';
import { StaticModel } from '@blue/reactive';
import { TextField } from '../src/text-field';

describe('TextField', () => {
    it('exposes Symbol.toStringTag', () => {
        const field = new TextField('field');

        expect(Object.prototype.toString.call(field)).toBe('[object TextField]');
    });

    it('starts with _element as null', () => {
        const field = new TextField('field');

        expect(field._element).toBeNull();
    });

    it('defaults type to text', () => {
        const field = new TextField('field');

        expect(field.type).toBe('text');
    });

    it('allows type to be set via constructor', () => {
        const field = new TextField('field', undefined, 'email');

        expect(field.type).toBe('email');
    });

    it('renders into an Element container directly', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('input');
        const field = new TextField('field', new StaticModel('Hello'));

        field.renderComponent(dom, container);

        expect(field._element).toBe(container);
        expect(container.getAttribute('value')).toBe('Hello');
    });

    it('renders into a DocumentFragment by creating an input', () => {
        const dom = new LinkedomDOMProvider();
        const fragment = dom.createFragment();
        const field = new TextField('field', new StaticModel('Hello'));

        field.renderComponent(dom, fragment);

        const input = fragment.firstChild as Element | null;
        expect(input?.tagName).toBe('INPUT');
        expect(field._element).toBe(input);
    });

    it('sets the value attribute from the model value', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('input');
        const field = new TextField('field', new StaticModel('Hello'));

        field.renderComponent(dom, container);

        expect(container.getAttribute('value')).toBe('Hello');
    });

    it('sets the type attribute', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('input');
        const field = new TextField('field', new StaticModel('Hello'), 'email');

        field.renderComponent(dom, container);

        expect(container.getAttribute('type')).toBe('email');
    });

    it('sets the name attribute to the component id', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('input');
        const field = new TextField('username', new StaticModel('Hello'));

        field.renderComponent(dom, container);

        expect(container.getAttribute('name')).toBe('username');
    });

    it('sets disabled when not enabled', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('input');
        const field = new TextField('field', new StaticModel('Hello'));
        field.enabled = false;

        field.renderComponent(dom, container);

        expect(container.getAttribute('disabled')).toBe('disabled');
    });

    it('does not set disabled when enabled', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('input');
        const field = new TextField('field', new StaticModel('Hello'));

        field.renderComponent(dom, container);

        expect(container.hasAttribute('disabled')).toBe(false);
    });

    it('renders an empty string value when model is null', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('input');
        const field = new TextField('field', new StaticModel<string | null>(null));

        field.renderComponent(dom, container);

        expect(container.getAttribute('value')).toBe('');
    });
});
