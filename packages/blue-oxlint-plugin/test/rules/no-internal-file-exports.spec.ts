/**
 * @module blue-oxlint-plugin
 * @since 1.0.0
 * @author Jeff Rose
 */
import { RuleTester } from 'oxlint/plugins-dev';
import { noInternalFileExports } from '../../src/rules/no-internal-file-exports';

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
        },
    },
});

ruleTester.run('no-internal-file-exports', noInternalFileExports, {
    valid: [
        {
            code: "export * from './container';",
            filename: '/packages/blue-core/src/index.ts',
        },
        {
            code: "export * from './_util';",
            filename: '/packages/blue-core/src/something.ts',
        },
        {
            code: "export { foo } from './deferred';",
            filename: '/packages/blue-core/src/index.ts',
        },
        {
            code: "export * from './_helpers';",
            filename: '/packages/blue-core/test/index.ts',
        },
        {
            code: 'const foo = 1;\nexport { foo };',
            filename: '/packages/blue-core/src/index.ts',
        },
        // A sub-barrel under `src/` is also a public API entry point (TOL-F2).
        {
            code: "export * from './registry';",
            filename: '/packages/blue-telemetry/src/metrics/index.ts',
        },
        // A two-level nested barrel re-exporting a public module is fine (RES-D).
        {
            code: "export * from './registry';",
            filename: '/packages/blue-telemetry/src/metrics/http/index.ts',
        },
    ],
    invalid: [
        {
            code: "export * from './_util';",
            filename: '/packages/blue-core/src/index.ts',
            errors: [
                {
                    messageId: 'internalExport',
                    data: {
                        source: './_util',
                    },
                },
            ],
        },
        {
            code: "export * from './_constants';",
            filename: '/packages/blue-factory/src/index.ts',
            errors: [
                {
                    messageId: 'internalExport',
                    data: {
                        source: './_constants',
                    },
                },
            ],
        },
        {
            code: "export { foo } from './_helpers';",
            filename: '/packages/blue-util/src/index.ts',
            errors: [
                {
                    messageId: 'internalExport',
                    data: {
                        source: './_helpers',
                    },
                },
            ],
        },
        // A two-level nested barrel re-exporting an internal file is flagged (RES-D).
        {
            code: "export * from './_x';",
            filename: '/packages/blue-telemetry/src/metrics/http/index.ts',
            errors: [
                {
                    messageId: 'internalExport',
                    data: {
                        source: './_x',
                    },
                },
            ],
        },
    ],
});
