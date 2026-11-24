/**
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
            code: "import { aiSdkModel } from '@ndigo/ai-sdk';",
            filename: '/packages/ndigo-core/src/container.ts',
        },
        {
            code: "import { generateText } from 'ai';",
            filename: '/packages/ndigo-ai-sdk/src/model.ts',
        },
        {
            code: "import { encode as encodeReference } from '@toon-format/toon';",
            filename: '/packages/ndigo-view-toon/src/toon-encode.ts',
        },
        {
            code: "import { signal } from '@preact/signals-core';",
            filename: '/packages/ndigo-signals/src/index.ts',
        },
        {
            code: "import { generateText } from 'ai';",
            filename: '/packages/ndigo-core/test/something.spec.ts',
        },
        {
            code: "import { describe } from 'vitest';",
            filename: '/packages/ndigo-core/src/container.ts',
        },
        {
            code: 'async function load(name: string) { return await import(name); }',
            filename: '/packages/ndigo-core/src/container.ts',
        },
    ],
    invalid: [
        {
            code: "import { generateText } from 'ai';",
            filename: '/packages/ndigo-core/src/container.ts',
            errors: [
                {
                    messageId: 'directImport',
                    data: {
                        library: 'ai',
                        integrationLayer: '@ndigo/ai-sdk',
                    },
                },
            ],
        },
        {
            code: "import { encode } from '@toon-format/toon';",
            filename: '/packages/ndigo-core/src/container.ts',
            errors: [
                {
                    messageId: 'directImport',
                    data: {
                        library: '@toon-format/toon',
                        integrationLayer: '@ndigo/boot or @ndigo/view-toon',
                    },
                },
            ],
        },
        {
            code: "import { generateText } from 'ai/rsc';",
            filename: '/packages/ndigo-view/src/renderer.ts',
            errors: [
                {
                    messageId: 'directImport',
                    data: {
                        library: 'ai',
                        integrationLayer: '@ndigo/ai-sdk',
                    },
                },
            ],
        },
        {
            code: "export * from 'ai';",
            filename: '/packages/ndigo-core/src/container.ts',
            errors: [
                {
                    messageId: 'directImport',
                    data: {
                        library: 'ai',
                        integrationLayer: '@ndigo/ai-sdk',
                    },
                },
            ],
        },
        {
            code: "export { generateText } from 'ai';",
            filename: '/packages/ndigo-core/src/container.ts',
            errors: [
                {
                    messageId: 'directImport',
                    data: {
                        library: 'ai',
                        integrationLayer: '@ndigo/ai-sdk',
                    },
                },
            ],
        },
        {
            code: "async function load() { return await import('@toon-format/toon'); }",
            filename: '/packages/ndigo-core/src/container.ts',
            errors: [
                {
                    messageId: 'directImport',
                    data: {
                        library: '@toon-format/toon',
                        integrationLayer: '@ndigo/boot or @ndigo/view-toon',
                    },
                },
            ],
        },
        {
            code: "async function load() { return await import('@preact/signals-core'); }",
            filename: '/packages/ndigo-core/src/container.ts',
            errors: [
                {
                    messageId: 'directImport',
                    data: {
                        library: '@preact/signals-core',
                        integrationLayer: '@ndigo/signals',
                    },
                },
            ],
        },
    ],
});
