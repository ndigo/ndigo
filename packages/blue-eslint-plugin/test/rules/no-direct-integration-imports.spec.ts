import { RuleTester } from 'oxlint/plugins-dev';
import { noDirectIntegrationImports } from '../../src/rules/no-direct-integration-imports';

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
        },
    },
});

ruleTester.run('no-direct-integration-imports', noDirectIntegrationImports, {
    valid: [
        {
            code: "import * as R from '@blue/util';",
            filename: '/packages/blue-core/src/container.ts',
        },
        {
            code: "import * as R from 'ramda';",
            filename: '/packages/blue-util/src/ramda.ts',
        },
        {
            code: "import * as R from 'ramda';",
            filename: '/packages/blue-core/test/something.spec.ts',
        },
        {
            code: "import { describe } from 'vitest';",
            filename: '/packages/blue-core/src/container.ts',
        },
    ],
    invalid: [
        {
            code: "import * as R from 'ramda';",
            filename: '/packages/blue-core/src/container.ts',
            errors: [
                {
                    messageId: 'directImport',
                    data: {
                        library: 'ramda',
                        integrationLayer: '@blue/util',
                    },
                },
            ],
        },
        {
            code: "import { format } from 'date-fns';",
            filename: '/packages/blue-http/src/query-string.ts',
            errors: [
                {
                    messageId: 'directImport',
                    data: {
                        library: 'date-fns',
                        integrationLayer: '@blue/util',
                    },
                },
            ],
        },
        {
            code: "import { format } from 'date-fns/format';",
            filename: '/packages/blue-http/src/query-string.ts',
            errors: [
                {
                    messageId: 'directImport',
                    data: {
                        library: 'date-fns',
                        integrationLayer: '@blue/util',
                    },
                },
            ],
        },
    ],
});
