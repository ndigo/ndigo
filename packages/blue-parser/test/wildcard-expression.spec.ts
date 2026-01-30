import { describe, it, expect, test } from 'vitest';
import { expectSuccess } from './_expect';
import wildcardExpression from '../src/wildcard-expression';

describe('wildcardExpression', function () {
    test('it should parse wildcards', function () {
        expectSuccess(wildcardExpression, 'a*b', '^a.*?b$');
        expectSuccess(wildcardExpression, 'a*b*c', '^a.*?b.*?c$');
    });
});
