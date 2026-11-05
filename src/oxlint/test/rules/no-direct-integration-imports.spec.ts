/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { RuleTester } from 'oxlint/plugins-dev';
import { noDirectIntegrationImports } from '../../rules/no-direct-integration-imports.ts';

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
            code: "import { createDOMProvider } from '@ndigo/dom';",
            filename: '/packages/ndigo-core/src/container.ts',
        },
        {
            code: "import { parseHTML } from 'linkedom';",
            filename: '/packages/ndigo-dom/src/linkedom-dom-provider.ts',
        },
        {
            code: "import { parseHTML } from 'linkedom';",
            filename: '/packages/ndigo-core/test/something.spec.ts',
        },
        {
            code: "import { describe } from 'vitest';",
            filename: '/packages/ndigo-core/src/container.ts',
        },
    ],
    invalid: [
        {
            code: "import { parseHTML } from 'linkedom';",
            filename: '/packages/ndigo-core/src/container.ts',
            errors: [
                {
                    messageId: 'directImport',
                    data: {
                        library: 'linkedom',
                        integrationLayer: '@ndigo/dom',
                    },
                },
            ],
        },
        {
            code: "import { parseHTML } from 'linkedom/worker';",
            filename: '/packages/ndigo-view/src/renderer.ts',
            errors: [
                {
                    messageId: 'directImport',
                    data: {
                        library: 'linkedom',
                        integrationLayer: '@ndigo/dom',
                    },
                },
            ],
        },
    ],
});
