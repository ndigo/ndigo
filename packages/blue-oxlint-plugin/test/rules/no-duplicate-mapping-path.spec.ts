/**
 * @module blue-oxlint-plugin
 * @since 1.0.0
 * @author Jeff Rose
 */
import { RuleTester } from 'oxlint/plugins-dev';
import { noDuplicateMappingPath } from '../../src/rules/no-duplicate-mapping-path';

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
        },
    },
});

ruleTester.run('no-duplicate-mapping-path', noDuplicateMappingPath, {
    valid: [
        // Distinct method paths, with a class-level prefix
        {
            code: `@routeMapping('/users')
                    class UserController {
                        @getMapping('/users/list')
                        list() {}
                        @getMapping('/users/:id')
                        getById() {}
                    }`,
            filename: '/packages/blue-app/src/controllers.ts',
        },
        // Class-level path is a prefix merged with method paths — not a duplicate
        {
            code: `@routeMapping('/')
                    class HelloController {
                        @routeMapping('/')
                        handleRoot() {}
                    }`,
            filename: '/packages/blue-app/src/controllers.ts',
        },
        {
            code: `@requestMapping('/')
                    class IslandController {
                        @getMapping('/')
                        home() {}
                    }`,
            filename: '/packages/blue-app/src/controllers.ts',
        },
        // Same position, different parameter NAMES — distinct radix labels
        {
            code: `class UserController {
                        @getMapping('/a/:id')
                        byId() {}
                        @getMapping('/a/:name')
                        byName() {}
                    }`,
            filename: '/packages/blue-app/src/controllers.ts',
        },
        // `{other}` folds to `:other` — a different label than `:id`
        {
            code: `class UserController {
                        @getMapping('/a/:id')
                        byId() {}
                        @getMapping('/a/{other}')
                        byOther() {}
                    }`,
            filename: '/packages/blue-app/src/controllers.ts',
        },
        // Same path, different decorator kind (HTTP method) — disambiguated
        {
            code: `class NoteController {
                        @getMapping('/notes')
                        list() {}
                        @postMapping('/notes')
                        create() {}
                    }`,
            filename: '/packages/blue-app/src/controllers.ts',
        },
        // Configuration form with extra conditions is skipped (disambiguates)
        {
            code: `class ProductController {
                        @getMapping({ value: '/:id', matrixParams: 'color' })
                        getById() {}
                        @getMapping('/:id')
                        getOne() {}
                    }`,
            filename: '/packages/blue-app/src/controllers.ts',
        },
        // Same normalized path in two different classes is not a class-level duplicate
        {
            code: `class AController {
                        @getMapping('/shared')
                        a() {}
                    }
                    class BController {
                        @getMapping('/shared')
                        b() {}
                    }`,
            filename: '/packages/blue-app/src/controllers.ts',
        },
        // Dynamic path expressions are not statically comparable
        {
            code: `class UserController {
                        @getMapping(basePath)
                        a() {}
                        @getMapping(basePath)
                        b() {}
                    }`,
            filename: '/packages/blue-app/src/controllers.ts',
        },
        // Non-mapping decorators with the same argument are ignored
        {
            code: `class UserController {
                        @getCall('/same')
                        a() {}
                        @getCall('/same')
                        b() {}
                    }`,
            filename: '/packages/blue-app/src/controllers.ts',
        },
    ],
    invalid: [
        // Trailing slash normalizes to the same path (same kind)
        {
            code: `class UserController {
                        @getMapping('/users')
                        list() {}
                        @getMapping('/users/')
                        listAll() {}
                    }`,
            filename: '/packages/blue-app/src/controllers.ts',
            errors: [{ messageId: 'duplicateMappingPath' }],
        },
        // Duplicate slashes collapse
        {
            code: `class UserController {
                        @getMapping('//foo')
                        a() {}
                        @getMapping('/foo')
                        b() {}
                    }`,
            filename: '/packages/blue-app/src/controllers.ts',
            errors: [{ messageId: 'duplicateMappingPath' }],
        },
        // `{name}` and `:name` are the same radix node
        {
            code: `class UserController {
                        @getMapping('/a/{id}')
                        a() {}
                        @getMapping('/a/:id')
                        b() {}
                    }`,
            filename: '/packages/blue-app/src/controllers.ts',
            errors: [{ messageId: 'duplicateMappingPath' }],
        },
        // Two identical method mappings
        {
            code: `class UserController {
                        @postMapping('/create')
                        a() {}
                        @postMapping('/create')
                        b() {}
                    }`,
            filename: '/packages/blue-app/src/controllers.ts',
            errors: [{ messageId: 'duplicateMappingPath' }],
        },
        // Optionless configuration form (`{ value }`) participates
        {
            code: `class UserController {
                        @routeMapping({ value: '/x' })
                        a() {}
                        @routeMapping('/x/')
                        b() {}
                    }`,
            filename: '/packages/blue-app/src/controllers.ts',
            errors: [{ messageId: 'duplicateMappingPath' }],
        },
    ],
});
