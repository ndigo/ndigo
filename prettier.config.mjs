// Prettier configuration for BlueJS monorepo
// Based on .editorconfig settings and existing code style

/** @type {import("prettier").Config} */
export default {
    // From .editorconfig: 4-space indentation for JS/TS
    tabWidth: 4,
    useTabs: false,

    // From .editorconfig: LF line endings
    endOfLine: 'lf',

    // From ESLint: semicolons required
    semi: true,

    // From ESLint: single quotes preferred
    singleQuote: true,

    // From ESLint: trailing commas for cleaner diffs
    trailingComma: 'es5',

    // Standard print width
    printWidth: 120,

    // Arrow function parens (always for consistency)
    arrowParens: 'always',

    // Bracket spacing - NOTE: Prettier default is true
    // Current code style uses spaces in brackets: [ 1, 2, 3 ]
    // Prettier's bracketSpacing only affects objects, not arrays
    bracketSpacing: true,

    // JSX settings (if needed)
    jsxSingleQuote: false,

    // File-specific overrides
    overrides: [
        {
            // JSON and YAML use 2-space indentation per .editorconfig
            files: ['*.json', '*.yaml', '*.yml'],
            options: {
                tabWidth: 2,
            },
        },
        {
            // Markdown files
            files: ['*.md'],
            options: {
                proseWrap: 'preserve',
            },
        },
    ],
};
