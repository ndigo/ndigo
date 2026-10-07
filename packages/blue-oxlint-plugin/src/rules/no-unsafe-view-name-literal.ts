/**
 * Rule that flags unsafe string literals used as view names.
 * @module blue-oxlint-plugin
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { Context, ESTree } from '@oxlint/plugins';

/**
 * View classes whose first constructor argument is a view name.
 *
 * `IslandView` takes a custom-element tag name and `ModelAndView` accepts a
 * view name in its string form (its other form is a `View` instance, which is
 * not a literal). `EJSView` is intentionally absent: its first argument is a
 * template *path* resolved through a `ResourceLoader`, where separators and
 * extensions (`pages/home.html`) are the documented, expected spelling — not
 * a view name subject to the DSV-SEC-1 contract.
 */
const VIEW_CONSTRUCTORS: Record<string, true> = {
    IslandView: true,
    ModelAndView: true,
};

/**
 * Resolver method whose first argument is a view name.
 */
const RESOLVE_VIEW_NAME = 'resolveViewName';

/**
 * Returns whether an AST argument node is a string literal.
 *
 * @param node - The argument node to test.
 * @returns `true` when the node is a string literal.
 */
function isStringLiteral(node: ESTree.Argument | null | undefined): node is ESTree.StringLiteral {
    return node !== null && node !== undefined && node.type === 'Literal' && typeof node.value === 'string';
}

/**
 * Returns whether a literal view name violates the DSV-SEC-1 safety contract.
 *
 * Mirrors `AbstractPathBasedViewResolver.isSafeViewName` (blue-view): a name
 * must be relative to the resolver prefix. Rejected forms:
 *
 * - NUL bytes, which truncate paths in native syscalls;
 * - absolute markers (`/x`, `\x`, `C:\x`), which discard the resolver prefix;
 * - any `..` segment, including its matrix-parameter and trailing-space
 *   spellings (`..;x=1`, `.. `), which climb out of the prefix.
 *
 * Plain separators are NOT rejected: nested names (`admin/users`) are a
 * supported, documented spelling, and dots inside a segment (`v1.2`,
 * `my.file`) stay valid.
 *
 * @param name - The literal view name to validate.
 * @returns `true` when the literal is unsafe.
 */
function isUnsafeViewName(name: string): boolean {
    if (name.includes('\0')) {
        return true;
    }
    if (name.startsWith('/') || name.startsWith('\\') || /^[a-zA-Z]:[\\/]/u.test(name)) {
        return true;
    }
    // A segment escapes only when, after dropping any matrix-parameter suffix
    // and trailing spaces (Windows), it is exactly `..`.
    return name.split(/[\\/]+/u).some((segment) => segment.split(';', 1)[0].replace(/\s+$/u, '') === '..');
}

/**
 * Reports string-literal view names that the resolver rejects.
 *
 * Only literal arguments are inspected; a dynamic expression (identifier,
 * call, template) is not provably a literal and is left to the runtime guard.
 */
export const noUnsafeViewNameLiteral = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow unsafe string-literal view names',
        },
        messages: {
            unsafeViewName:
                "Unsafe view-name literal '{{name}}' — view names must be relative and free of absolute prefixes, `..` segments, and NUL bytes (DSV-SEC-1). Use a plain name, or add oxlint-disable-next-line @blue/no-unsafe-view-name-literal with a reason.",
        },
        schema: [],
    } as const,
    defaultOptions: [],
    create(context: Context) {
        function checkLiteral(node: ESTree.StringLiteral): void {
            if (isUnsafeViewName(node.value)) {
                context.report({
                    node,
                    messageId: 'unsafeViewName',
                    data: {
                        name: node.value,
                    },
                });
            }
        }

        return {
            NewExpression(node: ESTree.NewExpression) {
                const callee = node.callee;
                if (callee.type !== 'Identifier' || VIEW_CONSTRUCTORS[callee.name] === undefined) {
                    return;
                }
                const firstArgument = node.arguments[0];
                if (isStringLiteral(firstArgument)) {
                    checkLiteral(firstArgument);
                }
            },
            CallExpression(node: ESTree.CallExpression) {
                const callee = node.callee;
                let name: string | null = null;
                if (callee.type === 'Identifier') {
                    name = callee.name;
                } else if (
                    callee.type === 'MemberExpression' &&
                    !callee.computed &&
                    callee.property.type === 'Identifier'
                ) {
                    name = callee.property.name;
                }
                if (name !== RESOLVE_VIEW_NAME) {
                    return;
                }
                const firstArgument = node.arguments[0];
                if (isStringLiteral(firstArgument)) {
                    checkLiteral(firstArgument);
                }
            },
        };
    },
};
