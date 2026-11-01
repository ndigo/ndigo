/**
 * @module blue-oxlint-plugin
 * @since 1.0.0
 * @author Jeff Rose
 */
import { RuleTester } from 'oxlint/plugins-dev';
import { noDirectIntegrationImports } from '../../src/rules/no-direct-integration-imports';

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
        } as RuleTester.ParserOptions,
    },
});

ruleTester.run('no-direct-integration-imports', noDirectIntegrationImports, {
    valid: [
        {
            code: "import { createDOMProvider } from '@blue/dom';",
            filename: '/packages/blue-core/src/container.ts',
        },
        {
            code: "import { parseHTML } from 'linkedom';",
            filename: '/packages/blue-dom/src/linkedom-dom-provider.ts',
        },
        {
            code: "import { parseHTML } from 'linkedom';",
            filename: '/packages/blue-core/test/something.spec.ts',
        },
        {
            code: "import { describe } from 'vitest';",
            filename: '/packages/blue-core/src/container.ts',
        },
    ],
    invalid: [
        {
            code: "import { parseHTML } from 'linkedom';",
            filename: '/packages/blue-core/src/container.ts',
            errors: [
                {
                    messageId: 'directImport',
                    data: {
                        library: 'linkedom',
                        integrationLayer: '@blue/dom',
                    },
                },
            ],
        },
        {
            code: "import { parseHTML } from 'linkedom/worker';",
            filename: '/packages/blue-view/src/renderer.ts',
            errors: [
                {
                    messageId: 'directImport',
                    data: {
                        library: 'linkedom',
                        integrationLayer: '@blue/dom',
                    },
                },
            ],
        },
    ],
});
