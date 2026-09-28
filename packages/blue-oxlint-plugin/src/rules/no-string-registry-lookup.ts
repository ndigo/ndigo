/**
 * Rule that flags string-literal registry lookups — the untyped bean handle.
 * * @module blue-oxlint-plugin
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { Context, ESTree } from '@oxlint/plugins';

/**
 * Registry read-side methods whose argument should be a {@link ContextToken}
 * in source files (AD-34 D1). Registration (`setValue`) stays string-legal:
 * tokens and strings share the description-keyed registry.
 */
const registryLookupMethods = new Set(['getValue', 'getInstance', 'hasValue', 'destroyValue']);

function isTestFile(filename: string): boolean {
    return (
        filename.includes('.spec.ts') ||
        filename.includes('.test.ts') ||
        filename.includes('/test/') ||
        filename.includes('\\test\\')
    );
}

/**
 * Reports string-literal arguments to registry lookup methods.
 *
 * Strings are invisible at compile time: a renamed or mistyped bean name
 * fails at dispatch, not at build. `ContextToken<T>` is the canonical
 * handle (ADR-34 D1); the rule points authors at it, and an oxlint-disable
 * comment documents intentional dynamic lookups (bean names computed from
 * data), which the rule's literal-only check already passes through.
 */
export const noStringRegistryLookup = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow string-literal registry lookups in source files',
        },
        messages: {
            preferToken:
                "String-literal registry lookup {{method}}('{{name}}') — use a ContextToken (ADR-34 D1) so renames and type errors surface at build time. For a genuinely dynamic name, keep the string and add oxlint-disable-next-line with a reason.",
        },
        schema: [],
    } as const,
    defaultOptions: [],
    create(context: Context) {
        const filename = context.filename ?? context.getFilename?.() ?? '';
        if (isTestFile(filename)) {
            return {};
        }

        function checkCall(node: ESTree.CallExpression): void {
            const callee = node.callee;
            if (callee === null || callee.type !== 'MemberExpression') {
                return;
            }
            const property = callee.property;
            if (property === null || property.type !== 'Identifier') {
                return;
            }
            if (!registryLookupMethods.has(property.name)) {
                return;
            }
            const firstArgument = node.arguments[0];
            if (
                firstArgument === undefined ||
                firstArgument.type !== 'Literal' ||
                typeof firstArgument.value !== 'string'
            ) {
                return;
            }
            context.report({
                node: firstArgument,
                messageId: 'preferToken',
                data: {
                    method: property.name,
                    name: firstArgument.value,
                },
            });
        }

        return {
            before() {
                // Per-file setup if needed in the future
            },
            CallExpression(node: ESTree.CallExpression) {
                checkCall(node);
            },
        };
    },
};
