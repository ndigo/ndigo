/**
 * Rule that flags string-typed registry lookups — the untyped bean handle.
 *
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
 * A lexical binding kind for a single identifier within a scope.
 * - `'string'` — directly initialized to a string literal (`const X = '…'`),
 *   so a registry lookup through `X` is a raw-string lookup.
 * - `'other'` — any other binding (token, alias, parameter, import, `let`/
 *   `var`, destructured name): the value is unknown, so lookup is not provably
 *   a string lookup. `'other'` shadows an outer `'string'` binding.
 */
type BindingKind = 'string' | 'other';

/**
 * A lexical scope: identifier name → binding kind. Only block/function-scoped
 * declarations that could be referenced by a registry lookup are recorded.
 */
type Scope = Map<string, BindingKind>;

const bindingKinds = {
    string: 'string',
    other: 'other',
} as const;

const isStringLiteral = (expression: ESTree.Expression | null): expression is ESTree.StringLiteral => {
    return expression !== null && expression.type === 'Literal' && typeof expression.value === 'string';
};

/**
 * Returns the identifier name bound by a simple `BindingIdentifier` pattern,
 * or `null` for any structured pattern (object/array/rest/assignment).
 *
 * @param pattern - The binding pattern to inspect.
 * @returns The bound identifier name, or `null`.
 */
const bindingName = (pattern: ESTree.BindingPattern | ESTree.FormalParameter): string | null =>
    pattern.type === 'Identifier' && typeof pattern.name === 'string' ? pattern.name : null;

/**
 * Records the identifier names bound by a binding pattern into `bind` with
 * kind {@link BindingKind} `'other'` (patterns never bind raw string values
 * we can trust), recursing through object/array/rest patterns.
 *
 * @param pattern - The binding pattern whose names to record.
 * @param bind - The target scope map.
 */
function bindPatternNames(pattern: ESTree.BindingPattern, bind: Scope): void {
    const name = bindingName(pattern);
    if (name !== null) {
        bind.set(name, bindingKinds.other);
        return;
    }
    if (pattern.type === 'ObjectPattern') {
        for (const property of pattern.properties) {
            if (property.type === 'Property') {
                bindPatternNames(property.value, bind);
            } else {
                bindPatternNames(property.argument, bind);
            }
        }
        return;
    }
    if (pattern.type === 'ArrayPattern') {
        for (const element of pattern.elements) {
            if (element !== null && typeof element !== 'string') {
                bindPatternNames(element.type === 'RestElement' ? element.argument : element, bind);
            }
        }
        return;
    }
    if (pattern.type === 'AssignmentPattern') {
        bindPatternNames(pattern.left, bind);
    }
}

