/**
 * Applies a theme to a DOM element by setting its `--nd-*` custom properties.
 */
import { TOKEN_NAMES } from './token-catalog.js';
import type { Theme } from './theme.js';

/**
 * Minimal structural shape of a theming target, so this module does not
 * depend on DOM type declarations.
 */
export type ThemeTarget = {
    style: {
        removeProperty(name: string): void;
        setProperty(name: string, value: string): void;
        colorScheme: string;
    };
    dataset: Record<string, string | undefined>;
};

function resolveTarget(target?: ThemeTarget): ThemeTarget | undefined {
    if (target) {
        return target;
    }
    const document = (globalThis as { document?: { documentElement?: ThemeTarget } }).document;
    return document?.documentElement;
}

/**
 * Clears any inline `--nd-*` custom properties previously applied to `target`.
 * @param target - Element to clear.
 */
function clearInlineTokens(target: ThemeTarget): void {
    for (const name of TOKEN_NAMES) {
        target.style.removeProperty(name);
    }
    target.style.removeProperty('color-scheme');
}

/**
 * Applies a theme to `target`, replacing any previously applied theme.
 *
 * Sets the token overrides as inline custom properties, the `color-scheme`
 * style, and the `data-theme` / `data-color-scheme` attributes (so CSS hooks
 * and persistence layers can read the active theme).
 *
 * @param theme - Theme to apply.
 * @param target - Element to apply to. Defaults to the document root.
 */
export function applyTheme(theme: Theme, target?: ThemeTarget): void {
    const resolved = resolveTarget(target);
    if (!resolved) {
        return;
    }

    clearInlineTokens(resolved);

    for (const [name, value] of Object.entries(theme.tokens)) {
        if (typeof value === 'string') {
            resolved.style.setProperty(name, value);
        }
    }

    resolved.style.colorScheme = theme.colorScheme;
    resolved.dataset.theme = theme.name;
    resolved.dataset.colorScheme = theme.colorScheme;
}

/**
 * Removes an applied theme from `target`, clearing inline overrides and the
 * theme attributes.
 * @param target - Element to clear. Defaults to the document root.
 */
export function removeTheme(target?: ThemeTarget): void {
    const resolved = resolveTarget(target);
    if (!resolved) {
        return;
    }

    clearInlineTokens(resolved);
    delete resolved.dataset.theme;
    delete resolved.dataset.colorScheme;
}
