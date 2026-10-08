/**
 * @module blue-oxlint-plugin
 * @since 1.0.0
 * @author Jeff Rose
 */
import { RuleTester } from 'oxlint/plugins-dev';
import { noMixedCaseAcronyms } from '../../src/rules/no-mixed-case-acronyms';

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
        } as RuleTester.ParserOptions,
    },
});

ruleTester.run('no-mixed-case-acronyms', noMixedCaseAcronyms, {
    valid: [
        // All-uppercase acronym in type names (correct per STYLE_GUIDE §3.9)
        {
            code: 'interface HTTPTransformer { transform(): unknown; }',
            filename: '/packages/blue-http/src/transformer.ts',
        },
        {
            code: 'class JSONParser { parse(input: string): unknown { return null; } }',
            filename: '/packages/blue-core/src/parser.ts',
        },
        {
            code: 'type UUIDConverter = (value: string) => string;',
            filename: '/packages/blue-core/src/converter.ts',
        },
        // All-lowercase acronym in identifiers
        {
            code: 'const httpTransformer = {};',
            filename: '/packages/blue-http/src/transformer.ts',
        },
        {
            code: 'function parseJson(input: string): unknown { return null; }',
            filename: '/packages/blue-core/src/parser.ts',
        },
    ],
    invalid: [
        {
            code: 'class HttpTransformer { transform(): unknown { return null; } }',
            filename: '/packages/blue-core/src/transformer.ts',
            errors: [{ messageId: 'mixedCaseAcronym' }],
        },
        {
            code: 'interface JsonParser { parse(input: string): unknown; }',
            filename: '/packages/blue-core/src/parser.ts',
            errors: [{ messageId: 'mixedCaseAcronym' }],
        },
        {
            code: 'type ApiClient = { get(): Promise<unknown> };',
            filename: '/packages/blue-core/src/client.ts',
            errors: [{ messageId: 'mixedCaseAcronym' }],
        },
    ],
});
