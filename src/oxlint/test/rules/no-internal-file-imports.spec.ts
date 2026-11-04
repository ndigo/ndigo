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
            code: "import { Deferred } from '@ndigo/core';",
            filename: '/packages/ndigo-core/src/container.ts',
        },
        {
            code: "import { something } from './_util';",
            filename: '/packages/ndigo-core/src/container.ts',
        },
        {
            code: "import { foo } from '@ndigo/util';",
            filename: '/packages/ndigo-core/src/container.ts',
        },
        {
            code: "import { bar } from '@ndigo/core/container';",
            filename: '/packages/ndigo-core/src/container.ts',
        },
        {
            code: "export * from '@ndigo/http';",
            filename: '/packages/ndigo-core/src/container.ts',
        },
    ],
    invalid: [
        {
            code: "import { foo } from '@ndigo/core/_util';",
            filename: '/packages/ndigo-core/src/container.ts',
            errors: [
                {
                    messageId: 'internalImport',
                    data: {
                        source: '@ndigo/core/_util',
                    },
                },
            ],
        },
        {
            code: "import { bar } from '@ndigo/util/_helpers';",
            filename: '/packages/ndigo-core/src/container.ts',
            errors: [
                {
                    messageId: 'internalImport',
                    data: {
                        source: '@ndigo/util/_helpers',
                    },
                },
            ],
        },
        {
            code: "export { baz } from '@ndigo/http/_internal';",
            filename: '/packages/ndigo-core/src/container.ts',
            errors: [
                {
                    messageId: 'internalImport',
                    data: {
                        source: '@ndigo/http/_internal',
                    },
                },
            ],
        },
        {
            code: "export * from '@ndigo/http/_internal';",
            filename: '/packages/ndigo-core/src/container.ts',
            errors: [
                {
                    messageId: 'internalImport',
                    data: {
                        source: '@ndigo/http/_internal',
                    },
                },
            ],
        },
    ],
});
