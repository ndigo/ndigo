import { describe, test, expect, beforeEach } from 'vitest';
import { NodeEnvironment } from '../src/node-environment';
import { StandardEnvironment } from '@blue/context';

describe('NodeEnvironment', () => {
    beforeEach(() => {
        // Reset process.env to clean state
        Object.keys(process.env).forEach((key) => {
            delete process.env[key];
        });
    });

    test('should extend StandardEnvironment', () => {
        const env = new NodeEnvironment();
        expect(env).toBeInstanceOf(StandardEnvironment);
    });

    test('should include process.env properties', () => {
        process.env.TEST_VAR = 'hello';
        process.env.ANOTHER_VAR = 'world';

        const env = new NodeEnvironment();

        expect(env.getProperty('TEST_VAR')).toBe('hello');
        expect(env.getProperty('ANOTHER_VAR')).toBe('world');
    });

    test('should allow overriding with propertySources', () => {
        process.env.TEST_VAR = 'original';

        const customSource = { TEST_VAR: 'overridden', NEW_VAR: 'new' };
        const env = new NodeEnvironment([customSource]);

        expect(env.getProperty('TEST_VAR')).toBe('overridden');
        expect(env.getProperty('NEW_VAR')).toBe('new');
    });

    test('should prioritize propertySources over process.env', () => {
        process.env.TEST_VAR = 'process-value';
        const customSource = { TEST_VAR: 'source-value' };
        const env = new NodeEnvironment([customSource]);

        // The custom source should override the process.env
        expect(env.getProperty('TEST_VAR')).toBe('source-value');
    });

    test('should handle empty propertySources', () => {
        const env = new NodeEnvironment([]);
        const result = env.getProperty('NONEXISTENT');
        expect(result === null || result === undefined).toBe(true);
    });
});
