import { describe, test, expect } from 'vitest';
import noop from '../src/no-op';

describe('noop', function () {
    test('it should match nothing and consume nothing', function () {
        const input = 'abc';
        const result = noop.run(input);
        expect(result.isError).toBe(false);
        expect(result.result).toBe(null);
        expect(result.index).toBe(0);
    });

    test('it should work in an empty string', function () {
        const result = noop.run('');
        expect(result.isError).toBe(false);
        expect(result.result).toBe(null);
        expect(result.index).toBe(0);
    });
});
