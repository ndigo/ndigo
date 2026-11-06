/**
 * Spec for the tsdoc-syntax rule.
 */
import { RuleTester } from 'oxlint/plugins-dev';
import { tsdocSyntax } from '../../rules/tsdoc-syntax.ts';

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
        } as RuleTester.ParserOptions,
    },
});

ruleTester.run('tsdoc-syntax', tsdocSyntax, {
    valid: [
        // Clean standard TSDoc.
        {
            code: `/**
 * Widget utilities.
 *
 * @param value - The value.
 * @returns The result.
 */
export const x = (value: number) => value;`,
            filename: '/packages/ndigo-core/src/widget.ts',
        },
        // Non-doc block comments are ignored.
        {
            code: `/* not a doc block */\nexport const x = 1;`,
            filename: '/packages/ndigo-core/src/widget.ts',
        },
        // Line comments are ignored.
        {
            code: `// @since 1.0.0\nexport const x = 1;`,
            filename: '/packages/ndigo-core/src/widget.ts',
        },
    ],
    invalid: [
        {
            code: `/**
 * Widget utilities.
 *
 * @since 1.0.0
 */
export const x = 1;`,
            filename: '/packages/ndigo-core/src/widget.ts',
            errors: [{ messageId: 'tsdocSyntax' }],
        },
        {
            code: `/**
 * Widget utilities.
 *
 * @param {string} name desc
 */
export const x = (name: string) => name;`,
            filename: '/packages/ndigo-core/src/widget.ts',
            errors: 2,
        },
        {
            code: `/**
 * Widget utilities with a stray brace: {foo}
 */
export const x = 1;`,
            filename: '/packages/ndigo-core/src/widget.ts',
            errors: 2,
        },
        {
            code: `/**
 * Widget utilities.
 *
 * {@link Foo
 */
export const x = 1;`,
            filename: '/packages/ndigo-core/src/widget.ts',
            errors: [{ messageId: 'tsdocSyntax' }],
        },
    ],
});
