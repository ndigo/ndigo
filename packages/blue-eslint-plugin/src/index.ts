/**
 * ESLint plugin that bundles BlueJS's repository-specific lint rules.
 */

import { noDirectIntegrationImports } from './rules/no-direct-integration-imports.js';
import { noInternalFileImports } from './rules/no-internal-file-imports.js';
import { noInternalFileExports } from './rules/no-internal-file-exports.js';

const plugin = {
    meta: {
        name: '@blue/eslint-plugin',
        version: '0.0.1',
    },
    rules: {
        'no-direct-integration-imports': noDirectIntegrationImports,
        'no-internal-file-imports': noInternalFileImports,
        'no-internal-file-exports': noInternalFileExports,
    },
    configs: {} as Record<string, unknown>,
};

/**
 * Recommended BlueJS ESLint plugin configuration.
 *
 * The plugin exposes repository-specific rules and a ready-to-use recommended config
 * so consumers can opt into the standard rule set with minimal setup.
 */
plugin.configs.recommended = {
    plugins: {
        '@blue': plugin,
    },
    rules: {
        '@blue/no-direct-integration-imports': 'warn',
        '@blue/no-internal-file-imports': 'error',
        '@blue/no-internal-file-exports': 'error',
    },
};

/**
 * The BlueJS ESLint plugin entry point.
 *
 * Consumers can import this default export to register the packaged rules and recommended
 * configuration.
 */
export default plugin;
