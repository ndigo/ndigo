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
            code: "export { foo } from './_helpers';",
            filename: '/packages/blue-util/src/index.ts',
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
    ],
});
