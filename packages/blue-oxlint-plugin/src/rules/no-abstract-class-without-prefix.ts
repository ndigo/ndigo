/**
 * Rule that flags abstract classes whose name does not start with `Abstract`.
 * @module blue-oxlint-plugin
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { Context, ESTree } from '@oxlint/plugins';

/**
 * Reports abstract classes missing the `Abstract` prefix.
 */
export const noAbstractClassWithoutPrefix = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Require abstract classes to use the Abstract prefix',
        },
        messages: {
            missingPrefix:
                "Abstract class '{{name}}' must follow the Abstract[Description][Role] naming pattern (STYLE_GUIDE §3.10); prefix it with 'Abstract'.",
        },
        schema: [],
    } as const,
    defaultOptions: [],
    create(context: Context) {
        function checkClass(node: ESTree.Class): void {
            if (!node.abstract) {
                return;
            }
            if (!node.id) {
                return;
            }
            const name = node.id.name;
            if (!name.startsWith('Abstract')) {
                context.report({
                    node: node.id,
                    messageId: 'missingPrefix',
                    data: {
                        name,
                    },
                });
            }
        }

        return {
            before() {
                // Per-file setup if needed in the future
            },
            ClassDeclaration(node: ESTree.Class) {
                checkClass(node);
            },
        };
    },
};
