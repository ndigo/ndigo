/**
 * @module blue-oxlint-plugin
 * @since 1.0.0
 * @author Jeff Rose
 */
import { RuleTester } from 'oxlint/plugins-dev';
import { noUppercaseRegexpConstants } from '../../src/rules/no-uppercase-regexp-constants';

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
        } as RuleTester.ParserOptions,
    },
});

ruleTester.run('no-uppercase-regexp-constants', noUppercaseRegexpConstants, {
    valid: [
        // camelCase regex constant (correct pattern)
        {
            code: 'const findByPattern = /^findBy([A-Z][A-Za-z0-9]*)$/;',
            filename: '/packages/blue-orm/src/repository.ts',
        },
        // lowercase regex constant
        {
            code: 'const uuidPattern = /^[0-9a-fA-F-]+$/;',
            filename: '/packages/blue-core/src/converter.ts',
        },
        // UPPER_SNAKE_CASE non-regex constants are fine (primitives)
        {
            code: 'const MAX_BODY_BYTES = 1048576;',
            filename: '/packages/blue-platform-node/src/limits.ts',
        },
        {
            code: 'export const DEFAULT_TIMEOUT_MS = 10_000;',
            filename: '/packages/blue-platform-node/src/limits.ts',
        },
        // RegExp via new RegExp() does not match the regex-literal convention check
        {
            code: 'const PATTERN = new RegExp("x");',
            filename: '/packages/blue-core/src/util.ts',
        },
        // let/var uppercase initializers from function calls
        {
            code: 'let TIMEOUT = computeTimeout();',
            filename: '/packages/blue-core/src/util.ts',
        },
    ],
    invalid: [
        {
            code: 'const FIND_BY = /^findBy([A-Z][A-Za-z0-9]*)$/;',
            filename: '/packages/blue-orm/src/repository.ts',
            errors: [{ messageId: 'uppercaseRegexp' }],
        },
        {
            code: 'export const UUID_PATTERN = /^[0-9a-fA-F-]+$/;',
            filename: '/packages/blue-core/src/converter.ts',
            errors: [{ messageId: 'uppercaseRegexp' }],
        },
        {
            code: 'const CROSS_PACKAGE_PATTERN = /^@blue\\/[^/]+\\/_/u;',
            filename: '/packages/blue-eslint-plugin/src/rules/no-internal-file-imports.ts',
            errors: [{ messageId: 'uppercaseRegexp' }],
        },
    ],
});
