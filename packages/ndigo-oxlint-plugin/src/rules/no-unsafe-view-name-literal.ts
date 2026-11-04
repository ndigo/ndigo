/**
 * Rule that flags unsafe string literals used as view names.
 * @module ndigo-oxlint-plugin
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { Context, ESTree } from '@oxlint/plugins';

/**
 * Constructor that takes a custom-element tag name as its first argument.
 *
 * `IslandView` validates its name with the custom-element grammar
 * (`isValidCustomElementName`), NOT the path contract — see
 * {@link isInvalidCustomElementName}.
 */
const ISLAND_VIEW_CONSTRUCTOR = 'IslandView';

/**
 * Constructor whose first argument is a view name in its string form.
 *
 * `ModelAndView` accepts either a view name (string) or a `View` instance; only
 * the string form is a literal subject to the path contract. `EJSView` is
 * intentionally absent: its first argument is a template *path* resolved through
 * a `ResourceLoader`, where separators and extensions (`pages/home.html`) are
 * the documented, expected spelling — not a view name subject to the DSV-SEC-1
 * contract.
 */
const MODEL_AND_VIEW_CONSTRUCTOR = 'ModelAndView';

/**
 * Resolver method whose first argument is a view name (path contract).
 */
const RESOLVE_VIEW_NAME = 'resolveViewName';

/**
 * Custom-element tag-name grammar, mirroring `customElementNamePattern`
 * (ndigo-view): a lowercase leading letter, at least one hyphen, then any
 * lowercase letters, digits, `_`, `.`, or `-`.
 */
const customElementNamePattern = /^[a-z][a-z0-9._]*-[a-z0-9._-]*$/;

/**
 * Custom-element names the platform reserves for built-in elements; the HTML
 * spec forbids registering these. Mirrors `RESERVED_CUSTOM_ELEMENT_NAMES`
 * (ndigo-view).
 */
const RESERVED_CUSTOM_ELEMENT_NAMES: Record<string, true> = {
    'annotation-xml': true,
    'color-profile': true,
    'font-face': true,
    'font-face-src': true,
    'font-face-uri': true,
    'font-face-format': true,
    'font-face-name': true,
    'missing-glyph': true,
};

/**
 * Returns whether an AST argument node is a plain string literal.
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
 * Mirrors `isSafeViewName` (ndigo-view): a name must be relative to the resolver
 * prefix. Rejected forms:
 *
 * - NUL bytes, which truncate paths in native syscalls;
 * - absolute markers (`/x`, `\x`, `C:\x`, `C:x`), which discard the resolver
 *   prefix — the drive-letter test ignores the following separator;
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
    if (name.startsWith('/') || name.startsWith('\\') || /^[a-zA-Z]:/u.test(name)) {
        return true;
    }
    // A segment escapes only when, after dropping any matrix-parameter suffix
    // and trailing spaces (Windows), it is exactly `..`.
    return name.split(/[\\/]+/u).some((segment) => segment.split(';', 1)[0].replace(/\s+$/u, '') === '..');
}

/**
 * Returns whether a literal is NOT a valid custom-element tag name.
 *
 * Mirrors `isValidCustomElementName` (ndigo-view): the name must match the
 * custom-element grammar (lowercase, at least one hyphen) and must not be a
 * reserved platform name. `IslandView` uses this grammar, so a name that is
 * safe as a view path (`'admin/users'`) but not a valid tag (`'MyElement'`,
 * `'plain'`) is rejected.
 *
 * @param name - The literal tag name to validate.
 * @returns `true` when the literal is not a valid custom-element name.
 */
function isInvalidCustomElementName(name: string): boolean {
    if (!customElementNamePattern.test(name)) {
        return true;
    }
    return name in RESERVED_CUSTOM_ELEMENT_NAMES;
}

/**
 * Reports string-literal view names that their runtime guard rejects.
 *
 * Only literal arguments are inspected; a dynamic expression (identifier, call,
 * template) is not provably a literal and is left to the runtime guard. The
 * check branches on the callee: `IslandView` is validated against the
 * custom-element grammar, while `ModelAndView` and `resolveViewName` keep the
 * relative-path (DSV-SEC-1) contract.
 */
export const noUnsafeViewNameLiteral = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow unsafe string-literal view names',
        },
        messages: {
            unsafeViewName:
                "Unsafe view-name literal '{{name}}' — view names must be relative and free of absolute prefixes, `..` segments, and NUL bytes (DSV-SEC-1). Use a plain name, or add oxlint-disable-next-line @ndigo/no-unsafe-view-name-literal with a reason.",
            invalidIslandViewName:
                "Invalid custom-element name literal '{{name}}' for IslandView — the name must be a lowercase tag with at least one hyphen (e.g. 'todo-app') and must not be a reserved platform name. Use a valid tag name, or add oxlint-disable-next-line @ndigo/no-unsafe-view-name-literal with a reason.",
        },
        schema: [],
    } as const,
    defaultOptions: [],
    create(context: Context) {
        function checkPathLiteral(node: ESTree.StringLiteral): void {
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

        function checkCustomElementLiteral(node: ESTree.StringLiteral): void {
            if (isInvalidCustomElementName(node.value)) {
                context.report({
                    node,
                    messageId: 'invalidIslandViewName',
                    data: {
                        name: node.value,
                    },
                });
            }
        }

        return {
            NewExpression(node: ESTree.NewExpression) {
                const callee = node.callee;
                if (callee.type !== 'Identifier') {
                    return;
                }
                const firstArgument = node.arguments[0];
                if (!isStringLiteral(firstArgument)) {
                    return;
                }
                if (callee.name === ISLAND_VIEW_CONSTRUCTOR) {
                    checkCustomElementLiteral(firstArgument);
                } else if (callee.name === MODEL_AND_VIEW_CONSTRUCTOR) {
                    checkPathLiteral(firstArgument);
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
                    checkPathLiteral(firstArgument);
                }
            },
        };
    },
};
