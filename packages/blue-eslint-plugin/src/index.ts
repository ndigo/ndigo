/**
 * ESLint plugin that bundles BlueJS's repository-specific lint rules.
 *
 * This plugin uses oxlint's eslintCompatPlugin API for dual compatibility
 * with both ESLint and oxlint. Rules use createOnce + before hook pattern
 * for future performance benefits.
 */

import { eslintCompatPlugin } from '@oxlint/plugins';

import { noDirectIntegrationImports } from './rules/no-direct-integration-imports.js';
import { noInternalFileImports } from './rules/no-internal-file-imports.js';
import { noInternalFileExports } from './rules/no-internal-file-exports.js';
import { noBrowserGlobalsInIsomorphic } from './rules/no-browser-globals-in-isomorphic.js';
import { noUppercaseRegexpConstants } from './rules/no-uppercase-regexp-constants.js';
import { noAbstractClassWithoutPrefix } from './rules/no-abstract-class-without-prefix.js';
import { noMixedCaseAcronyms } from './rules/no-mixed-case-acronyms.js';

const plugin = eslintCompatPlugin({
    meta: {
        name: '@blue/eslint-plugin',
    },
    rules: {
        'no-direct-integration-imports': noDirectIntegrationImports,
        'no-internal-file-imports': noInternalFileImports,
        'no-internal-file-exports': noInternalFileExports,
        'no-browser-globals-in-isomorphic': noBrowserGlobalsInIsomorphic,
        'no-uppercase-regexp-constants': noUppercaseRegexpConstants,
        'no-abstract-class-without-prefix': noAbstractClassWithoutPrefix,
        'no-mixed-case-acronyms': noMixedCaseAcronyms,
    },
});

/**
 * Recommended BlueJS ESLint plugin configuration.
 *
 * The plugin exposes repository-specific rules and a ready-to-use recommended config
 * so consumers can opt into the standard rule set with minimal setup.
 */
(plugin as unknown as Record<string, unknown>).configs = {
    recommended: {
        plugins: {
            '@blue': plugin,
        },
        rules: {
            '@blue/no-direct-integration-imports': 'warn',
            '@blue/no-internal-file-imports': 'error',
            '@blue/no-internal-file-exports': 'error',
            '@blue/no-browser-globals-in-isomorphic': 'warn',
            '@blue/no-uppercase-regexp-constants': 'error',
            '@blue/no-abstract-class-without-prefix': 'error',
            '@blue/no-mixed-case-acronyms': 'error',
        },
    },
};

/**
 * The BlueJS ESLint plugin entry point.
 *
 * Consumers can import this default export to register the packaged rules and recommended
 * configuration.
 */
export default plugin;
