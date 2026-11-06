/**
 */
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { $aware, AsAware, AsNameAware, likeAware, likeNameAware } from '../src/aware';

/** Asserts that a fixture initialized in `beforeEach` is present. */
function defined<T>(value: T | undefined): T {
    if (value === undefined) {
        throw new Error('Expected fixture to be defined');
    }
    return value;
}

describe('AsAware', () => {
    class Empty {}

    const AwareEmpty = AsAware(Empty);
    const NameAwareEmpty = AsNameAware(Empty);

    let aware: InstanceType<typeof AwareEmpty> | undefined;
    let nameAware: InstanceType<typeof NameAwareEmpty> | undefined;

    beforeEach(() => {
        aware = new AwareEmpty();
        nameAware = new NameAwareEmpty();
    });

    afterEach(() => {
        aware = nameAware = undefined;
    });

    test('it should create aware instances', () => {
        const a = defined(aware);
        const n = defined(nameAware);

        expect(Reflect.get(a, $aware)).toBe(true);
        expect(Reflect.get(n, $aware)).toBe(true);

        n.setName('test');

        expect(n).toHaveProperty('name', 'test');

        expect(likeAware(a)).toBe(true);
        expect(likeAware(n)).toBe(true);
        expect(likeNameAware(a)).toBe(false);
        expect(likeNameAware(n)).toBe(true);
    });
});
