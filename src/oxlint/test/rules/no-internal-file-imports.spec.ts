/**
 * @module src/oxlint
 * @since 1.0.0
 * @author Jeff Rose
 */
import { RuleTester } from 'oxlint/plugins-dev';
import { noInternalFileImports } from '../../rules/no-internal-file-imports.ts';

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
        } as RuleTester.ParserOptions,
    },
});

ruleTester.run('no-internal-file-imports', noInternalFileImports, {
    valid: [
        {
            code: "import { Deferred } from '@blue/core';",
            filename: '/packages/blue-core/src/container.ts',
        },
        {
            code: "import { something } from './_util';",
            filename: '/packages/blue-core/src/container.ts',
        },
        {
            code: "import { foo } from '@blue/util';",
            filename: '/packages/blue-core/src/container.ts',
        },
        {
            code: "import { bar } from '@blue/core/container';",
            filename: '/packages/blue-core/src/container.ts',
        },
        {
            code: "export * from '@blue/http';",
            filename: '/packages/blue-core/src/container.ts',
        },
    ],
    invalid: [
        {
            code: "import { foo } from '@blue/core/_util';",
            filename: '/packages/blue-core/src/container.ts',
            errors: [
                {
                    messageId: 'internalImport',
                    data: {
                        source: '@blue/core/_util',
                    },
                },
            ],
        },
        {
            code: "import { bar } from '@blue/util/_helpers';",
            filename: '/packages/blue-core/src/container.ts',
            errors: [
                {
                    messageId: 'internalImport',
                    data: {
                        source: '@blue/util/_helpers',
                    },
                },
            ],
        },
        {
            code: "export { baz } from '@blue/http/_internal';",
            filename: '/packages/blue-core/src/container.ts',
            errors: [
                {
                    messageId: 'internalImport',
                    data: {
                        source: '@blue/http/_internal',
                    },
                },
            ],
        },
        {
            code: "export * from '@blue/http/_internal';",
            filename: '/packages/blue-core/src/container.ts',
            errors: [
                {
                    messageId: 'internalImport',
                    data: {
                        source: '@blue/http/_internal',
                    },
                },
            ],
        },
    ],
});
