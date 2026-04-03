import { describe, expect, it, vi } from 'vitest';
import type { DOMProvider } from '@blue/dom';
import { LinkedomDOMProvider } from '@blue/dom';
import { MutableModel, StaticModel } from '@blue/reactive';
import { WicketContainer } from '../src/container';
import { Form } from '../src/form';
import { FormComponent } from '../src/form-component';

class TestForm extends Form<unknown> {
    submitSpy = vi.fn();
    errorSpy = vi.fn();

    protected onSubmit(): void {
        this.submitSpy();
    }

    protected onError(): void {
        this.errorSpy();
    }
}

class TestInput extends FormComponent<string> {
    protected render(dom: DOMProvider, container: Element | DocumentFragment): void {
        const element = dom.createElement('input');
        container.appendChild(element);
        this._element = element;
    }
}

describe('Form', () => {
    it('exposes Symbol.toStringTag', () => {
        const form = new Form('form');

        expect(Object.prototype.toString.call(form)).toBe('[object Form]');
    });

    it('starts with _element as null', () => {
        const form = new Form('form');

        expect(form._element).toBeNull();
    });

    it('renders into an Element container directly', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('div');
        const form = new Form('form');

        form.renderComponent(dom, container);

        expect(form._element).toBe(container);
    });

    it('renders into a DocumentFragment by creating a form element', () => {
        const dom = new LinkedomDOMProvider();
        const fragment = dom.createFragment();
        const form = new Form('form');

        form.renderComponent(dom, fragment);

        const element = fragment.firstChild as Element | null;
        expect(element?.tagName).toBe('FORM');
        expect(form._element).toBe(element);
    });

    it('calls onSubmit when all FormComponents are valid', () => {
        const form = new TestForm('form');
        const input = new TestInput('name');
        input.rawInput = 'value';
        form.addChild(input);

        form.process();

        expect(form.submitSpy).toHaveBeenCalledTimes(1);
        expect(form.errorSpy).not.toHaveBeenCalled();
    });

    it('calls onError when any FormComponent is invalid', () => {
        const form = new TestForm('form');
        const input = new TestInput('name');
        input.required = true;
        form.addChild(input);

        form.process();

        expect(form.errorSpy).toHaveBeenCalledTimes(1);
        expect(form.submitSpy).not.toHaveBeenCalled();
    });

    it('updates models for each component before calling onSubmit', () => {
        const form = new TestForm('form');
        const model = new MutableModel('initial');
        const input = new TestInput('name', model);
        input.rawInput = 'updated';
        form.addChild(input);
        const updateSpy = vi.spyOn(input, 'updateModel');

        form.process();

        expect(updateSpy).toHaveBeenCalledTimes(1);
        expect(model.get()).toBe('updated');
        expect(form.submitSpy).toHaveBeenCalledTimes(1);
    });

    it('does not update models when validation fails', () => {
        const form = new TestForm('form');
        const model = new MutableModel('initial');
        const input = new TestInput('name', model);
        input.required = true;
        form.addChild(input);
        const updateSpy = vi.spyOn(input, 'updateModel');

        form.process();

        expect(updateSpy).not.toHaveBeenCalled();
        expect(model.get()).toBe('initial');
        expect(form.errorSpy).toHaveBeenCalledTimes(1);
    });

    it('collects deeply nested FormComponents', () => {
        const form = new TestForm('form');
        const panel = new WicketContainer('panel');
        const input = new TestInput('name');
        input.rawInput = 'value';
        panel.addChild(input);
        form.addChild(panel);

        form.process();

        expect(form.submitSpy).toHaveBeenCalledTimes(1);
    });

    it('calls onSubmit immediately when there are no FormComponents', () => {
        const form = new TestForm('form');

        form.process();

        expect(form.submitSpy).toHaveBeenCalledTimes(1);
        expect(form.errorSpy).not.toHaveBeenCalled();
    });

    it('renders children into the resolved element', () => {
        const dom = new LinkedomDOMProvider();
        const fragment = dom.createFragment();
        const form = new Form('form', new StaticModel());
        const input = new TestInput('name');
        const renderSpy = vi.spyOn(input, 'renderComponent');
        form.addChild(input);

        form.renderComponent(dom, fragment);

        expect(renderSpy).toHaveBeenCalledTimes(1);
        expect(form._element?.tagName).toBe('FORM');
    });
});
