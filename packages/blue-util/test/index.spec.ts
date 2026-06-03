import { describe, test, expect } from 'vitest';

import { is, like } from '@blue/util';

describe('index', function () {
    describe('is', function () {
        test('it should be a function', function () {
            expect(is).toBeInstanceOf(Function);
        });
    });

    describe('like', function () {
        test('it should be a function', function () {
            expect(like).toBeInstanceOf(Function);
        });
    });
});
