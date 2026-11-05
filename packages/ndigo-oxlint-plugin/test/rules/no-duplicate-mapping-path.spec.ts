/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { RuleTester } from 'oxlint/plugins-dev';
import { canonicalizeRouteMappingPath } from '@ndigo/dispatcher';
import { noDuplicateMappingPath } from '../../src/rules/no-duplicate-mapping-path';

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
        } as RuleTester.ParserOptions,
    },
});

const FILENAME = '/packages/ndigo-app/src/controllers.ts';

/**
 * Shared path vector table for the rule⇄runtime canonicalizer parity check.
 *
 * Every unordered pair is driven through RuleTester: the rule must report a
 * duplicate exactly when `canonicalizeRouteMappingPath` (the dispatcher's
 * single source of truth) folds the two spellings onto the same radix node.
 */
const ROUTE_PATH_VECTORS = ['/a', '/a/', '//a', '/a/:id', '/a/{id}', '/a/{*rest}', '/a/**'] as const;

const parityValid: RuleTester.ValidTestCase[] = [];
const parityInvalid: RuleTester.InvalidTestCase[] = [];
for (let left = 0; left < ROUTE_PATH_VECTORS.length; left++) {
    for (let right = left + 1; right < ROUTE_PATH_VECTORS.length; right++) {
        const first = ROUTE_PATH_VECTORS[left];
        const second = ROUTE_PATH_VECTORS[right];
        const code = `class Controller {
                        @routeMapping(${JSON.stringify(first)})
                        a() {}
                        @routeMapping(${JSON.stringify(second)})
                        b() {}
                    }`;
        if (canonicalizeRouteMappingPath(first) === canonicalizeRouteMappingPath(second)) {
            parityInvalid.push({ code, filename: FILENAME, errors: [{ messageId: 'duplicateMappingPath' }] });
        } else {
            parityValid.push({ code, filename: FILENAME });
        }
    }
}

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
            filename: FILENAME,
        },
        // Class-level path is a prefix merged with method paths — not a duplicate
        {
            code: `@routeMapping('/')
                    class HelloController {
                        @routeMapping('/')
                        handleRoot() {}
                    }`,
            filename: FILENAME,
        },
        {
            code: `@requestMapping('/')
                    class IslandController {
                        @getMapping('/')
                        home() {}
                    }`,
            filename: FILENAME,
        },
        // Same position, different parameter NAMES — distinct radix labels
        {
            code: `class UserController {
                        @getMapping('/a/:id')
                        byId() {}
                        @getMapping('/a/:name')
                        byName() {}
                    }`,
            filename: FILENAME,
        },
        // `{other}` folds to `:other` — a different label than `:id`
        {
            code: `class UserController {
                        @getMapping('/a/:id')
                        byId() {}
                        @getMapping('/a/{other}')
                        byOther() {}
                    }`,
            filename: FILENAME,
        },
        // Same path, different decorator kind (HTTP method) — disambiguated
        {
            code: `class NoteController {
                        @getMapping('/notes')
                        list() {}
                        @postMapping('/notes')
                        create() {}
                    }`,
            filename: FILENAME,
        },
        // Same path, verb vs method-less — different HTTP-method identity
        {
            code: `class NoteController {
                        @getMapping('/notes')
                        list() {}
                        @requestMapping('/notes')
                        create() {}
                    }`,
            filename: FILENAME,
        },
        // Same path, template vs string but same node IS a duplicate (see invalid);
        // distinct template paths are not.
        {
            code: `class UserController {
                        @getMapping(\`/users\`)
                        list() {}
                        @getMapping(\`/accounts\`)
                        accounts() {}
                    }`,
            filename: FILENAME,
        },
        // Configuration form with extra conditions is skipped (disambiguates)
        {
            code: `class ProductController {
                        @getMapping({ value: '/:id', matrixParams: 'color' })
                        getById() {}
                        @getMapping('/:id')
                        getOne() {}
                    }`,
            filename: FILENAME,
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
            filename: FILENAME,
        },
        // Dynamic path expressions are not statically comparable
        {
            code: `class UserController {
                        @getMapping(basePath)
                        a() {}
                        @getMapping(basePath)
                        b() {}
                    }`,
            filename: FILENAME,
        },
        // Non-mapping decorators with the same argument are ignored
        {
            code: `class UserController {
                        @getCall('/same')
                        a() {}
                        @getCall('/same')
                        b() {}
                    }`,
            filename: FILENAME,
        },
        ...parityValid,
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
            filename: FILENAME,
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
            filename: FILENAME,
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
            filename: FILENAME,
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
            filename: FILENAME,
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
            filename: FILENAME,
            errors: [{ messageId: 'duplicateMappingPath' }],
        },
        // No-substitution template literal is a literal path (INS-2)
        {
            code: `class UserController {
                        @getMapping(\`/users\`)
                        a() {}
                        @getMapping('/users/')
                        b() {}
                    }`,
            filename: FILENAME,
            errors: [{ messageId: 'duplicateMappingPath' }],
        },
        // Renamed import binding resolves to the mapping decorator (INS-2)
        {
            code: `import { getMapping as g } from '@ndigo/dispatcher';
                    class UserController {
                        @g('/users')
                        a() {}
                        @g('/users/')
                        b() {}
                    }`,
            filename: FILENAME,
            errors: [{ messageId: 'duplicateMappingPath' }],
        },
        // Local `const` alias of an imported decorator resolves (INS-2)
        {
            code: `import { getMapping } from '@ndigo/dispatcher';
                    const alias = getMapping;
                    class UserController {
                        @alias('/users')
                        a() {}
                        @alias('/users/')
                        b() {}
                    }`,
            filename: FILENAME,
            errors: [{ messageId: 'duplicateMappingPath' }],
        },
        // `@queryMapping` (HTTP QUERY) registers in the same radix space (INS-2)
        {
            code: `class SearchController {
                        @queryMapping('/search')
                        a() {}
                        @queryMapping('/search/')
                        b() {}
                    }`,
            filename: FILENAME,
            errors: [{ messageId: 'duplicateMappingPath' }],
        },
        // `@publicMapping` is method-less, same family as `@routeMapping` (INS-2/INS-3)
        {
            code: `class HomeController {
                        @publicMapping('/home')
                        a() {}
                        @routeMapping('/home/')
                        b() {}
                    }`,
            filename: FILENAME,
            errors: [{ messageId: 'duplicateMappingPath' }],
        },
        // `@requestMapping` and `@routeMapping` are both method-less (INS-3)
        {
            code: `class UserController {
                        @requestMapping('/y')
                        a() {}
                        @routeMapping('/y')
                        b() {}
                    }`,
            filename: FILENAME,
            errors: [{ messageId: 'duplicateMappingPath' }],
        },
        ...parityInvalid,
    ],
});
