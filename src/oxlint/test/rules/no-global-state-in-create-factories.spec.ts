/**
 */
import { RuleTester } from 'oxlint/plugins-dev';
import { noGlobalStateInCreateFactories } from '../../rules/no-global-state-in-create-factories.ts';

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
        } as RuleTester.ParserOptions,
    },
});

ruleTester.run('no-global-state-in-create-factories', noGlobalStateInCreateFactories, {
    valid: [
        // create* reading a module const is pure creation
        {
            code: 'const DEFAULTS = { debug: false };\nexport const createOptions = () => ({ ...DEFAULTS });',
            filename: '/packages/ndigo-core/src/options.ts',
        },
        // create* with no module-state references at all
        {
            code: 'export function createThing(value: string) {\n    return { value };\n}',
            filename: '/packages/ndigo-core/src/thing.ts',
        },
        // a local binding shadows the module-level mutable name
        {
            code: 'let counter = 0;\nexport function createCounter() {\n    let counter = 5;\n    return counter;\n}',
            filename: '/packages/ndigo-core/src/counter.ts',
        },
        // get* is exactly where mutable module state belongs
        {
            code: 'let settings = { verbose: false };\nexport function getSettings() {\n    return settings;\n}',
            filename: '/packages/ndigo-log/src/settings.ts',
        },
        // ambient globals are out of scope
        {
            code: 'export const createFromEnv = () => ({ debug: process.env.DEBUG });',
            filename: '/packages/ndigo-core/src/env.ts',
        },
        // a static factory reading a readonly static is configuration-free
        {
            code: 'class Factory {\n    static readonly TYPE = "console";\n    static createThing() {\n        return { type: Factory.TYPE };\n    }\n}',
            filename: '/packages/ndigo-core/src/factory.ts',
        },
        // instance state is per-instance, not shared state
        {
            code: 'export function createThing(seed: number) {\n    function next() {\n        return seed + 1;\n    }\n    return { next };\n}',
            filename: '/packages/ndigo-core/src/seed.ts',
        },
        // a non-create name reading module state is fine
        {
            code: 'let cache: Map<string, unknown> = new Map();\nexport function loadCached(key: string) {\n    return cache.get(key);\n}',
            filename: '/packages/ndigo-core/src/cache.ts',
        },
        // write-only publication of a freshly built instance is not dependence
        {
            code: 'let published: unknown = null;\nexport function createThing() {\n    const thing = {};\n    published = thing;\n    return thing;\n}',
            filename: '/packages/ndigo-core/src/published.ts',
        },
    ],
    invalid: [
        // create* reading module-level let
        {
            code: 'let counter = 0;\nexport function createCounter() {\n    return { next: counter + 1 };\n}',
            filename: '/packages/ndigo-core/src/counter.ts',
            errors: [{ messageId: 'mutableModuleState' }],
        },
        // create* writing module-level var (reported once per name)
        {
            code: 'var cache: Record<string, unknown> | undefined;\nexport const createCache = () => {\n    cache = {};\n    return cache;\n};',
            filename: '/packages/ndigo-core/src/cache.ts',
            errors: [{ messageId: 'mutableModuleState' }],
        },
        // bare `create` is part of the family
        {
            code: 'let sequence = 0;\nexport function create() {\n    return ++sequence;\n}',
            filename: '/packages/ndigo-core/src/sequence.ts',
            errors: [{ messageId: 'mutableModuleState' }],
        },
        // static create* reading the class's own mutable static (documented wrong example)
        {
            code: 'class LoggerFactory {\n    private static type = "console";\n    static createLogger() {\n        return { type: LoggerFactory.type };\n    }\n}',
            filename: '/packages/ndigo-log/src/logger-factory.ts',
            errors: [{ messageId: 'mutableClassState' }],
        },
        // static create* reaching the same state via `this`
        {
            code: 'class Factory {\n    private static threshold = 1;\n    static createThing() {\n        return { threshold: this.threshold };\n    }\n}',
            filename: '/packages/ndigo-core/src/factory.ts',
            errors: [{ messageId: 'mutableClassState' }],
        },
    ],
});
