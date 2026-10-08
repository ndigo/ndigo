/**
 * @module blue-oxlint-plugin
 * @since 1.0.0
 * @author Jeff Rose
 */
import { RuleTester } from 'oxlint/plugins-dev';
import { noCrossParadigmDecorators } from '../../src/rules/no-cross-paradigm-decorators';

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
        } as RuleTester.ParserOptions,
    },
});

ruleTester.run('no-cross-paradigm-decorators', noCrossParadigmDecorators, {
    valid: [
        // Server controller: only mapping decorators
        {
            code: `@routeMapping('/users')
                    class UserController {
                        @getMapping('/:id')
                        getById() {}
                    }`,
            filename: '/packages/blue-app/src/controllers.ts',
        },
        // Service client: only @service + @*Call
        {
            code: `@service('accounts', { baseUrl: 'https://api.example.com' })
                    class AccountsAPI {
                        @getCall('/accounts/:id')
                        getById(id: number) { return undefined as unknown; }
                    }`,
            filename: '/packages/blue-app/src/clients.ts',
        },
        // Neither paradigm — unrelated decorator
        {
            code: `@configuration
                    class Config {
                        @entry()
                        make() {}
                    }`,
            filename: '/packages/blue-app/src/config.ts',
        },
    ],
    invalid: [
        {
            code: `@service('accounts', { baseUrl: 'https://api.example.com' })
                    class AccountsAPI {
                        @getMapping('/accounts/:id')
                        getById(id: number) { return undefined as unknown; }
                    }`,
            filename: '/packages/blue-app/src/clients.ts',
            errors: [{ messageId: 'mixedParadigms' }],
        },
        {
            code: `@routeMapping('/users')
                    class UserController {
                        @postCall('/create')
                        create() {}
                    }`,
            filename: '/packages/blue-app/src/controllers.ts',
            errors: [{ messageId: 'mixedParadigms' }],
        },
    ],
});
