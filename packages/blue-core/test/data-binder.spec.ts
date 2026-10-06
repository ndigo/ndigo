/**
 * @module blue-core
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { DataBinder } from '../src/data-binder';
import { MutablePropertyValues } from '../src/property-value';

describe('DataBinder', () => {
    let db: DataBinder;
    let target: Record<string, unknown>;

    beforeEach(() => {
        target = {};
        db = new DataBinder(target, 'test');
    });

    afterEach(() => {
        db = undefined as unknown as DataBinder;
        target = undefined as unknown as Record<string, unknown>;
    });

    test('it should bind data to empty objects', () => {
        const mpv = new MutablePropertyValues();
        mpv.addPropertyValue('foo', 123);
        mpv.addPropertyValue('bar.qux', 456);
        mpv.addPropertyValue('bar["fuz"]', 789);
        mpv.addPropertyValue('baz[0]', 'abc');
        mpv.addPropertyValue('baz[1]', 'def');
        db.bind(mpv);
        expect(db.result).toEqual({ foo: 123, bar: { qux: 456, fuz: 789 }, baz: ['abc', 'def'] });
    });

    test('it should keep plain-object semantics for plain targets', () => {
        const mpv = new MutablePropertyValues();
        mpv.addPropertyValue('a.b', 1);
        db.bind(mpv);
        expect(db.result).toEqual({ a: { b: 1 } });
        expect(Object.getPrototypeOf(db.result)).toBe(Object.prototype);
        expect(db.result).not.toBe(target);
    });

    test('it should bind into a class instance in place, preserving the prototype', () => {
        class ProfileForm {
            email = '';
            age = 0;
            address = { street: '', city: '' };
        }
        const instance = new ProfileForm();
        const binder = new DataBinder(instance, 'profile');
        const mpv = new MutablePropertyValues();
        mpv.addPropertyValue('email', 'a@b.c');
        mpv.addPropertyValue('age', '42');
        mpv.addPropertyValue('address.street', 'Main St');
        mpv.addPropertyValue('address.city', 'York');
        binder.bind(mpv);

        expect(binder.result).toBe(instance);
        expect(binder.result).toBeInstanceOf(ProfileForm);
        expect(instance).toEqual({ email: 'a@b.c', age: '42', address: { street: 'Main St', city: 'York' } });
    });

    test('it should accept required fields that are present by name', () => {
        db.requiredFields = ['foo', 'bar.qux'];
        const mpv = new MutablePropertyValues();
        mpv.addPropertyValue('foo', 123);
        mpv.addPropertyValue('bar.qux', 456);

        expect(() => db.bind(mpv)).not.toThrow();
        expect(db.result).toEqual({ foo: 123, bar: { qux: 456 } });
    });

    test('it should reject a missing required field by name', () => {
        db.requiredFields = ['foo', 'missing'];
        const mpv = new MutablePropertyValues();
        mpv.addPropertyValue('foo', 123);

        expect(() => db.bind(mpv)).toThrow(/Required field "missing" is missing/);
    });

    test('it should bind array keypaths into instance fields', () => {
        class TagsForm {
            tags: string[] = [];
        }
        const instance = new TagsForm();
        const binder = new DataBinder(instance, 'f');
        const mpv = new MutablePropertyValues();
        mpv.addPropertyValue('tags[0]', 'a');
        mpv.addPropertyValue('tags[1]', 'b');
        binder.bind(mpv);

        expect(binder.result).toBe(instance);
        expect(instance.tags).toEqual(['a', 'b']);
    });
});
