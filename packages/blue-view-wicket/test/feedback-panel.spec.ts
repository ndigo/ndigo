import { describe, expect, it } from 'vitest';
import type { DOMProvider } from '@blue/dom';
import { LinkedomDOMProvider } from '@blue/dom';
import { Form } from '../src/form';
import { FeedbackPanel } from '../src/feedback-panel';
import { FormComponent } from '../src/form-component';
import { WicketContainer } from '../src/container';

class TestInput extends FormComponent<string> {
    protected render(dom: DOMProvider, container: Element | DocumentFragment): void {
        const element = dom.createElement('input');
        container.appendChild(element);
        this._element = element;
    }
}

describe('FeedbackPanel', () => {
    it('exposes Symbol.toStringTag', () => {
        const panel = new FeedbackPanel('panel');

        expect(Object.prototype.toString.call(panel)).toBe('[object FeedbackPanel]');
    });

    it('starts with _element as null', () => {
        const panel = new FeedbackPanel('panel');

        expect(panel._element).toBeNull();
    });

    it('renders nothing when there are no errors', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('div');
        const form = new Form('form');
        const panel = new FeedbackPanel('panel');
        form.addChild(panel);

        panel.renderComponent(dom, container);

        expect(container.childNodes).toHaveLength(0);
        expect(panel._element).toBeNull();
    });

    it('renders a list item for each validation error', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('div');
        const form = new Form('form');
        const input = new TestInput('name');
        input.required = true;
        input.validate();
        const panel = new FeedbackPanel('panel');
        form.addChild(input);
        form.addChild(panel);

        panel.renderComponent(dom, container);

        const ul = container.querySelector('ul');
        const items = container.querySelectorAll('li');
        expect(ul).not.toBeNull();
        expect(items).toHaveLength(1);
        expect(items[0]?.textContent).toBe('name is required.');
    });

    it('collects errors from sibling form components', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('div');
        const form = new Form('form');
        const first = new TestInput('first');
        const second = new TestInput('second');
        first.required = true;
        second.required = true;
        first.validate();
        second.validate();
        const panel = new FeedbackPanel('panel');
        form.addChild(first);
        form.addChild(second);
        form.addChild(panel);

        panel.renderComponent(dom, container);

        const items = container.querySelectorAll('li');
        const text = Array.from(items).map((item) => item.textContent);
        expect(text).toEqual(['first is required.', 'second is required.']);
    });

    it('collects errors from nested form components', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('div');
        const form = new Form('form');
        const group = new WicketContainer('group');
        const input = new TestInput('nested');
        input.required = true;
        input.validate();
        const panel = new FeedbackPanel('panel');
        group.addChild(input);
        form.addChild(group);
        form.addChild(panel);

        panel.renderComponent(dom, container);

        const items = container.querySelectorAll('li');
        expect(items).toHaveLength(1);
        expect(items[0]?.textContent).toBe('nested is required.');
    });

    it('stores the rendered ul in _element', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('div');
        const form = new Form('form');
        const input = new TestInput('name');
        input.required = true;
        input.validate();
        const panel = new FeedbackPanel('panel');
        form.addChild(input);
        form.addChild(panel);

        panel.renderComponent(dom, container);

        const ul = container.querySelector('ul');
        expect(panel._element).toBe(ul);
    });

    it('renders a feedback-panel class on the list', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('div');
        const form = new Form('form');
        const input = new TestInput('name');
        input.required = true;
        input.validate();
        const panel = new FeedbackPanel('panel');
        form.addChild(input);
        form.addChild(panel);

        panel.renderComponent(dom, container);

        const ul = container.querySelector('ul');
        expect(ul?.getAttribute('class')).toBe('feedback-panel');
    });
});
