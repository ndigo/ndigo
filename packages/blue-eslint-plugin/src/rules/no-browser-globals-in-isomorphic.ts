/**
 * Rule that blocks unguarded access to browser globals in isomorphic packages.
 *
 * Migrated from ESLint to oxlint JS Plugin API.
 * Uses createOnce + before hook pattern for dual compatibility and future performance.
 */

import { BROWSER_GLOBALS, BROWSER_ONLY_PACKAGES } from '../_constants.js';

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
function isTypeofSubject(node: any): boolean {
    return node.parent?.type === 'UnaryExpression' && (node.parent as any).operator === 'typeof';
}

/**
 * Returns true if `node` is in a declaration/binding position rather than a value reference.
 * This avoids false positives when a parameter or variable is named the same as a browser global.
 */
function isBindingSite(node: any): boolean {
    const parent = node.parent;
    if (!parent) return false;
    switch (parent.type) {
        case 'VariableDeclarator':
            return (parent as any).id === node;
        case 'FunctionDeclaration':
        case 'FunctionExpression':
        case 'ArrowFunctionExpression': {
            const fn = parent as any;
            return fn.id === node || fn.params.includes(node as any);
        }
        case 'Property':
            return (parent as any).key === node && !(parent as any).computed;
        case 'MemberExpression':
            return (parent as any).property === node && !(parent as any).computed;
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
function isShadowedByLocalBinding(scope: any, name: string): boolean {
    let current = scope;
    while (current !== null && current.type !== 'global') {
        if (current.variables?.some((v: any) => v.name === name)) {
            return true;
        }
        current = current.upper ?? null;
    }
    return false;
}

/**
 * Returns true if `testNode` contains a `typeof <name> !== 'undefined'` (or `=== 'undefined'`) check.
 */
function containsTypeofGuard(testNode: any, name: string): boolean {
    if (testNode.type === 'BinaryExpression') {
        const bin = testNode;
        if (bin.operator === '!==' || bin.operator === '!=' || bin.operator === '===' || bin.operator === '==') {
            const left = bin.left;
            const right = bin.right;
            const isTypeofLeft =
                left.type === 'UnaryExpression' &&
                (left as any).operator === 'typeof' &&
                (left as any).argument.type === 'Identifier' &&
                ((left as any).argument as any).name === name;
            const isTypeofRight =
                right.type === 'UnaryExpression' &&
                (right as any).operator === 'typeof' &&
                (right as any).argument.type === 'Identifier' &&
                ((right as any).argument as any).name === name;
            if (isTypeofLeft || isTypeofRight) return true;
        }
    }
    if (testNode.type === 'LogicalExpression') {
        const log = testNode;
        return containsTypeofGuard(log.left, name) || containsTypeofGuard(log.right, name);
    }
    return false;
}

/**
 * Returns true if the identifier is inside a typeof-guarded scope:
 * - An ancestor IfStatement whose test contains `typeof <name> !== 'undefined'`
 * - An ancestor ConditionalExpression whose test contains the same
 * - An ancestor LogicalExpression (&&) whose left side contains the same, and `node` is on the right
 */
function isInsideTypeofGuard(node: any): boolean {
    const name = node.name;
    let current: any = node;

    while (current.parent) {
        const parent = current.parent;

        if (parent.type === 'IfStatement') {
            const ifStmt = parent;
            // We are in the consequent or alternate, not the test itself
            if (current !== ifStmt.test && containsTypeofGuard(ifStmt.test, name)) {
                return true;
            }
        }

        if (parent.type === 'ConditionalExpression') {
            const cond = parent;
            // We are in consequent or alternate, not the test
            if (current !== cond.test && containsTypeofGuard(cond.test, name)) {
                return true;
            }
        }

        if (parent.type === 'LogicalExpression') {
            const log = parent;
            // We are on the right side of &&, and the left contains a typeof guard
            if (log.operator === '&&' && current === log.right && containsTypeofGuard(log.left, name)) {
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
    create(context: any) {
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
            Identifier(node: any) {
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
