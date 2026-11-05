/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { RuleTester } from 'oxlint/plugins-dev';
import { requiresDocHeader } from '../../rules/requires-doc-header.ts';

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
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
`;

ruleTester.run('requires-doc-header', requiresDocHeader, {
    valid: [
        {
            code: `${CANONICAL}export const x = 1;`,
            filename: '/packages/ndigo-core/src/widget.ts',
        },
        // Summary may be omitted; tags are what matter.
        {
            code: `/**
 * @since 1.0.0
 * @author Jeff Rose
 */
export const x = 1;`,
            filename: '/packages/ndigo-core/src/widget.ts',
        },
        // Test files are checked too…
        {
            code: `${CANONICAL}import { x } from '../src/widget';\nit('x', () => x);`,
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
        {
            code: `/**\n * Only a description.\n */\nexport const x = 1;`,
            filename: '/packages/ndigo-core/src/widget.ts',
            errors: [{ messageId: 'missingTags' }],
        },
        {
            code: `/**
 * @since 1.0.0
 */
export const x = 1;`,
            filename: '/apps/ndigo-todo/src/index.ts',
            errors: [{ messageId: 'missingTags' }],
        },
        {
            // Copy-paste artifact: the stray '*' renders in generated docs.
            code: `/**
 * Widget utilities.
 *
 * * @since 1.0.0
 * @author Jeff Rose
 * @author Jeff Rose
 */
export const x = 1;`,
            filename: '/packages/ndigo-core/src/widget.ts',
            errors: [{ messageId: 'malformedTagLine' }],
        },
    ],
});
