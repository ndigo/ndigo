import { describe, it, expect } from 'vitest';
import { expectSuccess } from './_expect';
import keypathExpression from '../src/keypath-expression';

describe('keypathExpression', () => {
    it('should handle identifiers', () => {
        expectSuccess(keypathExpression, 'hello', ['hello']);
    });

    it('should handle static member expressions', () => {
        expectSuccess(keypathExpression, 'foo.bar.qux.baz', ['foo', 'bar', 'qux', 'baz']);
    });

    it('should handle computed member expressions', () => {
        expectSuccess(keypathExpression, 'foo["bar"]', ['foo', 'bar']);
        expectSuccess(keypathExpression, 'foo[0][1]', ['foo', 0, 1]);
    });
});
