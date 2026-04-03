import { describe, expect, it, vi } from 'vitest';
import { LinkedomDOMProvider } from '@blue/dom';
import { MutableModel, StaticModel } from '@blue/reactive';
import { CheckBox } from '../src/check-box';

describe('CheckBox', () => {
    it('exposes Symbol.toStringTag as CheckBox', () => {
        const checkBox = new CheckBox('accept');

        expect(Object.prototype.toString.call(checkBox)).toBe('[object CheckBox]');
    });

    it('starts with _element as null', () => {
        const checkBox = new CheckBox('accept');

        expect(checkBox._element).toBeNull();
    });

    it('convertInput returns true when rawInput is "true"', () => {
        const checkBox = new CheckBox('accept');
        checkBox.rawInput = 'true';

        expect(checkBox.convertInput()).toBe(true);
    });

    it('convertInput returns false when rawInput is "false"', () => {
        const checkBox = new CheckBox('accept');
        checkBox.rawInput = 'false';

        expect(checkBox.convertInput()).toBe(false);
    });

    it('convertInput returns false when rawInput is null', () => {
        const checkBox = new CheckBox('accept');
        checkBox.rawInput = null;

        expect(checkBox.convertInput()).toBe(false);
    });

    it('convertInput returns false for any other string', () => {
        const checkBox = new CheckBox('accept');
        checkBox.rawInput = 'yes';

        expect(checkBox.convertInput()).toBe(false);
    });

    it('renders into an Element container directly', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('input');
        const checkBox = new CheckBox('accept', new StaticModel(true));

        checkBox.renderComponent(dom, container);

        expect(checkBox._element).toBe(container);
        expect(container.getAttribute('type')).toBe('checkbox');
    });

    it('renders into a DocumentFragment by creating an input element', () => {
        const dom = new LinkedomDOMProvider();
        const fragment = dom.createFragment();
        const checkBox = new CheckBox('accept', new StaticModel(true));

        checkBox.renderComponent(dom, fragment);

        const input = fragment.firstChild as Element | null;
        expect(input?.tagName).toBe('INPUT');
        expect(input?.getAttribute('type')).toBe('checkbox');
        expect(checkBox._element).toBe(input);
    });

    it('sets the type attribute to "checkbox"', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('input');
        const checkBox = new CheckBox('accept', new StaticModel(false));

        checkBox.renderComponent(dom, container);

        expect(container.getAttribute('type')).toBe('checkbox');
    });

    it('sets the name attribute to the component id', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('input');
        const checkBox = new CheckBox('accept', new MutableModel(true));

        checkBox.renderComponent(dom, container);

        expect(container.getAttribute('name')).toBe('accept');
    });

    it('sets the checked attribute when model value is true', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('input');
        const model = { get: vi.fn(() => true), subscribe: vi.fn(() => () => {}) };
        const checkBox = new CheckBox('accept', model);

        checkBox.renderComponent(dom, container);

        expect(model.get).toHaveBeenCalledTimes(1);
        expect(container.getAttribute('checked')).toBe('checked');
    });

    it('removes the checked attribute when model value is false', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('input');
        const checkBox = new CheckBox('accept', new StaticModel(true));

        checkBox.renderComponent(dom, container);
        expect(container.hasAttribute('checked')).toBe(true);

        const next = new CheckBox('accept', new StaticModel(false));
        next.renderComponent(dom, container);

        expect(container.hasAttribute('checked')).toBe(false);
    });

    it('sets the disabled attribute when not enabled', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('input');
        const checkBox = new CheckBox('accept', new StaticModel(false));
        checkBox.enabled = false;

        checkBox.renderComponent(dom, container);

        expect(container.getAttribute('disabled')).toBe('disabled');
    });

    it('does not set the disabled attribute when enabled', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('input');
        const checkBox = new CheckBox('accept', new StaticModel(false));

        checkBox.renderComponent(dom, container);

        expect(container.hasAttribute('disabled')).toBe(false);
    });
});
