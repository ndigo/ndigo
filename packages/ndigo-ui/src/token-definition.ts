/**
 * Catalog shape for one design token.
 */
import type { TokenGroup } from './token-group.js';
import type { TokenName } from './token-name.js';

/**
 * Catalog entry for one design token.
 */
export interface TokenDefinition {
    /** CSS custom property name, e.g. `--nd-color-bg`. */
    readonly name: TokenName;
    /** Group the token belongs to. */
    readonly group: TokenGroup;
    /** What the token means and where it should be used. */
    readonly description: string;
}
