/**
 * Canonical documentation URLs for the consumer lint rules.
 *
 * Every rule message ends with its page URL because oxlint's default formatter
 * does not print `meta.docs.url`, and the terminal is where an agent first
 * meets a violation.
 */

/** Base URL of the published rule reference. */
export const RULE_DOCS_BASE = 'https://ndigo.dev/lint';

/**
 * Returns the canonical documentation URL for a consumer rule.
 *
 * @param rule - Rule key without the `@ndigo/` namespace.
 * @returns The absolute URL of the rule's documentation page.
 */
export function ruleUrl(rule: string): string {
    return `${RULE_DOCS_BASE}/${rule}`;
}
