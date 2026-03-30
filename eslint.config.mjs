import parser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettierConfig from 'eslint-config-prettier';
import bluePlugin from './packages/blue-eslint-plugin/lib/index.js';

/**
 * ESLint Configuration (Flat Config)
 *
 * IMPORTANT NOTE ON PRETTIER INTEGRATION:
 * The previous code style included custom spacing rules that Prettier does not support:
 * - Spaces inside parentheses: ( value )
 * - Spaces inside array brackets: [ 1, 2, 3 ]
 * - Spaces inside template strings: ${ value }
 *
 * Prettier is opinionated and will format these as (value), [1, 2, 3], ${value}.
 * These rules have been removed to allow Prettier to handle formatting.
 *
 * If you need to preserve the original spacing style, you would need to:
 * 1. Continue using ESLint-only for formatting (remove Prettier), OR
 * 2. Accept Prettier's formatting conventions
 */

export default [
    // Global ignores
    {
        ignores: [
            'archive',
            'doc-html',
            'coverage',
            'lib',
            'dist',
            'node_modules',
            'index.js',
            '**/lib/**',
            '**/dist/**',
            '**/tmp/**',
            '**/profile/**',
            '**/.tmp/**',
            '**/*.min.js',
            '**/*.legacy.js',
            '**/coverage/**',
            '**/node_modules/**',
            '**/test/**/*.js',
            'apps/blue-demo/index.js',
            'test/mockServiceWorker.js',
            'packages/blue-domain/src/constraints.ts',
            '*.config.js',
            '*.config.mjs',
            '*.config.ts',
        ],
    },
    // Main configuration
    {
        files: ['**/*.js', '**/*.ts', '**/*.mjs'],
        linterOptions: {
            reportUnusedDisableDirectives: 'off',
        },
        languageOptions: {
            parser: parser,
            parserOptions: {
                sourceType: 'module',
                ecmaVersion: 'latest',
            },
            globals: {
                // Browser globals
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                console: 'readonly',
                // Node globals
                process: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                Buffer: 'readonly',
                global: 'readonly',
                module: 'readonly',
                require: 'readonly',
                exports: 'readonly',
                // ES6+ globals
                globalThis: 'readonly',
                // Test globals (Vitest/Jest compatible)
                describe: 'readonly',
                it: 'readonly',
                before: 'readonly',
                after: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                expect: 'readonly',
                test: 'readonly',
                vi: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            '@blue': bluePlugin,
        },
        rules: {
            // Code quality rules (non-formatting)
            'no-unused-vars': 0,
            'no-undef': 0,

            // TypeScript rules (updated for v8)
            '@typescript-eslint/adjacent-overload-signatures': 2,
            '@typescript-eslint/explicit-function-return-type': 0,
            '@typescript-eslint/explicit-member-accessibility': 0,
            '@typescript-eslint/no-array-constructor': 2,
            '@typescript-eslint/no-empty-interface': 0,
            '@typescript-eslint/no-explicit-any': 0,
            '@typescript-eslint/no-inferrable-types': 0,
            '@typescript-eslint/no-namespace': [2, { allowDeclarations: false, allowDefinitionFiles: false }],
            '@typescript-eslint/no-non-null-assertion': 0,
            '@typescript-eslint/triple-slash-reference': 0,
            '@typescript-eslint/no-unused-vars': [
                1,
                {
                    vars: 'local',
                    args: 'none',
                    caughtErrors: 'none',
                    varsIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                },
            ],
            '@typescript-eslint/no-use-before-define': [
                2,
                { classes: false, functions: false, typedefs: false, variables: false },
            ],
            '@typescript-eslint/no-require-imports': 0,
            '@typescript-eslint/prefer-namespace-keyword': 2,

            // BlueJS architecture rules
            '@blue/no-direct-integration-imports': 1,
            '@blue/no-internal-file-imports': 2,
            '@blue/no-internal-file-exports': 2,
        },
    },
    {
        files: ['**/*.spec.ts', '**/*.test.ts', '**/test/**/*.ts', '**/test/**/*.js', '**/test/**/*.mjs'],
        rules: {
            '@typescript-eslint/no-unused-vars': 0,
        },
    },
    // Prettier config to disable conflicting rules
    prettierConfig,
];
