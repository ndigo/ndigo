/**
 * Rule that blocks unguarded access to browser globals in isomorphic packages.
 *
 * Migrated from ESLint to oxlint JS Plugin API.
 * Uses createOnce + before hook pattern for dual compatibility and future performance.
 */

import type { Context, ESTree, Scope } from '@oxlint/plugins';

import { BROWSER_GLOBALS, BROWSER_ONLY_PACKAGES } from '../_constants.js';

/**
 * Identifier node types the `Identifier` visitor dispatches, all carrying `name`.
 */
type IdentifierLike =
    | ESTree.IdentifierName
    | ESTree.IdentifierReference
    | ESTree.BindingIdentifier
    | ESTree.LabelIdentifier
    | ESTree.TSIndexSignatureName
    | ESTree.TSThisParameter;

function getCurrentPackageName(filename: string): string | null {
    const match = /[\\/]packages[\\/]blue-([^\\/]+)[\\/]/u.exec(filename);
    if (!match) return null;
    return `@blue/${match[1]}`;
}

function isTestFile(filename: string): boolean {
    return (
        filename.includes('.spec.ts') ||
        filename.includes('.test.ts') ||
        filename.includes('/test/') ||
        filename.includes('\\test\\')
    );
}

/**
 * Returns true if `node` is the argument of a `typeof` unary expression.
 */
function isTypeofSubject(node: IdentifierLike): boolean {
    const parent = node.parent;
    return parent.type === 'UnaryExpression' && parent.operator === 'typeof';
}

/**
 * Returns true if `node` is in a declaration/binding position rather than a value reference.
 * This avoids false positives when a parameter or variable is named the same as a browser global.
 */
function isBindingSite(node: IdentifierLike): boolean {
    const parent = node.parent;
    if (!parent) return false;
    switch (parent.type) {
        case 'VariableDeclarator':
            return parent.id === node;
        case 'FunctionDeclaration':
        case 'FunctionExpression':
        case 'ArrowFunctionExpression':
            return parent.id === node || parent.params.some((param) => param === node);
        case 'Property':
            return parent.key === node && !parent.computed;
        case 'MemberExpression':
            return parent.property === node && !parent.computed;
        case 'ImportDefaultSpecifier':
        case 'ImportNamespaceSpecifier':
        case 'ImportSpecifier':
        case 'ExportSpecifier':
        case 'ClassDeclaration':
        case 'ClassExpression':
        case 'LabeledStatement':
        case 'BreakStatement':
        case 'ContinueStatement':
        case 'RestElement':
        case 'AssignmentPattern':
            return true;
        default:
            return false;
    }
}

/**
 * Returns true if a local variable named `name` is declared in the scope chain
 * (excluding the global scope), meaning the identifier refers to a local binding
 * rather than the browser global.
 */
function isShadowedByLocalBinding(scope: Scope, name: string): boolean {
    let current: Scope | null = scope;
    while (current !== null && current.type !== 'global') {
        if (current.variables.some((variable) => variable.name === name)) {
            return true;
        }
        current = current.upper;
    }
    return false;
}

/**
 * Returns true if `testNode` contains a `typeof <name> !== 'undefined'` (or `=== 'undefined'`) check.
 */
function containsTypeofGuard(testNode: ESTree.Expression, name: string): boolean {
    if (testNode.type === 'BinaryExpression') {
        if (
            testNode.operator === '!==' ||
            testNode.operator === '!=' ||
            testNode.operator === '===' ||
            testNode.operator === '=='
        ) {
            const left = testNode.left;
            const right = testNode.right;
            const isTypeofLeft =
                left.type === 'UnaryExpression' &&
                left.operator === 'typeof' &&
                left.argument.type === 'Identifier' &&
                left.argument.name === name;
            const isTypeofRight =
                right.type === 'UnaryExpression' &&
                right.operator === 'typeof' &&
                right.argument.type === 'Identifier' &&
                right.argument.name === name;
            return isTypeofLeft || isTypeofRight;
        }
    }
    if (testNode.type === 'LogicalExpression') {
        return containsTypeofGuard(testNode.left, name) || containsTypeofGuard(testNode.right, name);
    }
    return false;
}

/**
 * Returns true if the identifier is inside a typeof-guarded scope:
 * - An ancestor IfStatement whose test contains `typeof <name> !== 'undefined'`
 * - An ancestor ConditionalExpression whose test contains the same
 * - An ancestor LogicalExpression (&&) whose left side contains the same, and `node` is on the right
 */
function isInsideTypeofGuard(node: IdentifierLike): boolean {
    const name = node.name;
    let current = node.parent;

    while (current.parent) {
        const parent = current.parent;

        if (parent.type === 'IfStatement') {
            // We are in the consequent or alternate, not the test itself
            if (current !== parent.test && containsTypeofGuard(parent.test, name)) {
                return true;
            }
        }

        if (parent.type === 'ConditionalExpression') {
            // We are in consequent or alternate, not the test
            if (current !== parent.test && containsTypeofGuard(parent.test, name)) {
                return true;
            }
        }

        if (parent.type === 'LogicalExpression') {
            // We are on the right side of &&, and the left contains a typeof guard
            if (parent.operator === '&&' && current === parent.right && containsTypeofGuard(parent.left, name)) {
                return true;
            }
        }

        current = parent;
    }

    return false;
}

/**
 * Reports unguarded access to browser globals in isomorphic packages.
 */
export const noBrowserGlobalsInIsomorphic = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow unguarded access to browser globals in isomorphic packages',
        },
        messages: {
            browserGlobal:
                "'{{name}}' is a browser global. Guard with `typeof {{name}} !== 'undefined'` or move to @blue/platform-web.",
        },
        schema: [],
    } as const,
    defaultOptions: [],
    create(context: Context) {
        const filename = context.filename ?? context.getFilename?.() ?? '';
        const currentPackageName = getCurrentPackageName(filename);

        // Allow in browser-only packages and test files
        if ((currentPackageName && BROWSER_ONLY_PACKAGES.includes(currentPackageName)) || isTestFile(filename)) {
            return {};
        }

        return {
            before() {
                // Per-file setup if needed in the future
            },
            Identifier(node: IdentifierLike) {
                if (!BROWSER_GLOBALS.includes(node.name)) {
                    return;
                }

                // Allow binding/declaration sites: parameter names, variable declarators, etc.
                if (isBindingSite(node)) {
                    return;
                }

                // Allow when the name is shadowed by a local variable/parameter in scope
                if (isShadowedByLocalBinding(context.sourceCode.getScope(node), node.name)) {
                    return;
                }

                // Allow typeof checks: typeof window !== 'undefined'
                if (isTypeofSubject(node)) {
                    return;
                }

                // Allow inside a typeof-guarded scope
                if (isInsideTypeofGuard(node)) {
                    return;
                }

                context.report({
                    node,
                    messageId: 'browserGlobal',
                    data: { name: node.name },
                });
            },
        };
    },
};
