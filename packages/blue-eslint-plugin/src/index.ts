/** @author opencode */

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

export default plugin;
