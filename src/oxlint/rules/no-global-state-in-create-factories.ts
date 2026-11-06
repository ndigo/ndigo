/**
 * Rule that flags `create*` factories that reference mutable module or class state.
 */
import type { Context, ESTree } from '@oxlint/plugins';

/** `create` itself plus the documented `create*` camelCase shape. */
const createFactoryName = /^create(?:$|[A-Z_])/u;

/** Keys whose subtrees never contribute value references. */
const SKIP_KEYS = new Set([
    'parent',
    'loc',
    'range',
    'typeAnnotation',
    'returnType',
    'typeParameters',
    'typeArguments',
    'superTypeArguments',
    'implements',
]);

/**
 * Tests whether a value is an ESTree node (has a string `type`).
 *
 * @param value - The value to test.
 * @returns `true` when the value is a node-like object.
 */
function isNode(value: unknown): value is ESTree.Node {
    return typeof value === 'object' && value !== null && typeof (value as { type?: unknown }).type === 'string';
}

/**
 * Visits every node in a subtree with the (parent, key) edge it was reached
 * through — enough context to recognize member accesses, property keys and
 * binding positions. Type-annotation subtrees are skipped wholesale: they
 * cannot contribute value references.
 *
 * @param node - The subtree root.
 * @param visit - Callback invoked for every node.
 * @param parent - The parent of `node`, when it is not the subtree root.
 * @param key - The key `node` was reached through on `parent`.
 */
function walk(
    node: ESTree.Node,
    visit: (node: ESTree.Node, parent: ESTree.Node | undefined, key: string | undefined) => void,
    parent?: ESTree.Node,
    key?: string
): void {
    visit(node, parent, key);
    for (const [childKey, value] of Object.entries(node)) {
        if (SKIP_KEYS.has(childKey)) {
            continue;
        }
        if (Array.isArray(value)) {
            for (const child of value) {
                if (isNode(child)) {
                    walk(child, visit, node, childKey);
                }
            }
        } else if (isNode(value)) {
            walk(value, visit, node, childKey);
        }
    }
}

/**
 * Collects binding names declared anywhere inside a subtree: function and
 * class names, variable declarators, parameters (any pattern shape), and
 * catch-clause parameters. Used to suppress references that are shadowed
 * locally — the walker itself treats every identifier shape uniformly.
 *
 * @param subtree - The subtree to scan.
 * @returns The set of locally-bound names.
 */
function collectBindings(subtree: ESTree.Node): Set<string> {
    const bindings = new Set<string>();

    /** Adds every identifier inside a binding pattern. */
    const addPattern = (pattern: ESTree.Node): void => {
        walk(pattern, (node) => {
            if (node.type === 'Identifier') {
                bindings.add(node.name);
            }
        });
    };

    walk(subtree, (node, parent, key) => {
        if (parent === undefined || key === undefined) {
            return;
        }
        if (key === 'id') {
            if (
                parent.type === 'VariableDeclarator' ||
                parent.type === 'FunctionDeclaration' ||
                parent.type === 'FunctionExpression' ||
                parent.type === 'ArrowFunctionExpression' ||
                parent.type === 'ClassDeclaration' ||
                parent.type === 'ClassExpression'
            ) {
                if (node.type === 'Identifier') {
                    bindings.add(node.name);
                } else {
                    addPattern(node);
                }
            }
            return;
        }
        if (
            key === 'params' &&
            (parent.type === 'FunctionDeclaration' ||
                parent.type === 'FunctionExpression' ||
                parent.type === 'ArrowFunctionExpression')
        ) {
            addPattern(node);
            return;
        }
        if (key === 'param' && parent.type === 'CatchClause') {
            addPattern(node);
        }
    });

    return bindings;
}

/**
 * Tests whether an identifier occurrence is a value reference — excluding
 * member/property keys, definition keys, and statement labels. Binding
 * positions are covered by {@link collectBindings} instead.
 *
 * @param parent - The node's parent.
 * @param key - The key the node was reached through.
 * @returns `true` when the occurrence reads the identifier's value.
 */
function isValueReference(parent: ESTree.Node | undefined, key: string | undefined): boolean {
    if (parent === undefined || key === undefined) {
        return true;
    }
    switch (parent.type) {
        case 'AssignmentExpression':
            // A plain `=` write publishes a freshly built value; it is a side
            // effect, not result dependence. Compound assignments read the
            // previous value and are therefore flagged.
            return key !== 'left' || parent.operator !== '=';
        case 'MemberExpression':
            return key === 'object' || parent.computed === true;
        case 'Property':
            return parent.computed === true || parent.shorthand === true || key === 'value';
        case 'MethodDefinition':
        case 'PropertyDefinition':
            return false;
        case 'LabeledStatement':
        case 'BreakStatement':
        case 'ContinueStatement':
            return false;
        default:
            return true;
    }
}

