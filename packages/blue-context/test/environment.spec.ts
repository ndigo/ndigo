import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { StandardEnvironment } from '../src/environment';

describe('StandardEnvironment', () => {
    const jsonData1 = { a: 1, b: 2, c: 3 };
    let env: StandardEnvironment;

    beforeEach(() => {
        env = new StandardEnvironment();
        env.activeProfiles = ['foo', 'bar'];
        env.propertySources.push(jsonData1);
    });

    afterEach(() => {
        env = void 0 as any;
    });

    test('it should track active profiles', () => {
        expect(env.activeProfiles).toContain('foo');
        expect(env.activeProfiles).toContain('bar');
        expect(env.activeProfiles).toHaveLength(2);

        expect(env.activeProfiles).not.toContain('qux');
        env.addActiveProfile('qux');
        expect(env.activeProfiles).toContain('qux');
        expect(env.activeProfiles).toHaveLength(3);

        env.activeProfiles = ['baz'];
        expect(env.activeProfiles).toContain('baz');
        expect(env.activeProfiles).not.toContain('foo');
        expect(env.activeProfiles).not.toContain('bar');
        expect(env.activeProfiles).not.toContain('qux');
        expect(env.activeProfiles).toHaveLength(1);
    });
});
