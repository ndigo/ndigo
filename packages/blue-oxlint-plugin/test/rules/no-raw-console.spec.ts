/**
 * @module blue-oxlint-plugin
 * @since 1.0.0
 * @author Jeff Rose
 */
import { RuleTester } from 'oxlint/plugins-dev';
import { noRawConsole } from '../../src/rules/no-raw-console';

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
        } as RuleTester.ParserOptions,
    },
});

ruleTester.run('no-raw-console', noRawConsole, {
    valid: [
        // `@blue/log` is the console bridge itself — allow-listed.
        {
            code: `console.warn('fallback');`,
            filename: '/packages/blue-log/src/logger/console-logger.ts',
        },
        {
            code: `console.error('boom');`,
            filename: '/packages/blue-log/src/logger/console-logger.ts',
        },
        // `@blue/util` is the documented leaf exception — allow-listed.
        {
            code: `console.warn('no crypto, using Math.random');`,
            filename: '/packages/blue-util/src/math/random.ts',
        },
        // Test files legitimately spy on the console.
        {
            code: `console.error('expected');`,
            filename: '/packages/blue-router/test/router.spec.ts',
        },
        // Specs co-located under `src` are exempt too.
        {
            code: `console.log('debug');`,
            filename: '/packages/blue-router/src/router.spec.ts',
        },
        // Non-package source is out of scope (the rule targets package src).
        {
            code: `console.log('ready');`,
            filename: '/apps/blue-api/src/main.ts',
        },
        // `console.debug`/`console.info` are not in the banned set.
        {
            code: `console.debug('trace');`,
            filename: '/packages/blue-router/src/router.ts',
        },
        // A reference that is not a call site is not reported.
        {
            code: `const emit = console.error;`,
            filename: '/packages/blue-router/src/router.ts',
        },
        // A member of a non-console object is unrelated.
        {
            code: `logger.warn('through @blue/log');`,
            filename: '/packages/blue-router/src/router.ts',
        },
    ],
    invalid: [
        {
            code: `console.error('boom');`,
            filename: '/packages/blue-router/src/router.ts',
            errors: [
                {
                    messageId: 'rawConsole',
                    data: { method: 'error' },
                },
            ],
        },
        {
            code: `console.warn('called again');`,
            filename: '/packages/blue-telemetry-web/src/browser-config.ts',
            errors: [
                {
                    messageId: 'rawConsole',
                    data: { method: 'warn' },
                },
            ],
        },
        {
            code: `if (debug) console.log('value', value);`,
            filename: '/packages/blue-http/src/query-string.ts',
            errors: [
                {
                    messageId: 'rawConsole',
                    data: { method: 'log' },
                },
            ],
        },
        {
            code: `console.log('a'); console.error('b');`,
            filename: '/packages/blue-core/src/trace.ts',
            errors: [
                {
                    messageId: 'rawConsole',
                    data: { method: 'log' },
                },
                {
                    messageId: 'rawConsole',
                    data: { method: 'error' },
                },
            ],
        },
    ],
});
