import { describe, it } from 'vitest';
import { expectSuccess } from './_expect';
import wildcardExpression from '../src/wildcard-expression';

describe('wildcardExpression', () => {
    it('should parse wildcards', () => {
        expectSuccess(wildcardExpression, 'a*b', '^a.*?b$');
        expectSuccess(wildcardExpression, 'a*b*c', '^a.*?b.*?c$');
    });
});
