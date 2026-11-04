/**
 * @module src/oxlint
 * @since 1.0.0
 * @author Jeff Rose
 */
import { RuleTester } from 'oxlint/plugins-dev';
import { noUpwardLayerImports } from '../../rules/no-upward-layer-imports.ts';

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
        } as RuleTester.ParserOptions,
    },
});

ruleTester.run('no-upward-layer-imports', noUpwardLayerImports, {
    valid: [
        {
            code: "import { Deferred } from '@ndigo/util';",
            filename: '/packages/ndigo-core/src/container.ts',
        },
        {
            // Equal ranks are siblings — free to cross-import.
            code: "import { signal } from '@ndigo/signals';",
            filename: '/packages/ndigo-core/src/container.ts',
        },
        {
            code: "import { X } from '@ndigo/core/container';",
            filename: '/packages/ndigo-core/src/container.ts',
        },
        {
            // Subpaths resolve to the root package (redis rank 6 <= platform-node rank 8).
            code: "import '@ndigo/redis/jobs';",
            filename: '/packages/ndigo-platform-node/src/index.ts',
        },
        {
            // Tooling targets are outside the layer system.
            code: "import { bootApp } from '@ndigo/test';",
            filename: '/packages/ndigo-auth-server/test/flow.spec.ts',
        },
        {
            // Tests may reach across layers — their edges are devDependencies.
            code: "import { HTTPServer } from '@ndigo/platform-node';",
            filename: '/packages/ndigo-boot/test/precedence.spec.ts',
        },
        {
            // Benches may reach across layers too.
            code: "import { X } from '@ndigo/platform-node';",
            filename: '/packages/ndigo-http/bench/query-string.bench.ts',
        },
        {
            // Tooling importers may reach anywhere.
            code: "import { X } from '@ndigo/platform-node';",
            filename: '/packages/ndigo-test/src/mock-http.ts',
        },
        {
            // Files outside packages/ are not layer subjects (apps, root scripts).
            code: "import { X } from '@ndigo/platform-node';",
            filename: '/apps/04-ndigo-api/src/index.ts',
        },
        {
            code: "import './local';",
            filename: '/packages/ndigo-core/src/container.ts',
        },
        {
            // Windows separators parse the same way.
            code: "import { X } from '@ndigo/util';",
            filename: 'C:\\repo\\packages\\ndigo-core\\src\\container.ts',
        },
        {
            // Dynamic imports flow through the same ranks.
            code: "const web = await import('@ndigo/view-webcomponent');",
            filename: '/packages/ndigo-platform-web/src/web-auto-configuration.ts',
        },
        {
            // Non-literal dynamic specifiers are nothing to check.
            code: 'const mod = await import(name);',
            filename: '/packages/ndigo-core/src/container.ts',
        },
    ],
    invalid: [
        {
            code: "import { V } from '@ndigo/view';",
            filename: '/packages/ndigo-core/src/container.ts',
            errors: [
                {
                    messageId: 'upwardImport',
                    data: { source: '@ndigo/view', importer: 'core', importerRank: 1, targetRank: 5 },
                },
            ],
        },
        {
            code: "import { Context } from '@ndigo/context';",
            filename: '/packages/ndigo-http/src/client.ts',
            errors: [
                {
                    messageId: 'upwardImport',
                    data: { source: '@ndigo/context', importer: 'http', importerRank: 3, targetRank: 4 },
                },
            ],
        },
        {
            code: "export * from '@ndigo/platform-node';",
            filename: '/packages/ndigo-core/src/index.ts',
            errors: [
                {
                    messageId: 'upwardImport',
                    data: { source: '@ndigo/platform-node', importer: 'core', importerRank: 1, targetRank: 8 },
                },
            ],
        },
        {
            code: "export { Route } from '@ndigo/dispatcher';",
            filename: '/packages/ndigo-http/src/index.ts',
            errors: [
                {
                    messageId: 'upwardImport',
                    data: { source: '@ndigo/dispatcher', importer: 'http', importerRank: 3, targetRank: 6 },
                },
            ],
        },
        {
            code: "import '@ndigo/platform-node';",
            filename: '/packages/ndigo-util/src/index.ts',
            errors: [
                {
                    messageId: 'upwardImport',
                    data: { source: '@ndigo/platform-node', importer: 'util', importerRank: 0, targetRank: 8 },
                },
            ],
        },
        {
            code: "import { jobQueue } from '@ndigo/redis/jobs';",
            filename: '/packages/ndigo-flags/src/index.ts',
            errors: [
                {
                    messageId: 'upwardImport',
                    data: { source: '@ndigo/redis/jobs', importer: 'flags', importerRank: 3, targetRank: 6 },
                },
            ],
        },
        {
            code: "const mod = await import('@ndigo/platform-node');",
            filename: '/packages/ndigo-core/src/container.ts',
            errors: [
                {
                    messageId: 'upwardImport',
                    data: { source: '@ndigo/platform-node', importer: 'core', importerRank: 1, targetRank: 8 },
                },
            ],
        },
    ],
});