/**
 * Reports `create*` factories that reference mutable module or class state.
 *
 * Mechanically-checkable slice of STYLE_GUIDE §3.13 "Factory Function Naming"
 * (`create*` = no global state; `get*` = global state affects the result),
 * matching the documented wrong example: a static factory backed by class
 * configuration.
 *
 * Conservative narrowing:
 *
 * - Only *mutable* state is considered: module-level `let`/`var`,
 *   non-`readonly` static class fields. Module `const`s are immutable and fine.
 * - Only direct references are flagged. A factory that reaches shared state
 *   through a helper function (`createX() { return getTracer(); }`) is not
 *   detected — the transitive case remains a review check.
 * - Ambient globals (`process.env`, `globalThis`) are out of scope.
 * - Plain `=` writes are treated as side-effect publication, not dependence:
 *   `installed = runtime` does not make the factory `get*`. Compound
 *   assignments (`counter += 1`) and updates (`++sequence`) read the previous
 *   value and are flagged.
 * - `get*` functions are never flagged: shared state affecting their result is
 *   exactly what the name promises.
 * - References shadowed by local bindings (parameters, locals, imports of the
 *   same name) are suppressed, as are member/property keys and labels.
 */
export const noGlobalStateInCreateFactories = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow create* factories that reference mutable module or class state',
        },
        messages: {
            mutableModuleState:
                "create* factory '{{factory}}' references module-level mutable state ('{{name}}'); a factory whose result depends on shared state must be named get* (STYLE_GUIDE §3.13).",
            mutableClassState:
                "static create* factory '{{factory}}' references mutable class state ('{{name}}'); the documented form is get* when class configuration affects the returned instance (STYLE_GUIDE §3.13).",
        },
        schema: [],
    } as const,
    defaultOptions: [],
    create(context: Context) {
        const mutableModuleNames = new Set<string>();

        /**
         * Collects names declared with `let`/`var` at module scope (including
         * inside `export` declarations) — only same-file module state is
         * visible to a given file's factories.
         *
         * @param node - The program node.
         */
        function collectMutableModuleState(node: ESTree.Program): void {
            for (const statement of node.body) {
                const declaration =
                    statement.type === 'ExportNamedDeclaration' && statement.declaration !== null
                        ? statement.declaration
                        : statement;
                if (declaration.type !== 'VariableDeclaration' || declaration.kind === 'const') {
                    continue;
                }
                for (const declarator of declaration.declarations) {
                    if (declarator.id.type === 'Identifier') {
                        mutableModuleNames.add(declarator.id.name);
                    }
                }
            }
        }

        /**
         * Reports direct references to module-level mutable state inside a
         * standalone `create*` factory.
         *
         * @param factory - The factory's (create*) name.
         * @param fn - The factory function node.
         */
        function checkStandaloneFactory(factory: string, fn: ESTree.Node): void {
            if (mutableModuleNames.size === 0) {
                return;
            }
            const locals = collectBindings(fn);
            const reported = new Set<string>();
            walk(fn, (node, parent, key) => {
                if (node.type !== 'Identifier') {
                    return;
                }
                const name = node.name;
                if (!mutableModuleNames.has(name) || locals.has(name) || reported.has(name)) {
                    return;
                }
                if (!isValueReference(parent, key)) {
                    return;
                }
                reported.add(name);
                context.report({ node, messageId: 'mutableModuleState', data: { factory, name } });
            });
        }

        /**
         * Reports static `create*` methods whose body reads the class's own
         * non-readonly static fields.
         *
         * @param node - The class node.
         */
        function checkClass(node: ESTree.Class): void {
            const staticFields = new Set<string>();
            for (const member of node.body.body) {
                if (
                    member.type === 'PropertyDefinition' &&
                    member.static &&
                    member.readonly !== true &&
                    member.key.type === 'Identifier'
                ) {
                    staticFields.add(member.key.name);
                }
            }
            if (staticFields.size === 0) {
                return;
            }
            const className = node.id?.name ?? null;
            for (const member of node.body.body) {
                if (member.type !== 'MethodDefinition' || !member.static || member.key.type !== 'Identifier') {
                    continue;
                }
                const factory = member.key.name;
                if (!createFactoryName.test(factory)) {
                    continue;
                }
                const reported = new Set<string>();
                walk(member.value, (child) => {
                    if (child.type !== 'MemberExpression' || child.computed) {
                        return;
                    }
                    const property = child.property;
                    if (
                        property.type !== 'Identifier' ||
                        !staticFields.has(property.name) ||
                        reported.has(property.name)
                    ) {
                        return;
                    }
                    const object = child.object;
                    const readsClassState =
                        object.type === 'ThisExpression' ||
                        (className !== null && object.type === 'Identifier' && object.name === className);
                    if (!readsClassState) {
                        return;
                    }
                    reported.add(property.name);
                    context.report({
                        node: child,
                        messageId: 'mutableClassState',
                        data: { factory, name: property.name },
                    });
                });
            }
        }

        return {
            before() {
                // Per-file setup if needed in the future
            },
            Program(node: ESTree.Program) {
                collectMutableModuleState(node);
            },
            FunctionDeclaration(node: ESTree.Node) {
                if (node.type !== 'FunctionDeclaration') {
                    return;
                }
                const name = node.id?.name;
                if (name !== undefined && createFactoryName.test(name)) {
                    checkStandaloneFactory(name, node);
                }
            },
            VariableDeclarator(node: ESTree.VariableDeclarator) {
                if (node.id.type !== 'Identifier' || !createFactoryName.test(node.id.name)) {
                    return;
                }
                const init = node.init;
                if (init !== null && (init.type === 'FunctionExpression' || init.type === 'ArrowFunctionExpression')) {
                    checkStandaloneFactory(node.id.name, init);
                }
            },
            ClassDeclaration(node: ESTree.Class) {
                checkClass(node);
            },
            ClassExpression(node: ESTree.Class) {
                checkClass(node);
            },
        };
    },
};
