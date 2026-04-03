import { describe, expect, it, vi } from 'vitest';
import type { DOMProvider } from '@blue/dom';
import { LinkedomDOMProvider } from '@blue/dom';
import { MutableModel, StaticModel } from '@blue/reactive';
import { FormComponent } from '../src/form-component';

class TestFormComponent extends FormComponent<string> {
    validateCalls = 0;

    protected render(dom: DOMProvider, container: Element | DocumentFragment): void {
        const element = dom.createElement('input');
        container.appendChild(element);
        this._element = element;
    }

    protected onValidate(): void {
        this.validateCalls += 1;
    }
}

describe('FormComponent', () => {
    it('exposes Symbol.toStringTag', () => {
        const component = new TestFormComponent('alpha');

        expect(Object.prototype.toString.call(component)).toBe('[object FormComponent]');
    });

    it('starts with _element as null', () => {
        const component = new TestFormComponent('alpha');

        expect(component._element).toBeNull();
    });

    it('defaults rawInput to null', () => {
        const component = new TestFormComponent('alpha');

        expect(component.rawInput).toBeNull();
    });

    it('allows rawInput to be updated', () => {
        const component = new TestFormComponent('alpha');

        component.rawInput = 'value';

        expect(component.rawInput).toBe('value');
    });

    it('defaults required to false', () => {
        const component = new TestFormComponent('alpha');

        expect(component.required).toBe(false);
    });

    it('allows required to be toggled', () => {
        const component = new TestFormComponent('alpha');

        component.required = true;

        expect(component.required).toBe(true);
    });

    it('defaults valid to true', () => {
        const component = new TestFormComponent('alpha');

        expect(component.valid).toBe(true);
    });

    it('defaults validationErrors to an empty array', () => {
        const component = new TestFormComponent('alpha');

        expect(component.validationErrors).toEqual([]);
    });

    it('passes validation when not required and rawInput is null', () => {
        const component = new TestFormComponent('alpha');

        component.validate();

        expect(component.valid).toBe(true);
        expect(component.validationErrors).toEqual([]);
    });

    it('fails validation when required and rawInput is null', () => {
        const component = new TestFormComponent('alpha');
        component.required = true;

        component.validate();

        expect(component.valid).toBe(false);
        expect(component.validationErrors).toEqual(['alpha is required.']);
    });

    it('fails validation when required and rawInput is empty', () => {
        const component = new TestFormComponent('alpha');
        component.required = true;
        component.rawInput = '';

        component.validate();

        expect(component.valid).toBe(false);
        expect(component.validationErrors).toEqual(['alpha is required.']);
    });

    it('passes validation when required and rawInput is provided', () => {
        const component = new TestFormComponent('alpha');
        component.required = true;
        component.rawInput = 'value';

        component.validate();

        expect(component.valid).toBe(true);
        expect(component.validationErrors).toEqual([]);
    });

    it('returns rawInput by default in convertInput', () => {
        const component = new TestFormComponent('alpha');
        component.rawInput = 'value';

        expect(component.convertInput()).toBe('value');
    });

    it('updates writable models in updateModel', () => {
        const model = new MutableModel('initial');
        const component = new TestFormComponent('alpha', model);
        component.rawInput = 'updated';

        component.updateModel();

        expect(model.get()).toBe('updated');
    });

    it('does nothing for read-only models in updateModel', () => {
        const model = new StaticModel('initial');
        const component = new TestFormComponent('alpha', model);
        component.rawInput = 'updated';

        component.updateModel();

        expect(model.get()).toBe('initial');
    });

    it('clears validation state and rawInput on detach', () => {
        const component = new TestFormComponent('alpha');
        component.required = true;
        component.validate();
        component.rawInput = 'value';

        component.detach();

        expect(component.rawInput).toBeNull();
        expect(component.validationErrors).toEqual([]);
        expect(component.valid).toBe(true);
    });

    it('invokes onValidate when not short-circuited', () => {
        const component = new TestFormComponent('alpha');
        component.rawInput = 'value';

        component.validate();

        expect(component.validateCalls).toBe(1);
    });

    it('renders using the public renderComponent API', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('div');
        const component = new TestFormComponent('alpha');

        component.renderComponent(dom, container);

        const input = container.querySelector('input');
        expect(input).not.toBeNull();
        expect(component._element).toBe(input);
    });
});
