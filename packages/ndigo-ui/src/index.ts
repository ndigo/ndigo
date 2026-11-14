/**
 * Public token surface of `@ndigo/ui` — the typed half of the design-token
 * contract. The canonical values live in `tokens/ndigo-tokens.css`; the
 * catalog mirrors them for documentation, autocomplete, and drift checks.
 */
export { getTokenDefinition, TOKEN_NAMES, TOKENS } from './token-catalog.js';
export type { TokenDefinition } from './token-definition.js';
export { TOKEN_GROUPS } from './token-group.js';
export type { TokenGroup } from './token-group.js';
export type { TokenName } from './token-name.js';
export { resolveToken } from './resolve-token.js';

export type { Theme, ThemeColorScheme, ThemeTokens } from './theme.js';
export { createTheme, withThemeTokens } from './create-theme.js';
export type { CreateThemeOptions } from './create-theme.js';
export { applyTheme, removeTheme } from './apply-theme.js';
export type { ThemeTarget } from './apply-theme.js';
export { themeToCss } from './theme-to-css.js';
export { resolveVisualTheme } from './resolve-visual-theme.js';
export type { VisualThemeMap } from './resolve-visual-theme.js';
export { themeAttributes } from './theme-attributes.js';
export type { ThemeAttributes } from './theme-attributes.js';
export {
    COMMON_THEMES,
    getCommonTheme,
    HIGH_CONTRAST_DARK_THEME,
    HIGH_CONTRAST_LIGHT_THEME,
    NDIGO_DARK_THEME,
    NDIGO_LIGHT_THEME,
    SOLARIZED_DARK_THEME,
    SOLARIZED_LIGHT_THEME,
} from './common-themes.js';