/**
 * Reports string-keyed registry lookups — both string literals and
 * identifiers that resolve (within this file, lexically) to a `const` that
 * was initialized directly from a string literal.
 *
 * Strings are invisible at compile time: a renamed or mistyped bean name
 * fails at dispatch, not at build. `ContextToken<T>` is the canonical
 * handle (ADR-34 D1); the rule points authors at it, and an oxlint-disable
 * comment documents intentional dynamic lookups (bean names computed from
 * data or re-exported constants).
 *
 * Identifier resolution is deliberately conservative to stay false-positive
 * free:
 * - only local `const X = '…'` (a raw string literal initializer) is treated
 *   as a string lookup — `let`/`var`, token aliases, and destructured names
 *   are not provable and are never flagged;
 * - parameters, imports (incl. re-exported aliases), and any shadowing
 *   binding shadow an outer string `const`;
 * - an unresolvable identifier (e.g. an import-`*`-namespace member or a
 *   cross-module constant) is never assumed to be a string.
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

        // Program scope at index 0; each block/function/loop/catch pushes.
        const scopes: Scope[] = [new Map()];
        const pushScope = (): void => {
            scopes.push(new Map());
        };
        const popScope = (): void => {
            if (scopes.length > 1) {
                scopes.pop();
            }
        };

        /**
         * Binds an enclosing function/class name in the parent scope as
         * `'other'` so a same-named const cannot leak through a homonymous
         * function/class.
         */
        const bindEnclosingName = (name: string | null): void => {
            if (typeof name === 'string' && scopes.length > 1) {
                scopes[scopes.length - 2].set(name, bindingKinds.other);
            }
        };

        /**
         * Records `const X = '…'` as a string binding; every other
         * declaration (including token/literal aliases, `let`/`var`,
         * destructuring) as `'other'`.
         */
        const bindVariableDeclaration = (node: ESTree.VariableDeclaration): void => {
            const scope = scopes[scopes.length - 1];
            for (const declarator of node.declarations) {
                const init = declarator.init;
                const name = declarator.id.type === 'Identifier' ? declarator.id.name : null;
                if (name === null) {
                    // Destructured declaration — bind the pattern names as
                    // `'other'` so they never resolve to a string.
                    bindPatternNames(declarator.id, scope);
                    continue;
                }
                const isRawStringConst = node.kind === 'const' && isStringLiteral(init);
                scope.set(name, isRawStringConst ? bindingKinds.string : bindingKinds.other);
            }
        };

        /**
         * Binds a parameter list (or catch parameter) as `'other'` so a
         * parameter shadows an outer string `const`.
         */
        const bindParams = (params: readonly ESTree.ParamPattern[]): void => {
            const scope = scopes[scopes.length - 1];
            for (const param of params) {
                if (param.type === 'RestElement') {
                    bindPatternNames(param.argument, scope);
                    continue;
                }
                if (param.type === 'TSParameterProperty') {
                    bindPatternNames(param.parameter, scope);
                    continue;
                }
                const name = bindingName(param);
                if (name !== null) {
                    scope.set(name, bindingKinds.other);
                } else {
                    bindPatternNames(param, scope);
                }
            }
        };

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
            if (firstArgument === undefined) {
                return;
            }

            let name: string;
            if (firstArgument.type === 'Literal' && typeof firstArgument.value === 'string') {
                // Direct string literal — the classic case.
                name = firstArgument.value;
            } else if (firstArgument.type === 'Identifier' && typeof firstArgument.name === 'string') {
                // Identifier: resolve to the nearest lexical binding.
                const identifierName = firstArgument.name;
                let resolved: BindingKind | undefined;
                for (let i = scopes.length - 1; i >= 0; i--) {
                    const bound = scopes[i].get(identifierName);
                    if (bound !== undefined) {
                        resolved = bound;
                        break;
                    }
                }
                if (resolved !== bindingKinds.string) {
                    // Shadowed by a non-string binding, or unresolvable
                    // (import/namespace/global) — not provably a string lookup.
                    return;
                }
                name = identifierName;
            } else {
                // Not a static identifier or literal (computed, call, member) —
                // dynamic lookup, left to an oxlint-disable if intentional.
                return;
            }

            context.report({
                node: firstArgument,
                messageId: 'preferToken',
                data: {
                    method: property.name,
                    name,
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
            BlockStatement() {
                pushScope();
            },
            'BlockStatement:exit'() {
                popScope();
            },
            FunctionDeclaration(node: ESTree.Function) {
                bindEnclosingName(node.id?.name ?? null);
                pushScope();
                bindParams(node.params);
            },
            'FunctionDeclaration:exit'() {
                popScope();
            },
            FunctionExpression(node: ESTree.Function) {
                bindEnclosingName(node.id?.name ?? null);
                pushScope();
                bindParams(node.params);
            },
            'FunctionExpression:exit'() {
                popScope();
            },
            ArrowFunctionExpression(node: ESTree.ArrowFunctionExpression) {
                pushScope();
                bindParams(node.params);
            },
            'ArrowFunctionExpression:exit'() {
                popScope();
            },
            ForStatement() {
                pushScope();
            },
            'ForStatement:exit'() {
                popScope();
            },
            ForInStatement() {
                pushScope();
            },
            'ForInStatement:exit'() {
                popScope();
            },
            ForOfStatement() {
                pushScope();
            },
            'ForOfStatement:exit'() {
                popScope();
            },
            SwitchStatement() {
                pushScope();
            },
            'SwitchStatement:exit'() {
                popScope();
            },
            CatchClause(node: ESTree.CatchClause) {
                pushScope();
                if (node.param !== null) {
                    bindPatternNames(node.param, scopes[scopes.length - 1]);
                }
            },
            'CatchClause:exit'() {
                popScope();
            },
            ImportDeclaration(node: ESTree.ImportDeclaration) {
                // Imported names (incl. re-exported aliases of tokens or
                // strings) are unknown across modules — never assume string.
                const scope = scopes[scopes.length - 1];
                for (const specifier of node.specifiers) {
                    scope.set(specifier.local.name, bindingKinds.other);
                }
            },
            VariableDeclaration(node: ESTree.VariableDeclaration) {
                bindVariableDeclaration(node);
            },
        };
    },
};
