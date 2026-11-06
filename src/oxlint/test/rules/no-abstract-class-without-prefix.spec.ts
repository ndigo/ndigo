/**
 */
import { RuleTester } from 'oxlint/plugins-dev';
import { noAbstractClassWithoutPrefix } from '../../rules/no-abstract-class-without-prefix.ts';

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
        } as RuleTester.ParserOptions,
    },
});

ruleTester.run('no-abstract-class-without-prefix', noAbstractClassWithoutPrefix, {
    valid: [
        {
            code: 'export abstract class AbstractFactory { init(): void {} }',
            filename: '/packages/ndigo-factory/src/factory.ts',
        },
        {
            code: 'export abstract class AbstractBaseInstrumentation { enable(): void {} }',
            filename: '/packages/ndigo-telemetry/src/instrumentation/base.ts',
        },
        // Concrete classes are unaffected
        {
            code: 'export class DefaultFactory extends AbstractFactory {}',
            filename: '/packages/ndigo-factory/src/factory.ts',
        },
        {
            code: 'abstract class AbstractNamed { getName(): string { return "x"; } }',
            filename: '/packages/ndigo-core/src/named.ts',
        },
    ],
    invalid: [
        {
            code: 'export abstract class BaseNdigoInstrumentation { enable(): void {} }',
            filename: '/packages/ndigo-telemetry/src/instrumentation/base.ts',
            errors: [{ messageId: 'missingPrefix' }],
        },
        {
            code: 'export abstract class UserDataTransformer { transform(): unknown { return null; } }',
            filename: '/packages/ndigo-core/src/transformer.ts',
            errors: [{ messageId: 'missingPrefix' }],
        },
    ],
});
