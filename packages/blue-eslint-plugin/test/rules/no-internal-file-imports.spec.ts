/** @author opencode */

import { RuleTester } from 'oxlint/plugins-dev';
import { noInternalFileImports } from '../../src/rules/no-internal-file-imports';

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
        },
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
            code: "export { baz } from '@blue/model/_internal';",
            filename: '/packages/blue-core/src/container.ts',
            errors: [
                {
                    messageId: 'internalImport',
                    data: {
                        source: '@blue/model/_internal',
                    },
                },
            ],
        },
    ],
});
