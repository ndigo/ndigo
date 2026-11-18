/**
 * Rule that blocks unguarded browser-global access in code that also runs on
 * the server.
 */
import type { Context, ESTree, Scope } from '@oxlint/plugins';

import { ruleUrl } from '../_docs.js';

/** Browser globals that do not exist under Node; each needs a guard. */
const DEFAULT_GLOBALS: readonly string[] = [
    'window',
    'document',
    'navigator',
    'location',
    'history',
    'localStorage',
    'sessionStorage',
    'indexedDB',
    'btoa',
    'atob',
    'requestAnimationFrame',
    'cancelAnimationFrame',
    'performance',
    'screen',
];

/** Options accepted by {@link noBrowserGlobals}. */
interface NoBrowserGlobalsOptions {
    /** Additional global names to check, e.g. `['matchMedia', 'ResizeObserver']`. */
    extraGlobals?: readonly string[];
}

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

/**
 * Reads the configured extra globals. A malformed option yields an empty list
 * so the rule keeps checking the defaults instead of going quiet.
 *
 * @param value - The first element of `context.options`.
 * @returns The extra global names to check.
 */
function readExtraGlobals(value: unknown): readonly string[] {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return [];
    }
    const configured = (value as NoBrowserGlobalsOptions).extraGlobals;
    return Array.isArray(configured) ? configured.filter((name) => typeof name === 'string') : [];
}

/**
 * Returns true if `node` is the argument of a `typeof` unary expression.
 */
function isTypeofSubject(node: IdentifierLike): boolean {
    const parent = node.parent;
    return parent.type === 'UnaryExpression' && parent.operator === 'typeof';
}

/**
 * Returns true if the identifier is the (non-computed) key of a property,
 * method, or class member — a name position, never a reference to the global.
 */
function isMemberName(node: IdentifierLike): boolean {
    const parent = node.parent as { key?: unknown; computed?: boolean } | undefined;
    if (!parent || parent.key !== node) {
        return false;
    }
    return parent.computed !== true;
}

/**
 * Returns true if `node` is in a declaration/binding position rather than a
 * value reference, so a parameter named like a browser global is not a global
 * access.
 */
function isBindingSite(node: IdentifierLike): boolean {
    if (isMemberName(node)) {
        return true;
    }
    const parent = node.parent;
    if (!parent) return false;
    switch (parent.type) {
        case 'VariableDeclarator':
            return parent.id === node;
        case 'FunctionDeclaration':
        case 'FunctionExpression':
        case 'ArrowFunctionExpression':
            return parent.id === node || parent.params.some((param) => param === node);
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
 * (excluding the global scope), meaning the identifier refers to a local
 * binding rather than the browser global.
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
 * Returns true if `testNode` contains a `typeof <name> !== 'undefined'` (or
 * `=== 'undefined'`) check.
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
 * - an ancestor `IfStatement`/`ConditionalExpression` whose test guards `name`
 * - the right side of an `&&` whose left side guards `name`
 */
function isInsideTypeofGuard(node: IdentifierLike): boolean {
    const name = node.name;
    let current = node.parent;

    while (current.parent) {
        const parent = current.parent;

        if (parent.type === 'IfStatement') {
            if (current !== parent.test && containsTypeofGuard(parent.test, name)) {
                return true;
            }
        }

        if (parent.type === 'ConditionalExpression') {
            if (current !== parent.test && containsTypeofGuard(parent.test, name)) {
                return true;
            }
        }

        if (parent.type === 'LogicalExpression') {
            if (parent.operator === '&&' && current === parent.right && containsTypeofGuard(parent.left, name)) {
                return true;
            }
        }

        current = parent;
    }

    return false;
}

/**
 * Reports unguarded browser-global access. Which files the rule applies to is
 * the consuming config's business — scope it with `overrides` and exempt
 * browser-only packages there. Guarded access (`typeof window !== 'undefined'`)
 * and locally shadowed names stay legal.
 */
export const noBrowserGlobals = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow unguarded access to browser globals in code that also runs on the server',
            url: ruleUrl('no-browser-globals'),
            recommended: false,
        },
        messages: {
            browserGlobal: `'{{name}}' is a browser global and does not exist on the server — guard with \`typeof {{name}} !== 'undefined'\` or move the code to a browser-only package. ${ruleUrl('no-browser-globals')}`,
        },
        schema: [
            {
                type: 'object',
                properties: {
                    extraGlobals: { type: 'array', items: { type: 'string' } },
                },
                additionalProperties: false,
            },
        ],
    } as const,
    defaultOptions: [{ extraGlobals: [] }],
    create(context: Context) {
        const globals = new Set([...DEFAULT_GLOBALS, ...readExtraGlobals(context.options[0])]);

        return {
            Identifier(node: IdentifierLike) {
                if (!globals.has(node.name)) {
                    return;
                }

                // Binding and name positions never reference the global.
                if (isBindingSite(node)) {
                    return;
                }

                // A local variable/parameter of the same name wins.
                if (isShadowedByLocalBinding(context.sourceCode.getScope(node), node.name)) {
                    return;
                }

                if (isTypeofSubject(node) || isInsideTypeofGuard(node)) {
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
