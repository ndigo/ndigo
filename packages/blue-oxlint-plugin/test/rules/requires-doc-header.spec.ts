/**
 * @module blue-oxlint-plugin
 * @since 1.0.0
 * @author Jeff Rose
 */
import { RuleTester } from 'oxlint/plugins-dev';
import { requiresDocHeader } from '../../src/rules/requires-doc-header';

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
        },
    },
});

const CANONICAL = `/**
 * Widget utilities.
 *
 * @module blue-core
 * @since 1.0.0
 * @author Jeff Rose
 */
`;

ruleTester.run('requires-doc-header', requiresDocHeader, {
    valid: [
        {
            code: `${CANONICAL}export const x = 1;`,
            filename: '/packages/blue-core/src/widget.ts',
        },
        // Summary may be omitted; tags are what matter.
        {
            code: `/**
 * @module blue-core
 * @since 1.0.0
 * @author Jeff Rose
 */
export const x = 1;`,
            filename: '/packages/blue-core/src/widget.ts',
        },
        // Test files are checked too…
        {
            code: `${CANONICAL}import { x } from '../src/widget';\nit('x', () => x);`,
            filename: '/packages/blue-core/test/widget.spec.ts',
        },
        // …but build configs and non-source locations are exempt.
        {
            code: 'export default { test: 1 };',
            filename: '/packages/blue-core/vitest.config.ts',
        },
        {
            code: 'console.log("no header needed");',
            filename: '/scripts/build.mjs',
        },
    ],
    invalid: [
        {
            code: 'export const x = 1;',
            filename: '/packages/blue-core/src/widget.ts',
            errors: [{ messageId: 'missingHeader' }],
        },
        {
            code: `/**\n * Only a description.\n */\nexport const x = 1;`,
            filename: '/packages/blue-core/src/widget.ts',
            errors: [{ messageId: 'missingTags' }],
        },
        {
            code: `/**
 * @module blue-core
 */
export const x = 1;`,
            filename: '/apps/blue-todo/src/index.ts',
            errors: [{ messageId: 'missingTags' }],
        },
    ],
});
