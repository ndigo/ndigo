/**
 * Stable token groups shared by the catalog, documentation, and drift checks.
 */
export const TOKEN_GROUPS = [
    'palette',
    'color',
    'typography',
    'space',
    'radius',
    'elevation',
    'motion',
    'z',
    'focus',
] as const;

/**
 * One of the stable token groups.
 *
 * @example
 * ```ts
 * type _Alias = TokenGroup;
 * ```
 */
export type TokenGroup = (typeof TOKEN_GROUPS)[number];
