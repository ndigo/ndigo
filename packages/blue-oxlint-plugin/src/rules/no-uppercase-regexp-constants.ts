/**
 * Rule that flags UPPER_SNAKE_CASE constants initialized with a RegExp literal.
 * * @module blue-oxlint-plugin
 * @since 1.0.0
 * @author Jeff Rose
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
