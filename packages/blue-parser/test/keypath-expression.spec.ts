import { describe, it, expect, test } from 'vitest';
import { expectSuccess } from './_expect';
import keypathExpression from '../src/keypath-expression';

describe('keypathExpression', function () {
    test('it should handle identifiers', function () {
        expectSuccess(keypathExpression, 'hello', ['hello']);
    });

    test('it should handle static member expressions', function () {
        expectSuccess(keypathExpression, 'foo.bar.qux.baz', ['foo', 'bar', 'qux', 'baz']);
    });

    test('it should handle computed member expressions', function () {
        expectSuccess(keypathExpression, 'foo["bar"]', ['foo', 'bar']);
        expectSuccess(keypathExpression, 'foo[0][1]', ['foo', 0, 1]);
    });
});
