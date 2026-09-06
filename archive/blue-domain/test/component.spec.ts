import '@tsmetadata/polyfill';
import { describe, expect, test } from 'vitest';
import { z } from 'zod';
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

    test('it should return isValid:true when no validation schemas exist', () => {
        const component = new GenericDomainComponent();
        component.init('test');
        const result = component.validate();
        expect(result.isValid).toBe(true);
        expect(result.failedProperties.size).toBe(0);
    });

    test('it should detect validation failures on constrained subclass fields', () => {
        class ProfileComponent extends GenericDomainComponent {
            username: string = '';

            get validationSchemas(): Record<string, z.ZodType> {
                return { create: z.object({ username: z.string().regex(/^[a-z]+$/) }) };
            }
        }

        const c = new ProfileComponent();
        c.init('profile');
        c.username = 'INVALID123';
        const result = c.validate({ groups: ['create'] });
        expect(result.isValid).toBe(false);
        expect(result.failedProperties.has('username')).toBe(true);
    });

    test('it should return isValid:true when constrained fields pass', () => {
        class ProfileComponent extends GenericDomainComponent {
            username: string = 'alice';

            get validationSchemas(): Record<string, z.ZodType> {
                return { create: z.object({ username: z.string().regex(/^[a-z]+$/) }) };
            }
        }

        const c = new ProfileComponent();
        c.init('profile');
        const result = c.validate({ groups: ['create'] });
        expect(result.isValid).toBe(true);
    });

    test('it should set destroyed to true after destroy()', async () => {
        const component = new GenericDomainComponent();
        component.init('to-destroy');
        expect(component.destroyed).toBe(false);
        await component.destroy();
        expect(component.destroyed).toBe(true);
    });

    test('it should emit "destroy" event before clearing listeners', async () => {
        const component = new GenericDomainComponent();
        component.init('to-destroy-2');
        let fired = false;
        component.on('destroy', () => {
            fired = true;
        });
        await component.destroy();
        expect(fired).toBe(true);
    });

    test('it should be idempotent — calling destroy() twice should not throw', async () => {
        const component = new GenericDomainComponent();
        component.init('idempotent');
        await component.destroy();
        await expect(component.destroy()).resolves.toBeUndefined();
    });
});
