/**
 * Rule that flags abstract classes whose name does not start with `Abstract`.
 *
 * Per STYLE_GUIDE §3.10 and the AGENTS.md pre-commit check
 * (`rg "^(export )?abstract class [A-Z]" | rg -v "abstract class Abstract"`):
 * abstract classes use the `Abstract[Description][Role]` pattern
 * (e.g. `AbstractBaseInstrumentation`, not `BaseBlueInstrumentation`).
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
