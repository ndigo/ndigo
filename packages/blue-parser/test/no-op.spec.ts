import { describe, it, expect } from 'vitest';
import noop from '../src/no-op';

describe('noop', () => {
    it('should match nothing and consume nothing', () => {
        const input = 'abc';
        const result = noop.run(input);
        expect(result.isError).toBe(false);
        expect(result.result).toBe(null);
        expect(result.index).toBe(0);
    });

    it('should work in an empty string', () => {
        const result = noop.run('');
        expect(result.isError).toBe(false);
        expect(result.result).toBe(null);
        expect(result.index).toBe(0);
    });
});
