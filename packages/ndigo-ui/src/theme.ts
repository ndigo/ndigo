/**
 * Theme contracts for `@ndigo/ui`.
 *
 * A theme is a named set of `--nd-*` token overrides plus a color scheme.
 * Structural tokens (spacing, radius, typography, motion, …) are intentionally
 * not part of a theme; only color-bearing tokens vary.
 */
import type { TokenName } from './token-name.js';

/**
 * Light or dark presentation of a theme.
 */
export type ThemeColorScheme = 'light' | 'dark';

/**
 * Partial map of design-token names to override values for a theme.
 */
export type ThemeTokens = Readonly<Partial<Record<TokenName, string>>>;

/**
 * A named theme: an identity, a color scheme, and its token overrides.
 */
export interface Theme {
    /** Human-readable, unique theme name (e.g. `solarized-dark`). */
    readonly name: string;
    /** Whether the theme presents as light or dark. */
    readonly colorScheme: ThemeColorScheme;
    /** Token overrides applied on top of the base token set. */
    readonly tokens: ThemeTokens;
    /** Optional human-readable description. */
    readonly description?: string;
}
