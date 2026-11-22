/**
 * The `recommended` oxlint preset for Ndigo applications.
 *
 * It carries only platform-neutral rules — the ones that are wrong in every
 * Ndigo project regardless of where the code runs. `no-raw-console` and
 * `no-browser-globals` are opt-in because the correct scope depends on the
 * application's platform split; enable them with your own `overrides`.
 */
import type { OxlintConfig } from 'oxlint';

/**
 * Rules every Ndigo application should enable at `error`.
 *
 * Spec and test fixtures register duplicate mappings on purpose, so the preset
 * turns that one rule off there — the single exception to "error everywhere".
 *
 * @example
 * ```ts
 * import { defineConfig } from 'oxlint';
 * import { recommended } from '@ndigo/oxlint-plugin/recommended';
 *
 * export default defineConfig({ extends: [recommended] });
 * ```
 */
export const recommended: OxlintConfig = {
    jsPlugins: ['@ndigo/oxlint-plugin'],
    rules: {
        '@ndigo/no-mixed-decorator-paradigms': 'error',
        '@ndigo/no-scheduled-in-browser': 'error',
        '@ndigo/no-signals-in-entity': 'error',
        '@ndigo/no-string-token-lookup': 'error',
        '@ndigo/no-unsafe-view-name-literal': 'error',
        '@ndigo/no-duplicate-mapping': 'error',
    },
    overrides: [
        {
            files: ['**/*.spec.ts', '**/*.test.ts', '**/test/**'],
            rules: {
                '@ndigo/no-duplicate-mapping': 'off',
            },
        },
    ],
};
