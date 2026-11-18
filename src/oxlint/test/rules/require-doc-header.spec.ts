/**
 * Spec for the require-doc-header rule (summary-only, src-only).
 */
import { RuleTester } from 'oxlint/plugins-dev';
import { requireDocHeader } from '../../rules/require-doc-header.ts';

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
        } as RuleTester.ParserOptions,
    },
});

const CANONICAL = `/**
 * Widget utilities.
 */
`;

ruleTester.run('require-doc-header', requireDocHeader, {
    valid: [
        {
            code: `${CANONICAL}export const x = 1;`,
            filename: '/packages/ndigo-core/src/widget.ts',
        },
        // Test files are exempt.
        {
            code: 'export const x = 1;',
            filename: '/packages/ndigo-core/test/widget.spec.ts',
        },
        // …but build configs and non-source locations are exempt.
        {
            code: 'export default { test: 1 };',
            filename: '/packages/ndigo-core/vitest.config.ts',
        },
        {
            code: 'console.log("no header needed");',
            filename: '/scripts/build.mjs',
        },
    ],
    invalid: [
        {
            code: 'export const x = 1;',
            filename: '/packages/ndigo-core/src/widget.ts',
            errors: [{ messageId: 'missingHeader' }],
        },
    ],
});
