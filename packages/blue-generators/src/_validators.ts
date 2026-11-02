/**
 * Package-internal validation shared across the generator set.
 *
 * Nx loads the generator factories with Node's native TypeScript stripping,
 * which needs exact specifiers: relative imports in Nx-loaded generator
 * files carry the `.ts` extension (rewritten to `.js` on emit by
 * `rewriteRelativeImportExtensions` in the package tsconfig — AD-85).
 *
 * @module blue-generators
 * @since 1.0.0
 * @author Jeff Rose
 */

/** Kebab-case artifact names (AD-85): lowercase words joined by single hyphens. */
const kebabNameRule = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/u;

/**
 * Validates an artifact name against the kebab-case contract shared by the
 * `package`, `readme`, and `app` generators.
 *
 * @param value - The name to validate.
 * @param label - What the name describes (`Package name`, `App name`, …).
 * @throws Error when the name is not kebab-case.
 */
export function validateKebabName(value: string, label: string): void {
    if (!kebabNameRule.test(value)) {
        throw new Error(`${label} must be kebab-case: "${value}"`);
    }
}
