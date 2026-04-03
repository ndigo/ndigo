import '@tsmetadata/polyfill';
import { describe, expect, it } from 'vitest';
import { MutableModel, PropertyModel, StaticModel } from '@blue/reactive';
import { bindModel, getModelBindings, hasModelBindings } from '../src/bind-model';
import { Form } from '../src/form';
import { Label } from '../src/label';
import { TextField } from '../src/text-field';

class NoBindings extends Form<{ name: string }> {}

class SingleBindingForm extends Form<{ name: string }> {
    @bindModel('name')
    nameField = new TextField<string>('name');
}

class MultiBindingForm extends Form<{ name: string; email: string }> {
    @bindModel('name')
    nameField = new TextField<string>('name');

    @bindModel('email')
    emailField = new TextField<string>('email');
}

describe('bindModel metadata', () => {
    it('getModelBindings returns empty map for class without decorators', () => {
        const bindings = getModelBindings(NoBindings);

        expect(bindings.size).toBe(0);
    });

    it('getModelBindings returns bindings for decorated class', () => {
        const bindings = getModelBindings(SingleBindingForm);

        expect(bindings.size).toBe(1);
        expect(bindings.get('nameField')).toBe('name');
    });

    it('getModelBindings returns bindings for instance of decorated class', () => {
        const form = new SingleBindingForm('form', new StaticModel({ name: 'Alice' }));
        const bindings = getModelBindings(form);

        expect(bindings.size).toBe(1);
        expect(bindings.get('nameField')).toBe('name');
    });

    it('hasModelBindings returns false for class without decorators', () => {
        expect(hasModelBindings(NoBindings)).toBe(false);
    });

    it('hasModelBindings returns true for class with decorators', () => {
        expect(hasModelBindings(SingleBindingForm)).toBe(true);
    });

    it('getModelBindings returns multiple bindings', () => {
        const bindings = getModelBindings(MultiBindingForm);

        expect(bindings.size).toBe(2);
        expect(bindings.get('nameField')).toBe('name');
        expect(bindings.get('emailField')).toBe('email');
    });
});

describe('bindModel binding behavior', () => {
    it('assigns PropertyModel to child component on construction', () => {
        const form = new SingleBindingForm('form', new StaticModel({ name: 'Alice' }));

        expect(form.nameField.model).toBeInstanceOf(PropertyModel);
        expect(form.nameField.model.get()).toBe('Alice');
    });

    it('uses CompoundModel caching for multiple bindings', () => {
        class SharedPathForm extends Form<{ name: string }> {
            @bindModel('name')
            firstField = new TextField<string>('first');

            @bindModel('name')
            secondField = new TextField<string>('second');
        }

        const form = new SharedPathForm('form', new StaticModel({ name: 'Alice' }));

        expect(form.firstField.model).toBe(form.secondField.model);
        expect(form.firstField.model.get()).toBe('Alice');
        expect(form.secondField.model.get()).toBe('Alice');
    });

    it('works with nested property paths', () => {
        class AddressForm extends Form<{ address: { city: string } }> {
            @bindModel('address.city')
            cityField = new TextField<string>('city');
        }

        const form = new AddressForm('form', new StaticModel({ address: { city: 'Paris' } }));

        expect(form.cityField.model.get()).toBe('Paris');
    });

    it('skips binding when field is null', () => {
        class NullFieldForm extends Form<{ name: string }> {
            @bindModel('name')
            nameField: TextField<string> | null = null;
        }

        const form = new NullFieldForm('form', new StaticModel({ name: 'Alice' }));

        expect(form.nameField).toBeNull();
    });
});

describe('bindModel integration', () => {
    it('child reflects source model updates', () => {
        const model = new MutableModel({ name: 'Alice' });
        const form = new SingleBindingForm('form', model);

        model.set({ name: 'Bob' });

        expect(form.nameField.model.get()).toBe('Bob');
    });

    it('binds Form TextField components to property models', () => {
        class TestForm extends Form<{ name: string; email: string }> {
            @bindModel('name')
            nameField = new TextField<string>('name');

            @bindModel('email')
            emailField = new TextField<string>('email');
        }

        const model = new MutableModel({ name: 'Alice', email: 'alice@example.com' });
        const form = new TestForm('form', model);

        expect(form.nameField.model.get()).toBe('Alice');
        expect(form.emailField.model.get()).toBe('alice@example.com');
    });

    it('binds Label components alongside other fields', () => {
        class LabelForm extends Form<{ title: string }> {
            @bindModel('title')
            titleLabel = new Label('title');
        }

        const form = new LabelForm('form', new StaticModel({ title: 'Hello' }));

        expect(form.titleLabel.model.get()).toBe('Hello');
    });
});
