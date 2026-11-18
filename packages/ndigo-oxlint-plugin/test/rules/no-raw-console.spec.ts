/**
 */
import { RuleTester } from 'oxlint/plugins-dev';
import { noRawConsole } from '../../src/rules/no-raw-console';

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            ecmaVersion: 'latest',
        } as RuleTester.ParserOptions,
    },
});

ruleTester.run('no-raw-console', noRawConsole, {
    valid: [
        // Flat consumer layout: the rule is layout-blind by design.
        {
            code: `logger.warn('deprecated');`,
            filename: '/app/src/server.ts',
        },
        // Console methods outside the default set stay free.
        {
            code: `console.info('ready');`,
            filename: '/app/src/server.ts',
        },
        // Computed access is not resolved; the rule never guesses the method.
        {
            code: `console['log']('ready');`,
            filename: '/app/src/server.ts',
        },
        // A caller-supplied method list replaces the default set.
        {
            code: `console.log('ready');`,
            filename: '/app/src/server.ts',
            options: [{ methods: ['debug'] }],
        },
    ],
    invalid: [
        {
            code: `console.log('ready');`,
            filename: '/app/src/server.ts',
            errors: [{ messageId: 'rawConsole' }],
        },
        {
            code: `console.warn('slow');`,
            filename: '/app/src/jobs/cleanup.ts',
            errors: [{ messageId: 'rawConsole' }],
        },
        {
            code: `console.error('failed');`,
            filename: '/app/src/main.ts',
            errors: [{ messageId: 'rawConsole' }],
        },
        {
            code: `console.debug('trace');`,
            filename: '/app/src/main.ts',
            options: [{ methods: ['debug'] }],
            errors: [{ messageId: 'rawConsole' }],
        },
    ],
});
