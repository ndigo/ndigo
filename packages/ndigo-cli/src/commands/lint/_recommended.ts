/**
 * The lint config `ndigo lint init` renders into a project.
 *
 * It mirrors `@ndigo/oxlint-plugin/recommended` without importing it — the CLI
 * must not carry the plugin (and its `oxlint` peer) at runtime.
 * `test/lint-init.spec.ts` compares this object to the preset, so the two
 * cannot drift.
 */

/** Vitest globals, so `no-undef` stays quiet in projects using globals mode. */
const VITEST_GLOBALS: Record<string, 'readonly'> = {
    afterAll: 'readonly',
    afterEach: 'readonly',
    beforeAll: 'readonly',
    beforeEach: 'readonly',
    describe: 'readonly',
    expect: 'readonly',
    it: 'readonly',
    test: 'readonly',
    vi: 'readonly',
};

/**
 * Builds the config document for one project.
 *
 * @param options - The project's platform split and test runner.
 * @returns The config object written to `.oxlintrc.json`.
 */
export function recommendedLintConfig(options: {
    browser: boolean;
    node: boolean;
    vitest: boolean;
    nodeRule: boolean;
}): Record<string, unknown> {
    const config: Record<string, unknown> = {
        $schema: './node_modules/oxlint/configuration_schema.json',
    };

    if (options.browser || options.node) {
        config.env = {
            ...(options.browser ? { browser: true } : {}),
            ...(options.node ? { node: true } : {}),
            es2022: true,
        };
    }

    if (options.vitest) {
        config.globals = VITEST_GLOBALS;
    }

    config.jsPlugins = ['@ndigo/oxlint-plugin'];
    config.rules = {
        '@ndigo/no-mixed-decorator-paradigms': 'error',
        '@ndigo/no-scheduled-in-browser': 'error',
        '@ndigo/no-signals-in-entity': 'error',
        '@ndigo/no-string-token-lookup': 'error',
        '@ndigo/no-unsafe-view-name-literal': 'error',
        '@ndigo/no-duplicate-mapping': 'error',
        ...(options.nodeRule ? { '@ndigo/no-browser-globals': 'error' } : {}),
    };
    config.overrides = [
        {
            files: ['**/*.spec.ts', '**/*.test.ts', '**/test/**'],
            rules: {
                '@ndigo/no-duplicate-mapping': 'off',
                ...(options.nodeRule ? { '@ndigo/no-browser-globals': 'off' } : {}),
            },
        },
    ];

    return config;
}
