import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { $aware, AsAware, AsNameAware, likeAware, likeNameAware } from '../src/aware';

describe('AsAware', () => {
    class Empty {}

    const AwareEmpty = AsAware(Empty);
    const NameAwareEmpty = AsNameAware(Empty);

    let aware: any;
    let nameAware: any;

    beforeEach(() => {
        aware = new AwareEmpty();
        nameAware = new NameAwareEmpty();
    });

    afterEach(() => {
        aware = nameAware = undefined;
    });

    test('it should create aware instances', () => {
        expect(aware).toHaveProperty($aware, true);
        expect(nameAware).toHaveProperty($aware, true);

        nameAware.setName('test');

        expect(nameAware).toHaveProperty('name', 'test');

        expect(likeAware(aware)).toBe(true);
        expect(likeAware(nameAware)).toBe(true);
        expect(likeNameAware(aware)).toBe(false);
        expect(likeNameAware(nameAware)).toBe(true);
    });
});
