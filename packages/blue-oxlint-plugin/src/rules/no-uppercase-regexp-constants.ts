/**
 * Rule that flags UPPER_SNAKE_CASE constants initialized with a RegExp literal.
 *
 * Per STYLE_GUIDE §3.9 (Acronym Casing) and the "no UPPER_SNAKE_CASE RegExp
 * constants" convention in AGENTS.md: RegExp instances are objects, not
 * primitives, so they follow camelCase identifier conventions like other
 * objects (e.g. `findByPattern`, not `FIND_BY`).
 *
 * Migrated from a pre-commit grep (`rg "^[export ]*const [A-Z_]+.*= /"`)
 * into a first-class oxlint rule so the convention cannot regress.
 */

import type { Context, ESTree } from '@oxlint/plugins';

const upperSnakeIdentifier = /^[A-Z][A-Z0-9_]*$/u;

function isRegExpLiteral(node: ESTree.Expression | null): node is ESTree.RegExpLiteral {
    return node !== null && node.type === 'Literal' && 'regex' in node;
}

/**
 * Reports UPPER_SNAKE_CASE RegExp constants.
 */
export const noUppercaseRegexpConstants = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow UPPER_SNAKE_CASE constants initialized with a RegExp literal',
        },
        messages: {
            uppercaseRegexp:
                "RegExp constant '{{name}}' uses UPPER_SNAKE_CASE; RegExp instances are objects, so use camelCase per STYLE_GUIDE §3.9.",
        },
        schema: [],
    } as const,
    defaultOptions: [],
    create(context: Context) {
        function checkDeclaration(declaration: ESTree.VariableDeclaration): void {
            for (const declarator of declaration.declarations) {
                const id = declarator.id;
                if (id.type !== 'Identifier' || !upperSnakeIdentifier.test(id.name)) {
                    continue;
                }
                if (isRegExpLiteral(declarator.init)) {
                    context.report({
                        node: id,
                        messageId: 'uppercaseRegexp',
                        data: {
                            name: id.name,
                        },
                    });
                }
            }
        }

        return {
            before() {
                // Per-file setup if needed in the future
            },
            VariableDeclaration(node: ESTree.VariableDeclaration) {
                checkDeclaration(node);
            },
        };
    },
};
