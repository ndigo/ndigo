import { describe, expect, test } from 'vitest';
import { GenericDomainComponent } from '../src/component';

describe('GenericDomainComponent', () => {
    test('it should initialize name and toString value', () => {
        const component = new GenericDomainComponent();
        component.init('profile');

        expect(component.name).toBe('profile');
        expect(component.toString()).toBe('profile');
    });

    test('it should generate unique ids', () => {
        const first = new GenericDomainComponent();
        first.init('first');

        const second = new GenericDomainComponent();
        second.init('second');

        expect(first.id).not.toBe(second.id);
    });

    test('it should serialize component metadata to json', () => {
        const component = new GenericDomainComponent();
        component.init('json-component');

        expect(component.toJSON()).toEqual({
            id: component.id,
            name: 'json-component',
        });
    });

    test('it should expose Symbol.toStringTag', () => {
        const component = new GenericDomainComponent();
        component.init('tagged');

        expect(component[Symbol.toStringTag]).toBe('DomainComponent:tagged');
    });
});
