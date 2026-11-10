/**
 * The `--ui` pointer: the version-free configuration the scaffold may write.
 *
 * Only pointers live here. Tokens, components, and the lockfile are
 * version-bearing content written by `ndigo ui` from the registry, so nothing
 * in this module duplicates `packages/ndigo-ui/registry/`.
 */
import type { PlannedFile } from './types.js';

/** The pointer file, matching `ndigo ui init` byte for byte. */
export const UI_CONFIG_FILE = 'ndigo.ui.json';

/** The application stylesheet that carries the token import. */
export const UI_STYLESHEET = 'src/styles.css';

/**
 * The `ndigo.ui.json` payload — the same schema, registry default, and alias
 * table `ndigo ui init` writes.
 *
 * @returns The pointer file content, newline-terminated.
 */
export function uiConfig(): string {
    const payload = {
        $schema: 'https://ndigo.dev/schema/ndigo.ui.json',
        registry: 'https://ndigo.dev/r/registry.json',
        aliases: {
            ui: 'src/ui',
            lib: 'src/lib',
            components: 'src/components',
            hooks: 'src/hooks',
        },
    };
    return `${JSON.stringify(payload, null, 2)}\n`;
}

/**
 * The entry stylesheet: the canonical `--nd-*` tokens, imported from the
 * package rather than copied in. The registry's `theme` item is the copy-in
 * alternative; an application uses one or the other, never both.
 *
 * @returns The stylesheet content.
 */
export function uiStylesheet(): string {
    return `/* Ndigo design tokens (--nd-*). Components install with \`ndigo ui add <item>\`. */\n@import '@ndigo/ui/tokens.css';\n`;
}

/**
 * Resolves the pointer files for a `--ui` scaffold.
 *
 * @returns The planned `ndigo.ui.json` and `src/styles.css` entries.
 */
export function planUiPointer(): PlannedFile[] {
    return [
        { destination: UI_CONFIG_FILE, content: uiConfig() },
        { destination: UI_STYLESHEET, content: uiStylesheet() },
    ];
}

/**
 * The AGENTS.md section appended when an agent bootstrap and the design system
 * are both requested. It is scaffold-time content, not part of the managed
 * `tools/agent-content/` block the CLI owns.
 */
export const UI_AGENTS_SECTION = `
## Design system

This app uses the Ndigo design system. \`src/styles.css\` imports the \`--nd-*\`
tokens from \`@ndigo/ui\`; style with those tokens (\`var(--nd-color-surface)\`,
\`var(--nd-space-4)\`) rather than literal values. Components install as copy-in
source with \`ndigo ui add <item>\` (see \`ndigo ui list\`); \`ndigo.ui.json\`
records the registry and the \`@ui\`/\`@lib\`/\`@components\`/\`@hooks\` aliases.
`;

/**
 * The next-steps hint printed when the pointer is written. Names a component
 * item, not `theme`: the token import already covers the theme layer.
 */
export const UI_NEXT_STEP = 'ndigo ui add button input field   # copy-in UI components';
