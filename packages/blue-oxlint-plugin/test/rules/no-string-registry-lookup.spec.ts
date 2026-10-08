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
        } as RuleTester.ParserOptions,
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
        // Re-exported alias (imported constant) — cannot prove it is a raw
        // string across modules, so it must not be flagged.
        {
            code: `import { SCHEDULER_BEAN } from '@blue/scheduler';
                    const scheduler = context.getValue(SCHEDULER_BEAN);`,
            filename: '/packages/blue-api/src/cached-report-controller.ts',
        },
        // Token alias of a string (a const whose initializer is not a raw
        // string literal) is not provably a raw-string lookup.
        {
            code: `const BASE = new ContextToken<string>('httpServer');
                    const server = context.getValue(BASE);`,
            filename: '/packages/blue-api/src/cached-report-controller.ts',
        },
        // A parameter shadows an outer string const — resolves to the param,
        // not the const, so no false positive.
        {
            code: `const BEAN = 'cacheManager';
                    function resolve(context, BEAN) {
                        return context.getValue(BEAN);
                    }`,
            filename: '/packages/blue-api/src/cached-report-controller.ts',
        },
        // let/var are reassignable — never provably a raw-string lookup.
        {
            code: `let BEAN = 'cacheManager';
                    const manager = context.getValue(BEAN);`,
            filename: '/packages/blue-api/src/cached-report-controller.ts',
        },
        // Import-namespace member — unresolved, must not be flagged.
        {
            code: `import * as beans from './beans';
                    const manager = context.getValue(beans.CACHE_MANAGER);`,
            filename: '/packages/blue-api/src/cached-report-controller.ts',
        },
        // A string const that is later reassigned via a catch/block shadow is
        // resolved to the shadow, not the outer const.
        {
            code: `const BEAN = 'cacheManager';
                    try {
                        risky();
                    } catch (BEAN) {
                        context.getValue(BEAN);
                    }`,
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
        // Identifier const initialized directly from a string literal — the
        // ADR-34 identifier gap the rule now closes.
        {
            code: `const TASK_SCHEDULER_NAME = 'taskScheduler';
                    const scheduler = context.getValue(TASK_SCHEDULER_NAME);`,
            filename: '/packages/blue-scheduler/src/schedule-registry.ts',
            errors: [
                {
                    messageId: 'preferToken',
                },
            ],
        },
        // const string used through a function-local reference.
        {
            code: `function resolve(context) {
                        const BEAN = 'argumentResolvers';
                        return context.getValue(BEAN);
                    }`,
            filename: '/packages/blue-dispatcher/src/route-handler-adapter.ts',
            errors: [
                {
                    messageId: 'preferToken',
                },
            ],
        },
        // Also catches hasValue/getInstance/destroyValue identifier lookups.
        {
            code: `const BEAN = 'cacheManager';
                    if (context.hasValue(BEAN)) {
                        context.destroyValue(BEAN);
                    }`,
            filename: '/packages/blue-api/src/cached-report-controller.ts',
            errors: [
                {
                    messageId: 'preferToken',
                },
                {
                    messageId: 'preferToken',
                },
            ],
        },
        // Multiple const strings, each lookup resolved to its own binding.
        {
            code: `const HTTP = 'httpServer';
                    const ROUTES = 'routeHandler';
                    context.getValue(HTTP);
                    context.getValue(ROUTES);`,
            filename: '/packages/blue-platform-node/src/http-server.ts',
            errors: [
                {
                    messageId: 'preferToken',
                },
                {
                    messageId: 'preferToken',
                },
            ],
        },
    ],
});
