import parser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  // Global ignores
  {
    ignores: [ 'coverage', 'lib', 'node_modules', '**/lib/**', '**/coverage/**', '**/node_modules/**' ]
  },
  // Main configuration
  {
    files: [ '**/*.js', '**/*.ts', '**/*.mjs' ],
    languageOptions: {
      parser: parser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest'
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
        // Mocha globals
        describe: 'readonly',
        it: 'readonly',
        before: 'readonly',
        after: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      // Spacing and formatting rules
      'array-bracket-spacing': [ 1, 'always' ],
      'arrow-body-style': [ 2, 'as-needed' ],
      'arrow-parens': [ 2, 'always' ],
      'arrow-spacing': [ 1, { before: true, after: true } ],
      'eol-last': 1,
      'keyword-spacing': [ 1, {
        overrides: {
          catch: { after: false },
          if: { after: false },
          for: { after: false },
          switch: { after: false },
          while: { after: false }
        }
      } ],
      'no-trailing-spaces': 1,
      'no-unused-vars': 0,
      'no-undef': 0,
      'semi': [ 2, 'always' ],
      'space-before-blocks': 0,
      'space-before-function-paren': [ 1, {
        anonymous: 'never',
        named: 'never',
        asyncArrow: 'always'
      } ],
      'space-in-parens': [ 1, 'always' ],
      'template-curly-spacing': [ 1, 'always' ],

      // TypeScript rules (updated for v8)
      '@typescript-eslint/adjacent-overload-signatures': 2,
      '@typescript-eslint/explicit-function-return-type': 0,
      '@typescript-eslint/explicit-member-accessibility': 0,
      '@typescript-eslint/no-array-constructor': 2,
      '@typescript-eslint/no-empty-interface': 0,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-inferrable-types': 0,
      '@typescript-eslint/no-namespace': [ 2, { allowDeclarations: false, allowDefinitionFiles: false } ],
      '@typescript-eslint/no-non-null-assertion': 0,
      '@typescript-eslint/triple-slash-reference': 0,
      '@typescript-eslint/no-unused-vars': [ 1, { vars: 'local', args: 'none', ignoreRestSiblings: true } ],
      '@typescript-eslint/no-use-before-define': [ 2, { classes: false, functions: false, typedefs: false, variables: false } ],
      '@typescript-eslint/no-require-imports': 0,
      '@typescript-eslint/prefer-namespace-keyword': 2
    }
  }
];
