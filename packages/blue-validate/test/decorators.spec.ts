import { describe, test, expect } from 'vitest';
import { Test } from './testDecorators';

describe('decorators', () => {
    test('it should decorate', () => {
        const test = new Test('bar');

        expect(test).toBeInstanceOf(Test);

        expect(true).toBe(true);
    });
});
