import { describe, expect, it } from 'vitest';
import { LinkedomDOMProvider } from '@blue/dom';
import { StaticModel } from '@blue/reactive';
import { DropDownChoice } from '../src/drop-down-choice';

describe('DropDownChoice', () => {
    it('exposes Symbol.toStringTag as DropDownChoice', () => {
        const dropDown = new DropDownChoice('choice', new StaticModel('alpha'), new StaticModel(['alpha']));

        expect(Object.prototype.toString.call(dropDown)).toBe('[object DropDownChoice]');
    });

    it('starts with _element as null', () => {
        const dropDown = new DropDownChoice('choice', new StaticModel('alpha'), new StaticModel(['alpha']));

        expect(dropDown._element).toBeNull();
    });

    it('exposes choices model via getter', () => {
        const choices = new StaticModel(['alpha', 'beta']);
        const dropDown = new DropDownChoice('choice', new StaticModel('alpha'), choices);

        expect(dropDown.choices).toBe(choices);
    });

    it('renders into an Element container directly', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('select');
        const dropDown = new DropDownChoice('choice', new StaticModel('alpha'), new StaticModel(['alpha']));

        dropDown.renderComponent(dom, container);

        expect(dropDown._element).toBe(container);
        expect(container.getAttribute('name')).toBe('choice');
    });

    it('renders into a DocumentFragment by creating a select element', () => {
        const dom = new LinkedomDOMProvider();
        const fragment = dom.createFragment();
        const dropDown = new DropDownChoice('choice', new StaticModel('alpha'), new StaticModel(['alpha']));

        dropDown.renderComponent(dom, fragment);

        const select = fragment.firstChild as Element | null;
        expect(select?.tagName).toBe('SELECT');
        expect(dropDown._element).toBe(select);
    });

    it('creates option elements for each choice', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('select');
        const dropDown = new DropDownChoice('choice', new StaticModel('beta'), new StaticModel(['alpha', 'beta']));

        dropDown.renderComponent(dom, container);

        expect(container.childNodes).toHaveLength(2);
        expect((container.childNodes[0] as Element).tagName).toBe('OPTION');
        expect((container.childNodes[1] as Element).tagName).toBe('OPTION');
    });

    it('sets value attribute to index on each option', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('select');
        const dropDown = new DropDownChoice('choice', new StaticModel('alpha'), new StaticModel(['alpha', 'beta']));

        dropDown.renderComponent(dom, container);

        const first = container.childNodes[0] as Element;
        const second = container.childNodes[1] as Element;
        expect(first.getAttribute('value')).toBe('0');
        expect(second.getAttribute('value')).toBe('1');
    });

    it('sets textContent to string representation of choice', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('select');
        const dropDown = new DropDownChoice('choice', new StaticModel('alpha'), new StaticModel(['alpha', 'beta']));

        dropDown.renderComponent(dom, container);

        expect((container.childNodes[0] as Element).textContent).toBe('alpha');
        expect((container.childNodes[1] as Element).textContent).toBe('beta');
    });

    it('marks matching option as selected', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('select');
        const dropDown = new DropDownChoice('choice', new StaticModel('beta'), new StaticModel(['alpha', 'beta']));

        dropDown.renderComponent(dom, container);

        const first = container.childNodes[0] as Element;
        const second = container.childNodes[1] as Element;
        expect(first.hasAttribute('selected')).toBe(false);
        expect(second.getAttribute('selected')).toBe('selected');
    });

    it('sets the name attribute to the component id', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('select');
        const dropDown = new DropDownChoice('choice', new StaticModel('alpha'), new StaticModel(['alpha']));

        dropDown.renderComponent(dom, container);

        expect(container.getAttribute('name')).toBe('choice');
    });

    it('sets the disabled attribute when not enabled', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('select');
        const dropDown = new DropDownChoice('choice', new StaticModel('alpha'), new StaticModel(['alpha']));
        dropDown.enabled = false;

        dropDown.renderComponent(dom, container);

        expect(container.getAttribute('disabled')).toBe('disabled');
    });

    it('uses custom displayValue function when provided', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('select');
        const dropDown = new DropDownChoice(
            'choice',
            new StaticModel('alpha'),
            new StaticModel(['alpha', 'beta']),
            (item) => `choice:${item}`
        );

        dropDown.renderComponent(dom, container);

        expect((container.childNodes[0] as Element).textContent).toBe('choice:alpha');
        expect((container.childNodes[1] as Element).textContent).toBe('choice:beta');
    });

    it('handles empty choices array', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('select');
        const dropDown = new DropDownChoice('choice', new StaticModel('alpha'), new StaticModel([]));

        dropDown.renderComponent(dom, container);

        expect(container.childNodes).toHaveLength(0);
    });

    it('clears existing options on re-render', () => {
        const dom = new LinkedomDOMProvider();
        const container = dom.createElement('select');
        const choices = new StaticModel(['alpha']);
        const model = new StaticModel('alpha');
        const dropDown = new DropDownChoice('choice', model, choices);

        dropDown.renderComponent(dom, container);
        expect(container.childNodes).toHaveLength(1);

        const updatedChoices = new StaticModel(['alpha', 'beta']);
        const updated = new DropDownChoice('choice', model, updatedChoices);
        updated.renderComponent(dom, container);

        expect(container.childNodes).toHaveLength(2);
    });
});
