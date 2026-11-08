/**
 * Canonical token-name type for ndigo-ui.
 *
 * Every design token is a CSS custom property in the `--nd-*` namespace. The
 * template literal keeps ad-hoc names out of typed APIs while still letting
 * the catalog narrow individual names.
 */
export type TokenName = `--nd-${string}`;
