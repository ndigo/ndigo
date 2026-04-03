import { describe, expect, it, vi } from 'vitest';
import { LinkedomDOMProvider } from '@blue/dom';
import { MutableModel, StaticModel } from '@blue/reactive';
import { TextArea } from '../src/text-area';

describe('TextArea', () => {
    it('exposes Symbol.toStringTag as TextArea', () => {
        const textArea = new TextArea('notes');

        expect(Object.prototype.toString.call(textArea)).toBe('[object TextArea]');
    });

    it('starts with _element as null', () => {
        const textArea = new TextArea('notes');

        expect(textArea._element).toBeNull();
    });

    it('renders into an Element container directly and sets textContent', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('textarea');
        const textArea = new TextArea('notes', new StaticModel('Hello'));

        textArea.renderComponent(dom, container);

        expect(container.textContent).toBe('Hello');
        expect(textArea._element).toBe(container);
    });

    it('renders into a DocumentFragment by creating a textarea element', () => {
        const dom = new LinkedomDOMProvider();
        const fragment = dom.createFragment();
        const textArea = new TextArea('notes', new StaticModel('Hello'));

        textArea.renderComponent(dom, fragment);

        const textarea = fragment.firstChild as Element | null;
        expect(textarea?.tagName).toBe('TEXTAREA');
        expect(textarea?.textContent).toBe('Hello');
        expect(textArea._element).toBe(textarea);
    });

    it('sets textContent from the model value', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('textarea');
        const model = { get: vi.fn(() => 'Notes'), subscribe: vi.fn(() => () => {}) };
        const textArea = new TextArea('notes', model);

        textArea.renderComponent(dom, container);

        expect(model.get).toHaveBeenCalledTimes(1);
        expect(container.textContent).toBe('Notes');
    });

    it('sets the name attribute to the component id', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('textarea');
        const textArea = new TextArea('notes', new MutableModel('Hello'));

        textArea.renderComponent(dom, container);

        expect(container.getAttribute('name')).toBe('notes');
    });

    it('sets the disabled attribute when not enabled', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('textarea');
        const textArea = new TextArea('notes', new StaticModel('Hello'));
        textArea.enabled = false;

        textArea.renderComponent(dom, container);

        expect(container.getAttribute('disabled')).toBe('disabled');
    });

    it('does not set the disabled attribute when enabled', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('textarea');
        const textArea = new TextArea('notes', new StaticModel('Hello'));

        textArea.renderComponent(dom, container);

        expect(container.hasAttribute('disabled')).toBe(false);
    });

    it('renders null model value as an empty string', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('textarea');
        const textArea = new TextArea('notes', new StaticModel<string | null>(null));

        textArea.renderComponent(dom, container);

        expect(container.textContent).toBe('');
    });

    it('renders undefined model value as an empty string', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('textarea');
        const textArea = new TextArea('notes', new StaticModel<string | undefined>(undefined));

        textArea.renderComponent(dom, container);

        expect(container.textContent).toBe('');
    });
});
