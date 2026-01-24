import { describe, test, expect } from 'vitest';
import fingerprint from '../src';

describe('fingerprint', () => {
    test('it should provide a unique signature', async () => {
        const result = await fingerprint;
        expect(result).toBeInstanceOf(Array);
    });
});
