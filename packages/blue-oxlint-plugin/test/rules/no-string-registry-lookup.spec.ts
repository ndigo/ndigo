/**
 * @module blue-oxlint-plugin
 * @since 1.0.0
 * @author Jeff Rose
 */
import { RuleTester } from 'oxlint/plugins-dev';
import { noStringRegistryLookup } from '../../src/rules/no-string-registry-lookup';

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            ecmaVersion: 'latest',
        },
    },
});

ruleTester.run('no-string-registry-lookup', noStringRegistryLookup, {
    valid: [
        // Token lookup (ADR-34 D1 canonical form).
        {
            code: `import { CACHE_MANAGER } from '@blue/cache';
                    const manager = context.getValue(CACHE_MANAGER);`,
            filename: '/packages/blue-api/src/cached-report-controller.ts',
        },
        // Dynamic (non-literal) bean name — data-driven lookups stay legal.
        {
            code: `const name = 'bean' + index;
                    const bean = context.getValue(name);`,
            filename: '/packages/blue-api/src/registry.ts',
        },
        // Registration is not a lookup.
        {
            code: `context.setValue('customName', new Bean());`,
            filename: '/packages/blue-api/src/configuration.ts',
        },
        // Test files are exempt (they exercise string registration freely).
        {
            code: `const resolvers = context.getValue<HandlerMethodArgumentResolver[]>('argumentResolvers');`,
            filename: '/packages/blue-platform-node/test/node-auto-configuration.spec.ts',
        },
        // Non-registry method with a string argument.
        {
            code: `cacheManager.getCache('reports').delete('key');`,
            filename: '/packages/blue-api/src/cached-report-controller.ts',
        },
    ],
    invalid: [
        {
            code: `const manager = context.getValue('cacheManager');`,
            filename: '/packages/blue-api/src/cached-report-controller.ts',
            errors: [
                {
                    messageId: 'preferToken',
                },
            ],
        },
        {
            code: `if (applicationContext.hasValue('argumentResolvers')) {
                        applicationContext.getValue('argumentResolvers');
                    }`,
            filename: '/packages/blue-dispatcher/src/route-handler-adapter.ts',
            errors: [
                {
                    messageId: 'preferToken',
                },
                {
                    messageId: 'preferToken',
                },
            ],
        },
        {
            code: `const server = context.getValue<HTTPServer>('httpServer');`,
            filename: '/packages/blue-platform-node/src/http-server.ts',
            errors: [
                {
                    messageId: 'preferToken',
                },
            ],
        },
    ],
});
