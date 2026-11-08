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
