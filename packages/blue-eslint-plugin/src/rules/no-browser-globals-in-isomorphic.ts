/**
 * ESLint rule that blocks unguarded access to browser globals in isomorphic packages.
 */

import type { TSESTree } from '@typescript-eslint/utils';
import { ESLintUtils } from '@typescript-eslint/utils';

import { BROWSER_GLOBALS, BROWSER_ONLY_PACKAGES } from '../_constants.js';

const createRule = ESLintUtils.RuleCreator(
    (name) => `https://github.com/user/blue/blob/main/packages/blue-eslint-plugin/docs/${name}.md`
);

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
function isTypeofSubject(node: TSESTree.Identifier): boolean {
    return node.parent?.type === 'UnaryExpression' && (node.parent as TSESTree.UnaryExpression).operator === 'typeof';
}

/**
 * Returns true if `node` is in a declaration/binding position rather than a value reference.
 * This avoids false positives when a parameter or variable is named the same as a browser global.
 */
function isBindingSite(node: TSESTree.Identifier): boolean {
    const parent = node.parent;
    if (!parent) return false;
    switch (parent.type) {
        case 'VariableDeclarator':
            return (parent as TSESTree.VariableDeclarator).id === node;
        case 'FunctionDeclaration':
        case 'FunctionExpression':
        case 'ArrowFunctionExpression': {
            const fn = parent as TSESTree.FunctionDeclaration | TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression;
            return fn.id === node || fn.params.includes(node as TSESTree.Parameter);
        }
        case 'Property':
            return (parent as TSESTree.Property).key === node && !(parent as TSESTree.Property).computed;
        case 'MemberExpression':
            return (parent as TSESTree.MemberExpression).property === node && !(parent as TSESTree.MemberExpression).computed;
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
function containsTypeofGuard(testNode: TSESTree.Node, name: string): boolean {
    if (testNode.type === 'BinaryExpression') {
        const bin = testNode as TSESTree.BinaryExpression;
        if (bin.operator === '!==' || bin.operator === '!=' || bin.operator === '===' || bin.operator === '==') {
            const left = bin.left;
            const right = bin.right;
            const isTypeofLeft =
                left.type === 'UnaryExpression' &&
                (left as TSESTree.UnaryExpression).operator === 'typeof' &&
                (left as TSESTree.UnaryExpression).argument.type === 'Identifier' &&
                ((left as TSESTree.UnaryExpression).argument as TSESTree.Identifier).name === name;
            const isTypeofRight =
                right.type === 'UnaryExpression' &&
                (right as TSESTree.UnaryExpression).operator === 'typeof' &&
                (right as TSESTree.UnaryExpression).argument.type === 'Identifier' &&
                ((right as TSESTree.UnaryExpression).argument as TSESTree.Identifier).name === name;
            if (isTypeofLeft || isTypeofRight) return true;
        }
    }
    if (testNode.type === 'LogicalExpression') {
        const log = testNode as TSESTree.LogicalExpression;
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
function isInsideTypeofGuard(node: TSESTree.Identifier): boolean {
    const name = node.name;
    let current: TSESTree.Node = node as TSESTree.Node;

    while (current.parent) {
        const parent = current.parent as TSESTree.Node;

        if (parent.type === 'IfStatement') {
            const ifStmt = parent as TSESTree.IfStatement;
            // We are in the consequent or alternate, not the test itself
            if (current !== ifStmt.test && containsTypeofGuard(ifStmt.test, name)) {
                return true;
            }
        }

        if (parent.type === 'ConditionalExpression') {
            const cond = parent as TSESTree.ConditionalExpression;
            // We are in consequent or alternate, not the test
            if (current !== cond.test && containsTypeofGuard(cond.test, name)) {
                return true;
            }
        }

        if (parent.type === 'LogicalExpression') {
            const log = parent as TSESTree.LogicalExpression;
            // We are on the right side of &&, and the left contains a typeof guard
            if (log.operator === '&&' && current === log.right && containsTypeofGuard(log.left, name)) {
                return true;
            }
        }

        current = parent;
    }

    return false;
}

export const noBrowserGlobalsInIsomorphic = createRule({
    name: 'no-browser-globals-in-isomorphic',
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
    },
    defaultOptions: [],
    create(context) {
        const filename = context.filename;
        const currentPackageName = getCurrentPackageName(filename);

        // Allow in browser-only packages and test files
        if ((currentPackageName && BROWSER_ONLY_PACKAGES.includes(currentPackageName)) || isTestFile(filename)) {
            return {};
        }

        return {
            Identifier(node) {
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
});